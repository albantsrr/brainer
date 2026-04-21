#!/usr/bin/env python3
"""
Generate pedagogical chapter content from a pre-analyzed plan.

This script:
1. Verifies the chapter plan file exists (produced by /prepare-chapter)
2. Displays key metadata for Claude to proceed with generation
3. Provides update_chapter() for Claude to call via API

Usage:
    python generate_chapter.py <course-slug> <chapter-number>

Parameters:
    <course-slug>: Course identifier (e.g., algebre-lineaire-geometrie)
    <chapter-number>: Chapter number to process (e.g., 1, 5)

Examples:
    python generate_chapter.py algebre-lineaire-geometrie 1
    python generate_chapter.py computer-systems-a-programmers-perspective 3
"""

import json
import os
import sys
from pathlib import Path
from typing import Optional

try:
    import requests
except ImportError:
    sys.exit("ERROR: requests library not installed. Run: pip install requests")


# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")
BRAINER_TOKEN = os.getenv("BRAINER_TOKEN", "")
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
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


def read_chapter_plan(course_slug: str, chapter_num: int) -> Optional[dict]:
    """Read and parse the chapter plan file produced by /prepare-chapter."""
    plan_file = TEMP_DIR / f"chapter_plan_{course_slug}_ch{chapter_num:02d}.md"

    if not plan_file.exists():
        print(f"❌ Plan file not found: {plan_file}")
        print(f"   Run /prepare-chapter {course_slug} {chapter_num} first.")
        return None

    content = plan_file.read_text(encoding="utf-8")

    # Parse YAML frontmatter
    metadata = {}
    if content.startswith("---"):
        end = content.find("---", 3)
        if end != -1:
            frontmatter = content[3:end].strip()
            for line in frontmatter.splitlines():
                if ":" in line:
                    key, _, value = line.partition(":")
                    metadata[key.strip()] = value.strip()

    return {
        "file": str(plan_file),
        "content": content,
        "metadata": metadata,
    }


def update_chapter(course_slug: str, chapter_slug: str, html_content: str) -> bool:
    """Update chapter content via API."""
    response = requests.put(
        f"{API_URL}/api/courses/{course_slug}/chapters/{chapter_slug}",
        json={"content": html_content},
        headers=_auth_headers(),
    )

    if response.status_code == 200:
        print(f"✅ Chapter '{chapter_slug}' updated successfully")
        return True
    else:
        print(f"❌ Failed to update chapter: {response.status_code} - {response.text}")
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
    print("  Brainer — Generate Chapter (Content Generation)")
    print("=" * 70)

    if len(sys.argv) < 3:
        print("\nUsage: python generate_chapter.py <course-slug> <chapter-number>")
        print("\nExamples:")
        print("  python generate_chapter.py algebre-lineaire-geometrie 1")
        print("  python generate_chapter.py computer-systems-a-programmers-perspective 3")
        sys.exit(1)

    course_slug = sys.argv[1]
    try:
        chapter_num = int(sys.argv[2])
    except ValueError:
        print(f"❌ Chapter number must be an integer, got: {sys.argv[2]}")
        sys.exit(1)

    if not check_backend():
        sys.exit(1)

    print(f"\n📋 Looking for chapter plan...")
    plan = read_chapter_plan(course_slug, chapter_num)
    if not plan:
        sys.exit(1)

    meta = plan["metadata"]
    print(f"   ✅ Plan found: {plan['file']}")
    print(f"\n  Chapter metadata:")
    print(f"    Course slug:    {meta.get('course_slug', course_slug)}")
    print(f"    Chapter slug:   {meta.get('chapter_slug', 'N/A')}")
    print(f"    Chapter number: {meta.get('chapter_number', chapter_num)}")
    print(f"    Difficulty:     {meta.get('difficulty', 'N/A')}")
    print(f"    Posture:        {meta.get('posture', 'N/A')}")
    print(f"    Strategies:     {meta.get('strategies', 'N/A')}")

    print(f"\n  References to load for generation:")
    posture = meta.get('posture', '').strip()
    strategies_raw = meta.get('strategies', '[]').strip().strip('[]')
    strategies = [s.strip() for s in strategies_raw.split(',') if s.strip()]

    print(f"    Base: 00_principes, 01_structure, 02_langue_francais")
    if posture:
        print(f"    Posture: {posture}")
    for s in strategies:
        print(f"    Strategy: {s}")

    print(f"\n  Plan file: {plan['file']}")
    print(f"\n  Next: Claude reads the plan and generates pedagogical content")
    print(f"  Do NOT reload XHTML or previous synopses — the plan is self-contained")
    print()


if __name__ == "__main__":
    main()
