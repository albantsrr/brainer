#!/usr/bin/env python3
"""
Parse an EPUB toc.ncx and produce a structured course plan (JSON).

Does NOT generate any content.  The output course-plan.json is the
contract that create-chapters will consume to produce each MDX file.

Usage:
    python .claude/skills/import-course/scripts/parse_toc.py <path>   # path vers un dossier (cherche toc.ncx récursivement) ou vers un fichier toc.ncx
"""

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def find_toc(books_dir: Path) -> Path:
    hits = list(books_dir.rglob("toc.ncx"))
    if not hits:
        print(f"\nERROR: no toc.ncx found under {books_dir}")
        print(f"\nThis book may not have standard EPUB metadata.")
        print(f"Try using the structure-agnostic normalization pipeline instead:\n")
        print(f'  python .claude/skills/reformat-epub/scripts/normalize_epub.py "{books_dir}"\n')
        sys.exit(1)
    if len(hits) > 1:
        print(f"[warn] {len(hits)} toc.ncx found, using {hits[0]}")
    return hits[0]


def detect_ns(root: ET.Element) -> str:
    """Pull the default namespace out of the root tag."""
    m = re.match(r"\{(.+?)\}", root.tag)
    return m.group(1) if m else ""


def tag(ns: str, local: str) -> str:
    return f"{{{ns}}}{local}" if ns else local


def slugify(text: str) -> str:
    s = text.lower().strip()
    s = re.sub(r"[^\w\s-]", "", s)
    s = re.sub(r"[\s_]+", "-", s)
    s = re.sub(r"-+", "-", s)
    return s.strip("-")


def roman_to_int(s: str) -> int:
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total, prev = 0, 0
    for ch in reversed(s.upper()):
        v = vals.get(ch, 0)
        total += -v if v < prev else v
        prev = v
    return total


def classify(label: str):
    """Return (kind, num, clean_title).

    kind    meaning
    ----    -------
    part      Roman-numeral part header  (I. …)
    chapter   Numbered chapter           (1. …)
    other     Everything else            (preface, appendix, index …)
    """
    # Part — Roman numeral prefix
    m = re.match(r"^([IVX]+)\.\s+(.*)", label)
    if m:
        return "part", roman_to_int(m.group(1)), m.group(2).strip()

    # Chapter — "Chapter N: Title" format
    m = re.match(r"^Chapter\s+(\d+):\s+(.*)", label, re.IGNORECASE)
    if m:
        return "chapter", int(m.group(1)), m.group(2).strip()

    # Chapter — numeric prefix
    m = re.match(r"^(\d+)\.\s+(.*)", label)
    if m:
        return "chapter", int(m.group(1)), m.group(2).strip()

    # Everything else (preface, appendices A./B., index, …) is skipped
    return "other", None, label.strip()


# ---------------------------------------------------------------------------
# Core parsing
# ---------------------------------------------------------------------------


def parse(toc_path: Path) -> dict:
    tree = ET.parse(toc_path)
    root = tree.getroot()
    ns = detect_ns(root)

    def T(local):
        return tag(ns, local)

    # --- metadata ---
    title_el = root.find(f".//{T('docTitle')}/{T('text')}")
    title = title_el.text.strip() if title_el is not None else "Untitled"

    author_el = root.find(f".//{T('docAuthor')}/{T('text')}")
    author = author_el.text.strip() if author_el is not None else None

    # --- top-level navPoints (direct children of <navMap>) ---
    nav_map = root.find(T("navMap"))
    if nav_map is None:
        sys.exit("ERROR: no <navMap> in toc.ncx")

    # Collect (label, source-file) for each direct-child navPoint
    top_items: list[tuple[str, str]] = []
    for np in nav_map.findall(T("navPoint")):          # direct children only
        label_el = np.find(f"{T('navLabel')}/{T('text')}")
        label = label_el.text.strip() if label_el is not None else ""
        content_el = np.find(T("content"))
        src = content_el.get("src", "").split("#")[0] if content_el is not None else ""
        top_items.append((label, src))

    # --- classify & group chapters under their preceding part ---
    parts: list[dict] = []
    current_part: dict | None = None

    for label, src in top_items:
        kind, num, clean = classify(label)

        if kind == "part":
            # flush previous part
            if current_part is not None:
                parts.append(current_part)
            current_part = {"order": num, "title": clean, "chapters": []}

        elif kind == "chapter":
            # chapters before the first part header land in an implicit part
            if current_part is None:
                current_part = {"order": 0, "title": "General", "chapters": []}
            current_part["chapters"].append(
                {"chapter_num": num, "title": clean, "source_file": src}
            )
        # 'other' → silently skipped (preface, appendices, index, …)

    # flush last part
    if current_part is not None:
        parts.append(current_part)

    parts.sort(key=lambda p: p["order"])

    # --- assign global sequential order & derive filenames ---
    order = 1  # 00 is reserved for the index
    for part in parts:
        for ch in part["chapters"]:
            ch["order"] = order
            ch["slug"] = slugify(ch["title"])
            ch["mdx_file"] = f"{order:02d}-{ch['slug']}.mdx"
            order += 1

    # --- assemble plan ---
    slug = slugify(title)
    n_chapters = sum(len(p["chapters"]) for p in parts)

    return {
        "course": {
            "title": title,
            "author": author,
            "slug": slug,
            "output_dir": f"content/courses/{slug}/",
        },
        "index": {
            "mdx_file": "00-index.mdx",
        },
        "parts": parts,
        "summary": {
            "parts": len(parts),
            "chapters": n_chapters,
            "total_mdx_files": 1 + n_chapters,  # index + chapters
        },
    }


# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------


def pretty_print(plan: dict):
    c = plan["course"]
    print(f"\n{'=' * 58}")
    print(f"  {c['title']}")
    if c["author"]:
        print(f"  by {c['author']}")
    print(f"  slug       -> {c['slug']}")
    print(f"  output dir -> {c['output_dir']}")
    print(f"{'=' * 58}\n")

    print(f"  [index]  {plan['index']['mdx_file']}\n")

    for part in plan["parts"]:
        print(f"  [Part {part['order']}] {part['title']}")
        for ch in part["chapters"]:
            print(f"      {ch['mdx_file']:52s}<- {ch['source_file']}")
        print()

    s = plan["summary"]
    print(f"  {s['parts']} parts, {s['chapters']} chapters -> {s['total_mdx_files']} MDX files\n")


def main():
    if len(sys.argv) < 2:
        sys.exit("Usage: python .claude/skills/import-course/scripts/parse_toc.py <path>  # dossier ou fichier toc.ncx")

    target = Path(sys.argv[1]).resolve()

    if target.is_file():
        toc_path = target
    elif target.is_dir():
        toc_path = find_toc(target)
        print(f"[info] found {toc_path.relative_to(target)}")
    else:
        sys.exit(f"ERROR: '{target}' n'existe pas.")

    plan = parse(toc_path)
    pretty_print(plan)

    # Ensure temp directory exists
    temp_dir = Path.cwd() / "temp"
    temp_dir.mkdir(exist_ok=True)

    out = temp_dir / "course-plan.json"
    out.write_text(json.dumps(plan, indent=2, ensure_ascii=False) + "\n")
    print(f"  [ok] plan saved -> {out}\n")


if __name__ == "__main__":
    main()
