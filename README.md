# Bible Study App

This project is a FastAPI-based Bible search and reading app with a browser UI and packaged deployment options for Windows and Android.

## Project structure

- `main.py` — FastAPI server and Bible search logic
- `kjv.sqlite` — Bible database
- `icon.ico` and `icon.png` — browser/Windows and Android app icons
- `static/` — JavaScript and CSS frontend assets
- `templates/` — HTML pages, including the in-app help page
- `packaging/` — Windows and Android packaging scripts

## Run locally

From the project root:

```powershell
.venv\Scripts\Activate.ps1
python main.py
```

Then open:

```text
http://127.0.0.1:8000/
```

## Help

Open **Help** from the app's top bar, or visit `http://127.0.0.1:8000/help`. The help page covers text and reference search, multi-reference note preservation, reading mode, display options, and exports.

## Learn the books

Open **Learn the books** from the top bar, or visit `http://127.0.0.1:8000/learn-books`. Select all 66 books in canonical order. The game includes a timer, category colors, audio feedback, and optional player names. Completed results are stored in browser local storage on that device and can be cleared from the game page.

## Server deployment

The deployment scripts copy the app entry point and database, the HTML templates and static assets, the README and dependency list, both icon files, the packaging scripts, and the deployment scripts:

- Windows: run `deploy_bibleapp.bat` to deploy to the configured shared-folder destination.
- Linux: run `deploy_bibleapp.sh` to deploy to `/var/www/bibleapp` and restart the `bibleapp` systemd service.

The browser favicon is served from the root-level `icon.ico`. Keep it alongside `main.py`; `icon.png` is used by the Android package.

### Server deployment ZIP

Create a ZIP containing the server app, database, templates, static assets, icons, packaging files, and Linux deployment script:

```powershell
packaging\build_server_zip.bat
```

The archive is written to `dist\server-deployment\MarkdownBible-Server-Deployment.zip`. Extract it on the server, enter the included project folder, and run `sudo bash deploy_bibleapp.sh`. The script deploys to `/var/www/bibleapp` and restarts the existing `bibleapp` systemd service. Use `--output <path>` to choose a different ZIP location.

## Windows portable package

The portable Windows build creates an executable bundle that includes the app files needed to run without a separate install.

### Prerequisites

- Python virtual environment created in the project root
- PyInstaller installed in that environment

### Build

Run:

```powershell
packaging\build_windows_portable.bat
```

This outputs a portable build under:

```text
dist\windows-portable\
```

The folder contains:

- `BibleStudyApp.exe`
- `app_files\` with the bundled server, static files, templates, SQLite database, and icons
- `README.md` and `requirements.txt`
- `run_app.bat` to launch the packaged app

### Quick EXE build and ZIP

Run `compile_to_exe.bat` to build `dist\Bible_Study.exe`. The script stops any running copy of this app before compiling, then creates `dist\Bible_Study.zip` containing `Bible_Study.exe` and `kjv.sqlite`. The same two files are also copied into `MarkdownBible-Portable\`.

## Android APK package

The Android package is built with Buildozer and produces an APK for distribution.

### Prerequisites

- Android Studio installed
- Android SDK installed and `ANDROID_HOME` configured
- Java toolchain available
- Buildozer installed in the Python environment

### Build

Run:

```powershell
packaging\build_android_apk.bat
```

This produces an APK under:

```text
dist\android-apk\
```

The Android package uses the root-level `icon.png` for its app icon and presplash image.

## Notes

- The Windows build is intended for portable local distribution.
- The Android build is intended for Android APK distribution and requires a valid Android SDK setup.
- The packaged app includes the server runtime and necessary app files, so it is meant to run as a self-contained local app without additional installation steps beyond launching the packaged result.
