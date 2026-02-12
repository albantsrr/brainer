#!/usr/bin/env python3
"""
Stage 2: Semantic Chapter Detection & Reconstruction

Analyzes documents and TOC to identify logical chapter boundaries.
Handles:
- TOC-based chapter detection (NCX or HTML nav)
- Content-based fallback (semantic HTML markers)
- Split file merging (_split_000, _split_001, etc.)
- Multi-chapter file splitting
- Front matter detection and filtering

Produces normalized chapter list with merged/split content.
"""

import re
from pathlib import Path
from typing import Optional
from bs4 import BeautifulSoup

# Import utility functions from parse_toc.py
import sys
sys.path.insert(0, str(Path(__file__).parent))
from parse_toc import slugify, roman_to_int, classify as classify_original


def classify(label: str):
    """
    Enhanced classify function that handles labels without spaces.

    Examples:
    - "Chapter1Title" → chapter, 1, "Title"
    - "PartITitle" → part, 1, "Title"
    - "1. Title" → chapter, 1, "Title"
    - "1.1Title" → other (section, not chapter)
    """
    # Try original classify first (handles standard formats with spaces/dots)
    kind, num, title = classify_original(label)
    if kind != 'other' or num is not None:
        return kind, num, title

    # Enhanced patterns for no-space formats

    # Pattern: "Chapter<num><Title>" without spaces
    match = re.match(r'^Chapter\s*(\d+)\s*(.+)$', label, re.IGNORECASE)
    if match:
        return 'chapter', int(match.group(1)), match.group(2).strip()

    # Pattern: "Part<roman><Title>" without spaces
    match = re.match(r'^Part\s*([IVX]+)\s*(.+)$', label, re.IGNORECASE)
    if match:
        roman = match.group(1).upper()
        title = match.group(2).strip()
        return 'part', roman_to_int(roman), title

    # Pattern: "<num>.<num><Title>" (subsections like "1.1Title")
    match = re.match(r'^(\d+)\.(\d+)', label)
    if match:
        # This is a section/subsection, not a main chapter
        return 'other', None, label.strip()

    # Pattern: just number at start
    match = re.match(r'^(\d+)\s*(.+)$', label)
    if match and not '.' in match.group(2)[:5]:  # Avoid matching "1.1Title" etc.
        return 'chapter', int(match.group(1)), match.group(2).strip()

    # No match
    return 'other', None, label.strip()


def detect_chapters(documents: list, toc_structure: list, book_metadata: dict) -> dict:
    """
    Main entry point: detect logical chapter boundaries.

    Returns dict with:
        - parts: [{ order, title, chapters: [...] }]
        - chapters: [{ chapter_num, title, source_files, content_html, part_order }]
    """
    print(f"\n[chapter_detector] Analyzing {len(documents)} documents...")

    # Strategy 1: TOC-based detection
    if toc_structure:
        print(f"[chapter_detector] Using TOC structure ({len(toc_structure)} items)")
        result = _detect_from_toc(documents, toc_structure)
    else:
        print("[chapter_detector] No TOC, using content-based detection")
        result = _detect_from_content(documents)

    # Merge section files (for EPUBs with split content across multiple files)
    result = _merge_section_files(result, documents)

    # Merge split files
    result = _merge_split_files(result, documents)

    # Filter front matter
    result = _filter_frontmatter(result)

    # Assign sequential chapter numbers
    result = _assign_chapter_numbers(result)

    # Generate slugs
    result = _generate_slugs(result)

    parts = result['parts']
    chapters = result['chapters']
    print(f"[chapter_detector] ✓ Detected {len(parts)} parts, {len(chapters)} chapters")

    return result


def _detect_from_toc(documents: list, toc_structure: list) -> dict:
    """Detect chapters using TOC structure."""
    # Build document lookup by href
    doc_by_href = {}
    for doc in documents:
        # Normalize href (handle both relative paths and filenames)
        href = Path(doc['href']).name
        doc_by_href[href] = doc

        # Also store by full path
        doc_by_href[doc['href']] = doc

    parts = []
    chapters = []
    current_part = None
    chapter_counter = 0

    def process_toc_item(item, depth=0):
        nonlocal current_part, chapter_counter

        label = item.get('label', '').strip()
        src = item.get('src', '')
        children = item.get('children', [])

        if not label:
            # Process children
            for child in children:
                process_toc_item(child, depth)
            return

        # Classify the item
        kind, num, clean_title = classify(label)

        # Get document content
        doc = None
        if src:
            # Try to find document by various href patterns
            filename = Path(src).name
            doc = doc_by_href.get(src) or doc_by_href.get(filename)

        if kind == 'part':
            # Start new part
            if current_part and current_part['chapters']:
                parts.append(current_part)
            current_part = {
                'order': num,
                'title': clean_title,
                'chapters': []
            }
            # Process children (chapters under this part)
            for child in children:
                process_toc_item(child, depth + 1)

        elif kind == 'chapter':
            # Chapter found
            if current_part is None:
                # Implicit part for chapters before first part
                current_part = {
                    'order': 0,
                    'title': 'General',
                    'chapters': []
                }

            chapter_counter += 1
            chapter = {
                'declared_num': num,
                'title': clean_title,
                'source_files': [src] if src else [],
                'content_html': doc['content'] if doc else '',
                'part_order': current_part['order'],
                'toc_depth': depth
            }

            current_part['chapters'].append(chapter)
            chapters.append(chapter)

            # Process subsections (don't treat as separate chapters)
            # Just note them for later processing
            for child in children:
                # Subsections are informational only
                pass

        else:
            # 'other' - frontmatter, backmatter, etc.
            # Skip but process children in case they contain chapters
            for child in children:
                process_toc_item(child, depth)

    # Process all top-level TOC items
    for item in toc_structure:
        process_toc_item(item, depth=0)

    # Flush last part
    if current_part and current_part['chapters']:
        parts.append(current_part)

    return {
        'parts': parts,
        'chapters': chapters
    }


def _detect_from_content(documents: list) -> dict:
    """
    Fallback: Detect chapters from content analysis when TOC is unavailable.
    """
    parts = []
    chapters = []
    current_part = None
    chapter_counter = 0

    for doc in documents:
        soup = BeautifulSoup(doc['content'], 'html.parser')

        # Check for part markers
        is_part = _is_part_document(soup, doc['href'])
        if is_part:
            part_title, part_num = _extract_part_info(soup)
            if current_part and current_part['chapters']:
                parts.append(current_part)
            current_part = {
                'order': part_num or len(parts) + 1,
                'title': part_title,
                'chapters': []
            }
            continue

        # Check for chapter markers
        is_chapter = _is_chapter_document(soup, doc['href'])
        if is_chapter:
            chapter_title, chapter_num = _extract_chapter_info(soup)

            if current_part is None:
                current_part = {
                    'order': 0,
                    'title': 'General',
                    'chapters': []
                }

            chapter_counter += 1
            chapter = {
                'declared_num': chapter_num or chapter_counter,
                'title': chapter_title,
                'source_files': [doc['href']],
                'content_html': doc['content'],
                'part_order': current_part['order'],
                'toc_depth': 0
            }

            current_part['chapters'].append(chapter)
            chapters.append(chapter)

    # Flush last part
    if current_part and current_part['chapters']:
        parts.append(current_part)

    return {
        'parts': parts,
        'chapters': chapters
    }


def _is_part_document(soup: BeautifulSoup, href: str) -> bool:
    """Check if document represents a part divider."""
    # Check epub:type
    section = soup.find('section', attrs={'epub:type': 'part'})
    if section:
        return True

    # Check filename pattern
    if 'part' in Path(href).stem.lower():
        return True

    # Check heading content
    h1 = soup.find('h1')
    if h1:
        text = h1.get_text(strip=True)
        # Match "Part I", "Part 1", "PART I", etc.
        if re.match(r'^Part\s+([IVX]+|\d+)', text, re.IGNORECASE):
            return True

    return False


def _is_chapter_document(soup: BeautifulSoup, href: str) -> bool:
    """Check if document represents a chapter."""
    # Check epub:type
    section = soup.find('section', attrs={'epub:type': 'chapter'})
    if section:
        return True

    # Check filename pattern
    stem = Path(href).stem.lower()
    if re.match(r'^ch(ap(ter)?)?[_-]?\d+', stem):
        return True

    # Check heading content
    h1 = soup.find('h1')
    if h1:
        text = h1.get_text(strip=True)
        # Match "Chapter 1", "1.", "1 Title", etc.
        if re.match(r'^(Chapter\s+)?\d+[\.\s]', text, re.IGNORECASE):
            return True

    return False


def _extract_part_info(soup: BeautifulSoup) -> tuple:
    """Extract (title, number) from part document."""
    h1 = soup.find('h1')
    if not h1:
        return "Unknown Part", None

    text = h1.get_text(strip=True)

    # Match "Part I: Title" or "Part 1 - Title"
    match = re.match(r'^Part\s+([IVX]+|\d+)[\s:\-]*(.*)$', text, re.IGNORECASE)
    if match:
        num_str = match.group(1)
        title = match.group(2).strip() or f"Part {num_str}"

        # Convert Roman to int if needed
        if num_str.upper() in ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']:
            num = roman_to_int(num_str)
        else:
            num = int(num_str) if num_str.isdigit() else None

        return title, num

    return text, None


def _extract_chapter_info(soup: BeautifulSoup) -> tuple:
    """Extract (title, number) from chapter document."""
    h1 = soup.find('h1')
    if not h1:
        # Try title tag
        title_tag = soup.find('title')
        if title_tag:
            text = title_tag.get_text(strip=True)
        else:
            return "Untitled Chapter", None
    else:
        text = h1.get_text(strip=True)

    # Try to extract chapter number and title
    # Patterns: "Chapter 1: Title", "1. Title", "1 Title"
    match = re.match(r'^(Chapter\s+)?(\d+)[\.\s:\-]+(.*)$', text, re.IGNORECASE)
    if match:
        num = int(match.group(2))
        title = match.group(3).strip() or f"Chapter {num}"
        return title, num

    # No number found
    return text, None


def _merge_section_files(result: dict, documents: list) -> dict:
    """
    Merge section files referenced by internal links in chapter HTML.

    Some EPUBs (like Computer Systems) split chapter content across multiple files:
    - chapter01.xhtml contains only intro + TOC with href links
    - fileP70004970270000000000000000000BB.xhtml contains section 1.1 content
    - fileP70004970270000000000000000000D8.xhtml contains section 1.2 content
    etc.

    This function:
    1. Parses chapter HTML to find all internal href links to .xhtml files
    2. Loads referenced section files from documents list
    3. Merges all section content into the chapter's content_html
    """
    chapters = result['chapters']

    # Build document lookup by filename (handle various path formats)
    doc_by_name = {}
    for doc in documents:
        # Store by full href
        doc_by_name[doc['href']] = doc
        # Store by filename only
        filename = Path(doc['href']).name
        doc_by_name[filename] = doc
        # Store by stem (without extension)
        stem = Path(doc['href']).stem
        doc_by_name[stem] = doc

    for chapter in chapters:
        if not chapter.get('content_html'):
            continue

        # Parse chapter HTML to find section file references
        soup = BeautifulSoup(chapter['content_html'], 'html.parser')
        section_files = set()

        # Find all <a href="..."> links pointing to .xhtml files
        for link in soup.find_all('a', href=True):
            href = link['href']

            # Check if it's an internal link to an .xhtml file
            if '.xhtml' in href or '.html' in href:
                # Extract filename (remove fragments like #P70004...)
                href_clean = href.split('#')[0]

                # Skip empty or same-file references
                if not href_clean or href_clean in chapter.get('source_files', []):
                    continue

                section_files.add(href_clean)

        # If we found section files, merge their content
        if section_files:
            print(f"[chapter_detector] Found {len(section_files)} section files for: {chapter['title']}")

            merged_content_parts = [chapter['content_html']]
            loaded_sections = []

            for section_href in sorted(section_files):
                # Try to find the document by various lookups
                doc = (doc_by_name.get(section_href) or
                       doc_by_name.get(Path(section_href).name) or
                       doc_by_name.get(Path(section_href).stem))

                if doc and doc.get('content'):
                    merged_content_parts.append(doc['content'])
                    loaded_sections.append(section_href)
                else:
                    print(f"[chapter_detector] ⚠️  Section file not found: {section_href}")

            # Update chapter with merged content
            if loaded_sections:
                chapter['content_html'] = '\n'.join(merged_content_parts)
                chapter['source_files'].extend(loaded_sections)
                print(f"[chapter_detector] ✓ Merged {len(loaded_sections)} section files into: {chapter['title']}")

    return result


def _merge_split_files(result: dict, documents: list) -> dict:
    """
    Merge split files (e.g., file_split_000.xhtml, file_split_001.xhtml).
    """
    chapters = result['chapters']

    # Build document lookup
    doc_by_href = {doc['href']: doc for doc in documents}

    # Group chapters by base filename (detect splits)
    merged_chapters = []

    for chapter in chapters:
        if not chapter['source_files']:
            merged_chapters.append(chapter)
            continue

        primary_src = chapter['source_files'][0]
        base_name = Path(primary_src).stem

        # Check if this is a split file
        split_match = re.match(r'^(.+)_split_(\d+)$', base_name)

        if split_match:
            base = split_match.group(1)
            split_num = int(split_match.group(2))

            # Only process split_000 (first part)
            if split_num != 0:
                continue  # Skip, will be merged into split_000

            # Find all split parts
            split_parts = [primary_src]
            counter = 1
            while True:
                parent_dir = Path(primary_src).parent
                next_split = f"{base}_split_{counter:03d}.xhtml"
                next_path = str(parent_dir / next_split) if parent_dir != Path('.') else next_split

                # Try to find in documents
                found = False
                for doc in documents:
                    if Path(doc['href']).name == next_split:
                        split_parts.append(doc['href'])
                        found = True
                        break

                if not found:
                    break
                counter += 1

            # Merge content
            merged_content = []
            for part_href in split_parts:
                doc = doc_by_href.get(part_href)
                if doc:
                    merged_content.append(doc['content'])

            chapter['source_files'] = split_parts
            chapter['content_html'] = '\n'.join(merged_content)

            if len(split_parts) > 1:
                print(f"[chapter_detector] Merged {len(split_parts)} split files for: {chapter['title']}")

        merged_chapters.append(chapter)

    result['chapters'] = merged_chapters
    return result


def _filter_frontmatter(result: dict) -> dict:
    """
    Remove frontmatter chapters (preface, copyright, TOC, dedication).
    """
    frontmatter_keywords = [
        'preface', 'foreword', 'dedication', 'acknowledgment', 'acknowledgement',
        'copyright', 'table of contents', 'contents', 'about the author', 'introduction'
    ]

    filtered_chapters = []

    for chapter in result['chapters']:
        title_lower = chapter['title'].lower()

        # Check if it's frontmatter
        is_frontmatter = any(keyword in title_lower for keyword in frontmatter_keywords)

        if is_frontmatter:
            print(f"[chapter_detector] Filtering frontmatter: {chapter['title']}")
            continue

        filtered_chapters.append(chapter)

    result['chapters'] = filtered_chapters

    # Update parts
    for part in result['parts']:
        part['chapters'] = [ch for ch in part['chapters'] if ch in filtered_chapters]

    # Remove empty parts
    result['parts'] = [p for p in result['parts'] if p['chapters']]

    return result


def _assign_chapter_numbers(result: dict) -> dict:
    """Assign sequential chapter numbers (1, 2, 3, ...)."""
    for idx, chapter in enumerate(result['chapters'], 1):
        chapter['chapter_num'] = idx

    return result


def _generate_slugs(result: dict) -> dict:
    """Generate deterministic slugs for chapters."""
    slugs_seen = set()

    for chapter in result['chapters']:
        base_slug = slugify(chapter['title'])

        # Ensure uniqueness
        slug = f"chapter-{chapter['chapter_num']:02d}-{base_slug}"
        counter = 1
        while slug in slugs_seen:
            slug = f"chapter-{chapter['chapter_num']:02d}-{base_slug}-{counter}"
            counter += 1

        slugs_seen.add(slug)
        chapter['slug'] = slug

        # Truncate if too long (max 80 chars)
        if len(slug) > 80:
            # Truncate at word boundary
            truncated = slug[:77].rsplit('-', 1)[0]
            chapter['slug'] = truncated + '...'

    return result
