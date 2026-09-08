# Display, Copy, Export, Search, UI Control, Help, and Ownership Specification

## 1. Purpose

This specification defines the required behavior for:

- browser display,
- search and reference lookup,
- reading-mode rendering,
- copy-to-clipboard output,
- export formatting,
- hyperlink handling,
- UI controls,
- responsive behavior,
- URL-based state restoration,
- Help-page content,
- file ownership and responsibility boundaries,
- search fallback behavior.

All implementations, bug fixes, refactors, and documentation updates **MUST** comply with this specification.

---

## 2. Normative Terms

The key words **MUST**, **MUST NOT**, **SHOULD**, and **MAY** are to be interpreted as follows:

- **MUST** / **MUST NOT**: mandatory requirement
- **SHOULD** / **SHOULD NOT**: recommended unless a documented exception exists
- **MAY**: optional behavior

---

## 3. Authoritative State Model

The application **MUST** treat the following as distinct state variables:

- `query_mode`: `text`, `reference`, or `extract`
- `granularity`: `Verse` or `Passage`
- `reference_style`: `Wikilink` or `Standard`
- `reference_position`: `Ref First` or `Ref Last`
- `recommended_view`: advisory UI state only
- `reading_items`: explicit reading-view payload, separate from normal result `items`

The application **MUST** also treat the following UI controls as authoritative where applicable:

- search input
- search intent controls
- `search_type`
- `book_group`
- `reference_style`
- `granularity`
- `reference_position`
- `context_window`
- `whole_word`
- `case_sensitive`
- `suppress_paragraph`
- `highlightMatches`
- `showRedLetters`
- `showInlineVerseNumbers`
- `exportFormat`
- theme toggle

### 3.1 Source of truth
All display, copy, and export formatting **MUST** derive from the active rendered view state.

Implementations **MUST NOT**:
- infer formatting solely from query text,
- rely on stale cached item metadata,
- reuse formatting assumptions from a previously active view.

If explicit active-view state is available, formatters **MUST** use it as the source of truth.

### 3.2 `recommended_view`
`recommended_view` **MUST NOT** change formatting behavior by itself.  
It **MAY** influence UI suggestions, but formatting behavior **MUST** follow the actually active rendered view.

---

## 4. Display Modes

The application defines two primary display modes.

### 4.1 Search mode
Search mode is the result list produced from a search request.

Search mode **MUST** support:
- verse-level results,
- passage-level results.

Search mode formatting **MUST** be controlled by:
- `granularity`,
- `reference_style`,
- `reference_position`.

### 4.2 Reading mode
Reading mode is the contextual chapter-style or passage-style reading view.

Reading mode **MUST**:
- use the dedicated `reading_items` construction path,
- remain distinct from search mode,
- display reading-style verse markers rather than search-style full references.

Reading mode **MUST NOT** be treated as a search result list.

---

## 5. Query Controls

The following controls **MUST** be sent in the search request payload when applicable:

- `book_group`
- `search_type`
- `whole_word`
- `case_sensitive`
- `reference_style`
- `granularity`
- `reference_position`
- `suppress_paragraph`
- `context_window`

These values **MUST** be read from the current browser UI state at request time.

Implementations **MUST NOT**:
- reuse stale values from a prior request,
- infer these values from result items,
- silently substitute defaults when a valid UI control value is present.

### 5.1 Default values
If a control is absent, the implementation **MUST** fall back to the current defined defaults:

- `book_group`: `All Books`
- `search_type`: `Phrase`
- `reference_style`: `Wikilink`
- `granularity`: `Verse`
- `reference_position`: `Ref First`
- `context_window`: `0`
- `whole_word`: `false`
- `case_sensitive`: `false`
- `suppress_paragraph`: `true` when the control exists and has been initialized as checked

If product defaults change, the specification **MUST** be updated to match.

---

## 6. Display Controls

The following controls are display-only controls and **MUST NOT** alter the underlying search result set unless explicitly included in the request contract:

- `highlightMatches`
- `showRedLetters`
- `showInlineVerseNumbers`
- theme toggle

These controls **MUST** trigger re-rendering of the current view when changed, if result data is already loaded.

These controls **MUST NOT** require a new search request unless the product intentionally changes that contract.

---

## 7. Search Intent Behavior

The application supports at least two explicit search intents:

- word/text search,
- reference search.

### 7.1 Trigger behavior
The following actions **MUST** trigger a word/text search:
- form submit,
- Enter key in the search input,
- search button click.

The reference button **MUST** trigger a reference search.

### 7.2 Initial query routing
When the application is initialized from URL or bootstrapped query state, it **MUST** determine whether the initial query looks like a reference.

If the query matches reference syntax, the initial search **MUST** use reference intent.  
Otherwise, it **MUST** use text search intent.

### 7.3 Search fallback
If a text search returns no results and the query is not an apostrophe-sensitive text query, the application **MAY** attempt a reference search fallback.

If both fail, the UI **MUST** show an empty result state.

---

## 8. Search Mode Display Contract

In search mode:

1. Each result **MUST** display the reference using the active `reference_style`.
2. The visible reference **MUST** match the browser-visible format exactly.
3. The visible reference **MUST** use the full reference and **MUST NOT** be shortened to a verse-only fragment unless that fragment is itself the full selected format.
4. In `Verse` granularity, each result **MUST** use the full verse reference.
5. In `Passage` granularity, each grouped result **MUST** use the full passage-range reference.
6. `reference_position` **MUST** control whether the reference appears before or after the text.

---

## 9. Reading Mode Display Contract

In reading mode:

1. Visible verse markers **MUST** remain verse numbers only.
2. Reading mode **MUST NOT** replace verse numbers with full search-style references.
3. `reference_style` **MUST NOT** alter the visible verse-number presentation.
4. Reading mode formatting **MUST** remain distinct from search mode formatting even when the same content is shown.

---

## 10. Reference Style Requirements

Supported reference styles **MUST** include:

- **Wikilink**
  - verse form: `[[Book Chapter.Verse]]`
  - passage form: approved range form using wikilink syntax

- **Standard**
  - verse form: `Book Chapter:Verse`
  - passage form: approved standard range form

Unless the active view is reading mode, the visible reference text **MUST** match the selected `reference_style`.

### 10.1 Canonical range formatting
The engineering team **SHOULD** define one canonical representation for:
- single-verse references,
- same-chapter passage ranges,
- cross-chapter passage ranges.

Once defined, that canonical representation **MUST** be used consistently across browser display, copy, and export.

---

## 11. Context Window Behavior

### 11.1 Definition
`context_window` defines the amount of surrounding context included for search results when the backend supports contextual expansion.

### 11.2 Request behavior
`context_window` **MUST** be parsed as an integer from the UI control and sent as `context_window` in the search payload.

If parsing fails, the value **MUST** default to `0`.

### 11.3 Scope
`context_window` applies to **search-mode result generation**, not to reading-mode chapter navigation.

Reading mode **MUST NOT** reinterpret `context_window` as a chapter preload, auto-load threshold, or reading navigation size unless a future version explicitly defines that behavior.

### 11.4 Display consistency
If `context_window` changes the text returned for a result, then:
- browser display **MUST** reflect that returned context,
- copy output **MUST** reflect the currently visible contextual result,
- export output **MUST** reflect the same contextual result for the active search result set.

### 11.5 Reading mode exclusion
When the application is rendering `reading_items`, reading-mode formatting **MUST** take precedence over any search-result context-window presentation rules.

---

## 12. Reference Text and Hyperlink Separation

Visible reference text and hyperlink target are separate concerns.

### 12.1 Visible reference
The visible reference **MUST** remain plain, human-readable text.

Visible references **MUST NOT**:
- contain embedded HTTP or HTTPS URLs,
- be rewritten to include hyperlink target text,
- be polluted with export-only URL content.

### 12.2 Wikilink integrity
Wikilink references **MUST** remain compatible with downstream tools such as Obsidian.

Implementations **MUST NOT** embed a web URL inside visible wikilink syntax.

### 12.3 Hyperlink placement
Where an export format supports hyperlinks, the actual URL **MUST** appear only in the designated hyperlink location for that format.

The URL **MUST NOT** appear:
- inside the visible reference,
- inside verse text,
- inside passage text,
- in plain text, CSV, or clipboard output.

---

## 13. Formatting Rules

### 13.1 Search match highlighting
Where the output format supports emphasis or rich text, search matches:

- **MUST** be limited to the exact matched substring,
- **MUST NOT** extend to surrounding unmatched text,
- **MUST NOT** include verse numbers unless the verse number itself was matched,
- **MUST** preserve exact match boundaries.

### 13.2 Bracketed text
Bracketed text:

- **MUST** be italicized where the output format supports italics,
- **MUST NOT** be superscripted,
- **MUST NOT** use vertical-align styling.

### 13.3 Verse numbers
Verse numbers:

- **MUST** remain plain baseline text,
- **MUST NOT** be superscripted,
- **MUST NOT** use vertical-align styling,
- **MUST NOT** inherit bracket formatting,
- **MUST NOT** be included in search highlighting unless explicitly matched.

### 13.4 Combined formatting precedence
If a substring is both bracketed and matched by the search query:

- the substring **SHOULD** preserve both semantics where the export format supports both,
- bracket semantics **SHOULD** be represented by italics,
- match semantics **SHOULD** be represented by bold or underline,
- superscript **MUST NOT** be introduced.

If a target format cannot represent both simultaneously, match highlighting **MUST** take precedence over decorative formatting.

---

## 14. Granularity and Inline Verse Number Behavior

### 14.1 Granularity control
`granularity` **MUST** control whether the application is operating in verse-result mode or passage-result mode for search results.

### 14.2 Passage-only inline verse number control
The `showInlineVerseNumbers` control **MUST** be available only in passage-mode reading presentation.

If `granularity !== 'Passage'`:
- the inline verse number control row **MUST** be hidden,
- the inline verse number toggle **MUST** be reset to unchecked.

### 14.3 Passage rendering behavior
In passage-mode reading presentation:

- if inline verse numbers are enabled in “new line” mode, each verse block **MUST** render on its own line,
- if inline verse numbers are disabled, verses **MAY** render inline within the paragraph flow,
- verse numbers **MUST** remain interactive focus targets where implemented.

### 14.4 Re-rendering
A change to `granularity` **MUST** update dependent UI controls and **MUST** re-render the current results if data is already loaded.

---

## 15. Reference Style and Reference Position Controls

### 15.1 Reference style
`reference_style` **MUST** affect search-mode visible references and any derived copy/export output for search-mode items.

`reference_style` **MUST NOT** alter reading-mode verse-number presentation.

### 15.2 Reference position
`reference_position` **MUST** control whether the visible reference appears before or after the result text in outputs where reference placement is part of the format contract.

If a given export schema uses dedicated columns instead of inline placement, the schema contract **MUST** take precedence.

---

## 16. Reading View Navigation and URL Behavior

### 16.1 Reading payload
Reading mode **MUST** render from `reading_items`, not from normal search result `items`.

### 16.2 Chapter grouping
Reading mode **MUST** group content by chapter and **SHOULD** render chapter headings when chapter boundaries are crossed.

### 16.3 Verse focus behavior
Where verse focus is supported:
- verse numbers **MUST** be keyboard-focusable,
- clicking or activating a verse number **MUST** update the reading focus state,
- the focused verse **SHOULD** be scrolled into view,
- the focused verse **SHOULD** receive a visible focus/highlight treatment.

### 16.4 URL synchronization
Reading focus state **SHOULD** be reflected in the URL using explicit query parameters such as:
- `q`
- `granularity`
- `newLineVerse`
- `focus`

If these parameters are present at load time, the application **MUST** restore the corresponding reading state as closely as possible.

### 16.5 Query normalization
If a reading-mode URL contains a verse-level focus within a chapter-oriented reading flow, the application **SHOULD** normalize the query to the chapter-level reference while preserving the verse-level focus target.

### 16.6 Reference URL behavior
Result references that open a reading view **SHOULD** generate URLs that:
- point to the reading interface,
- preserve the chapter query,
- preserve the verse focus where applicable.

---

## 17. Reading Auto-Load Behavior

### 17.1 Boundary-triggered chapter loading
In reading mode, the application **MAY** auto-load previous or next chapters when the user reaches the top or bottom boundary and the corresponding navigation reference exists.

### 17.2 Debounce and cooldown
Auto-load behavior **MUST** include debounce and cooldown protection to prevent repeated accidental loads from:
- wheel input,
- keyboard input,
- scroll boundary oscillation.

### 17.3 Directional locking
The application **SHOULD** use directional load locks so that one boundary does not repeatedly trigger duplicate loads while the user remains at that boundary.

### 17.4 Input parity
If auto-load is supported, behavior **SHOULD** be reasonably consistent across:
- scroll,
- wheel,
- keyboard navigation.

### 17.5 User feedback
When a chapter is auto-loaded, the application **SHOULD** provide visible feedback, such as a toast or status message indicating which chapter was loaded.

---

## 18. Copy and Export Consistency

### 18.1 Current-view rule
All copy and export operations **MUST** derive from the currently visible rendered view.

Implementations **MUST NOT** use:
- stale precomputed output,
- hidden alternate view data,
- formatting from a previously active mode.

### 18.2 Search-mode consistency
In search mode:

- copied and exported references **MUST** match the browser-visible reference format exactly,
- verse-mode output **MUST** use verse references,
- passage-mode output **MUST** use passage-range references,
- text layout **MUST** reflect the active granularity.

### 18.3 Reading-mode consistency
In reading mode:

- copied and exported output **MUST** preserve reading-view formatting,
- reading mode **MUST NOT** leak search-mode full-reference formatting,
- verse markers **MUST** remain reading-style verse numbers.

### 18.4 Copy scope
The copy action **MUST** copy the current visible view representation, not a hidden raw payload.

### 18.5 Export scope
The export action **MUST** export the currently loaded result items for the active result set.

If no exportable items exist, the application **MUST** show a user-visible error/status message and **MUST NOT** produce an empty file silently.

### 18.6 Reading-mode export behavior
If the product supports reading-mode export in the future, that behavior **MUST** be explicitly specified.

Until then, implementations **MUST NOT** silently treat reading-mode content as equivalent to normal search result items unless the payload contract guarantees equivalence.

---

## 19. Export Rules by Output Type

### 19.1 Plain text export
Plain text export:

- **MUST** include the visible reference in the active browser format,
- **MUST NOT** include the URL,
- **MUST NOT** include hyperlink metadata.

### 19.2 CSV export
CSV export:

- **MUST** include the visible reference in the active browser format,
- **MUST NOT** include embedded hyperlinks,
- **MUST NOT** include the URL unless a future schema explicitly defines a dedicated URL column.

If a URL column is added in the future, it **MUST** be a separate field and **MUST NOT** alter the visible reference field.

### 19.3 Clipboard copy
Clipboard output:

- **MUST** derive from the current visible view,
- **MUST** preserve the visible reference format shown in the browser,
- **MUST NOT** include the URL,
- **MUST NOT** include hyperlink target metadata.

### 19.4 Markdown export
Markdown export:

- **MUST** preserve the visible reference as plain text,
- **MUST** preserve search-mode formatting as shown in the browser,
- **MUST** preserve reading-mode distinction,
- **MUST** append a trailing hyperlink formatted as `[Web](URL)` when hyperlink export is enabled for that item.

Markdown export **MUST NOT**:
- convert the visible reference itself into a clickable URL,
- embed the URL inside wikilink syntax,
- collapse reading mode into search-mode full-reference formatting.

### 19.5 Word (DOCX) export
Word export:

- **MUST** show the full browser-visible reference in search mode,
- **MUST** preserve reading-mode formatting distinctly,
- **MUST** include a trailing `Web` hyperlink containing the actual URL,
- **MUST** keep visible reference text separate from hyperlink target text.

### 19.6 Excel export
Excel export **MUST** use the following column contract unless a versioned schema explicitly replaces it:

- **Column 1:** visible reference text
- **Column 2:** `Web` hyperlink
- **Column 3:** verse or passage text in rich text form

Excel export **MUST**:
- place the browser-visible reference in Column 1,
- place the actual hyperlink only in Column 2,
- preserve exact formatting constraints for rich text,
- avoid superscript and vertical-align formatting entirely.

---

## 20. Format-Specific Rich Text Constraints

### 20.1 Excel rich text constraints
In Excel rich text:

- bold **MUST** be limited to the exact match span only,
- italics **MUST** be used only for bracketed text,
- superscript **MUST NOT** be used,
- vertical-align styling **MUST NOT** be used,
- formatting **MUST NOT** visually extend beyond the intended character range.

### 20.2 Word formatting constraints
In Word:

- search hit emphasis **MAY** use bold, underline, or both,
- emphasis **MUST** remain limited to the exact matched text,
- bracketed text **MUST** use italics only,
- verse numbers **MUST** remain plain baseline text.

---

## 21. Status and Loading Behavior

### 21.1 Status messaging
The application **MUST** provide user-visible status feedback for:
- ready state,
- search in progress,
- reference search in progress,
- copy success/failure,
- export success/failure,
- chapter auto-load success/failure,
- no results found.

### 21.2 Status lifecycle
Transient status messages **SHOULD** auto-dismiss after a reasonable timeout.  
Error styling **MUST** be visually distinct from non-error status messaging.

### 21.3 Loading lock
During an active search request:
- search controls **MUST** be disabled as needed to prevent duplicate requests,
- the input field **MUST** be disabled if that is the chosen concurrency model.

Once the request completes, controls **MUST** be restored.

---

## 22. Theme Behavior

### 22.1 Persistence
Theme selection **MUST** persist across sessions using local storage or an equivalent client-side persistence mechanism.

### 22.2 Toggle behavior
The theme toggle **MUST**:
- update the active theme,
- update its accessibility state,
- update its visible label to reflect the next available action.

### 22.3 Scope
Theme changes **MUST** affect presentation only.  
Theme changes **MUST NOT** alter search payloads, result content, copy content, or export content.

---

## 23. Responsive and Accordion Behavior

### 23.1 Mobile accordion behavior
On mobile-sized interfaces, accordion panels **SHOULD** default to collapsed unless the user has explicitly expanded them.

### 23.2 Desktop behavior
On larger interfaces, accordion panels **SHOULD** default to expanded.

### 23.3 User intent preservation
If a user explicitly expands or collapses an accordion panel, that user intent **SHOULD** be preserved within the current interaction state unless a mode transition explicitly resets it.

### 23.4 Resize behavior
When transitioning from mobile to desktop:
- collapsed accordion panels **SHOULD** be expanded automatically.

When transitioning from desktop to mobile:
- accordion state **SHOULD** be reconciled through the responsive accordion sync logic rather than arbitrarily reset.

### 23.5 Semantic stability
Responsive layout changes **MUST NOT** alter the semantic content of results; they may alter only presentation and panel visibility.

---

## 24. Search Reliability Requirements

### 24.1 Apostrophe handling
Queries containing apostrophes, including examples such as `Peter's`, **MUST** still return expected literal matches.

### 24.2 Fallback behavior
If the primary FTS path cannot safely or correctly handle an apostrophe-containing query, the system **MUST** fall back to a literal-safe search path.

### 24.3 Behavioral requirement
This requirement is behavioral rather than implementation-specific.

The system **MUST** ensure that:
- apostrophe-containing queries do not silently fail,
- apostrophe-containing queries do not degrade into avoidable false negatives,
- users receive expected matches even when the primary index path is unsuitable.

---

## 25. Cross-Interface Consistency Rules

The following consistency rules are mandatory across browser UI, copy, export, and URL-restored sessions:

1. The same active control state **MUST** produce the same visible formatting for the same result data.
2. Search-mode controls **MUST NOT** silently alter reading-mode verse-number presentation.
3. Reading-mode controls **MUST NOT** silently rewrite search-mode export schemas.
4. Display-only toggles **MUST NOT** mutate the underlying result payload.
5. URL-restored state **MUST** produce materially equivalent rendering to interactively selected state.
6. Responsive layout changes **MUST NOT** alter semantic result content.

---

## 26. Engineering Principles

Implementations **MUST** follow these principles:

- **View fidelity:** exported and copied output must match the active browser view.
- **Mode separation:** search mode and reading mode are separate contracts.
- **Reference separation:** visible reference text and hyperlink target are separate data elements.
- **Minimal formatting:** formatting must be exact, scoped, and non-decorative.
- **Link hygiene:** URLs belong only in explicitly designated hyperlink locations.
- **State correctness:** formatters must use current active view state.
- **Behavior over mechanism:** correctness of search results is more important than which internal search path is used.

---

## 27. Help Page Content Requirements

The application **MUST** provide a Help page that explains the core user-facing behaviors of search, reference lookup, context expansion, reading mode, and passage display controls.

### 27.1 Help page purpose
The Help page **MUST** describe user-visible behavior only.  
It **MUST NOT** expose implementation details such as FTS, SQLite fallback internals, or internal rendering helpers.

### 27.2 Required Help topics
The Help page **MUST** explain the following behaviors:

1. **Text search behavior**
   - Users can search by word or phrase.
   - Search modes such as `All Words`, `Any Word`, and `Phrase` affect matching behavior.

2. **Reference fallback behavior**
   - If a text search returns no results, the application **MAY** attempt a reference lookup fallback.
   - This fallback behavior **MUST** be described in user-facing terms.

3. **Context window behavior**
   - The Help page **MUST** explain that the context window controls how many surrounding verses are included around a match.
   - It **SHOULD** explain that overlapping contextual ranges may be merged into a continuous result.

4. **Passage grouping behavior**
   - The Help page **SHOULD** explain that nearby or consecutive verses may be grouped in passage mode.

5. **Reading mode behavior**
   - The Help page **MUST** explain that chapter or passage references may open in reading mode.
   - It **MUST** explain that reading mode is intended for contextual browsing rather than search-result listing.

6. **Reading auto-load behavior**
   - The Help page **SHOULD** explain that reaching the top or bottom of reading mode may load the previous or next chapter automatically.

7. **Inline verse layout control**
   - The Help page **MUST** explain the passage-layout toggle that switches between paragraph-style display and one-verse-per-line display.

### 27.3 Help-page accuracy requirement
Help-page text **MUST** match actual implemented behavior.

If product behavior changes, the Help page **MUST** be updated in the same change set or release cycle.

### 27.4 Terminology consistency
The Help page **SHOULD** use the same user-facing labels as the UI wherever possible.

If the UI label changes, the Help page **SHOULD** be updated to match.

---

## 28. File Ownership and Responsibility Map

This section defines which file owns which behavior so implementation work remains consistent and maintainable.

### 28.1 `templates/index.html`
`templates/index.html` **MUST** own:

- page structure and semantic layout,
- control markup,
- control labels,
- accessibility attributes present in static markup,
- top-level regions such as:
  - search form,
  - search options,
  - display options,
  - export controls,
  - status region,
  - results region.

`templates/index.html` **MUST NOT** own:

- search logic,
- result rendering logic,
- reading auto-load logic,
- export generation logic,
- backend query behavior.

### 28.2 `templates/help.html`
`templates/help.html` **MUST** own:

- user-facing help content,
- explanation of supported search behaviors,
- explanation of reading mode behavior,
- explanation of context window behavior,
- explanation of fallback behavior in user-friendly language,
- explanation of passage display controls.

`templates/help.html` **MUST NOT** own:

- implementation logic,
- state restoration logic,
- backend behavior,
- export formatting logic.

### 28.3 `static/styles.css`
`static/styles.css` **MUST** own:

- visual presentation,
- responsive layout rules,
- theme-specific styling,
- typography,
- spacing,
- button styling,
- accordion visual behavior,
- reading-view visual treatment,
- highlight styling,
- red-letter styling,
- focus styling,
- status/toast styling.

`static/styles.css` **MUST NOT** own:

- business logic,
- search behavior,
- URL state behavior,
- export behavior,
- backend formatting rules.

### 28.4 `static/app.js`
`static/app.js` **MUST** own:

- DOM event wiring,
- reading current control state from the UI,
- building search request payloads,
- client-side rendering of search results,
- client-side rendering of reading view,
- display-only re-render behavior,
- copy-to-clipboard behavior,
- export request initiation,
- theme persistence in local storage,
- responsive accordion synchronization,
- URL-driven reading-state restoration,
- verse focus behavior,
- reading auto-load behavior,
- status messaging,
- loading-state UI behavior.

`static/app.js` **MUST NOT** own:

- SQL query behavior,
- canonical backend search matching logic,
- export file generation,
- reference parsing as the authoritative backend source of truth,
- database access.

### 28.5 Backend application file
The backend application file (currently the FastAPI app module) **MUST** own:

- API routes,
- request validation,
- reference parsing,
- text search behavior,
- reference lookup behavior,
- extracted-reference behavior,
- FTS eligibility rules,
- SQLite fallback behavior,
- context-window expansion logic,
- normalization of rows,
- construction of `items`,
- construction of `reading_items`,
- wildcard summary generation,
- export file generation for TXT / MD / CSV / DOCX / XLSX,
- hyperlink construction for exports,
- help-page route delivery,
- home-page route delivery.

The backend application file **MUST NOT** own:

- browser-only UI state,
- DOM manipulation,
- accordion state,
- local storage theme state,
- client-side focus styling.

---

## 29. Behavior Ownership by Concern

### 29.1 Search behavior ownership
- **Frontend (`static/app.js`)** owns request initiation and control-state capture.
- **Backend** owns actual search interpretation and result generation.

### 29.2 Reference parsing ownership
- **Backend** is the authoritative source of truth for reference parsing.
- Frontend reference detection **MAY** be used only for routing convenience and initial intent selection.

### 29.3 Reading mode ownership
- **Backend** owns the `reading_items` payload structure.
- **Frontend** owns rendering, scrolling, focus, and auto-load behavior for reading mode.

### 29.4 Export ownership
- **Frontend** owns export format selection and download initiation.
- **Backend** owns actual file content generation and export formatting rules.

### 29.5 Copy behavior ownership
- **Frontend** owns copy generation from the current visible view unless a future version moves copy generation server-side.

### 29.6 Help content ownership
- **Help template** owns explanatory copy.
- **Specification** owns normative behavior.
- **Implementation files** must remain consistent with both.

---

## 30. Change Management Rule

Any change affecting one of the following **MUST** be reviewed for corresponding updates in all relevant owned files:

- search behavior,
- reading mode behavior,
- context window behavior,
- export behavior,
- control labels,
- Help page wording,
- URL-restoration behavior.

At minimum, a change owner **MUST** check whether updates are needed in:

- `templates/index.html`
- `templates/help.html`
- `static/app.js`
- `static/styles.css`
- backend application module
- specification document

---

## 31. Acceptance Criteria

A change **MUST NOT** be considered complete unless all of the following are true.

### 31.1 Mode and reference correctness
- In search mode, references match the browser-visible selected format exactly.
- In reading mode, verse markers remain verse-number-only.
- Passage-mode outputs use passage references rather than verse-only references.
- `reference_position` is honored wherever reference placement applies.

### 31.2 Link correctness
- Word, Excel, and Markdown exports include the URL only in the designated `Web` hyperlink location.
- Visible references never contain embedded HTTP or HTTPS URLs.
- Plain text, CSV, and clipboard outputs remain link-free.

### 31.3 Formatting correctness
- Exact highlight spans are preserved.
- No extra surrounding text is bolded or underlined.
- Bracketed text is italicized only.
- Bracketed text is never superscripted.
- Verse numbers remain plain baseline text.
- Excel does not apply superscript or vertical-align formatting anywhere in exported result text.

### 31.4 View consistency
- Copy and export output is generated from the current visible view.
- Search-mode output matches search-mode browser display.
- Reading-mode output matches reading-mode browser display.

### 31.5 Search correctness
- Apostrophe-containing searches return expected results.
- Fallback behavior prevents apostrophe-related false negatives.

### 31.6 Control correctness
- Query-affecting controls are read from current UI state at request time.
- Display-only controls re-render current results without mutating the underlying result payload.
- `context_window` is applied only to search-result generation unless explicitly redefined.
- Passage-only inline verse number controls are hidden and reset outside passage mode.

### 31.7 Interface correctness
- URL-restored state reproduces the intended reading/search state.
- Responsive accordion behavior follows mobile/desktop rules.
- Theme changes do not alter content or export semantics.
- Reading auto-load behavior does not trigger repeated duplicate loads at boundaries.

### 31.8 Help and ownership correctness
- Help-page text matches actual implemented behavior.
- Help-page terminology matches current UI labels where practical.
- File ownership boundaries are respected.
- Changes to owned behavior are reflected in the correct file(s).

---

## 32. Recommended Implementation Additions

The following additions are recommended to reduce ambiguity.

### 32.1 Export matrix
The team **SHOULD** maintain a single export matrix in code or documentation:

| Output Type | Visible Reference | URL Included | URL Placement | Rich Text |
|---|---|---:|---|---|
| Plain Text | Yes | No | N/A | No / minimal |
| CSV | Yes | No | N/A | No |
| Clipboard | Yes | No | N/A | App-defined |
| Markdown | Yes | Yes | Trailing `[Web](URL)` | Markdown emphasis |
| Word | Yes | Yes | Trailing `Web` hyperlink | Yes |
| Excel | Yes | Yes | Dedicated `Web` column | Yes, constrained |

### 32.2 Canonical passage formatting
The team **SHOULD** define one canonical syntax for:
- same-chapter ranges,
- cross-chapter ranges,
- single-verse passages.

Once approved, that syntax **MUST** be reused everywhere.

### 32.3 Active-view contract
The codebase **SHOULD** define a single helper or view model that resolves:
- active mode,
- active granularity,
- active reference style,
- active reference position,
- whether `reading_items` is active.

All formatters **SHOULD** consume that resolved state rather than recomputing it independently.

### 32.4 Control classification table
The codebase **SHOULD** maintain a control classification table identifying:
- request-affecting controls,
- render-only controls,
- export-only controls,
- responsive-layout controls.

This reduces drift between UI behavior and backend payload behavior.

---

If you want, I can next turn this into a **local-agent implementation checklist by file**, with exact tasks under each file name.