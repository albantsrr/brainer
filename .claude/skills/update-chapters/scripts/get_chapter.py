#!/usr/bin/env python3
"""
Fetch current chapter HTML content from the Brainer API.

Saves the existing content to temp/ so Claude can read and modify it.

Usage:
    python get_chapter.py <course-slug> <chapter-number>

Output:
    temp/chapter_{course-slug}_ch{XX}_current.html  — current HTML content
    temp/chapter_{course-slug}_ch{XX}_meta.json     — chapter metadata (slug, id, title)
"""

import json
import os
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    sys.exit("ERROR: requests library not installed. Run: pip install requests")

API_URL = os.getenv("API_URL", "http://localhost:8000")
# Script is in .claude/skills/update-chapters/scripts/
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
TEMP_DIR = PROJECT_ROOT / "temp"


def check_backend():
    try:
        requests.get(f"{API_URL}/api/courses", timeout=2)
        return True
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Backend not accessible at {API_URL}: {e}")
        print("   Run: uvicorn api.main:app --reload --host 0.0.0.0\n")
        return False


def get_chapters(course_slug: str) -> list[dict]:
    response = requests.get(f"{API_URL}/api/courses/{course_slug}/chapters")
    if response.status_code == 404:
        print(f"❌ Course '{course_slug}' not found")
        return []
    if response.status_code != 200:
        print(f"❌ Failed to fetch chapters: {response.status_code} - {response.text}")
        return []
    return response.json()


def main():
    if len(sys.argv) < 3:
        print("Usage: python get_chapter.py <course-slug> <chapter-number>")
        print("\nExamples:")
        print("  python get_chapter.py fundamentals-of-data-engineering 1")
        print("  python get_chapter.py computer-systems-a-programmers-perspective 3")
        sys.exit(1)

    course_slug = sys.argv[1]
    try:
        chapter_num = int(sys.argv[2])
    except ValueError:
        print(f"❌ Chapter number must be an integer, got: {sys.argv[2]}")
        sys.exit(1)

    if not check_backend():
        sys.exit(1)

    print(f"\n📚 Fetching chapter {chapter_num} from '{course_slug}'...")
    chapters = get_chapters(course_slug)
    if not chapters:
        sys.exit(1)

    chapter_meta = next((c for c in chapters if c["order"] == chapter_num), None)
    if not chapter_meta:
        print(f"❌ Chapter {chapter_num} not found")
        print(f"   Available chapters: {sorted(c['order'] for c in chapters)}")
        sys.exit(1)

    # Fetch full chapter content via individual endpoint
    chapter_slug = chapter_meta["slug"]
    resp = requests.get(f"{API_URL}/api/courses/{course_slug}/chapters/{chapter_slug}")
    if resp.status_code != 200:
        print(f"❌ Failed to fetch chapter content: {resp.status_code} - {resp.text}")
        sys.exit(1)
    chapter = resp.json()

    TEMP_DIR.mkdir(exist_ok=True)

    # Save HTML content
    html_file = TEMP_DIR / f"chapter_{course_slug}_ch{chapter_num:02d}_current.html"
    content = chapter.get("content") or ""
    with open(html_file, "w", encoding="utf-8") as f:
        f.write(content)

    # Save metadata (including synopsis if present)
    synopsis = chapter.get("synopsis") or ""
    meta_file = TEMP_DIR / f"chapter_{course_slug}_ch{chapter_num:02d}_meta.json"
    with open(meta_file, "w", encoding="utf-8") as f:
        json.dump(
            {
                "id": chapter["id"],
                "slug": chapter["slug"],
                "title": chapter["title"],
                "order": chapter["order"],
                "course_slug": course_slug,
                "synopsis": synopsis,
            },
            f,
            indent=2,
            ensure_ascii=False,
        )

    print(f"✅ Chapter: {chapter['title']}")
    print(f"   Slug: {chapter['slug']}")
    print(f"   Content: {len(content):,} chars")
    synopsis_info = f"{len(synopsis):,} chars" if synopsis else "none"
    print(f"   Synopsis: {synopsis_info}")
    print(f"\n📄 Saved to:")
    print(f"   {html_file}")
    print(f"   {meta_file}")
    print(f"\n🔗 Update endpoint: PUT /api/courses/{course_slug}/chapters/{chapter['slug']}")


if __name__ == "__main__":
    main()
