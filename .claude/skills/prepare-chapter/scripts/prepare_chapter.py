#!/usr/bin/env python3
"""
Extract and prepare chapter content for pedagogical analysis.

This script:
1. Finds the chapter XHTML file(s) via source-map or fallback
2. Extracts and parses the content
3. Saves extracted content to temp/ for Claude to analyze

Usage:
    python prepare_chapter.py <course-slug> <chapter-number>

Parameters:
    <course-slug>: Course identifier (e.g., algebre-lineaire-geometrie)
    <chapter-number>: Chapter number to process (e.g., 1, 5)

Examples:
    python prepare_chapter.py algebre-lineaire-geometrie 1
    python prepare_chapter.py computer-systems-a-programmers-perspective 3
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
# Script is in .claude/skills/prepare-chapter/scripts/prepare_chapter.py
# Need to go up 5 levels to reach project root
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
BOOKS_DIR = PROJECT_ROOT / "books"
TEMP_DIR = PROJECT_ROOT / "temp"


def _auth_headers() -> dict:
    if BRAINER_TOKEN:
        return {"Authorization": f"Bearer {BRAINER_TOKEN}"}
    print("⚠️  BRAINER_TOKEN not set — write requests will fail (401).")
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


def load_source_map(course_slug: str) -> Optional[tuple[dict, Path]]:
    """Find source-map.json for this course. Returns (source_map, book_dir) or None."""
    for book_dir in BOOKS_DIR.iterdir():
        if not book_dir.is_dir():
            continue
        source_map_path = book_dir / "source-map.json"
        if source_map_path.exists():
            try:
                data = json.loads(source_map_path.read_text())
                if data.get("course_slug") == course_slug:
                    return data, book_dir
            except Exception:
                pass
    return None


def find_chapter_file_by_name(filename: str, book_dir: Path) -> Optional[Path]:
    """Find a specific XHTML file by name within a known book directory."""
    search_dirs = [
        book_dir / "OEBPS",
        book_dir / "OEBPS" / "OEBPS",
        book_dir,
    ]
    for search_dir in search_dirs:
        if not search_dir.exists():
            continue
        candidate = search_dir / filename
        if candidate.exists():
            return candidate
    return None


def find_chapter_file(course_title: str, chapter_num: int, course_slug: str = None) -> Optional[Path]:
    """Find the XHTML file for a specific chapter."""
    search_dirs = []
    if course_slug and BOOKS_DIR.exists():
        for book_dir in BOOKS_DIR.iterdir():
            if not book_dir.is_dir():
                continue
            plan_path = book_dir / "course-plan.json"
            if plan_path.exists():
                try:
                    with open(plan_path) as f:
                        plan = json.load(f)
                    if plan.get("course", {}).get("slug") == course_slug:
                        search_dirs.extend([
                            book_dir / "OEBPS",
                            book_dir / "OEBPS" / "OEBPS",
                            book_dir,
                        ])
                except Exception:
                    pass

    search_dirs.extend([
        BOOKS_DIR / course_title / "OEBPS",
        BOOKS_DIR / course_title / "OEBPS" / "OEBPS",
        BOOKS_DIR / course_title,
        BOOKS_DIR / f"{course_title}-normalized" / "OEBPS",
        BOOKS_DIR / f"{course_title}-normalized",
    ])

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
        chapter_file = book_dir / f"ch{chapter_num:02d}.xhtml"
        if chapter_file.exists():
            return chapter_file
        chapter_file = book_dir / f"ch{chapter_num}.xhtml"
        if chapter_file.exists():
            return chapter_file

    print(f"❌ Chapter file not found: ch{chapter_num:02d}.xhtml or ch{chapter_num}.xhtml")
    print(f"   Searched in: {', '.join(str(d) for d in search_dirs)}")
    return None


def _extract_scope(html: str, start_heading: str, end_heading: str | None = None) -> str:
    """Extract a heading-delimited section from an HTML string."""
    heading_tags = {"h1", "h2", "h3", "h4"}
    soup = BeautifulSoup(html, "html.parser")

    body = soup.body
    root_children = [el for el in (body or soup).children if hasattr(el, "name") and el.name]

    start_idx: int | None = None
    for i, el in enumerate(root_children):
        if el.name in heading_tags and start_heading.lower() in el.get_text().lower():
            start_idx = i
            break

    if start_idx is None:
        return html

    end_idx = len(root_children)
    if end_heading:
        for i in range(start_idx + 1, len(root_children)):
            if root_children[i].name in heading_tags and end_heading.lower() in root_children[i].get_text().lower():
                end_idx = i
                break

    return "\n".join(str(el) for el in root_children[start_idx:end_idx])


def extract_content(xhtml_paths: list[Path]) -> dict:
    """Extract structured content from one or more XHTML files."""
    content = ""
    for path in xhtml_paths:
        with open(path, 'r', encoding='utf-8') as f:
            content += f.read() + "\n"

    full_html_parts = []
    full_text_parts = []
    all_images = []

    xml_docs = content.split('<?xml version')
    for i, doc in enumerate(xml_docs):
        if i > 0:
            doc = '<?xml version' + doc
        if not doc.strip():
            continue
        try:
            soup = BeautifulSoup(doc, 'html.parser')
            body = soup.find('body')
            if body:
                full_html_parts.append(str(body))
                full_text_parts.append(body.get_text())
                for img in body.find_all('img'):
                    src = img.get('src', '')
                    if src:
                        filename = src.split('/')[-1]
                        if filename not in all_images:
                            all_images.append(filename)
        except Exception as e:
            print(f"   ⚠️  Could not parse document part {i}: {e}")
            continue

    if not full_html_parts:
        soup = BeautifulSoup(content, 'html.parser')
        full_html_parts = [str(soup)]
        full_text_parts = [soup.get_text()]
        for img in soup.find_all('img'):
            src = img.get('src', '')
            if src:
                filename = src.split('/')[-1]
                if filename not in all_images:
                    all_images.append(filename)

    combined_html = '\n'.join(full_html_parts)
    combined_text = '\n'.join(full_text_parts)

    soup = BeautifulSoup(content, 'html.parser')
    title_elem = soup.find('h1')
    title = title_elem.get_text() if title_elem else "Unknown Chapter"

    return {
        'title': title,
        'html': combined_html,
        'text': combined_text,
        'images': all_images,
        'word_count': len(combined_text.split())
    }


def save_extracted_content(course_slug: str, chapter_num: int, content: dict):
    """Save extracted content to a JSON file for Claude to analyze."""
    TEMP_DIR.mkdir(exist_ok=True)
    output_file = TEMP_DIR / f"chapter_{course_slug}_ch{chapter_num:02d}_extracted.json"

    data = {
        'course_slug': course_slug,
        'chapter_number': chapter_num,
        'content': content,
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n📝 Extracted content saved to: {output_file}")
    print(f"   Title: {content['title']}")
    print(f"   Word count: {content['word_count']:,}")
    print(f"   Images referenced: {len(content['images'])}")

    return output_file


def main():
    print("=" * 70)
    print("  Brainer — Prepare Chapter (Extract & Analyze)")
    print("=" * 70)

    if len(sys.argv) < 3:
        print("\nUsage: python prepare_chapter.py <course-slug> <chapter-number>")
        print("\nExamples:")
        print("  python prepare_chapter.py algebre-lineaire-geometrie 1")
        print("  python prepare_chapter.py computer-systems-a-programmers-perspective 3")
        sys.exit(1)

    course_slug = sys.argv[1]
    try:
        chapter_num = int(sys.argv[2])
    except ValueError:
        print(f"❌ Chapter number must be an integer, got: {sys.argv[2]}")
        sys.exit(1)

    if not check_backend():
        sys.exit(1)

    print(f"\n📚 Fetching course: {course_slug}")
    course = get_course(course_slug)
    if not course:
        sys.exit(1)
    print(f"   ✅ Found: {course['title']} (difficulty: {course.get('difficulty', 'N/A')})")
    course_title = course['title']

    print(f"\n📖 Fetching chapters...")
    chapters = get_chapters(course_slug)

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

    print(f"\n📄 Finding chapter source files...")
    xhtml_paths = []
    scope_headings: dict | None = None

    result = load_source_map(course_slug)
    if result and chapter_slug in result[0].get("chapters", {}):
        source_map, book_dir = result
        chapter_entry = source_map["chapters"][chapter_slug]
        source_filenames = chapter_entry["source_files"]
        scope_headings = chapter_entry.get("scope_headings")
        print(f"   📌 Source map found: {len(source_filenames)} file(s)")
        if scope_headings:
            print(f"   🔍 Scope: {scope_headings}")
        for filename in source_filenames:
            path = find_chapter_file_by_name(filename, book_dir)
            if path:
                xhtml_paths.append(path)
                print(f"   ✅ {filename} → {path}")
            else:
                print(f"   ⚠️  File not found: {filename}")
        if not xhtml_paths:
            print("❌ None of the source files could be located")
            sys.exit(1)
    else:
        print(f"   ℹ️  No source map — falling back to ch{chapter_num:02d}.xhtml")
        xhtml_path = find_chapter_file(course_title, chapter_num, course_slug)
        if not xhtml_path:
            sys.exit(1)
        xhtml_paths = [xhtml_path]
        print(f"   ✅ Found: {xhtml_path}")

    print(f"\n📖 Extracting content from {len(xhtml_paths)} XHTML file(s)...")
    content = extract_content(xhtml_paths)
    print(f"   ✅ Extracted: {content['word_count']:,} words")

    if scope_headings:
        start = scope_headings.get("start", "")
        end = scope_headings.get("end")
        if start:
            scoped_html = _extract_scope(content["html"], start, end)
            if scoped_html != content["html"]:
                scoped_words = len(BeautifulSoup(scoped_html, "html.parser").get_text().split())
                print(f"   🔍 Scope applied: {content['word_count']:,} → {scoped_words:,} words")
                content["html"] = scoped_html
                content["text"] = BeautifulSoup(scoped_html, "html.parser").get_text()
                content["word_count"] = scoped_words
            else:
                print(f"   ⚠️  Scope heading '{start}' not found — using full content")

    output_file = save_extracted_content(course_slug, chapter_num, content)

    print("\n" + "=" * 70)
    print("  ✅ Extraction Complete — Ready for Analysis")
    print("=" * 70)
    print(f"\n  Chapter info:")
    print(f"    Course:    {course_slug}")
    print(f"    Chapter:   {chapter_slug} (order: {chapter_num})")
    print(f"    Difficulty: {course.get('difficulty', 'intermediaire')}")
    print(f"\n  Extracted content: {output_file}")
    print(f"\n  Next: Claude analyzes the content and produces a pedagogical plan")
    print(f"  Plan will be saved to: temp/chapter_plan_{course_slug}_ch{chapter_num:02d}.md")
    print()


if __name__ == "__main__":
    main()
