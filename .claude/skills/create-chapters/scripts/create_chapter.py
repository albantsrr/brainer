#!/usr/bin/env python3
"""
Create pedagogical chapter content from EPUB XHTML files.

This script:
1. Finds the chapter XHTML file and associated images
2. Extracts and parses the content
3. Outputs extracted content for Claude to transform
4. Updates the chapter in the database

Usage:
    python create_chapter.py <course-slug> <chapter-number>

Parameters:
    <course-slug>: Course identifier (e.g., fundamentals-of-data-engineering)
    <chapter-number>: Chapter number to process (e.g., 1, 5)

Examples:
    python create_chapter.py fundamentals-of-data-engineering 1
    python create_chapter.py computer-systems-a-programmers-perspective 3
"""

import json
import os
import sys
from pathlib import Path
from typing import Optional
from bs4 import BeautifulSoup

try:
    import requests
except ImportError:
    sys.exit("ERROR: requests library not installed. Run: pip install requests")

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("ERROR: beautifulsoup4 library not installed. Run: pip install beautifulsoup4")


# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
BRAINER_TOKEN = os.getenv("BRAINER_TOKEN", "")
# Script is in .claude/skills/create-chapters/scripts/create_chapter.py
# Need to go up 5 levels to reach project root
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent  # Up to /home/teissier/brainer
BOOKS_DIR = PROJECT_ROOT / "books"
TEMP_DIR = PROJECT_ROOT / "temp"


def _auth_headers() -> dict:
    if BRAINER_TOKEN:
        return {"Authorization": f"Bearer {BRAINER_TOKEN}"}
    print("⚠️  BRAINER_TOKEN not set — write requests will fail (401). Get a token via POST /api/auth/login")
    return {}


def check_backend():
    """Verify backend is accessible."""
    try:
        requests.get(f"{API_URL}/api/courses", timeout=2)
        return True
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Backend not accessible at {API_URL}")
        print(f"   Error: {e}")
        print(f"   Make sure to run: uvicorn api.main:app --reload --host 0.0.0.0\n")
        return False


def get_course(course_slug: str) -> Optional[dict]:
    """Fetch course info from API."""
    response = requests.get(f"{API_URL}/api/courses/{course_slug}")

    if response.status_code == 200:
        return response.json()
    elif response.status_code == 404:
        print(f"❌ Course '{course_slug}' not found in database")
        return None
    else:
        print(f"❌ Error fetching course: {response.status_code} - {response.text}")
        return None


def get_chapters(course_slug: str) -> list[dict]:
    """Fetch all chapters for a course."""
    response = requests.get(f"{API_URL}/api/courses/{course_slug}/chapters")

    if response.status_code == 200:
        return response.json()
    else:
        print(f"❌ Error fetching chapters: {response.status_code}")
        return []


def find_chapter_file(course_title: str, chapter_num: int, course_slug: str = None) -> Optional[Path]:
    """Find the XHTML file for a specific chapter."""
    # First: scan all book directories for one with a matching course-plan.json slug
    search_dirs = []
    if course_slug and BOOKS_DIR.exists():
        for book_dir in BOOKS_DIR.iterdir():
            if not book_dir.is_dir():
                continue
            plan_path = book_dir / "course-plan.json"
            if plan_path.exists():
                try:
                    import json as _json
                    with open(plan_path) as f:
                        plan = _json.load(f)
                    if plan.get("course", {}).get("slug") == course_slug:
                        # Add all possible sub-paths including double-nested OEBPS
                        search_dirs.extend([
                            book_dir / "OEBPS",
                            book_dir / "OEBPS" / "OEBPS",
                            book_dir,
                        ])
                except Exception:
                    pass

    # Fallback: try title and slug based patterns
    search_dirs.extend([
        BOOKS_DIR / course_title / "OEBPS",
        BOOKS_DIR / course_title / "OEBPS" / "OEBPS",
        BOOKS_DIR / course_title,
        BOOKS_DIR / f"{course_title}-normalized" / "OEBPS",
        BOOKS_DIR / f"{course_title}-normalized",
    ])

    # Also try with slug if provided
    if course_slug:
        search_dirs.extend([
            BOOKS_DIR / course_slug / "OEBPS",
            BOOKS_DIR / course_slug / "OEBPS" / "OEBPS",
            BOOKS_DIR / course_slug,
            BOOKS_DIR / f"{course_slug}-normalized" / "OEBPS",
            BOOKS_DIR / f"{course_slug}-normalized",
        ])

    for book_dir in search_dirs:
        if not book_dir.exists():
            continue

        # Try zero-padded (ch01.xhtml)
        chapter_file = book_dir / f"ch{chapter_num:02d}.xhtml"
        if chapter_file.exists():
            return chapter_file

        # Try without padding (ch1.xhtml)
        chapter_file = book_dir / f"ch{chapter_num}.xhtml"
        if chapter_file.exists():
            return chapter_file

    print(f"❌ Chapter file not found: ch{chapter_num:02d}.xhtml or ch{chapter_num}.xhtml")
    print(f"   Searched in: {', '.join(str(d) for d in search_dirs)}")
    return None


def find_chapter_images(course_title: str, chapter_num: int, course_slug: str = None) -> list[Path]:
    """Find all images associated with a chapter."""
    # Try multiple directory patterns
    search_dirs = [
        BOOKS_DIR / course_title / "OEBPS" / "Images",                   # Standard structure (with title)
        BOOKS_DIR / f"{course_title}-normalized" / "OEBPS" / "Images",  # Normalized structure (with title)
    ]

    # Also try with slug if provided
    if course_slug:
        search_dirs.extend([
            BOOKS_DIR / course_slug / "OEBPS" / "Images",                   # Standard structure (with slug)
            BOOKS_DIR / f"{course_slug}-normalized" / "OEBPS" / "Images",  # Normalized structure (with slug)
        ])

    images = []

    for images_dir in search_dirs:
        if not images_dir.exists():
            continue

        # Pattern 1: Normalized naming (chapter-01-image-*.png)
        normalized_pattern = f"chapter-{chapter_num:02d}-image-*.*"
        images.extend(images_dir.glob(normalized_pattern))

        # Pattern 2: Legacy naming (fode_01*.png)
        legacy_pattern = f"fode_{chapter_num:02d}*.*"
        images.extend(images_dir.glob(legacy_pattern))

        # Also try without zero-padding for chapters >= 10
        if chapter_num >= 10:
            legacy_pattern = f"fode_{chapter_num}*.*"
            images.extend(images_dir.glob(legacy_pattern))

    # Remove duplicates and sort
    images = sorted(set(images))

    return images


def extract_content(xhtml_path: Path) -> dict:
    """Extract structured content from XHTML file."""
    with open(xhtml_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # For normalized EPUBs, the file may contain multiple concatenated XML documents
    # Parse each document and extract all content
    full_html_parts = []
    full_text_parts = []
    all_images = []

    # Split by XML declarations to handle concatenated documents
    xml_docs = content.split('<?xml version')
    for i, doc in enumerate(xml_docs):
        if i > 0:  # Re-add the XML declaration
            doc = '<?xml version' + doc

        if not doc.strip():
            continue

        try:
            soup = BeautifulSoup(doc, 'html.parser')

            # Extract body content
            body = soup.find('body')
            if body:
                full_html_parts.append(str(body))
                full_text_parts.append(body.get_text())

                # Extract images
                for img in body.find_all('img'):
                    src = img.get('src', '')
                    if src:
                        filename = src.split('/')[-1]
                        if filename not in all_images:
                            all_images.append(filename)
        except Exception as e:
            print(f"   ⚠️  Could not parse document part {i}: {e}")
            continue

    # If we got nothing, fallback to simple extraction
    if not full_html_parts:
        soup = BeautifulSoup(content, 'html.parser')
        full_html_parts = [str(soup)]
        full_text_parts = [soup.get_text()]

        # Find images
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src:
                filename = src.split('/')[-1]
                if filename not in all_images:
                    all_images.append(filename)

    combined_html = '\n'.join(full_html_parts)
    combined_text = '\n'.join(full_text_parts)

    # Extract title from first document
    soup = BeautifulSoup(content, 'html.parser')
    title_elem = soup.find('h1')
    title = title_elem.get_text() if title_elem else "Unknown Chapter"

    return {
        'title': title,
        'html': combined_html,
        'text': combined_text,
        'images': all_images,
        'sections': [],  # Not parsing sections for concatenated docs
        'word_count': len(combined_text.split())
    }

# Old code below for reference
def extract_content_old(xhtml_path: Path) -> dict:
    """Extract structured content from XHTML file (OLD VERSION)."""
    with open(xhtml_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Find the main chapter div/section
    # Try multiple ways to identify chapter content
    chapter_div = soup.find('div', class_='chapter')
    if not chapter_div:
        chapter_div = soup.find('section', {'data-type': 'chapter'})
    if not chapter_div:
        chapter_div = soup.find('section', attrs={'epub:type': 'chapter'})

    if not chapter_div:
        print("⚠️  Could not find chapter content in XHTML")
        return {
            'html': str(soup),
            'text': soup.get_text(),
            'images': [],
            'sections': []
        }

    # Extract chapter title
    title_elem = chapter_div.find('h1')
    title = title_elem.get_text() if title_elem else "Unknown Chapter"

    # Extract image references
    images = []
    for img in chapter_div.find_all('img'):
        src = img.get('src', '')
        if src:
            # Extract just the filename
            filename = src.split('/')[-1]
            images.append(filename)

    # Extract sections
    sections = []
    for section in chapter_div.find_all('section', {'data-type': 'sect1'}):
        sect_title_elem = section.find('h1')
        sect_title = sect_title_elem.get_text() if sect_title_elem else "Untitled Section"
        sections.append({
            'title': sect_title,
            'html': str(section)
        })

    return {
        'title': title,
        'html': str(chapter_div),
        'text': chapter_div.get_text(),
        'images': images,
        'sections': sections,
        'word_count': len(chapter_div.get_text().split())
    }


def upload_image(image_path: Path) -> Optional[str]:
    """Upload an image to the API and return its URL."""
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (image_path.name, f, 'image/png')}
            response = requests.post(f"{API_URL}/api/images/upload", files=files, headers=_auth_headers())

        if response.status_code == 200:
            data = response.json()
            return data.get('url')
        else:
            print(f"   ❌ Failed to upload {image_path.name}: {response.status_code}")
            return None
    except Exception as e:
        print(f"   ❌ Error uploading {image_path.name}: {e}")
        return None


def upload_images(image_paths: list[Path]) -> dict[str, str]:
    """Upload all images and return filename -> URL mapping."""
    print(f"\n🖼️  Uploading {len(image_paths)} images...")

    url_map = {}
    for image_path in image_paths:
        url = upload_image(image_path)
        if url:
            url_map[image_path.name] = url
            print(f"   ✅ {image_path.name} → {url}")
        else:
            print(f"   ⚠️  Skipped {image_path.name}")

    return url_map


def save_extracted_content(course_slug: str, chapter_num: int, content: dict, image_map: dict):
    """Save extracted content to a JSON file for Claude to process."""
    TEMP_DIR.mkdir(exist_ok=True)

    output_file = TEMP_DIR / f"chapter_{course_slug}_ch{chapter_num:02d}_extracted.json"

    data = {
        'course_slug': course_slug,
        'chapter_number': chapter_num,
        'content': content,
        'image_map': image_map,
        'instructions': {
            'task': 'Transform this chapter content into concise, pedagogical course material in French',
            'mandatory_structure': [
                '0. Introduction — 2-3 paragraphs, no <h2>, narrative tone',
                '1. <h2>Objectifs d\'apprentissage</h2> - 3-6 actionable objectives using action verbs',
                '2. <h2>Pourquoi c\'est important</h2> - Concrete impact (performance, security, etc.)',
                '3. Content sections — each <h2> MUST contain:',
                '   - <h3>Concept fondamental</h3>',
                '   - <h3>Mécanisme interne</h3>',
                '   - <h3>Exemple pratique</h3> (MANDATORY)',
                '   - <h3>Erreurs fréquentes</h3> (if relevant)',
                '4. <h2>Synthèse</h2> - Structured summary with key points'
            ],
            'critical_constraints': [
                '✅ Preserve ALL central mechanisms (technical explanations)',
                '✅ NEVER remove essential technical content',
                '✅ Simplify language WITHOUT making content incorrect/incomplete',
                '✅ Reduce length to 40-60% of original',
                '✅ Remove redundancies, digressions, tangential anecdotes'
            ],
            'html_guidelines': [
                'Use semantic HTML5 tags only (h2, h3, p, ul, ol, pre, code, blockquote)',
                'NO inline styles, NO presentational tags, NO CSS classes',
                'ALWAYS use <ul> and <ol> for lists — NEVER convert to paragraphs',
                'Mermaid diagrams: <pre><code class="language-mermaid">DIAGRAM_CODE</code></pre>',
                '  • 100% French in nodes/labels, max 6-8 nodes, prefer graph TD over graph LR',
                '  • Nodes: common nouns ("Serveur", "Client") — Labels: action nouns ("Requête", "Réponse")',
                '  • Technical names OK in English: PostgreSQL, FastAPI, HTTP, JSON',
                'Target 2-4 diagrams per chapter — only when they add clarity beyond text',
                'Code: complete, executable examples with comments',
                'NO external images — create Mermaid diagrams instead'
            ],
            'language_rules': [
                'French for running text, technical terms in English with explanation at first mention',
                '  • Format: Un <strong>buffer</strong> (tampon mémoire temporaire) stocke...',
                'NO Franglais: analyser (not "parser"), données (not "data"), fichier (not "file")',
                'Proper nouns without translation: Python, PostgreSQL, Docker, HTTP, JSON'
            ],
            'output_format': 'Return complete HTML content as a string following the mandatory structure'
        }
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n📝 Extracted content saved to: {output_file}")
    print(f"   Title: {content['title']}")
    print(f"   Word count: {content['word_count']:,}")
    print(f"   Sections: {len(content['sections'])}")
    print(f"   Images referenced: {len(content['images'])}")

    return output_file


def update_chapter(course_slug: str, chapter_slug: str, html_content: str) -> bool:
    """Update chapter content via API."""
    payload = {'content': html_content}

    response = requests.put(
        f"{API_URL}/api/courses/{course_slug}/chapters/{chapter_slug}",
        json=payload,
        headers=_auth_headers(),
    )

    if response.status_code == 200:
        return True
    else:
        print(f"❌ Failed to update chapter: {response.status_code} - {response.text}")
        return False


def update_chapter_synopsis(course_slug: str, chapter_slug: str, synopsis: str) -> bool:
    """Update chapter synopsis via API."""
    response = requests.put(
        f"{API_URL}/api/courses/{course_slug}/chapters/{chapter_slug}",
        json={'synopsis': synopsis},
        headers=_auth_headers(),
    )

    if response.status_code == 200:
        return True
    else:
        print(f"❌ Failed to update synopsis: {response.status_code} - {response.text}")
        return False


def create_exercise(chapter_id: int, exercise_data: dict) -> bool:
    """Create an exercise via API."""
    response = requests.post(
        f"{API_URL}/api/chapters/{chapter_id}/exercises",
        json=exercise_data,
        headers=_auth_headers(),
    )

    if response.status_code == 201:
        return True
    else:
        print(f"❌ Failed to create exercise: {response.status_code} - {response.text}")
        return False


def main():
    print("=" * 70)
    print("  Brainer Chapter Content Creator")
    print("=" * 70)

    # Parse arguments
    if len(sys.argv) < 3:
        print("\nUsage: python create_chapter.py <course-slug> <chapter-number>")
        print("\nParameters:")
        print("  <course-slug>: Course identifier (e.g., fundamentals-of-data-engineering)")
        print("  <chapter-number>: Chapter number to process (e.g., 1, 5)")
        print("\nExamples:")
        print("  python create_chapter.py fundamentals-of-data-engineering 1")
        print("  python create_chapter.py computer-systems-a-programmers-perspective 3")
        sys.exit(1)

    course_slug = sys.argv[1]

    try:
        chapter_num = int(sys.argv[2])
    except ValueError:
        print(f"❌ Chapter number must be an integer, got: {sys.argv[2]}")
        sys.exit(1)

    # Check backend
    if not check_backend():
        sys.exit(1)

    # Get course info
    print(f"\n📚 Fetching course: {course_slug}")
    course = get_course(course_slug)
    if not course:
        sys.exit(1)

    print(f"   ✅ Found: {course['title']}")
    course_title = course['title']

    # Get chapters
    print(f"\n📖 Fetching chapters...")
    chapters = get_chapters(course_slug)

    # Find the target chapter
    target_chapter = None
    for chapter in chapters:
        if chapter['order'] == chapter_num:
            target_chapter = chapter
            break

    if not target_chapter:
        print(f"❌ Chapter {chapter_num} not found in database")
        print(f"   Available chapters: {[c['order'] for c in chapters]}")
        sys.exit(1)

    print(f"   ✅ Chapter {chapter_num}: {target_chapter['title']}")
    chapter_slug = target_chapter['slug']
    chapter_id = target_chapter['id']

    # Find XHTML file
    print(f"\n📄 Finding chapter file...")
    xhtml_path = find_chapter_file(course_title, chapter_num, course_slug)
    if not xhtml_path:
        sys.exit(1)

    print(f"   ✅ Found: {xhtml_path}")

    # Find images
    print(f"\n🖼️  Finding associated images...")
    image_paths = find_chapter_images(course_title, chapter_num, course_slug)
    print(f"   ✅ Found {len(image_paths)} images")

    # Extract content
    print(f"\n📖 Extracting content from XHTML...")
    content = extract_content(xhtml_path)
    print(f"   ✅ Extracted: {content['word_count']:,} words, {len(content['sections'])} sections")

    # Skip image upload - we'll create diagrams instead
    print(f"\n🎨 Skipping image upload (will create diagrams in content)")
    image_map = {}  # Empty map - no images uploaded

    # Save extracted content for Claude to process
    output_file = save_extracted_content(course_slug, chapter_num, content, image_map)

    # Summary
    print("\n" + "=" * 70)
    print("  ✅ Extraction Complete!")
    print("=" * 70)
    print(f"\n  Next steps:")
    print(f"  1. Claude will read {output_file}")
    print(f"  2. Claude will generate pedagogical content in French")
    print(f"  3. Claude will update the chapter via API")
    print(f"\n  Chapter to update:")
    print(f"    Course: {course_slug}")
    print(f"    Chapter: {chapter_slug} (ID: {chapter_id})")
    print(f"    Order: {chapter_num}")
    print(f"\n  Note: Use /create-exercise skill separately to add exercises")
    print()


if __name__ == "__main__":
    main()
