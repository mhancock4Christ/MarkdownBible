# -*- mode: python ; coding: utf-8 -*-


a = Analysis(
    ['C:/Users/mah0906/Apps/WPy64-31241/scripts/MarkdownBible/packaging/win_server_launcher.py'],
    pathex=['C:/Users/mah0906/Apps/WPy64-31241/scripts/MarkdownBible'],
    binaries=[],
    datas=[],
    hiddenimports=[],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    noarchive=False,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    name='BibleStudyApp',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=['C:/Users/mah0906/Apps/WPy64-31241/scripts/MarkdownBible/app/assets/icon.ico'],
)
