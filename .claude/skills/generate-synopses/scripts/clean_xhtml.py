#!/usr/bin/env python3
"""
Clean XHTML/HTML files from EPUB books before LLM ingestion.

Removes non-semantic noise to reduce token count by ~50-70%:
- Strips <head> (CSS links, inline styles, meta)
- Removes presentational attributes (class, id, style, epub:type, data-*, xmlns*)
- Removes footnote markers (<sup><a data-type="noteref">)
- Removes <img> tags (not used — diagrams are generated)
- Unwraps non-semantic <div> containers
- Removes XML declarations and empty elements
- Strips cross-reference <a> wrappers (keeps text)

Usage:
    python scripts/clean_xhtml.py <input.xhtml> [output.html]
    python scripts/clean_xhtml.py <input.xhtml>  # prints to stdout

    # From Python:
    from scripts.clean_xhtml import clean_xhtml_file, clean_xhtml_string
    clean_html = clean_xhtml_file(path)
"""

import re
import sys
from pathlib import Path

try:
    from bs4 import BeautifulSoup, NavigableString, Tag
except ImportError:
    sys.exit("ERROR: beautifulsoup4 not installed. Run: pip install beautifulsoup4")


# Attributes to keep (whitelist approach for semantic value)
KEEP_ATTRS = {
    "code": {"class"},       # language-python, language-bash, etc.
    "pre":  {"class"},       # code block type hints
}

# Tags that are purely structural wrappers — unwrap, keep children
UNWRAP_TAGS = {"div", "span", "section", "article", "aside", "main"}

# Tags to remove entirely (including children)
REMOVE_TAGS = {"head", "style", "script", "img", "figure", "nav", "aside", "sup"}

# Semantic tags to keep as-is (minus stripped attributes)
KEEP_TAGS = {
    "html", "body", "h1", "h2", "h3", "h4", "h5", "h6",
    "p", "ul", "ol", "li", "blockquote", "pre", "code",
    "em", "strong", "b", "i", "table", "thead", "tbody",
    "tr", "th", "td", "dl", "dt", "dd",
}


def _is_crossref_link(tag: Tag) -> bool:
    """Return True if this <a> is an internal cross-reference."""
    if tag.name != "a":
        return False
    data_type = tag.get("data-type", "")
    href = tag.get("href", "")
    # Internal xrefs or footnote back-links
    return data_type in ("xref", "noteref") or (href.startswith("#") and not data_type)


def _strip_attrs(tag: Tag) -> None:
    """Remove all attributes except whitelisted ones for this tag."""
    allowed = KEEP_ATTRS.get(tag.name, set())
    attrs_to_remove = [k for k in list(tag.attrs.keys()) if k not in allowed]
    for attr in attrs_to_remove:
        del tag[attr]


def clean_soup(soup: BeautifulSoup) -> BeautifulSoup:
    """Apply all cleaning passes to a BeautifulSoup tree."""

    # Pass 1: Remove unwanted tags entirely (with children)
    for tag_name in REMOVE_TAGS:
        for tag in soup.find_all(tag_name):
            tag.decompose()

    # Pass 2: Unwrap or remove <a> tags
    for tag in soup.find_all("a"):
        href = tag.get("href", "")
        text = tag.get_text(strip=True)
        # Remove pure navigation anchors (no visible text, or empty href)
        if not text or not href:
            tag.decompose()
        elif _is_crossref_link(tag):
            tag.unwrap()  # keep the link text, remove the <a>
        else:
            tag.unwrap()  # external links: keep text, drop the link

    # Pass 3: Strip non-semantic attributes from all remaining tags
    for tag in soup.find_all(True):
        _strip_attrs(tag)

    # Pass 4: Unwrap structural container divs/spans/sections
    # Process bottom-up so nested divs are handled correctly
    for tag in reversed(soup.find_all(UNWRAP_TAGS)):
        tag.unwrap()

    # Pass 5: Remove empty block elements (whitespace-only)
    for tag in soup.find_all(["p", "li", "h1", "h2", "h3", "h4", "h5", "h6", "blockquote"]):
        if not tag.get_text(strip=True):
            tag.decompose()

    return soup


def clean_xhtml_string(xhtml: str) -> str:
    """
    Clean a raw XHTML string and return minimal HTML body content.

    Handles concatenated XML documents (multiple <?xml ...?> declarations).
    Returns the cleaned inner content of <body>, or the full cleaned tree
    if no <body> is found.
    """
    # Remove XML declarations (can appear multiple times in normalized EPUBs)
    xhtml = re.sub(r"<\?xml[^?]*\?>", "", xhtml)

    # Remove DOCTYPE
    xhtml = re.sub(r"<!DOCTYPE[^>]*>", "", xhtml, flags=re.IGNORECASE)

    soup = BeautifulSoup(xhtml, "html.parser")
    soup = clean_soup(soup)

    body = soup.find("body")
    if body:
        return body.decode_contents().strip()

    return str(soup).strip()


def clean_xhtml_files(paths: list[Path]) -> str:
    """
    Clean and concatenate multiple XHTML files into a single clean HTML string.
    Useful when a chapter spans multiple source files.
    """
    parts = []
    for path in paths:
        raw = path.read_text(encoding="utf-8")
        cleaned = clean_xhtml_string(raw)
        if cleaned:
            parts.append(cleaned)
    return "\n\n".join(parts)


def clean_xhtml_file(path: Path) -> str:
    """Clean a single XHTML file and return the cleaned HTML string."""
    return clean_xhtml_files([path])


def extract_scope(html: str, start_heading: str, end_heading: str | None = None) -> str:
    """
    Extract a heading-delimited section from cleaned HTML.

    Scans top-level elements for a heading (h1-h4) whose text contains
    `start_heading` (case-insensitive, partial match) and returns everything
    from that heading up to (but not including) the next heading whose text
    contains `end_heading`.  If `end_heading` is None, returns to end of doc.
    If `start_heading` is not found, returns the original HTML unchanged.

    Intended for use after clean_xhtml_string() / clean_xhtml_files() when
    a source file contains multiple pedagogical chapters and only a portion
    is needed.

    Args:
        html: Cleaned HTML string (body content, no <body> wrapper).
        start_heading: Partial heading text to match as the section start.
        end_heading: Partial heading text to match as the exclusive end boundary.

    Returns:
        HTML string containing only the matched section.
    """
    heading_tags = {"h1", "h2", "h3", "h4"}

    # Parse as a fragment — no <body> wrapper in cleaned output
    soup = BeautifulSoup(html, "html.parser")

    # Top-level elements only (avoids double-counting nested content)
    elements = [el for el in soup.contents if hasattr(el, "name") and el.name]

    # Find start heading
    start_idx: int | None = None
    for i, el in enumerate(elements):
        if el.name in heading_tags and start_heading.lower() in el.get_text().lower():
            start_idx = i
            break

    if start_idx is None:
        return html  # scope not found — return full content unchanged

    # Find end boundary
    end_idx = len(elements)
    if end_heading:
        for i in range(start_idx + 1, len(elements)):
            if elements[i].name in heading_tags and end_heading.lower() in elements[i].get_text().lower():
                end_idx = i
                break

    return "\n".join(str(el) for el in elements[start_idx:end_idx])


def estimate_reduction(original: str, cleaned: str) -> str:
    orig_chars = len(original)
    clean_chars = len(cleaned)
    reduction = (1 - clean_chars / orig_chars) * 100 if orig_chars else 0
    return (
        f"Original: {orig_chars:,} chars ({orig_chars // 4:,} est. tokens) | "
        f"Cleaned: {clean_chars:,} chars ({clean_chars // 4:,} est. tokens) | "
        f"Reduction: {reduction:.0f}%"
    )


def main():
    if len(sys.argv) < 2:
        print("Usage: python clean_xhtml.py <input.xhtml> [output.html]")
        print("       python clean_xhtml.py <input.xhtml>  # stdout")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    if not input_path.exists():
        print(f"ERROR: File not found: {input_path}")
        sys.exit(1)

    raw = input_path.read_text(encoding="utf-8")
    cleaned = clean_xhtml_string(raw)

    # Stats
    print(estimate_reduction(raw, cleaned), file=sys.stderr)

    if len(sys.argv) >= 3:
        output_path = Path(sys.argv[2])
        output_path.write_text(cleaned, encoding="utf-8")
        print(f"Saved to: {output_path}", file=sys.stderr)
    else:
        print(cleaned)


if __name__ == "__main__":
    main()
