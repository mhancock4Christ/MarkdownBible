#!/usr/bin/env python3
"""Create a ZIP archive containing the files needed for server deployment."""

import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


PACKAGE_PATHS = (
    "app",
    "config/requirements.txt",
    "docs",
    "packaging",
    ".local-scripts/deploy_bibleapp.sh",
)


def package_files(root_dir: Path) -> list[Path]:
    files = []
    for relative_path in PACKAGE_PATHS:
        source = root_dir / relative_path
        if not source.exists():
            raise FileNotFoundError(f"Required deployment input not found: {source}")
        if source.is_file():
            files.append(source)
            continue

        for path in sorted(source.rglob("*")):
            if "__pycache__" in path.parts or path.suffix == ".pyc":
                continue
            if path.is_file():
                files.append(path)
    return files


def main() -> None:
    root_dir = Path(__file__).resolve().parents[1]
    default_output = (
        root_dir
        / "dist"
        / "MarkdownBible-Server"
        / "MarkdownBible-Server-Deployment.zip"
    )

    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--output",
        type=Path,
        default=default_output,
        help=f"ZIP output path (default: {default_output})",
    )
    args = parser.parse_args()
    output_path = args.output.resolve()

    try:
        files = package_files(root_dir)
    except FileNotFoundError as exc:
        parser.error(str(exc))

    output_path.parent.mkdir(parents=True, exist_ok=True)
    archive_root = "MarkdownBible-Server"
    with ZipFile(output_path, "w", compression=ZIP_DEFLATED, compresslevel=9) as archive:
        for source in files:
            relative_path = source.relative_to(root_dir)
            if relative_path == Path(".local-scripts/deploy_bibleapp.sh"):
                relative_path = Path("scripts/deploy_bibleapp.sh")
            archive.write(source, Path(archive_root) / relative_path)

    print(f"Created server deployment package: {output_path}")
    print(f"Included {len(files)} files.")


if __name__ == "__main__":
    main()
