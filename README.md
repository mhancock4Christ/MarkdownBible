# Bible Study App

This project is a FastAPI-based Bible search and reading app with a browser UI and packaged deployment options for Windows and Android.

## Project structure

- `main.py` — FastAPI server and Bible search logic
- `kjv.sqlite` — Bible database
- `static/` — JavaScript and CSS frontend assets
- `templates/` — HTML pages
- `packaging/` — packaging and distribution scripts

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
- `app_files\` with the bundled server, static files, templates, and SQLite database
- `run_app.bat` to launch the packaged app

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

## Notes

- The Windows build is intended for portable local distribution.
- The Android build is intended for Android APK distribution and requires a valid Android SDK setup.
- The packaged app includes the server runtime and necessary app files, so it is meant to run as a self-contained local app without additional installation steps beyond launching the packaged result.
