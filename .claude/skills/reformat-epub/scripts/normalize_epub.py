#!/usr/bin/env python3
"""
Structure-Agnostic EPUB Normalization Pipeline

Transforms any EPUB (packed or unpacked, well-formed or malformed) into a
standardized structure with:
- 1 normalized XHTML file per logical chapter (ch01.xhtml, ch02.xhtml, ...)
- Deterministically renamed images (chapter-01-image-01.png, ...)
- Generated course-plan.json compatible with import_course.py
- Front matter filtered out

Supports:
- Standard EPUBs with content.opf + toc.ncx
- EPUB 3 with nav.xhtml
- Malformed EPUBs with HTML TOC only (e.g., Computer Systems)
- Split files (_split_000, _split_001, etc.)

Usage:
    python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Computer Systems/"
    python .claude/skills/reformat-epub/scripts/normalize_epub.py books/book.epub --output books/output/
"""

import argparse
import json
import re
import sys
from pathlib import Path

# Import pipeline stages (now in same directory)
import epub_analyzer
import semantic_chapter_detector
import image_normalizer


# Utility function for generating slugs
def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")


def normalize_epub(source_path: Path, output_dir: Path = None, dry_run: bool = False) -> dict:
    """
    Main pipeline orchestrator.

    Args:
        source_path: Path to .epub file or unpacked directory
        output_dir: Output directory (default: books/{BookTitle}-normalized/)
        dry_run: If True, don't write files, just analyze

    Returns:
        course_plan dict
    """
    print(f"\n{'='*70}")
    print(f"  EPUB Normalization Pipeline")
    print(f"{'='*70}")
    print(f"Source: {source_path}")

    # -------------------------------------------------------------------------
    # Stage 1: Analyze & Extract Metadata
    # -------------------------------------------------------------------------
    print(f"\n{'='*70}")
    print("STAGE 1: Analyzing EPUB & Extracting Metadata")
    print(f"{'='*70}")

    try:
        metadata = epub_analyzer.load_epub(source_path)
    except Exception as e:
        print(f"\n❌ ERROR in Stage 1: {e}")
        raise

    book_meta = metadata['book_metadata']
    documents = metadata['documents']
    toc_structure = metadata['toc_structure']

    print(f"\n✓ Book: {book_meta['title']}")
    if book_meta['author']:
        print(f"  Author: {book_meta['author']}")
    print(f"  Documents: {len(documents)}")
    print(f"  Images: {len(metadata['images'])}")
    print(f"  TOC structure: {'Available' if toc_structure else 'Not found'}")

    # -------------------------------------------------------------------------
    # Stage 2: Detect Chapters
    # -------------------------------------------------------------------------
    print(f"\n{'='*70}")
    print("STAGE 2: Detecting Chapters & Reconstructing Structure")
    print(f"{'='*70}")

    try:
        result = semantic_chapter_detector.detect_chapters(
            documents,
            toc_structure,
            book_meta
        )
    except Exception as e:
        print(f"\n❌ ERROR in Stage 2: {e}")
        raise

    parts = result['parts']
    chapters = result['chapters']

    print(f"\n✓ Detected structure:")
    print(f"  Parts: {len(parts)}")
    print(f"  Chapters: {len(chapters)}")

    for part in parts:
        print(f"    Part {part['order']}: {part['title']} ({len(part['chapters'])} chapters)")

    # Determine output directory
    if output_dir is None:
        book_slug = slugify(book_meta['title'])
        output_dir = source_path.parent / f"{book_slug}-normalized"

    oebps_dir = output_dir / "OEBPS"

    print(f"\n  Output: {output_dir}")

    # -------------------------------------------------------------------------
    # Stage 3: Normalize Images
    # -------------------------------------------------------------------------
    print(f"\n{'='*70}")
    print("STAGE 3: Normalizing Images & Updating References")
    print(f"{'='*70}")

    if not dry_run:
        try:
            chapters = image_normalizer.normalize_images(
                chapters,
                source_path if source_path.is_dir() else source_path.parent,
                oebps_dir
            )
        except Exception as e:
            print(f"\n❌ ERROR in Stage 3: {e}")
            raise
    else:
        print("[DRY RUN] Skipping image normalization")

    # -------------------------------------------------------------------------
    # Generate Outputs
    # -------------------------------------------------------------------------
    print(f"\n{'='*70}")
    print("STAGE 4: Generating Normalized Files")
    print(f"{'='*70}")

    if not dry_run:
        # Create output directories
        oebps_dir.mkdir(parents=True, exist_ok=True)

        # Write normalized XHTML files
        _write_normalized_xhtml(chapters, oebps_dir)

        # Generate course-plan.json
        course_plan = _generate_course_plan(book_meta, parts, chapters, oebps_dir)

        # Write course-plan.json
        plan_path = output_dir / "course-plan.json"
        with open(plan_path, 'w', encoding='utf-8') as f:
            json.dump(course_plan, f, indent=2, ensure_ascii=False)
            f.write('\n')

        print(f"\n✓ Generated course-plan.json: {plan_path}")
    else:
        print("[DRY RUN] Skipping file generation")
        course_plan = _generate_course_plan(book_meta, parts, chapters, oebps_dir)

    # -------------------------------------------------------------------------
    # Summary
    # -------------------------------------------------------------------------
    print(f"\n{'='*70}")
    print("✅ NORMALIZATION COMPLETE")
    print(f"{'='*70}")
    print(f"  Output directory: {output_dir}")
    print(f"  Chapters: {len(chapters)}")
    print(f"  Parts: {len(parts)}")
    print(f"\nNext steps:")
    print(f'  1. python .claude/skills/import-course/scripts/import_course.py "{output_dir.name}"')
    print(f'  2. python .claude/skills/create-chapters/scripts/create_chapter.py {course_plan["course"]["slug"]} 1')
    print()

    return course_plan


def _write_normalized_xhtml(chapters: list, output_dir: Path) -> None:
    """Write normalized XHTML files (ch01.xhtml, ch02.xhtml, ...)."""
    for chapter in chapters:
        chapter_num = chapter['chapter_num']
        filename = f"ch{chapter_num:02d}.xhtml"
        filepath = output_dir / filename

        # Wrap content in proper XHTML structure if needed
        content = _wrap_xhtml(chapter['content_html'], chapter['title'])

        filepath.write_text(content, encoding='utf-8')

    print(f"✓ Wrote {len(chapters)} normalized XHTML files")


def _wrap_xhtml(content: str, title: str) -> str:
    """
    Wrap content in proper XHTML structure if not already wrapped.
    """
    # Check if content already has <html> wrapper
    if content.strip().startswith('<?xml') or content.strip().startswith('<html'):
        return content

    # Wrap in minimal XHTML structure
    return f"""<?xml version='1.0' encoding='utf-8'?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head>
    <meta charset="utf-8"/>
    <title>{title}</title>
</head>
<body>
{content}
</body>
</html>
"""


def _generate_course_plan(book_meta: dict, parts: list, chapters: list, oebps_dir: Path) -> dict:
    """
    Generate course-plan.json in format compatible with import_course.py.
    """
    slug = slugify(book_meta['title'])

    # Build parts structure
    parts_data = []
    global_order = 1

    for part in parts:
        part_data = {
            'order': part['order'],
            'title': part['title'],
            'chapters': []
        }

        for chapter in part['chapters']:
            chapter_data = {
                'chapter_num': chapter['chapter_num'],
                'order': global_order,
                'title': chapter['title'],
                'slug': chapter['slug'],
                'source_file': f"ch{chapter['chapter_num']:02d}.xhtml",
                'mdx_file': f"{global_order:02d}-{chapter['slug']}.mdx"
            }
            part_data['chapters'].append(chapter_data)
            global_order += 1

        parts_data.append(part_data)

    # Sort parts by order
    parts_data.sort(key=lambda p: p['order'])

    return {
        'course': {
            'title': book_meta['title'],
            'author': book_meta['author'],
            'slug': slug,
            'output_dir': "OEBPS/"
        },
        'parts': parts_data,
        'summary': {
            'parts': len(parts_data),
            'chapters': len(chapters),
            'total_mdx_files': len(chapters)
        }
    }


def main():
    parser = argparse.ArgumentParser(
        description="Normalize EPUB to standard structure for Brainer import",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Normalize unpacked EPUB directory
  python .claude/skills/reformat-epub/scripts/normalize_epub.py "books/Computer Systems/"

  # Normalize packed .epub file
  python .claude/skills/reformat-epub/scripts/normalize_epub.py books/book.epub

  # Specify custom output directory
  python .claude/skills/reformat-epub/scripts/normalize_epub.py books/book.epub --output books/custom-output/

  # Dry run (analyze only, don't write files)
  python .claude/skills/reformat-epub/scripts/normalize_epub.py books/book.epub --dry-run
        """
    )

    parser.add_argument(
        'source',
        type=str,
        help='Path to .epub file or unpacked EPUB directory'
    )

    parser.add_argument(
        '--output', '-o',
        type=str,
        help='Output directory (default: books/{BookTitle}-normalized/)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Analyze only, do not write files'
    )

    args = parser.parse_args()

    # Resolve paths
    source_path = Path(args.source).resolve()

    if not source_path.exists():
        print(f"❌ ERROR: Source path does not exist: {source_path}")
        sys.exit(1)

    output_dir = Path(args.output).resolve() if args.output else None

    # Run pipeline
    try:
        normalize_epub(source_path, output_dir, args.dry_run)
    except Exception as e:
        print(f"\n❌ PIPELINE FAILED: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == '__main__':
    main()
