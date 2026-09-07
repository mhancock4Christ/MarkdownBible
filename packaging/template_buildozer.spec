[app]
# (str) Title of your application
title = BibleStudyApp

# (str) Package name
package.name = biblestudyapp

# (str) Package domain (needed for android/packaging)
package.domain = org.rom34

# (str) Source code where the main.py live
source.dir = ..

# (str) The main .py file to use
source.include_exts = py,png,jpg,kv,atlas,sqlite,html,js,css

# (list) Source files to include (let empty to include all the listed ones)
source.include_patterns = static/*,templates/*,main.py,kjv.sqlite

# (list) List of exclusions using pattern expressions
source.exclude_patterns = .git/*,*.pyc,*/__pycache__/*

# (str) Application versioning
version = 1.0.0

# (str) Application requirements
requirements = python3,fastapi,uvicorn,jinja2,python-multipart,python-docx,openpyxl,pydantic

# (str) Presplash of the app
presplash.filename = %(source.dir)s/static/icon.png

# (str) Icon of the app
icon.filename = %(source.dir)s/static/icon.png

# (str) Supported orientation
orientation = portrait

# (list) Permissions
android.permissions = INTERNET

# (int) Target Android API
android.api = 31

# (int) Minimum API your APK will support
android.minapi = 21

# (bool) Indicate if the application should be packaged in a single APK
android.single_app = False

# (str) The Android archs to build for
android.archs = arm64-v8a, armeabi-v7a

# (str) The Android logcat tag to use
# android.logcat_filters = *:S python:D

# (bool) Use --private data directory
android.private_storage = True

# (str) The name of the Java class to use
# android.entrypoint = org.test.myapp.MainActivity

# (str) The Android package mode
# android.gradle_dependencies =

# (list) The Android SDK and NDK directories (can be set through env var)
# android.sdk_path =
# android.ndk_path =

# (str) The app's main module; this is custom and required for Kivy/Python packaging
# p4a.branch = master

# (bool) Indicate whether to use the app's own custom source code
# p4a.source_dir =

[buildozer]
log_level = 2
warn_on_root = 0

[app:python]
# Python version used by the app
# python_version = 3.11

[app:android]
# Android settings
