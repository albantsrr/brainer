#!/usr/bin/env python3
"""
EPUB Normalization Validator

Validates the output of normalize_epub.py to ensure:
- All chapter files exist and are readable
- All image references are resolved
- Slugs are unique
- course-plan.json is well-formed
- No broken references

Usage:
    python scripts/epub_validator.py "books/Computer-Systems-normalized/"
"""

import argparse
import json
import sys
from pathlib import Path
from bs4 import BeautifulSoup


def validate(output_dir: Path) -> bool:
    """
    Validate normalized EPUB output.

    Returns:
        True if validation passes, False otherwise
    """
    print(f"\n{'='*70}")
    print(f"  EPUB Normalization Validator")
    print(f"{'='*70}")
    print(f"Validating: {output_dir}\n")

    errors = []
    warnings = []

    # Find course-plan.json
    plan_path = output_dir.parent / "course-plan.json"
    if not plan_path.exists():
        # Try in output_dir itself
        plan_path = output_dir / "course-plan.json"

    if not plan_path.exists():
        errors.append(f"course-plan.json not found (checked {plan_path.parent})")
        print(f"❌ FATAL: course-plan.json not found")
        return False

    print(f"✓ Found course-plan.json: {plan_path}")

    # Load course plan
    try:
        with open(plan_path, 'r', encoding='utf-8') as f:
            plan = json.load(f)
    except Exception as e:
        errors.append(f"Failed to parse course-plan.json: {e}")
        print(f"❌ FATAL: Failed to parse course-plan.json: {e}")
        return False

    print(f"✓ course-plan.json is valid JSON")

    # Validate structure
    if 'course' not in plan:
        errors.append("course-plan.json missing 'course' key")
    if 'parts' not in plan:
        errors.append("course-plan.json missing 'parts' key")

    if errors:
        for error in errors:
            print(f"❌ {error}")
        return False

    course = plan['course']
    parts = plan['parts']

    print(f"\n📚 Course: {course.get('title', 'Unknown')}")
    print(f"   Slug: {course.get('slug', 'N/A')}")
    print(f"   Parts: {len(parts)}")

    # Find OEBPS directory
    oebps_dir = output_dir / "OEBPS"
    if not oebps_dir.exists():
        # Maybe output_dir IS the OEBPS dir
        if (output_dir / "ch01.xhtml").exists():
            oebps_dir = output_dir
        else:
            errors.append(f"OEBPS directory not found: {oebps_dir}")

    if not oebps_dir.exists():
        print(f"❌ FATAL: OEBPS directory not found")
        return False

    print(f"✓ Found OEBPS directory: {oebps_dir}\n")

    # Validate chapters
    print("Validating chapters...")
    all_chapters = []
    for part in parts:
        all_chapters.extend(part.get('chapters', []))

    slugs_seen = set()
    chapter_nums_seen = set()

    for chapter in all_chapters:
        chapter_num = chapter.get('chapter_num')
        slug = chapter.get('slug')
        source_file = chapter.get('source_file')
        title = chapter.get('title', 'Unknown')

        # Check slug uniqueness
        if slug in slugs_seen:
            errors.append(f"Duplicate slug: {slug}")
        else:
            slugs_seen.add(slug)

        # Check chapter_num uniqueness
        if chapter_num in chapter_nums_seen:
            errors.append(f"Duplicate chapter_num: {chapter_num}")
        else:
            chapter_nums_seen.add(chapter_num)

        # Check file exists
        if source_file:
            file_path = oebps_dir / source_file
            if not file_path.exists():
                errors.append(f"Chapter file missing: {source_file} (chapter: {title})")
            else:
                # Validate XHTML
                try:
                    content = file_path.read_text(encoding='utf-8')
                    soup = BeautifulSoup(content, 'html.parser')

                    # Check for images
                    images = soup.find_all('img')
                    if images:
                        print(f"  ✓ Chapter {chapter_num}: {title} ({len(images)} images)")
                    else:
                        print(f"  ✓ Chapter {chapter_num}: {title}")

                    # Validate image references
                    for img in images:
                        src = img.get('src', '')
                        if src:
                            # Resolve image path
                            if src.startswith('Images/'):
                                img_path = oebps_dir / src
                            elif src.startswith('../'):
                                img_path = (file_path.parent / src).resolve()
                            else:
                                img_path = file_path.parent / src

                            if not img_path.exists():
                                warnings.append(f"Image not found: {src} (in {source_file})")

                except Exception as e:
                    errors.append(f"Failed to parse {source_file}: {e}")

    print(f"\n✓ Validated {len(all_chapters)} chapters")

    # Validate images directory
    images_dir = oebps_dir / "Images"
    if images_dir.exists():
        image_files = list(images_dir.glob('*'))
        print(f"✓ Found {len(image_files)} images in Images/")

        # Check for normalized naming pattern
        normalized_count = sum(1 for f in image_files if f.stem.startswith('chapter-'))
        if normalized_count > 0:
            print(f"  {normalized_count}/{len(image_files)} images use normalized naming")
    else:
        warnings.append("Images directory not found")

    # Print summary
    print(f"\n{'='*70}")
    print("VALIDATION SUMMARY")
    print(f"{'='*70}")

    if not errors and not warnings:
        print("✅ All checks passed!")
        print(f"   Chapters: {len(all_chapters)}")
        print(f"   Parts: {len(parts)}")
        print(f"   Unique slugs: {len(slugs_seen)}")
        return True

    if warnings:
        print(f"\n⚠️  Warnings ({len(warnings)}):")
        for warning in warnings:
            print(f"  - {warning}")

    if errors:
        print(f"\n❌ Errors ({len(errors)}):")
        for error in errors:
            print(f"  - {error}")
        return False

    if warnings and not errors:
        print(f"\n✅ Validation passed with {len(warnings)} warnings")
        return True

    return False


def main():
    parser = argparse.ArgumentParser(
        description="Validate normalized EPUB output",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Example:
  python scripts/epub_validator.py "books/Computer-Systems-normalized/"
        """
    )

    parser.add_argument(
        'output_dir',
        type=str,
        help='Path to normalized EPUB output directory'
    )

    args = parser.parse_args()

    output_dir = Path(args.output_dir).resolve()

    if not output_dir.exists():
        print(f"❌ ERROR: Output directory does not exist: {output_dir}")
        sys.exit(1)

    success = validate(output_dir)

    if not success:
        print("\n❌ VALIDATION FAILED")
        sys.exit(1)
    else:
        print("\n✅ VALIDATION SUCCESSFUL")
        sys.exit(0)


if __name__ == '__main__':
    main()
