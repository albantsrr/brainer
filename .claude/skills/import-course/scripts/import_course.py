#!/usr/bin/env python3
"""
Import a course from an EPUB book into the Brainer database.

This script:
1. Finds toc.ncx files in the books/ directory
2. Calls parse_toc.py to generate course-plan.json
3. Makes REST API calls to create Course, Parts, and Chapters

Usage:
    python import_course.py                    # List available books
    python import_course.py "Book Title"       # Import specific book
"""

import json
import os
import shutil
import sys
import time
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    sys.exit("ERROR: requests library not installed. Run: pip install requests")


# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
BRAINER_TOKEN = os.getenv("BRAINER_TOKEN", "")
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent  # Go up to /home/teissier/brainer
BOOKS_DIR = PROJECT_ROOT / "books"
TEMP_DIR = PROJECT_ROOT / "temp"
COURSE_PLAN_FR_FILE = TEMP_DIR / "course-plan-fr.json"


def _auth_headers() -> dict:
    if BRAINER_TOKEN:
        return {"Authorization": f"Bearer {BRAINER_TOKEN}"}
    print("⚠️  BRAINER_TOKEN not set — write requests will fail (401). Get a token via POST /api/auth/login")
    return {}


def clear_temp_dir():
    """Clear the temp/ directory before starting."""
    if TEMP_DIR.exists():
        print(f"🗑️  Clearing temp directory: {TEMP_DIR}")
        shutil.rmtree(TEMP_DIR)
    TEMP_DIR.mkdir(exist_ok=True)
    print(f"   ✅ Temp directory ready")


def find_books() -> list[tuple[str, Path]]:
    """Find all books with course-plan.json in their directory."""
    books = []

    # Search for course-plan.json in all book directories
    for book_dir in BOOKS_DIR.iterdir():
        if not book_dir.is_dir():
            continue

        plan_path = book_dir / "course-plan.json"
        if plan_path.exists():
            books.append((book_dir.name, plan_path))

    return books


def find_book_by_name(name: str) -> Optional[Path]:
    """Find course-plan.json for a specific book name."""
    books = find_books()
    for book_name, path in books:
        if book_name.lower() == name.lower():
            return path
    return None


def load_course_plan(plan_path: Path) -> dict:
    """Load course-plan.json from book directory."""
    print(f"📖 Loading course plan: {plan_path}")

    if not plan_path.exists():
        sys.exit(f"ERROR: {plan_path} not found")

    with open(plan_path, "r", encoding="utf-8") as f:
        return json.load(f)


def create_course(plan: dict) -> str:
    """Create the course via API. Returns course slug."""
    course_info = plan["course"]

    payload = {
        "title": course_info["title"],
        "slug": course_info["slug"],
        "description": course_info.get("description")
    }

    print(f"\n🎓 Creating course: {payload['title']}")
    print(f"   Slug: {payload['slug']}")

    response = requests.post(f"{API_URL}/api/courses", json=payload, headers=_auth_headers())

    if response.status_code == 201:
        print("   ✅ Course created")
        return payload["slug"]
    elif response.status_code == 400 and "already exists" in response.text.lower():
        print("   ⚠️  Course already exists")
        return payload["slug"]
    else:
        print(f"   ❌ Failed: {response.status_code} - {response.text}")
        sys.exit(1)


def create_parts(course_slug: str, parts: list[dict]) -> dict[int, int]:
    """Create parts via API. Returns mapping of order -> part_id."""
    print(f"\n📚 Creating {len(parts)} parts...")

    part_ids = {}

    for part in parts:
        payload = {
            "order": part["order"],
            "title": part["title"],
            "description": ""
        }

        response = requests.post(
            f"{API_URL}/api/courses/{course_slug}/parts",
            json=payload,
            headers=_auth_headers(),
        )

        if response.status_code == 201:
            part_data = response.json()
            part_ids[part["order"]] = part_data["id"]
            print(f"   ✅ Part {part['order']}: {part['title']}")
        else:
            print(f"   ❌ Failed to create part: {response.status_code} - {response.text}")
            sys.exit(1)

    return part_ids


def write_source_map(plan_path: Path, plan: dict):
    """Write books/{book-dir}/source-map.json for create-chapters to find source files."""
    source_map = {
        "course_slug": plan["course"]["slug"],
        "chapters": {}
    }
    for part in plan["parts"]:
        for ch in part["chapters"]:
            source_files = ch.get("source_files", [])
            if source_files:
                source_map["chapters"][ch["slug"]] = {
                    "source_files": source_files
                }

    if not source_map["chapters"]:
        print("   ⚠️  No source_files found in course-plan-fr.json — skipping source-map")
        return

    out = plan_path.parent / "source-map.json"
    out.write_text(json.dumps(source_map, indent=2, ensure_ascii=False) + "\n")
    print(f"   📌 Source map saved: {out}")


def create_chapters(course_slug: str, parts: list[dict], part_ids: dict[int, int]):
    """Create chapters via API."""
    total_chapters = sum(len(part["chapters"]) for part in parts)
    print(f"\n📝 Creating {total_chapters} chapters...")

    for part in parts:
        part_id = part_ids[part["order"]]

        for chapter in part["chapters"]:
            payload = {
                "part_id": part_id,
                "order": chapter["order"],
                "title": chapter["title"],
                "slug": chapter["slug"],
                "content": "<p>Content will be added in a future step.</p>"
            }

            response = requests.post(
                f"{API_URL}/api/courses/{course_slug}/chapters",
                json=payload,
                headers=_auth_headers(),
            )

            if response.status_code == 201:
                print(f"   ✅ Chapter {chapter['order']:2d}: {chapter['title']}")
            else:
                print(f"   ❌ Failed to create chapter: {response.status_code} - {response.text}")
                sys.exit(1)


def main():
    print("=" * 70)
    print("  Brainer Course Importer")
    print("=" * 70)

    # Ensure temp directory exists (without clearing it)
    TEMP_DIR.mkdir(exist_ok=True)

    # Check if backend is running
    try:
        requests.get(f"{API_URL}/api/courses", timeout=2)
    except requests.exceptions.RequestException:
        sys.exit(f"\n❌ Backend not accessible at {API_URL}\n   Make sure to run: uvicorn api.main:app --reload --host 0.0.0.0\n")

    # Find books with course-plan.json
    books = find_books()

    if not books:
        sys.exit(f"\n❌ No books with course-plan.json found in {BOOKS_DIR}\n   Run /reformat-epub first to generate course-plan.json\n")

    # If no book name provided, list available books
    if len(sys.argv) < 2:
        print(f"\n📚 Found {len(books)} book(s) with course-plan.json:\n")
        for book_name, plan_path in books:
            print(f"   • {book_name}")
        print(f"\nUsage: python {Path(__file__).name} \"Book Directory Name\"")
        sys.exit(0)

    # Import specific book
    book_name = sys.argv[1]
    plan_path = find_book_by_name(book_name)

    if not plan_path:
        print(f"\n❌ Book '{book_name}' not found.\n")
        print("Available books:")
        for name, _ in books:
            print(f"   • {name}")
        sys.exit(1)

    # Load course plan from book directory
    plan = load_course_plan(plan_path)

    print(f"\n📝 Course plan loaded successfully")
    print(f"   Course: {plan['course']['title']}")
    print(f"   Parts: {plan['summary']['parts']}")
    print(f"   Chapters: {plan['summary']['chapters']}")

    # Ask Claude to translate to French and save to temp/course-plan-fr.json
    print(f"\n⚠️  IMPORTANT: Claude must now translate the course plan to French")
    print(f"   Source: {plan_path}")
    print(f"   Target: {COURSE_PLAN_FR_FILE}")
    print(f"\n   After translation, this script will import using the French version.\n")

    # Check if French translation exists in temp/
    if COURSE_PLAN_FR_FILE.exists():
        print(f"\n✅ French translation found: {COURSE_PLAN_FR_FILE}")
        with open(COURSE_PLAN_FR_FILE, "r", encoding="utf-8") as f:
            plan = json.load(f)
    else:
        sys.exit(f"\n❌ Please create French translation at {COURSE_PLAN_FR_FILE} before importing")

    # Create course structure
    course_slug = create_course(plan)
    part_ids = create_parts(course_slug, plan["parts"])
    create_chapters(course_slug, plan["parts"], part_ids)

    # Write persistent source map for /create-chapters to use
    print(f"\n📌 Writing source map...")
    write_source_map(plan_path, plan)

    # Summary
    summary = plan["summary"]
    print("\n" + "=" * 70)
    print("  ✅ Import Complete!")
    print("=" * 70)
    print(f"\n  Course:   {plan['course']['title']}")
    print(f"  Slug:     {course_slug}")
    print(f"  Parts:    {summary['parts']}")
    print(f"  Chapters: {summary['chapters']}")
    print(f"\n  View at:  http://localhost:3000/courses/{course_slug}\n")


if __name__ == "__main__":
    main()
