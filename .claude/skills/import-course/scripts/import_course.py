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
import subprocess
import sys
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    sys.exit("ERROR: requests library not installed. Run: pip install requests")


# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent  # Go up to /home/teissier/brainer
BOOKS_DIR = PROJECT_ROOT / "books"
PARSE_TOC_SCRIPT = Path(__file__).parent / "parse_toc.py"  # Now in same scripts directory
TEMP_DIR = PROJECT_ROOT / "temp"
COURSE_PLAN_FILE = TEMP_DIR / "course-plan.json"
COURSE_PLAN_FR_FILE = TEMP_DIR / "course-plan-fr.json"


def find_books() -> list[tuple[str, Path]]:
    """Find all books with toc.ncx files OR normalized directories with course-plan.json."""
    books = []

    # Find books with toc.ncx
    for toc_path in BOOKS_DIR.rglob("toc.ncx"):
        book_name = toc_path.parent.name
        books.append((book_name, toc_path))

    # Find normalized books (directories ending with -normalized containing course-plan.json)
    for book_dir in BOOKS_DIR.iterdir():
        if book_dir.is_dir() and book_dir.name.endswith('-normalized'):
            plan_path = book_dir / "course-plan.json"
            if not plan_path.exists():
                # Try parent directory
                plan_path = book_dir.parent / "course-plan.json"

            if plan_path.exists():
                books.append((book_dir.name, plan_path))

    return books


def find_book_by_name(name: str) -> Optional[Path]:
    """Find toc.ncx or course-plan.json for a specific book name."""
    books = find_books()
    for book_name, path in books:
        if book_name.lower() == name.lower():
            return path
    return None


def parse_toc(toc_or_plan_path: Path) -> dict:
    """Run parse_toc.py or load existing course-plan.json."""

    # Ensure temp directory exists
    TEMP_DIR.mkdir(exist_ok=True)

    # Check if this is already a course-plan.json file
    if toc_or_plan_path.name == "course-plan.json":
        print(f"📖 Loading existing course plan: {toc_or_plan_path}")
        with open(toc_or_plan_path, "r", encoding="utf-8") as f:
            return json.load(f)

    # Otherwise, parse toc.ncx
    print(f"📖 Parsing TOC: {toc_or_plan_path}")

    # Run parse_toc.py
    result = subprocess.run(
        [sys.executable, str(PARSE_TOC_SCRIPT), str(toc_or_plan_path)],
        cwd=PROJECT_ROOT,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        print(f"ERROR running parse_toc.py:\n{result.stderr}")
        sys.exit(1)

    print(result.stdout)  # Show parse_toc.py output

    # Check if parse_toc.py created the file at the old location (root)
    old_plan_file = PROJECT_ROOT / "course-plan.json"
    if old_plan_file.exists() and not COURSE_PLAN_FILE.exists():
        # Move it to temp/
        print(f"   📁 Moving course-plan.json to temp/")
        old_plan_file.rename(COURSE_PLAN_FILE)

    # Read generated course-plan.json
    if not COURSE_PLAN_FILE.exists():
        sys.exit(f"ERROR: {COURSE_PLAN_FILE} was not created")

    with open(COURSE_PLAN_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def create_course(plan: dict) -> str:
    """Create the course via API. Returns course slug."""
    course_info = plan["course"]

    payload = {
        "title": course_info["title"],
        "slug": course_info["slug"],
        "description": f"by {course_info['author']}" if course_info.get("author") else None
    }

    print(f"\n🎓 Creating course: {payload['title']}")
    print(f"   Slug: {payload['slug']}")

    response = requests.post(f"{API_URL}/api/courses", json=payload)

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
            json=payload
        )

        if response.status_code == 201:
            part_data = response.json()
            part_ids[part["order"]] = part_data["id"]
            print(f"   ✅ Part {part['order']}: {part['title']}")
        else:
            print(f"   ❌ Failed to create part: {response.status_code} - {response.text}")
            sys.exit(1)

    return part_ids


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
                json=payload
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

    # Parse arguments
    generate_only = "--generate-plan" in sys.argv
    if generate_only:
        sys.argv.remove("--generate-plan")

    # Check if backend is running (skip if only generating plan)
    if not generate_only:
        try:
            response = requests.get(f"{API_URL}/api/courses", timeout=2)
        except requests.exceptions.RequestException:
            sys.exit(f"\n❌ Backend not accessible at {API_URL}\n   Make sure to run: uvicorn api.main:app --reload --host 0.0.0.0\n")

    # Find books
    books = find_books()

    if not books:
        sys.exit(f"\n❌ No books with toc.ncx found in {BOOKS_DIR}\n")

    # If no book name provided, list available books
    if len(sys.argv) < 2:
        print(f"\n📚 Found {len(books)} book(s):\n")
        for book_name, toc_path in books:
            print(f"   • {book_name}")
        print(f"\nUsage: python {Path(__file__).name} [--generate-plan] \"Book Title\"")
        sys.exit(0)

    # Import specific book
    book_name = sys.argv[1]
    toc_path = find_book_by_name(book_name)

    if not toc_path:
        print(f"\n❌ Book '{book_name}' not found.\n")
        print("Available books:")
        for name, _ in books:
            print(f"   • {name}")
        sys.exit(1)

    # Parse TOC
    plan = parse_toc(toc_path)

    # If generate-only mode, stop here
    if generate_only:
        print("\n" + "=" * 70)
        print("  ✅ Course plan generated!")
        print("=" * 70)
        print(f"\n  File: {COURSE_PLAN_FILE}")
        print(f"\n  Next step: Claude will translate this file to French")
        print(f"  French file will be saved as: {COURSE_PLAN_FR_FILE}")
        print(f"  Then run without --generate-plan to import\n")
        sys.exit(0)

    # Check if French translation exists
    if COURSE_PLAN_FR_FILE.exists():
        print(f"\n📝 Using French translation: {COURSE_PLAN_FR_FILE}")
        with open(COURSE_PLAN_FR_FILE, "r", encoding="utf-8") as f:
            plan = json.load(f)
    else:
        print(f"\n⚠️  No French translation found at {COURSE_PLAN_FR_FILE}")
        print("   Using English version (not recommended)")
        print(f"   Run with --generate-plan first to create French translation")

    # Create course structure
    course_slug = create_course(plan)
    part_ids = create_parts(course_slug, plan["parts"])
    create_chapters(course_slug, plan["parts"], part_ids)

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
