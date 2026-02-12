"""
Supprime récursivement dans un dossier donné tous les fichiers dont le nom
ne commence pas par 'ch', 'part' ou 'fode'.

Usage:
    python .claude/skills/reformat-epub/scripts/clean_ebook_data.py <path>          # dry-run  — liste ce qui sera supprimé
    python .claude/skills/reformat-epub/scripts/clean_ebook_data.py <path> --delete  # suppression réelle
"""

import os
import sys

PREFIXES = ("ch", "part", "fode")


def collect_targets(root: str) -> list[str]:
    """Retourne la liste des chemins de fichiers à supprimer."""
    targets = []
    for dirpath, _, filenames in os.walk(root):
        for name in filenames:
            if name == os.path.basename(__file__):
                continue
            if not name.lower().startswith(PREFIXES):
                targets.append(os.path.join(dirpath, name))
    return targets


def remove_empty_dirs(root: str) -> None:
    """Supprime les dossiers vides laissés après nettoyage (bottom-up)."""
    for dirpath, dirnames, filenames in os.walk(root, topdown=False):
        if dirpath == root:
            continue
        if not os.listdir(dirpath):
            os.rmdir(dirpath)
            print(f"  [dir supprimé] {dirpath}")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not args:
        sys.exit("Usage: python .claude/skills/reformat-epub/scripts/clean_ebook_data.py <path> [--delete]")

    root = os.path.abspath(args[0])
    if not os.path.isdir(root):
        sys.exit(f"ERROR: '{root}' n'est pas un dossier valide.")

    delete = "--delete" in sys.argv

    targets = collect_targets(root)

    if not targets:
        print("Aucun fichier à supprimer.")
        return

    mode = "SUPPRESSION" if delete else "DRY-RUN"
    print(f"=== {mode} — {len(targets)} fichier(s) trouvé(s) ===\n")

    for path in sorted(targets):
        rel = os.path.relpath(path, root)
        if delete:
            os.remove(path)
            print(f"  [supprimé] {rel}")
        else:
            print(f"  [à supprimer] {rel}")

    if delete:
        print()
        remove_empty_dirs(root)

    if not delete:
        print("\n  Lancez avec --delete pour effectuer la suppression.")


if __name__ == "__main__":
    main()
