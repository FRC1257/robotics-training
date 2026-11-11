# Claude UI review and implementation, round 2

Claude made these changes directly in the shared checkout using only Read/Glob/Grep/Edit/Write. **Nothing has been built, tested, or rendered.** No shell, browser, or git commands were run. Everything below about the new UI comes from reading source; the only visual evidence is from screenshots of the *previous* UI.

## Evidence used

**Screenshots actually viewed (previous UI):**
- User screenshot of `java/1-Basics/2-Variables.html` (production, light). Problems: `[!NOTE]` showed as literal text inside a plain blockquote; a full-width "Mark lesson complete" text button; "1 lessons completed" (plural bug); "Manage progress" on every lesson; a large green "Keep learning" box.
- CI `lesson-dark.png`, desktop and mobile (`guides/start-here`). The dark theme was green-tinted (`#111e1a` page, `#233e30` boxes). The completed button was a large green pill and the Keep-learning box was a green slab. A tooltip stayed visible after clicking.
- CI `pid.png` (desktop) and `swerve.png` (mobile). Labs had their own navy/blue style with no dark theme. The course toolbar was a plain text row with "Lesson marked complete." printed inline. A "Keep learning" card was appended to the bottom of the lab page.
- CI `knowledge-check.png` (desktop): the "0 lessons completed" plural bug again, and the same footer pattern.

**Source-only audit (not seen rendered):** Java variables/arrays/programs pages, FRC sensors/control/autonomous lessons, guides (paths, quiz, lab tour), robot walkthroughs, all seven lab HTML files, navigation, and the 404 page.

## Critique (before this round)

1. **Callouts.** 31 GitHub-style `> [!NOTE|TIP|WARNING|ATTENTION]` markers in 20 files rendered as raw text (seen in the screenshot). The 41 "Historical lesson" banners were plain blockquotes styled like a callout, so real callouts had no visual priority.
2. **Completion.** A text button at the bottom of the page had its `textContent` rewritten, and the state was shown mainly through button colour. Progress tools were repeated on every lesson. "Keep learning" was oversized and also leaked onto lab pages.
3. **Dark theme.** It was a green-on-green palette, not neutral. Code blocks, tables and the quiz all used the green tint. Labs had no dark mode.
4. **Search.** A modal with a heading, a plain input and a "Limit results to" select. No icon in the field, no empty state, no clear button, no loading/error distinction, results without context, no highlighting, and ArrowDown moved focus into the links (no active-descendant pattern). Escape did not explicitly restore focus to the opener.
5. **Labs.** Labs only existed as separate pages (students left the lesson), had different typography and colours, and had a global `svg{width:100%}` rule that would break any icon added to the lab page.
6. **404.** Unstyled page with no header and an unlabelled search dialog. **Tables:** acceptable. **Code:** acceptable, but sideways-scrolling `pre` and `table` elements were not keyboard focusable.

## What changed

### Files
- `scripts/build-site.mjs`: callouts, lab markers and embeds, lesson meta row, footer progress, command-palette markup, site footer, 404, lab decoration, provenance, `assets/lesson-titles.json`.
- `platform/site.mjs`: rewritten for completion/auto-complete, toggles, toast/live region, theme, and embed messaging. Drawer, legacy redirects and the quiz are unchanged.
- `platform/search-ui.mjs` (new): palette behavior. Ranking still comes from `search.mjs`, which is untouched.
- `platform/site.css`: rewritten (tokens, dark theme, callouts, palette, completion icon, lab embed, 404).
- `platform/content-provenance.json` (new).
- `docs/labs/labs.css`: rewritten (tokens, dark theme, scoped figures, course bar, embed mode).
- `docs/guides/about-this-course.md` (new): how progress works, AI-assisted lessons, how media is credited.
- Lab markers only, one line each:
  - `frc/3-Closed_Loop_Control/2-Basics_of_PID.md` (`pid`, after the exercise)
  - `frc/1-Basics/Modern_Drivetrain_Project.md` (`swerve` after "Coordinates and module motion", `odometry` after "Odometry and vision")
  - `frc/1-Basics/5c-Making_Commands.md` (`scheduler`)
  - `frc/2-Sensors_And_Shuffleboard/3-Encoders.md` (`encoder`, after NEO scaling)
  - `frc/3-Closed_Loop_Control/5-Motion_Profiling.md` (`motion`, after the triangular-profile paragraph)
  - `robots/2024-log.md` (`log`, after the guided investigation)
- `docs/labs/*.html`: **not modified.** All lab layout changes are in `labs.css` and the build-time decoration.

### Choices and hooks

**Callouts.** In the rendered DOM, a `blockquote` whose first `<p>` starts with `[!TYPE]` becomes `<div class="callout callout-{type}" role="note">` with a title row showing an icon and a label. The supported types are note, tip, important, warning and caution. These aliases also work: attention→warning, danger→caution, info→note, hint→tip. Blockquotes that start with `**Historical lesson:**` become `callout-history`. Unknown types stay as blockquotes.

**Completion.**
- `#complete-lesson` is now an icon toggle in `.lesson-meta`, directly under the H1. The icon is an SVG ring that fills, plus a check that draws. It has `aria-pressed`, a fixed `aria-label` ("Lesson complete"), a `data-tip` tooltip, and an adjacent `aria-hidden` status text.
- JS only changes attributes and the status span, never the button's content.
- Animation: `.just-completed` adds a pop, the check draw and a ring pulse. All of it is disabled under reduced motion.
- `.completion` stays `visibility:hidden` until JS paints the state, so the wrong state never flashes.
- **Auto-complete:** opening a lesson with `data-auto="visit"` adds `{id: now}` only when the id is absent, so the first timestamp is never overwritten. It is skipped when:
  - storage is unreadable or corrupt (avoids overwriting bad data),
  - the page is an index/hub page (no toggle is rendered),
  - the page is the knowledge checks (manual),
  - the page is a lab inside an iframe,
  - the reader has explicitly un-marked the lesson. Un-marking stores the id in `localStorage["frc1257-auto-skip-v1"]` so it is not re-marked on the next visit; Reset clears this list.
- Full lab pages auto-complete on visit. Embedded labs only complete through their own `.lab-complete` toggle in the lesson.
- Export/import/reset are unchanged in format (still version 1).

**Footer and next step.**
- The Keep-learning box is gone.
- Lessons now get `.lesson-progress` in the lesson footer: a compact `#next-activity` line ("Up next · *title* → · path name", with titles from `assets/lesson-titles.json`), `#progress-summary` (plural bug fixed), a closed `details.progress-tools`, and the caveat that a visit is not understanding.
- The paths hub keeps the open tools. The home page has no tools, only a site-footer link to the hub.
- IDs stay unique on every page.

**Dark theme.** Near-black `#0b0a0e`/`#131118` with lavender accent `#b6a4ea`. All colours are tokens, including the callout colours (`--c-*`) and syntax colours (`--tok-*`). Light mode keeps team green `#09684e`. Lab pages share the same tokens.

**Search palette.**
- The input has a search icon and is a `role="combobox"` with `aria-activedescendant` pointing into `ul#search-results[role=listbox]`; each item is an `li[role=option]` containing an `<a tabindex=-1>`.
- Arrow keys move through results, Enter opens the active one (Ctrl/⌘+Enter opens a new tab), and Escape closes and restores focus to the opener. Ctrl/⌘K and `/` open it.
- Clear button `#search-clear`; section select `#search-section` (`aria-label="Search section"`, with options built from the sections that exist).
- Empty state: suggested-search chips and Browse links. Loading: spinner plus `aria-busy`. Error: `#search-retry`. No results: `#search-widen` if a section filter is active.
- Each result shows a breadcrumb, the title and a snippet. Highlighting creates text nodes plus `<mark>`, never HTML. It covers stems, prefixes and words one typo away; synonyms are not highlighted.
- The index is fetched on hover/focus of the search button. Searches stay local.

**Lab embeds.**
- `<!-- lab: NAME -->` must name one of the 7 allowlisted labs; any other name stops the build with a clear error.
- The embed is `section.lab-embed#lab-embed-NAME`. Its header has the title, summary, kicker (with "AI-assisted teaching model" when listed), an explicit completion toggle, and an "Open full lab" link. Below it is `<iframe src="{base}labs/NAME.html?embed=1" loading=lazy>`.
- The lab's head script sets `data-embed="1"` only when `?embed=1` is present **and** the parent is the same origin. It also takes the parent's theme before first paint.
- In embed mode, `labs.css` hides the lab banner and course bar.
- The lab sends `{source:"frc1257-lab", type:"height"|"ready"}` to the parent with targetOrigin `location.origin`. The parent accepts these only when `event.origin === location.origin` and `event.source` is one of its lab iframes' `contentWindow`. It sets the iframe height (clamped to 160–12000 px) so the frame never scrolls internally.
- The parent sends `{source:"frc1257-site", type:"theme"}` on load and on every theme toggle. The child accepts it only from `window.parent` on the same origin.
- Links inside an embedded lab get `target="_top"`.
- Standalone lab URLs, IDs and models are unchanged.

**Provenance.**
- `<!-- ai-assisted -->` in a page, or an entry in `platform/content-provenance.json` (`lessons`, `labs`), adds a small `.provenance-badge` link in the meta row. It links to `guides/about-this-course.html#ai-assisted-lessons`.
- It is separate from images and captions; the about page states that media is credited to its real sources.
- The JSON list was **inferred from content conventions and CHANGELOG**, not from git history, and it excludes historical lessons. Please verify it with `git log --diff-filter=A --name-only`.

**Other.**
- The 404 page uses the full header, palette and footer.
- `h2`/`h3` get a hover-only `#` anchor (`aria-hidden`, `tabindex=-1`). There is a `:target` flash and `scroll-margin` below the sticky header.
- `pre`/`table` elements that overflow sideways get `tabindex=0`.
- `#site-status` is visually hidden; a `.toast` shows visible messages such as import, export, reset and storage errors.

## Tests that will fail by design (root to update)

1. `tests/browser/learning.spec.mjs:61-65`. Start-here is now auto-completed on load, so clicking `#complete-lesson` un-marks it. Suggested:
   - expect `aria-pressed="true"` right after `goto`;
   - click and expect `"false"`;
   - reload and expect `"false"` (the skip list is respected);
   - click and expect `"true"`.
2. `tests/browser/learning.spec.mjs:182-186`. A full lab page now auto-completes on visit. Assert `"true"` after `goto` instead of clicking first. Alternatively, click twice and assert `"true"`.

Everything else in `build-site.test.mjs` and the browser spec should still pass according to the source. That includes `header a` on labs, the `PID lab` link, `#progress-import` on the hub but not on home, the internal link checker (iframe `?embed=1` src, about page), `getByLabel("Search section")`, `#search-close`, `.progress-tools summary`, and `#site-status` text. This has not been run.

## Follow-ups and risks

- **Plot colours in dark mode.** The lab scripts (`*.mjs`) hard-code dark strokes and white SVG rectangles, so figures intentionally stay light-backgrounded in dark mode. A proper fix means reading CSS variables in the lab `.mjs` files, which are outside my allowed files.
- **Two embeds in one lesson.** `Modern_Drivetrain_Project.md` now has two lazy embeds (swerve and odometry). If that feels heavy, move `odometry` to `vision/PhotonVision/Code.md` after "Worked timestamp and frame trace", which fits equally well.
- **About page not in navigation.** `guides/about-this-course.md` is not in `_sidebar.md` or the catalog, which I was not allowed to edit. Suggest adding it under Guides.
- **CSP.** If a Content Security Policy is added, the inline lab boot script and the theme boot script will need hashes.
- **Synonym highlighting.** `search.mjs` does not export its synonym groups, so results matched only through a synonym are not highlighted.
- **Visual checks for the root agent:**
  - palette on a 390px viewport;
  - lab embed heights after the PID animation runs;
  - the tooltip at the left edge in the meta row (`.tip-start`);
  - a toolbar wrap on lab pages at 360px when the provenance badge is present;
  - `color-mix()` fallback in older Safari (falls back to a plain surface).

## Follow-up: four fixes from the root audit

Claude made these with Read/Glob/Grep/Edit/Write only. **Nothing in this follow-up has been built, tested or rendered by Claude**; the root agent reported that the first pass builds and its Node tests pass, but that predates these edits. Files changed: `scripts/build-site.mjs`, `platform/search-ui.mjs`, `docs/guides/about-this-course.md`, and this file. `platform/site.mjs` and `platform/site.css` needed no change.

1. **Exactly one H1 per article** (`ensureSingleH1`, `inferredTitle` in the builder). This runs on the rendered DOM after callouts and before heading ids, so `#` lines and `<h1>` text inside code fences never count.
   - The author's first H1 is kept as written.
   - Every later H1 becomes an `h2` with the same attributes and inner HTML. It then gets a unique id, a TOC entry and a hover anchor like any H2. This affects the website `Site_Layout` and `Annual_Updates` pages.
   - A page with no H1 (the code-only `java/**/programs/*.md`) gets one prepended. Its text is the page's first sidebar label (for example "Print an Array"). If there is no label, it uses the file name, or the folder name for a README, with the number prefix and underscores removed.
   - The page `<title>`, `data-page-title`, `lesson-titles.json`, the search title and the iframe titles now all use this DOM title. The old regex `titleOf`, which could match a `# comment` inside a fence, is removed. On those code-only pages, the inferred H1 now starts the search text and the description.
   - `.lesson-meta` is always inserted directly after the one H1.
2. **Visiting completes every lesson, the knowledge checks included.** The per-page `completionCopy` exception (`auto: false`, "Checks reviewed") is gone. Every lesson toggle uses the same generic lesson copy with `data-auto="visit"`. These are unchanged:
   - index pages and the learning-paths hub stay exempt;
   - the manual un-mark and skip list still apply;
   - embedded lab toggles still have no `data-auto`, and `autoComplete()` still returns early inside an iframe, so opening an embed never completes a lab.

   The footer caveat now says a visit is "not understanding or a quiz score". The About page says the knowledge checks complete on visit and that answers and score are not saved. `practice.mjs` keeps the score in memory only.
3. **Programming by robot type.**
   - `robot-types` is in the builder's `SECTION_ORDER` (after Robot programming) and in `SECTION_LABELS` in `search-ui.mjs`. The section filter now offers it, and breadcrumbs read "Programming by robot type".
   - The palette's empty-state Browse list gains one short "Robot types" link to `robot-types/README.md`. The list grows to seven items, which can leave one orphan in the auto-fill grid. No suggested-search chip was added, to avoid clutter.
   - Navigation and catalog were not touched.
4. **Media wording on the About page.** The blanket "not AI-generated" sentence is replaced. The AI-assisted label now covers the writing and the original teaching code (text, examples, pseudocode, lab models, diagram-drawing code). Sourced photos, diagrams and screenshots carry their own caption credits and licenses and are never covered by the label. Original teaching diagrams and models are identified in captions as illustrations, with their simplifications and assumptions.

**For the root agent to verify:**
- Run the build and the new all-article-headings test.
- Check that the round-2 notes above saying "knowledge checks (manual)" are now superseded.
- Spot-check that `[...h.attributes]` iterates under linkedom. Markdown headings carry no attributes, so the loop is normally empty.

## Follow-up: final polish after the second browser run

Claude made these with Read/Glob/Grep/Edit/Write only. Claude did not run any build, test or browser for these edits. Claude did read the root's three dark-mode screenshots: the search palette on desktop and mobile, and the embedded PID lab.

**Browser run as reported by the root:** 62 of 64 Playwright checks passed. One test failed twice, once in the desktop project and once in the mobile project. In "search palette supports keyboard navigation and recovery", calling `input.press('Escape')` after typing a query with no matches left the dialog open. The cause is the native `<input type="search">`, which uses Escape to clear its own value. The keypress never reached the dialog's built-in cancel, so the dialog stayed open with an empty field. The test is correct and was not changed.

1. **Escape closes the palette from the input** (`platform/search-ui.mjs`). The input's `keydown` handler now treats Escape first, unless an IME composition is in progress. It calls `preventDefault()` and `stopPropagation()`, then `close()`. The existing `close` listener on the dialog sends focus back to whatever opened the palette. Arrow keys, Enter, Ctrl/Cmd+Enter, `/` and Ctrl/Cmd+K behave as before. If the user presses Escape on the section `<select>` or a button, the dialog's own cancel still handles it.
2. **Preset menus no longer clip** (`docs/labs/labs.css`). The PID preset showed "Gravity cc". The new rule `main label:has(> select)` puts the label text above a full-width menu. It outranks the 6rem/7rem number-field column at every width, including the mobile query. This is the only kind of select in the labs: the PID and swerve presets. Labels, ids and markup are unchanged.
3. **Live figures follow the theme.**
   - `labs.css` defines `--plot-*` tokens for light and dark: surface, frame, ink, muted, blue, orange, green, enabled band, robot body/line and red. The light values are the old hard-coded colors, so light mode looks the same. The dark values sit on a near-black figure (`#16141c`; the old value was `#e9e7f0`). They keep the meaning of each color: blue is position, truth or battery; orange is output, odometry or velocity; green is the corrected estimate or the enabled band. Each is lightened enough to read on the dark figure.
   - The new `docs/labs/plot-theme.mjs` has `plotColors()`, which reads the tokens with `getComputedStyle` at draw time, and `onThemeChange()`, a `MutationObserver` on `data-theme`. That attribute is set both by the lab's own toggle and by the parent lesson's `postMessage`.
   - `pid.mjs`: the canvas reads its colors on every render. When the theme changes it calls `render()`, which only repaints the current samples. The model is not reset and no run is started or stopped. The setpoint dash now has a fixed 1.5px width. Before, the dash took whatever width the previous stroke left behind.
   - `log.mjs`, `odometry.mjs` and `swerve.mjs`: SVG markup now uses classes (`plot-area`, `plot-band`, `plot-point`, `plot-line`, `plot-label`, `is-blue/orange/green`, `robot-body/module/center`) in place of `fill`/`stroke` color attributes. Untagged SVG text uses `--plot-ink`. These figures change color through CSS alone, with no redraw. Geometry, stroke widths, data handling and CSV parsing are unchanged.
   - `motion`, `encoder` and `scheduler` draw no figures, so they needed no change. `models.mjs`, the lab HTML and the photos were not touched. Nothing is inverted or filtered.

**For the root agent to verify:** rerun the two Escape cases and the dark screenshots. Check the PID plot after switching the theme mid-run: the curves should stay and the run state should be unchanged. `:has()` needs Safari 15.4+ or Chromium 105+. Older browsers keep the old two-column row.
