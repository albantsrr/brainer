#!/usr/bin/env python3
"""
Stage 3: Image Normalization & Reference Update

Extracts image references from chapter HTML, renames images deterministically,
updates HTML references, and copies images to normalized output directory.

Naming pattern: chapter-{num:02d}-image-{idx:02d}.{ext}
Example: chapter-01-image-01.png
"""

import shutil
from pathlib import Path
from urllib.parse import unquote
from bs4 import BeautifulSoup


def normalize_images(chapters: list, source_dir: Path, output_dir: Path) -> list:
    """
    Main entry point: normalize all images for chapters.

    Updates chapters in-place with:
        - images_referenced: list of {original_path, normalized_name, caption}

    Returns updated chapters list.
    """
    print(f"\n[image_normalizer] Processing images...")

    # Build image mapping: original_path -> normalized_name
    image_map = {}
    all_image_info = []

    for chapter in chapters:
        if not chapter.get('content_html'):
            continue

        # Extract image references from this chapter
        images = _extract_images(chapter['content_html'], chapter['source_files'])

        # Assign normalized names
        chapter_num = chapter['chapter_num']
        for idx, img_info in enumerate(images, 1):
            original_path = img_info['original_path']

            if original_path not in image_map:
                ext = Path(original_path).suffix
                normalized_name = f"chapter-{chapter_num:02d}-image-{idx:02d}{ext}"
                image_map[original_path] = normalized_name

                all_image_info.append({
                    'chapter_num': chapter_num,
                    'original_path': original_path,
                    'normalized_name': normalized_name,
                    'caption': img_info.get('caption')
                })

        chapter['images_referenced'] = [
            {
                'original_path': img_info['original_path'],
                'normalized_name': image_map[img_info['original_path']],
                'caption': img_info.get('caption')
            }
            for img_info in images
        ]

    # Update HTML references
    for chapter in chapters:
        if chapter.get('content_html'):
            chapter['content_html'] = _update_html_references(
                chapter['content_html'],
                image_map
            )

    # Copy images to output directory
    images_output_dir = output_dir / "Images"
    images_output_dir.mkdir(parents=True, exist_ok=True)

    _copy_images(source_dir, images_output_dir, image_map)

    print(f"[image_normalizer] ✓ Processed {len(image_map)} images")

    return chapters


def _extract_images(html_content: str, source_files: list) -> list:
    """
    Extract all image references from HTML content.

    Returns list of dicts: {original_path, src_attr, caption}
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    images = []

    for img in soup.find_all('img'):
        src = img.get('src', '')
        if not src:
            continue

        # Resolve relative path
        # src can be: "Images/p63-1.png", "../images/p63-1.png", "p63-1.png"
        original_path = _resolve_image_path(src, source_files)

        # Try to find caption (in parent <figure> or nearby <figcaption>)
        caption = None
        figure = img.find_parent('figure')
        if figure:
            figcaption = figure.find('figcaption')
            if figcaption:
                caption = figcaption.get_text(strip=True)

        images.append({
            'original_path': original_path,
            'src_attr': src,
            'caption': caption
        })

    return images


def _resolve_image_path(src: str, source_files: list) -> str:
    """
    Resolve image src attribute to normalized path.

    Handles:
    - Relative paths: ../images/p63-1.png
    - Absolute paths: Images/p63-1.png
    - Simple filenames: p63-1.png
    """
    # URL decode
    src = unquote(src)

    # Remove fragment
    src = src.split('#')[0]

    # Normalize path separators
    src = src.replace('\\', '/')

    # Handle absolute paths (starting with /)
    if src.startswith('/'):
        return src[1:]

    # Handle relative paths with ../
    if '../' in src:
        # Find the deepest component after all ../
        parts = src.split('/')
        # Remove .. and preceding components
        resolved_parts = []
        for part in parts:
            if part == '..':
                if resolved_parts:
                    resolved_parts.pop()
            elif part and part != '.':
                resolved_parts.append(part)
        return '/'.join(resolved_parts)

    # Simple path: Images/file.png or file.png
    return src


def _update_html_references(html_content: str, image_map: dict) -> str:
    """
    Update all <img src="..."> attributes to use normalized image names.
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    for img in soup.find_all('img'):
        src = img.get('src', '')
        if not src:
            continue

        # Resolve to original path
        original_path = _resolve_image_path(src, [])

        # Update to normalized name
        if original_path in image_map:
            normalized_name = image_map[original_path]
            img['src'] = f"Images/{normalized_name}"

    return str(soup)


def _copy_images(source_dir: Path, output_dir: Path, image_map: dict) -> None:
    """
    Copy images from source to output directory with normalized names.
    """
    copied_count = 0
    missing_count = 0

    for original_path, normalized_name in image_map.items():
        # Try to find source image
        source_path = _find_image_file(source_dir, original_path)

        if source_path and source_path.exists():
            dest_path = output_dir / normalized_name
            shutil.copy2(source_path, dest_path)
            copied_count += 1
        else:
            print(f"[image_normalizer] ⚠️  Image not found: {original_path}")
            missing_count += 1

    if copied_count > 0:
        print(f"[image_normalizer] ✓ Copied {copied_count} images")
    if missing_count > 0:
        print(f"[image_normalizer] ⚠️  {missing_count} images not found (references will be broken)")


def _find_image_file(source_dir: Path, image_path: str) -> Path:
    """
    Find image file in source directory.

    Tries multiple strategies:
    1. Direct path from source_dir
    2. Search in Images/ subdirectories
    3. Search in images/ subdirectories (case-insensitive)
    4. Recursive search by filename
    """
    # Strategy 1: Direct path
    candidate = source_dir / image_path
    if candidate.exists():
        return candidate

    # Strategy 2: Check common image directories
    filename = Path(image_path).name
    for img_dir in ['Images', 'images', 'IMAGES', 'OPS/images', 'OEBPS/Images', 'text/OPS/images']:
        candidate = source_dir / img_dir / filename
        if candidate.exists():
            return candidate

    # Strategy 3: Recursive search by filename (last resort)
    matches = list(source_dir.rglob(filename))
    if matches:
        # Return first match
        return matches[0]

    # Not found
    return None
