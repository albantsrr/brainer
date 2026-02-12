#!/usr/bin/env python3
"""
Reformat EPUB - Main orchestration script for the /reformat-epub skill

This script provides an intelligent pipeline that:
1. Analyzes EPUB structure to determine if it's standard or malformed
2. Routes to the appropriate processing pipeline (parse_toc or normalize_epub)
3. Validates the output
4. Reports results and next steps

Usage:
    python reformat_epub.py "books/Book Name/"
    python reformat_epub.py "books/Book Name/" --analyze-only
    python reformat_epub.py "books/Book Name/" --force-normalize
"""

import argparse
import json
import subprocess
import sys
from pathlib import Path
from typing import Optional, Tuple

# Project paths
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent.parent
SCRIPTS_DIR = PROJECT_ROOT / "scripts"
BOOKS_DIR = PROJECT_ROOT / "books"


def print_header(title: str):
    """Print a formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")


def print_step(step: str):
    """Print a step indicator."""
    print(f"\n📍 {step}")
    print("-" * 70)


def find_book_path(book_name: str) -> Optional[Path]:
    """Find the book directory in books/."""
    book_path = BOOKS_DIR / book_name
    if book_path.exists() and book_path.is_dir():
        return book_path

    # Try case-insensitive search
    for book_dir in BOOKS_DIR.iterdir():
        if book_dir.is_dir() and book_dir.name.lower() == book_name.lower():
            return book_dir

    return None


def has_toc_ncx(book_path: Path) -> bool:
    """Check if the book has a toc.ncx file."""
    toc_files = list(book_path.rglob("toc.ncx"))
    return len(toc_files) > 0


def has_course_plan(book_path: Path) -> bool:
    """Check if course-plan.json already exists for this book."""
    return (book_path / "course-plan.json").exists() or (PROJECT_ROOT / "course-plan.json").exists()


def analyze_epub(book_path: Path) -> dict:
    """Run epub_analyzer.py and parse its output."""
    print_step("Step 1: Analyzing EPUB structure")

    analyzer_script = SCRIPTS_DIR / "epub_analyzer.py"
    if not analyzer_script.exists():
        print(f"⚠️  Warning: epub_analyzer.py not found at {analyzer_script}")
        return {"status": "unknown", "has_toc": has_toc_ncx(book_path)}

    try:
        result = subprocess.run(
            [sys.executable, str(analyzer_script), str(book_path)],
            capture_output=True,
            text=True,
            check=False
        )

        # Display the analyzer output
        print(result.stdout)
        if result.stderr:
            print("Errors/Warnings:", result.stderr)

        # Determine if standard or malformed based on toc.ncx presence
        has_toc = has_toc_ncx(book_path)

        return {
            "status": "success",
            "has_toc": has_toc,
            "recommendation": "parse_toc" if has_toc else "normalize",
            "output": result.stdout
        }

    except Exception as e:
        print(f"❌ Error running analyzer: {e}")
        return {"status": "error", "error": str(e), "has_toc": has_toc_ncx(book_path)}


def parse_toc_pipeline(book_path: Path) -> bool:
    """Run parse_toc.py for standard EPUBs."""
    print_step("Step 2: Parsing TOC (standard EPUB)")

    parse_toc_script = SCRIPTS_DIR / "parse_toc.py"
    if not parse_toc_script.exists():
        print(f"❌ Error: parse_toc.py not found at {parse_toc_script}")
        return False

    try:
        result = subprocess.run(
            [sys.executable, str(parse_toc_script), str(book_path)],
            capture_output=True,
            text=True,
            check=True
        )

        print(result.stdout)
        if result.stderr:
            print("Warnings:", result.stderr)

        # Check if course-plan.json was created
        course_plan_path = PROJECT_ROOT / "course-plan.json"
        if course_plan_path.exists():
            print(f"✅ course-plan.json created successfully at {course_plan_path}")
            return True
        else:
            print("⚠️  Warning: parse_toc.py ran but course-plan.json not found")
            return False

    except subprocess.CalledProcessError as e:
        print(f"❌ Error running parse_toc.py:")
        print(e.stdout)
        print(e.stderr)
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def normalize_epub_pipeline(book_path: Path) -> Tuple[bool, Optional[Path]]:
    """Run normalize_epub.py for malformed EPUBs."""
    print_step("Step 2: Normalizing EPUB (non-standard structure)")

    normalize_script = SCRIPTS_DIR / "normalize_epub.py"
    if not normalize_script.exists():
        print(f"❌ Error: normalize_epub.py not found at {normalize_script}")
        return False, None

    try:
        result = subprocess.run(
            [sys.executable, str(normalize_script), str(book_path)],
            capture_output=True,
            text=True,
            check=True
        )

        print(result.stdout)
        if result.stderr:
            print("Warnings:", result.stderr)

        # Find the normalized output directory
        normalized_name = book_path.name.lower().replace(' ', '-') + "-normalized"
        normalized_path = BOOKS_DIR / normalized_name

        if not normalized_path.exists():
            # Try variations
            for book_dir in BOOKS_DIR.iterdir():
                if book_dir.is_dir() and book_dir.name.endswith('-normalized') and book_path.name.lower().replace(' ', '-') in book_dir.name.lower():
                    normalized_path = book_dir
                    break

        if normalized_path.exists():
            print(f"✅ Normalized book created at: {normalized_path}")

            # Check for course-plan.json
            course_plan_paths = [
                normalized_path / "course-plan.json",
                PROJECT_ROOT / "course-plan.json",
                BOOKS_DIR / "course-plan.json"
            ]

            for plan_path in course_plan_paths:
                if plan_path.exists():
                    print(f"✅ course-plan.json found at: {plan_path}")
                    return True, normalized_path

            print("⚠️  Warning: Normalization completed but course-plan.json not found")
            return True, normalized_path
        else:
            print("⚠️  Warning: Normalization ran but output directory not found")
            return False, None

    except subprocess.CalledProcessError as e:
        print(f"❌ Error running normalize_epub.py:")
        print(e.stdout)
        print(e.stderr)
        return False, None
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False, None


def validate_output(output_path: Path) -> bool:
    """Run epub_validator.py on the output."""
    print_step("Step 3: Validating output structure")

    validator_script = SCRIPTS_DIR / "epub_validator.py"
    if not validator_script.exists():
        print(f"ℹ️  epub_validator.py not found - skipping validation")
        return True  # Don't fail if validator doesn't exist

    try:
        result = subprocess.run(
            [sys.executable, str(validator_script), str(output_path)],
            capture_output=True,
            text=True,
            check=False  # Don't raise on non-zero exit
        )

        print(result.stdout)
        if result.stderr:
            print("Errors:", result.stderr)

        if result.returncode == 0:
            print("✅ Validation passed")
            return True
        else:
            print("⚠️  Validation found issues (see above)")
            return False

    except Exception as e:
        print(f"⚠️  Warning: Could not run validator: {e}")
        return True  # Don't fail the entire pipeline


def print_next_steps(book_name: str, is_normalized: bool, normalized_path: Optional[Path] = None):
    """Print clear next steps for the user."""
    print_header("Next Steps")

    print("✅ EPUB reformatting complete!\n")
    print("📋 To import this book into Brainer:\n")

    if is_normalized and normalized_path:
        print(f"   1. Run: /import-course {normalized_path.name}")
    else:
        print(f"   1. Run: /import-course {book_name}")

    print("   2. After import, generate chapter content:")
    print("      /create-chapters 1")
    print("      /create-chapters 2")
    print("      /create-chapters 3")
    print("      ... (repeat for all chapters)")
    print()
    print("💡 Tip: You can batch chapter creation later when that feature is implemented")
    print()


def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(
        description="Reformat EPUB books for Brainer import"
    )
    parser.add_argument(
        "book_path",
        help="Path to book directory (e.g., 'books/Book Name/' or 'Book Name')"
    )
    parser.add_argument(
        "--analyze-only",
        action="store_true",
        help="Only analyze the EPUB structure, don't process"
    )
    parser.add_argument(
        "--force-normalize",
        action="store_true",
        help="Force normalization pipeline even if toc.ncx exists"
    )

    args = parser.parse_args()

    print_header("EPUB Reformat Pipeline")

    # Resolve book path
    book_path = Path(args.book_path)
    if not book_path.is_absolute():
        # Try to find in books/ directory
        if book_path.parent == Path('.'):
            # Just a name provided
            found_path = find_book_path(book_path.name)
            if found_path:
                book_path = found_path
            else:
                book_path = BOOKS_DIR / book_path.name

    if not book_path.exists():
        print(f"❌ Error: Book path not found: {book_path}")
        print(f"\n💡 Available books in {BOOKS_DIR}:")
        for book_dir in BOOKS_DIR.iterdir():
            if book_dir.is_dir() and not book_dir.name.startswith('.'):
                print(f"   - {book_dir.name}")
        sys.exit(1)

    print(f"📚 Book: {book_path.name}")
    print(f"📂 Path: {book_path}")

    # Step 1: Analyze
    analysis = analyze_epub(book_path)

    if args.analyze_only:
        print_header("Analysis Complete")
        print("Run without --analyze-only to process the book")
        sys.exit(0)

    # Step 2: Process based on analysis
    if args.force_normalize or analysis.get("recommendation") == "normalize":
        success, normalized_path = normalize_epub_pipeline(book_path)

        if success:
            # Step 3: Validate
            if normalized_path:
                validate_output(normalized_path)

            # Print next steps
            print_next_steps(book_path.name, True, normalized_path)
            sys.exit(0)
        else:
            print_header("Pipeline Failed")
            print("❌ Normalization pipeline failed. Check errors above.")
            sys.exit(1)

    else:  # Standard EPUB with toc.ncx
        success = parse_toc_pipeline(book_path)

        if success:
            # Print next steps
            print_next_steps(book_path.name, False)
            sys.exit(0)
        else:
            print_header("Pipeline Failed")
            print("❌ TOC parsing failed.")
            print("\n💡 Try running with --force-normalize to use the normalization pipeline instead:")
            print(f"   python reformat_epub.py \"{book_path}\" --force-normalize")
            sys.exit(1)


if __name__ == "__main__":
    main()
