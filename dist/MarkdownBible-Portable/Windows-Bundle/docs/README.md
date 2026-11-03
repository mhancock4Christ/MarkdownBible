# Bible Study App

This project is a FastAPI-based Bible search and reading app with a browser UI and packaged deployment options for Windows and server hosting.

## Project structure

- `app/` — Python application, static assets, templates, icons, and database
- `config/requirements.txt` — server/runtime Python dependencies
- `docs/` — project documentation
- `packaging/` — packaging support files and the server ZIP builder
- `tests/` — automated tests and fixtures
- `tools/` — maintenance utilities
- `.local-scripts/` — local build and deployment scripts; ignored by Git
- `.gitignore` — repository ignore rules (the only loose file at the project root)

## Run locally

From the project root:

```powershell
.venv\Scripts\Activate.ps1
pip install -r config\requirements.txt
python -m uvicorn app.main:app --reload
```

Then open:

```text
http://127.0.0.1:8000/
```

## Help

Open **Help** from the app's top bar, or visit `http://127.0.0.1:8000/help`. The help page covers text and reference search, multi-reference note preservation, reading mode, display options, and exports.

## Learn the books

Open **Learn the books** from the top bar, or visit `http://127.0.0.1:8000/learn-books`. Select all 66 books in canonical order. The game includes a timer, category colors, audio feedback, and optional player names. Recent results are stored in browser local storage and can be cleared from the game page. Completed scores are also recorded in `app/data/book_order_leaderboard.json` beside the app database; the server creates the file when the first score is submitted, so that folder must be writable. The public board shows the 10 fastest times overall and 20 most recent finishes. No account is needed. Display names are checked for common profanity, adult terms, and markup. Scores and display names are public, and completion times are submitted by the browser, so the board is intended for casual competition rather than tamper-proof rankings.

## Dictionary

Open **Dictionary** from the app's top bar, or visit `http://127.0.0.1:8000/dictionary`. Search for a Webster's 1828 headword. Use `*` to match zero or more characters and `?` to match exactly one character. Each headword appears once with its definitions grouped together; additional matching words load as needed. The page reads `app/data/dictionary.db`, from [kayson-argyle/websters_1828](https://github.com/kayson-argyle/websters_1828).

## Server deployment

The deployment scripts copy the app, configuration, documentation, packaging support files, and deployment scripts as subdirectories:

- Windows: run `.local-scripts\deploy_bibleapp.bat` to deploy to the configured shared-folder destination.
- Linux: run `.local-scripts\deploy_bibleapp.sh` to deploy to `/var/www/bibleapp` and restart the `bibleapp` systemd service.

The browser favicon is served from `app/assets/icon.ico`.

### Server deployment ZIP

Create a ZIP containing the server app, database, templates, static assets, icons, packaging support files, and Linux deployment script:

```powershell
.local-scripts\build_server_zip.bat
```

The archive is written to `dist\MarkdownBible-Server\MarkdownBible-Server-Deployment.zip` and contains a `MarkdownBible-Server\` project folder with the app, configuration, docs, packaging files, and the Linux deploy script at both the project root and `scripts\deploy_bibleapp.sh`. Extract it on the server, enter that folder, and run `sudo bash deploy_bibleapp.sh` (or `sudo bash scripts/deploy_bibleapp.sh`). The script requires `rsync`; it synchronizes the deployed app and support folders, removes obsolete flat-layout files and stale files from those folders, and verifies the deployed help page before restarting the service. It preserves `app/data/book_order_leaderboard.json` and its temporary files across deployments. The deployed systemd service should use a Python environment with `config/requirements.txt` installed and launch `app.main:app` from `/var/www/bibleapp`. Use `--output <path>` to choose a different ZIP location.

## Windows portable package

The portable Windows build creates an executable bundle that includes the app files needed to run without a separate install.

### Prerequisites

- Python virtual environment created in the project root
- PyInstaller installed in that environment

### Build

Run:

```powershell
.local-scripts\build_windows_portable.bat
```

This outputs a portable build under:

```text
dist\MarkdownBible-Portable\Windows-Bundle\
```

The build script also creates `dist\MarkdownBible-Portable\Windows-Bundle.zip` for distribution.
The ZIP contains the `Windows-Bundle\` folder and its executable, app files, documentation, configuration, and launcher.

The folder contains:

- `BibleStudyApp.exe`
- `app_files\app\` with the server, static files, templates, SQLite databases, and icons
- `docs\README.md` and `config\requirements.txt`
- `scripts\run_app.bat` to launch the packaged app

### Quick EXE build and ZIP

Run `.local-scripts\compile_to_exe.bat` to build the portable executable. The script stops any running copy of this app before compiling, then writes `dist\MarkdownBible-Portable\MarkdownBible-Portable.zip`. The ZIP contains a `MarkdownBible-Portable\` project folder with `app\Bible_Study.exe`, `app\data\kjv.sqlite`, `app\data\dictionary.db`, and `docs\README.md`; the same folder is available beside the ZIP.

## Notes

- The Windows build is intended for portable local distribution.
- The packaged app includes the server runtime and necessary app files, so it is meant to run as a self-contained local app without additional installation steps beyond launching the packaged result.
