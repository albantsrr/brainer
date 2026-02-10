#!/usr/bin/env python3
"""
Create pedagogical chapter content from EPUB XHTML files.

This script:
1. Finds the chapter XHTML file and associated images
2. Extracts and parses the content
3. Uploads images to the API
4. Outputs extracted content for Claude to transform
5. Updates the chapter in the database

Usage:
    python create_chapter.py <course-slug> <chapter-number>

Examples:
    python create_chapter.py fundamentals-of-data-engineering 1
    python create_chapter.py fundamentals-of-data-engineering 5
"""

import json
import os
import re
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
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent  # Up to /home/teissier/brainer
BOOKS_DIR = PROJECT_ROOT / "books"


def check_backend():
    """Verify backend is accessible."""
    try:
        response = requests.get(f"{API_URL}/api/courses", timeout=2)
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


def find_chapter_file(course_title: str, chapter_num: int) -> Optional[Path]:
    """Find the XHTML file for a specific chapter."""
    book_dir = BOOKS_DIR / course_title / "OEBPS"

    if not book_dir.exists():
        print(f"❌ Book directory not found: {book_dir}")
        return None

    # Try zero-padded (ch01.xhtml)
    chapter_file = book_dir / f"ch{chapter_num:02d}.xhtml"
    if chapter_file.exists():
        return chapter_file

    # Try without padding (ch1.xhtml)
    chapter_file = book_dir / f"ch{chapter_num}.xhtml"
    if chapter_file.exists():
        return chapter_file

    print(f"❌ Chapter file not found: ch{chapter_num:02d}.xhtml or ch{chapter_num}.xhtml")
    return None


def find_chapter_images(course_title: str, chapter_num: int) -> list[Path]:
    """Find all images associated with a chapter."""
    images_dir = BOOKS_DIR / course_title / "OEBPS" / "Images"

    if not images_dir.exists():
        print(f"⚠️  Images directory not found: {images_dir}")
        return []

    # Pattern: fode_01*.png for chapter 1, fode_02*.png for chapter 2, etc.
    pattern = f"fode_{chapter_num:02d}*.png"

    images = list(images_dir.glob(pattern))

    # Also try without zero-padding for chapters >= 10
    if chapter_num >= 10:
        pattern = f"fode_{chapter_num}*.png"
        images.extend(images_dir.glob(pattern))

    # Remove duplicates and sort
    images = sorted(set(images))

    return images


def extract_content(xhtml_path: Path) -> dict:
    """Extract structured content from XHTML file."""
    with open(xhtml_path, 'r', encoding='utf-8') as f:
        content = f.read()

    soup = BeautifulSoup(content, 'html.parser')

    # Find the main chapter div
    chapter_div = soup.find('div', class_='chapter')
    if not chapter_div:
        chapter_div = soup.find('section', {'data-type': 'chapter'})

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
            response = requests.post(f"{API_URL}/api/images/upload", files=files)

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
    output_file = PROJECT_ROOT / f"chapter_{course_slug}_ch{chapter_num:02d}_extracted.json"

    data = {
        'course_slug': course_slug,
        'chapter_number': chapter_num,
        'content': content,
        'image_map': image_map,
        'instructions': {
            'task': 'Transform this chapter content into concise, pedagogical course material in French',
            'guidelines': [
                'Create structured HTML content using semantic tags (h2, h3, p, ul, ol, pre, code, blockquote, figure)',
                'Aim for 40-60% of original length while preserving key concepts',
                'Replace image references with URLs from image_map',
                'Focus on learning objectives and practical understanding',
                'Use clear, simple language',
                'Add descriptive captions for images'
            ],
            'output_format': 'Return complete HTML content as a string'
        }
    }

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"\n📝 Extracted content saved to: {output_file}")
    print(f"   Title: {content['title']}")
    print(f"   Word count: {content['word_count']:,}")
    print(f"   Sections: {len(content['sections'])}")
    print(f"   Images referenced: {len(content['images'])}")
    print(f"   Images uploaded: {len(image_map)}")

    return output_file


def update_chapter(course_slug: str, chapter_slug: str, html_content: str) -> bool:
    """Update chapter content via API."""
    payload = {'content': html_content}

    response = requests.put(
        f"{API_URL}/api/courses/{course_slug}/chapters/{chapter_slug}",
        json=payload
    )

    if response.status_code == 200:
        return True
    else:
        print(f"❌ Failed to update chapter: {response.status_code} - {response.text}")
        return False


def create_exercise(chapter_id: int, exercise_data: dict) -> bool:
    """Create an exercise via API."""
    response = requests.post(
        f"{API_URL}/api/chapters/{chapter_id}/exercises",
        json=exercise_data
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
        print("\nExamples:")
        print("  python create_chapter.py fundamentals-of-data-engineering 1")
        print("  python create_chapter.py fundamentals-of-data-engineering 5")
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
    xhtml_path = find_chapter_file(course_title, chapter_num)
    if not xhtml_path:
        sys.exit(1)

    print(f"   ✅ Found: {xhtml_path}")

    # Find images
    print(f"\n🖼️  Finding associated images...")
    image_paths = find_chapter_images(course_title, chapter_num)
    print(f"   ✅ Found {len(image_paths)} images")

    # Extract content
    print(f"\n📖 Extracting content from XHTML...")
    content = extract_content(xhtml_path)
    print(f"   ✅ Extracted: {content['word_count']:,} words, {len(content['sections'])} sections")

    # Upload images
    image_map = upload_images(image_paths)

    # Save extracted content for Claude to process
    output_file = save_extracted_content(course_slug, chapter_num, content, image_map)

    # Summary
    print("\n" + "=" * 70)
    print("  ✅ Extraction Complete!")
    print("=" * 70)
    print(f"\n  Next steps:")
    print(f"  1. Claude will read {output_file}")
    print(f"  2. Claude will generate pedagogical content in French")
    print(f"  3. Claude will create 2-4 exercises")
    print(f"  4. Claude will update the chapter via API")
    print(f"\n  Chapter to update:")
    print(f"    Course: {course_slug}")
    print(f"    Chapter: {chapter_slug} (ID: {chapter_id})")
    print(f"    Order: {chapter_num}")
    print()


if __name__ == "__main__":
    main()
