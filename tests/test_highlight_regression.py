import io
from pathlib import Path

from fastapi.testclient import TestClient
from openpyxl import load_workbook

from main import app


client = TestClient(app)


def test_highlight_toggle_is_not_hardcoded():
    app_js = Path(__file__).resolve().parents[1] / "static" / "app.js"
    source = app_js.read_text(encoding="utf-8")

    assert 'highlightMatches' in source
    assert 'highlight: options.highlight' in source
    assert 'show_red_letters: options.show_red_letters' in source
    assert 'highlight: true' not in source


def test_xlsx_export_adds_clickable_reference_column():
    response = client.post(
        "/api/export/xlsx",
        json=[
            {
                "reference": "John 1:1",
                "verse_text": "In the beginning was the Word.",
                "highlight_spans": []
            }
        ],
    )

    assert response.status_code == 200

    workbook = load_workbook(filename=io.BytesIO(response.content))
    sheet = workbook.active

    assert sheet["A1"].value == "Reference"
    assert sheet["B1"].value == "Reading Link"
    assert sheet["C1"].value == "Verse"
    assert sheet["A2"].value == "John 1:1"
    assert sheet["B2"].value == "John 1:1"
    assert sheet["B2"].hyperlink == "/?q=John+1%3A1"
