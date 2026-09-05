#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEST_DIR="/var/www/bibleapp"

if [[ ! -d "$DEST_DIR" ]]; then
  echo "Destination directory does not exist: $DEST_DIR" >&2
  echo "Creating it..."
  sudo mkdir -p "$DEST_DIR"
fi

copy_file() {
  local src="$1"
  local dst="$2"

  if [[ ! -f "$src" ]]; then
    echo "Source file not found: $src" >&2
    return 1
  fi

  echo "Copying: $src -> $dst"
  sudo mkdir -p "$(dirname "$dst")"
  sudo cp "$src" "$dst"
}

copy_dir() {
  local src="$1"
  local dst="$2"

  if [[ ! -d "$src" ]]; then
    echo "Source directory not found: $src" >&2
    return 1
  fi

  echo "Copying directory: $src -> $dst"
  sudo mkdir -p "$dst"
  sudo cp -R "$src"/. "$dst"/
}

copy_file "$SCRIPT_DIR/main.py" "$DEST_DIR/main.py"
copy_file "$SCRIPT_DIR/kjv.sqlite" "$DEST_DIR/kjv.sqlite"
copy_dir "$SCRIPT_DIR/templates" "$DEST_DIR/templates"
copy_dir "$SCRIPT_DIR/static" "$DEST_DIR/static"

echo "Stopping bibleapp service..."
sudo systemctl stop bibleapp

echo "Restarting bibleapp service..."
sudo systemctl start bibleapp

echo "Bible app deployed and restarted."
