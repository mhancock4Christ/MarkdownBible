import asyncio
import sqlite3

import pytest
from fastapi import HTTPException
from openpyxl import Workbook
from docx import Document

from main import (
    compile_search_regexes,
    export_csv,
    export_docx,
    export_md,
    export_txt,
    export_xlsx,
    build_markdown_text,
    build_passage_items,
    build_reading_link,
    build_reading_link,
    build_reference_search_targets,
    build_xlsx_rich_text,
    can_use_fts,
    get_sqlite_text_rows,
    normalize_row,
    split_paragraphs_from_rows,
    write_docx_runs,
)


def test_export_endpoints_reject_empty_items():
    with pytest.raises(HTTPException, match="No results to export"):
        asyncio.run(export_txt([]))
    with pytest.raises(HTTPException, match="No results to export"):
        asyncio.run(export_csv([]))
    with pytest.raises(HTTPException, match="No results to export"):
        asyncio.run(export_md(None, []))
    with pytest.raises(HTTPException, match="No results to export"):
        asyncio.run(export_docx(None, []))
    with pytest.raises(HTTPException, match="No results to export"):
        asyncio.run(export_xlsx(None, []))


def test_passage_items_split_on_paragraph_mark_before_stripping():
    rows = [
        normalize_row({
            "ID": 1,
            "book": 40,
            "chapter": 1,
            "verse": 1,
            "text": "This is the first paragraph.¶This is the second paragraph.",
        }, suppress_paragraph=True)
    ]

    items = build_passage_items(rows, "Standard", "Ref First", [], False, False)

    assert items[0]["verse_text"] == "This is the first paragraph.\n\nThis is the second paragraph."


def test_split_paragraphs_from_rows_starts_new_block_for_leading_paragraph_marker():
    rows = [
        {"verse": 21, "text": "He did the truth.", "cleaned_text": "He did the truth.", "suppress_paragraph": True},
        {"verse": 22, "text": "¶ After these things came Jesus.", "cleaned_text": "After these things came Jesus.", "suppress_paragraph": True},
        {"verse": 23, "text": "And John also was baptizing.", "cleaned_text": "And John also was baptizing.", "suppress_paragraph": True},
    ]

    paragraphs = split_paragraphs_from_rows(rows, False)

    assert len(paragraphs) == 2
    assert [verse["verse"] for verse in paragraphs[0]] == [21]
    assert [verse["verse"] for verse in paragraphs[1]] == [22, 23]


def test_single_reference_expands_to_chapter_context_but_keeps_verse_focus():
    refs = [{
        "book_name": "John",
        "book_num": 43,
        "chapter": 1,
        "verse_start": 16,
        "verse_end": None,
    }]

    expanded = build_reference_search_targets(refs)

    assert expanded == [{
        "book_name": "John",
        "book_num": 43,
        "chapter": 1,
        "verse_start": None,
        "verse_end": None,
    }]


def test_exact_word_search_excludes_longer_words_by_default():
    regexes = compile_search_regexes("hand", "Phrase", whole_word=False, case_sensitive=False)

    assert regexes[0].search("hand") is not None
    assert regexes[0].search("my hand is here") is not None
    assert regexes[0].search("hands") is None
    assert regexes[0].search("handed") is None


def test_wildcard_search_allows_matches_only_at_wildcard_position():
    suffix_regexes = compile_search_regexes("hand*", "Phrase", whole_word=False, case_sensitive=False)
    prefix_regexes = compile_search_regexes("*hand", "Phrase", whole_word=False, case_sensitive=False)
    contains_regexes = compile_search_regexes("*hand*", "Phrase", whole_word=False, case_sensitive=False)

    assert suffix_regexes[0].search("hand") is not None
    assert suffix_regexes[0].search("hands") is not None
    assert suffix_regexes[0].search("handed") is not None
    assert suffix_regexes[0].search("merchand") is None

    assert prefix_regexes[0].search("hand") is not None
    assert prefix_regexes[0].search("merchand") is not None

    assert contains_regexes[0].search("merchandise") is not None
    assert contains_regexes[0].search("merchand") is not None


def test_markdown_text_uses_visible_highlight_formatting_and_web_link():
    item = {
        "reference": "[[John 1:1]]",
        "reference_position": "Ref First",
        "verse_text": "[the] Word",
        "highlight_spans": [(0, 3)],
    }

    result = build_markdown_text(item, base_url="https://example.com")

    assert "***the***" in result
    assert " Word" in result
    assert "[[John 1:1]]" in result
    assert "[Web](https://example.com/?q=John+1&granularity=Verse&newLineVerse=1&focus=John+1%3A1)" in result
    assert "[John 1:1](https://example.com/?q=John+1&granularity=Verse&newLineVerse=1&focus=John+1%3A1)" not in result
    assert "[[[John 1:1]]]" not in result


def test_docx_export_uses_reference_and_highlights_match_text():
    item = {
        "reference": "[[Matthew 4.18]]",
        "reference_position": "Ref First",
        "verse": 18,
        "verse_text": "And Jesus, walking by the sea of Galilee, saw two brethren, Simon called Peter, and Andrew his brother, casting a net into the sea: for they were fishers.",
        "highlight_spans": [(len("And Jesus, walking by the sea of Galilee, saw two brethren, Simon called "), len("And Jesus, walking by the sea of Galilee, saw two brethren, Simon called Peter"))],
    }

    doc = Document()
    paragraph = doc.add_paragraph()
    write_docx_runs(paragraph, item, base_url="http://127.0.0.1:8000")

    assert paragraph.text.startswith("[[Matthew 4.18]]")
    assert "Web" in paragraph.text
    assert any(run.text == "Peter" and run.bold for run in paragraph.runs)
    assert any(run.text == "Peter" and run.underline for run in paragraph.runs)
    assert any(rel.reltype == "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink" for rel in paragraph.part.rels.values())


def test_docx_export_matches_browser_reference_format_in_search_mode():
    item = {
        "reference": "John 1:1",
        "reference_position": "Ref Last",
        "verse": 1,
        "verse_text": "In the beginning was the Word.",
        "highlight_spans": [],
    }

    doc = Document()
    paragraph = doc.add_paragraph()
    write_docx_runs(paragraph, item, base_url="http://127.0.0.1:8000")

    assert paragraph.text.startswith("In the beginning was the Word.")
    assert "John 1:1" in paragraph.text
    assert "1. In the beginning" not in paragraph.text


def test_xlsx_export_scopes_bold_to_exact_match_and_keeps_verse_plain():
    item = {
        "reference": "Psalm 42:20",
        "reference_position": "Ref First",
        "verse": 20,
        "verse_text": "My friends scorn me: but mine eye poureth out tears unto God.",
        "highlight_spans": [(3, 10)],
    }

    rich = build_xlsx_rich_text(item)
    bold_segments = [
        block.text for block in rich
        if hasattr(block, "font") and getattr(block.font, "bold", False)
    ]

    assert bold_segments == ["friends"]
    assert any(getattr(block, "text", None) == "20. " for block in rich if hasattr(block, "text"))
    assert not any(
        hasattr(block, "font") and getattr(block.font, "italic", False)
        and getattr(block.font, "vertAlign", None) == "superscript"
        for block in rich if hasattr(block, "font")
    )

    bracket_item = {
        "reference": "John 1:1",
        "reference_position": "Ref First",
        "verse": 1,
        "verse_text": "[the] Word",
        "highlight_spans": [(1, 4)],
    }
    bracket_rich = build_xlsx_rich_text(bracket_item)
    assert [block.text for block in bracket_rich if hasattr(block, "font") and getattr(block.font, "bold", False)] == ["the"]
    assert [block.text for block in bracket_rich if hasattr(block, "font") and getattr(block.font, "italic", False)] == ["the"]
    assert not any(
        hasattr(block, "font") and getattr(block.font, "vertAlign", None) == "superscript"
        for block in bracket_rich if hasattr(block, "font")
    )

    wb = Workbook()
    ws = wb.active
    ws.title = "Verses"
    ws.append(["Reference", "Web", "Verse"])
    row_num = ws.max_row + 1
    reference = item["reference"]
    ws.cell(row=row_num, column=1, value=reference)
    link_cell = ws.cell(row=row_num, column=2, value="Web")
    link_cell.hyperlink = "http://127.0.0.1:8000/?q=Psalm+42&granularity=Verse&newLineVerse=1&focus=Psalm+42%3A20"
    link_cell.style = "Hyperlink"

    assert ws["B2"].value == "Web"
    assert ws["B2"].hyperlink.target == "http://127.0.0.1:8000/?q=Psalm+42&granularity=Verse&newLineVerse=1&focus=Psalm+42%3A20"


def test_reading_link_uses_absolute_domain_url():
    url = build_reading_link("Genesis 1:1", base_url="https://example.com")

    assert url.startswith("https://example.com/")
    assert "q=Genesis+1" in url
    assert "focus=Genesis+1%3A1" in url


def test_markdown_export_keeps_reference_plain_and_web_last():
    item = {
        "reference": "[[Matthew 4.18]]",
        "reference_position": "Ref First",
        "verse_text": "And Jesus, walking by the sea of Galilee, saw two brethren, Simon called Peter, and Andrew his brother, casting a net into the sea: for they were fishers.",
        "highlight_spans": [(len("And Jesus, walking by the sea of Galilee, saw two brethren, Simon called "), len("And Jesus, walking by the sea of Galilee, saw two brethren, Simon called Peter"))],
    }

    result = build_markdown_text(item, base_url="http://127.0.0.1:8000")

    assert "[[Matthew 4.18]]" in result
    assert "***Peter***" in result
    assert "[Web](http://127.0.0.1:8000/?q=Matthew+4&granularity=Verse&newLineVerse=1&focus=Matthew+4.18)" in result
    assert "[[[Matthew 4.18]]]" not in result
    assert "[Matthew 4.18](http://127.0.0.1:8000/?q=Matthew+4&granularity=Verse&newLineVerse=1&focus=Matthew+4.18)" not in result


def test_markdown_export_uses_reference_without_verse_number_prefix_in_search_mode():
    item = {
        "reference": "John 1:1",
        "reference_position": "Ref First",
        "verse": 1,
        "verse_text": "In the beginning was the Word.",
        "highlight_spans": [],
    }

    result = build_markdown_text(item, base_url="https://example.com")

    assert "John 1:1 In the beginning was the Word." in result
    assert "1. In the beginning" not in result
    assert "[Web](https://example.com/?q=John+1&granularity=Verse&newLineVerse=1&focus=John+1%3A1)" in result


def test_markdown_export_honors_reference_last_ordering_in_search_mode():
    item = {
        "reference": "John 1:1",
        "reference_position": "Ref Last",
        "verse": 1,
        "verse_text": "In the beginning was the Word.",
        "highlight_spans": [],
    }

    result = build_markdown_text(item, base_url="https://example.com")

    assert "In the beginning was the Word. John 1:1" in result
    assert "John 1:1 In the beginning" not in result
    assert "[Web](https://example.com/?q=John+1&granularity=Verse&newLineVerse=1&focus=John+1%3A1)" in result


def test_markdown_export_preserves_standard_reference_format_without_url_link():
    item = {
        "reference": "Matthew 4:18",
        "reference_position": "Ref First",
        "verse_text": "And Jesus, walking by the sea of Galilee, saw two brethren, Simon called Peter, and Andrew his brother, casting a net into the sea: for they were fishers.",
        "highlight_spans": [(len("And Jesus, walking by the sea of Galilee, saw two brethren, Simon called "), len("And Jesus, walking by the sea of Galilee, saw two brethren, Simon called Peter"))],
    }

    result = build_markdown_text(item, base_url="http://127.0.0.1:8000")

    assert "Matthew 4:18" in result
    assert "[[Matthew 4:18]]" not in result
    assert "[Matthew 4:18](http://127.0.0.1:8000/?q=Matthew+4&granularity=Verse&newLineVerse=1&focus=Matthew+4%3A18)" not in result


def test_apostrophe_queries_force_sqlite_fallback():
    conn = sqlite3.connect(":memory:")
    cur = conn.cursor()
    cur.execute("CREATE VIRTUAL TABLE bible_fts USING fts5(text)")

    assert not can_use_fts(cur, "Peter's", False)
    assert not can_use_fts(cur, "John's", False)


def test_apostrophe_search_finds_literal_matches_in_sqlite_fallback():
    conn = sqlite3.connect("kjv.sqlite")
    cur = conn.cursor()
    rows_phrase = get_sqlite_text_rows(cur, "Peter's", [40, 43], "Phrase", False)
    rows_words = get_sqlite_text_rows(cur, "Peter's", [40, 43], "All Words", False)

    assert rows_phrase
    assert rows_words
    assert any(row[1] == 40 and row[2] == 8 and row[3] == 14 for row in rows_phrase)
    assert any(row[1] == 43 and row[2] == 1 and row[3] == 40 for row in rows_words)
