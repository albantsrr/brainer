#!/usr/bin/env python3
"""
Stage 1: EPUB Analysis & Metadata Extraction

Loads EPUB files (packed .epub or unpacked directories) and extracts:
- Book metadata (title, author, language)
- Document inventory (all XHTML files with spine order)
- Navigation structure (from content.opf, toc.ncx, or HTML nav)
- Image catalog

Supports multiple EPUB formats with intelligent fallback strategy.
"""

import re
from pathlib import Path
from typing import Optional
from bs4 import BeautifulSoup


def load_epub(path: Path) -> dict:
    """
    Load EPUB from .epub file or unpacked directory.

    Returns dict with:
        - book_metadata: {title, author, language, identifier}
        - documents: [{id, href, spine_order, content, type}]
        - images: [{id, href, mime_type}]
        - toc_structure: list (if available)
    """
    if path.suffix == '.epub':
        return _load_packed_epub(path)
    elif path.is_dir():
        return _load_unpacked_epub(path)
    else:
        raise ValueError(f"Path must be .epub file or directory: {path}")


def _load_packed_epub(epub_path: Path) -> dict:
    """Load a packed .epub file using ebooklib."""
    try:
        import ebooklib
        from ebooklib import epub
    except ImportError:
        raise ImportError("ebooklib required for .epub files: pip install ebooklib")

    book = epub.read_epub(str(epub_path))

    # Extract metadata
    metadata = _extract_ebooklib_metadata(book)

    # Extract documents
    documents = []
    for item in book.get_items_of_type(ebooklib.ITEM_DOCUMENT):
        documents.append({
            'id': item.get_id(),
            'href': item.get_name(),
            'content': item.get_content().decode('utf-8'),
            'type': item.get_type(),
            'spine_order': None  # Will be set from spine
        })

    # Extract images
    images = []
    for item in book.get_items_of_type(ebooklib.ITEM_IMAGE):
        images.append({
            'id': item.get_id(),
            'href': item.get_name(),
            'mime_type': item.media_type
        })

    # Set spine order
    spine = book.spine
    for idx, (item_id, linear) in enumerate(spine):
        for doc in documents:
            if doc['id'] == item_id:
                doc['spine_order'] = idx
                break

    # Parse TOC
    toc_structure = _parse_ebooklib_toc(book)

    return {
        'book_metadata': metadata,
        'documents': sorted([d for d in documents if d['spine_order'] is not None],
                          key=lambda x: x['spine_order']),
        'images': images,
        'toc_structure': toc_structure
    }


def _load_unpacked_epub(epub_dir: Path) -> dict:
    """Load an unpacked EPUB directory."""
    print(f"[epub_analyzer] Loading unpacked EPUB from: {epub_dir}")

    # Try to find standard EPUB structure
    opf_path = _find_content_opf(epub_dir)

    if opf_path:
        print(f"[epub_analyzer] Found content.opf: {opf_path.relative_to(epub_dir)}")
        return _load_from_opf(opf_path, epub_dir)
    else:
        print("[epub_analyzer] No content.opf found, using directory scan fallback")
        return _load_from_directory_scan(epub_dir)


def _find_content_opf(epub_dir: Path) -> Optional[Path]:
    """Find content.opf file in unpacked EPUB."""
    # Check standard locations
    candidates = [
        epub_dir / "content.opf",
        epub_dir / "OEBPS" / "content.opf",
        epub_dir / "OPS" / "content.opf",
    ]

    for candidate in candidates:
        if candidate.exists():
            return candidate

    # Recursive search as last resort
    opf_files = list(epub_dir.rglob("content.opf"))
    return opf_files[0] if opf_files else None


def _load_from_opf(opf_path: Path, epub_dir: Path) -> dict:
    """Load EPUB from content.opf manifest and spine."""
    with open(opf_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'xml')

    opf_dir = opf_path.parent

    # Extract metadata
    metadata = _extract_opf_metadata(soup)

    # Build manifest map
    manifest = {}
    for item in soup.find_all('item'):
        item_id = item.get('id')
        href = item.get('href')
        media_type = item.get('media-type', '')

        if item_id and href:
            manifest[item_id] = {
                'id': item_id,
                'href': href,
                'media_type': media_type
            }

    # Extract spine order
    documents = []
    spine = soup.find('spine')
    if spine:
        for idx, itemref in enumerate(spine.find_all('itemref')):
            idref = itemref.get('idref')
            if idref in manifest:
                item = manifest[idref]
                file_path = opf_dir / item['href']

                if file_path.exists():
                    content = file_path.read_text(encoding='utf-8')
                    documents.append({
                        'id': item['id'],
                        'href': item['href'],
                        'spine_order': idx,
                        'content': content,
                        'type': item['media_type']
                    })

    # Extract images
    images = []
    for item in manifest.values():
        if item['media_type'].startswith('image/'):
            images.append({
                'id': item['id'],
                'href': item['href'],
                'mime_type': item['media_type']
            })

    # Parse navigation
    toc_structure, toc_title = _parse_navigation(opf_dir, epub_dir)

    # Use TOC title if available and metadata title is generic
    if toc_title and (not metadata['title'] or metadata['title'] == 'Untitled'):
        metadata['title'] = toc_title

    return {
        'book_metadata': metadata,
        'documents': documents,
        'images': images,
        'toc_structure': toc_structure
    }


def _load_from_directory_scan(epub_dir: Path) -> dict:
    """
    Fallback: Load EPUB by scanning directory structure.
    Used when content.opf is missing (like Computer Systems).
    """
    # Find all XHTML files
    xhtml_files = []
    for pattern in ['**/*.xhtml', '**/*.html', '**/*.htm']:
        xhtml_files.extend(list(epub_dir.glob(pattern)))

    # Filter out TOC files (will be parsed separately)
    content_files = [f for f in xhtml_files if 'toc' not in f.stem.lower()]

    # Sort by path for deterministic order
    content_files.sort()

    # Load documents
    documents = []
    for idx, file_path in enumerate(content_files):
        content = file_path.read_text(encoding='utf-8')
        href = str(file_path.relative_to(epub_dir))

        documents.append({
            'id': file_path.stem,
            'href': href,
            'spine_order': idx,
            'content': content,
            'type': 'application/xhtml+xml'
        })

    # Find images
    images = []
    for pattern in ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg']:
        for img_path in epub_dir.glob(pattern):
            images.append({
                'id': img_path.stem,
                'href': str(img_path.relative_to(epub_dir)),
                'mime_type': f"image/{img_path.suffix[1:]}"
            })

    # Parse navigation first (might have better title)
    toc_structure, toc_title = _parse_navigation(epub_dir, epub_dir)

    # Extract metadata from first XHTML file
    metadata = _extract_metadata_from_content(documents)

    # Prefer TOC title if available
    if toc_title:
        metadata['title'] = toc_title

    print(f"[epub_analyzer] Loaded {len(documents)} documents, {len(images)} images")

    return {
        'book_metadata': metadata,
        'documents': documents,
        'images': images,
        'toc_structure': toc_structure
    }


def _parse_navigation(opf_dir: Path, epub_dir: Path) -> tuple:
    """
    Parse navigation structure with fallback chain:
    1. toc.ncx (EPUB 2)
    2. nav.xhtml with epub:type="toc" (EPUB 3)
    3. toc*.xhtml files (Computer Systems)

    Returns (toc_items, title) tuple.
    """
    # Try toc.ncx first
    ncx_path = opf_dir / "toc.ncx"
    if not ncx_path.exists():
        ncx_candidates = list(epub_dir.rglob("toc.ncx"))
        ncx_path = ncx_candidates[0] if ncx_candidates else None

    if ncx_path and ncx_path.exists():
        print(f"[epub_analyzer] Parsing toc.ncx")
        return (_parse_ncx(ncx_path), None)

    # Try nav.xhtml (EPUB 3)
    nav_path = opf_dir / "nav.xhtml"
    if not nav_path.exists():
        nav_candidates = list(epub_dir.rglob("nav.xhtml"))
        nav_path = nav_candidates[0] if nav_candidates else None

    if nav_path and nav_path.exists():
        print(f"[epub_analyzer] Parsing nav.xhtml")
        return (_parse_html_nav(nav_path), None)

    # Try toc*.xhtml files (Computer Systems case)
    toc_files = sorted(epub_dir.rglob("toc*.xhtml"))
    if toc_files:
        print(f"[epub_analyzer] Parsing {len(toc_files)} HTML TOC files")
        toc_items, title = _parse_html_toc_files(toc_files)
        return (toc_items, title)

    print("[epub_analyzer] No navigation document found")
    return ([], None)


def _parse_ncx(ncx_path: Path) -> list:
    """Parse EPUB 2 toc.ncx file."""
    with open(ncx_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'xml')

    nav_map = soup.find('navMap')
    if not nav_map:
        return []

    def parse_navpoint(np):
        label_el = np.find('navLabel')
        label = label_el.find('text').text.strip() if label_el else ""

        content_el = np.find('content', recursive=False)
        src = content_el.get('src', '').split('#')[0] if content_el else ""

        children = [parse_navpoint(child) for child in np.find_all('navPoint', recursive=False)]

        return {
            'label': label,
            'src': src,
            'children': children
        }

    return [parse_navpoint(np) for np in nav_map.find_all('navPoint', recursive=False)]


def _parse_html_nav(nav_path: Path) -> list:
    """Parse EPUB 3 nav.xhtml with epub:type='toc'."""
    with open(nav_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Find <nav epub:type="toc">
    nav = soup.find('nav', attrs={'epub:type': 'toc'})
    if not nav:
        nav = soup.find('nav', id='toc')

    if not nav:
        return []

    return _parse_nav_list(nav.find('ol'))


def _parse_html_toc_files(toc_files: list) -> tuple:
    """
    Parse multiple HTML TOC files (Computer Systems case).
    Returns (toc_items, title) where title is extracted from first TOC file.
    """
    all_items = []
    title = None

    for toc_file in toc_files:
        with open(toc_file, 'r', encoding='utf-8') as f:
            content = f.read()
            soup = BeautifulSoup(content, 'html.parser')

        # Extract title from first TOC file
        if title is None:
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.text.strip()

        # Find <nav epub:type="toc"> or <nav id="toc">
        nav = soup.find('nav', attrs={'epub:type': 'toc'})
        if not nav:
            nav = soup.find('nav', id='toc')

        if nav:
            items = _parse_nav_list(nav.find('ol'))
            all_items.extend(items)

    return all_items, title


def _parse_nav_list(ol) -> list:
    """Recursively parse <ol> structure from HTML nav."""
    if not ol:
        return []

    items = []
    for li in ol.find_all('li', recursive=False):
        a = li.find('a', recursive=False)
        if not a:
            continue

        label = a.get_text(strip=True)
        href = a.get('href', '').split('#')[0]

        # Find nested <ol> for children
        nested_ol = li.find('ol', recursive=False)
        children = _parse_nav_list(nested_ol) if nested_ol else []

        items.append({
            'label': label,
            'src': href,
            'children': children
        })

    return items


def _extract_opf_metadata(soup: BeautifulSoup) -> dict:
    """Extract metadata from content.opf."""
    metadata = soup.find('metadata')
    if not metadata:
        return {'title': 'Untitled', 'author': None, 'language': 'en', 'identifier': None}

    def get_meta(name):
        # Try dc:name
        el = metadata.find(f'dc:{name}')
        if el:
            return el.text.strip()
        # Try meta name
        el = metadata.find('meta', attrs={'name': name})
        if el:
            return el.get('content', '').strip()
        return None

    return {
        'title': get_meta('title') or 'Untitled',
        'author': get_meta('creator') or get_meta('author'),
        'language': get_meta('language') or 'en',
        'identifier': get_meta('identifier')
    }


def _extract_ebooklib_metadata(book) -> dict:
    """Extract metadata from ebooklib book object."""
    def get_meta(name):
        values = book.get_metadata('DC', name)
        return values[0][0] if values else None

    return {
        'title': get_meta('title') or 'Untitled',
        'author': get_meta('creator'),
        'language': get_meta('language') or 'en',
        'identifier': get_meta('identifier')
    }


def _extract_metadata_from_content(documents: list) -> dict:
    """Extract metadata from XHTML content (fallback)."""
    if not documents:
        return {'title': 'Untitled', 'author': None, 'language': 'en', 'identifier': None}

    # Try to find a document with a meaningful title (not "Contents", "Preface", etc.)
    title = None
    for doc in documents[:10]:  # Check first 10 documents
        soup = BeautifulSoup(doc['content'], 'html.parser')
        title_tag = soup.find('title')
        if title_tag:
            candidate = title_tag.text.strip()
            # Skip generic titles
            if candidate and candidate.lower() not in ['contents', 'preface', 'toc', 'table of contents']:
                # Check if it looks like a book title (usually contains : or has multiple words)
                if ':' in candidate or len(candidate.split()) > 2:
                    title = candidate
                    break

    # Fallback to first document if no good title found
    if not title:
        soup = BeautifulSoup(documents[0]['content'], 'html.parser')
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.text.strip()
        else:
            h1 = soup.find('h1')
            if h1:
                title = h1.get_text(strip=True)

    return {
        'title': title or 'Untitled',
        'author': None,
        'language': 'en',
        'identifier': None
    }


def _parse_ebooklib_toc(book) -> list:
    """Parse TOC from ebooklib book object."""
    toc = book.toc
    if not toc:
        return []

    def parse_item(item):
        if isinstance(item, tuple):
            # (section, children) tuple
            section, children = item
            return {
                'label': section.title,
                'src': section.href.split('#')[0] if section.href else '',
                'children': [parse_item(child) for child in children]
            }
        else:
            # Single link
            return {
                'label': item.title,
                'src': item.href.split('#')[0] if item.href else '',
                'children': []
            }

    return [parse_item(item) for item in toc]
