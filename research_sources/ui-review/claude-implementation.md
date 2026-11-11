# Claude UI implementation

Claude Code implemented these changes directly in the shared checkout after the user requested a review. Model reported: `claude-opus-5-5`. No denied tools. The implementation was then integrated and checked by the primary agent; CI evidence is recorded separately.

I've implemented the redesign across six files. Nothing has been run: no build, no tests, no browser checks. Three existing test assertions will fail by design, and the root agent will need to update them (details below).

## What changed

**Navigation**
- Removed the duplicate top nav.
- `docs/_sidebar.md` now runs Home → Start here → Java → FRC → Git/GitHub → Vision, then two groups, "Labs and real robots" and "Guides", then Documentation and Website. Plain-text lines like `* Guides` are group labels without a link.
- The foundations sub-pages and all seven labs now appear in the tree.
- The builder outputs real nested `<ul>`s. Each branch has a separate chevron button that toggles `aria-expanded`/`hidden`. The current page and its parent branches render open at build time.
- Prev/next links skip the group labels. Their order changes because they follow the new sidebar order.
- Without JavaScript: the two groups stay expanded, the dead buttons are hidden, and on mobile the tree shows in place instead of in a drawer.
- Page URLs and legacy routes are untouched, since both come from file paths.

**Header**
- 3.5rem tall, with icon-only search, theme and menu buttons at 40px. The search dialog's close button also uses an icon.
- The SVGs are read from `node_modules/lucide-static` at build time, so the markup is exact. The ISC license is copied to `assets/LICENSE-Lucide.txt`, and each page carries the `@license` notice.
- Tooltips appear on hover and keyboard focus after 300ms; accessible names come from `aria-label`.
- The theme label stays fixed as "Dark theme". `aria-pressed` carries the state and CSS swaps the moon/sun icons, so the markup survives toggling.
- A small inline script in `<head>` sets the theme before first paint, which should prevent the light flash.

**Home**
- No hero, no cards, no `foundations-system.svg`, no completion button.
- One H1 ("Team 1257 Robotics Training"), a short intro, the existing next-step table, a compact curriculum list, then the existing labs and team sections.
- A compact learning-paths list is inserted at `<!-- learning-paths -->`. It keeps the `data-path-id`/`data-path-lessons` hooks, so the links still jump to the next unfinished activity. Progress bars stay hidden until something is completed.
- Times show as "~4 h", and the repeated "Time is an approximate…" sentence is stripped from the path descriptions.

**Learning paths page**
- A builder-inserted "Paths at a glance" table (path, activities, time, progress).
- The only home for progress summary and export/import/reset.
- Section index pages and this page no longer get a completion button.

**Knowledge checks**
- The 12 reading-version questions are now collapsed `<details>` under one "Reading version" H2, with the question text preserved.
- The completion button reads "Mark checks reviewed". Lab pages keep "Mark lab complete", which `refreshProgress` used to overwrite.
- The "On this page" rail lists H2s only, clamps each link to two lines, and is left out on pages with more than 12 entries.

**Density and motion**
- Smaller heading sizes. On mobile, table cells drop the 7rem minimum width, which stops the clipped next-step table; wide tables get edge shadows showing they scroll.
- Short transitions: chevron rotation, branch reveal, drawer slide with scrim, a dialog fade with a plain `#0007` backdrop (no blur), and fades for quiz questions, answers, progress and the next-activity box. All of it is off under reduced motion.
- Mobile drawer: tapping the scrim, pressing Escape, or tapping a link closes it. Opening moves focus to the current link, page content is made inert while it's open, focus returns to the menu button on close, and it closes if the window widens to desktop.

Search, quiz mounting, next-activity suggestions, math/code rendering, page metadata and the no-analytics default are unchanged.

## Tests that will fail by design
- `tests/build-site.test.mjs:75` expects `#complete-lesson` on home, and `:91` expects `#progress-import` on home. I suggest moving the import check to `guides/learning-paths.html`. The `:86` progress-hook check should still pass.
- `tests/browser/learning.spec.mjs:16-19` expects the old hero H1 text and four `.path-card`s. The new values are "Team 1257 Robotics Training" and four `.path-list [data-path-id]` items.

## Remaining concerns
- `guides/learning-paths.md` and `catalog.json` still repeat the time-estimate sentence; I wasn't allowed to edit them.
- Lab pages and `404.html` keep their own standalone styling: no new header, and no dark theme on labs.
- The inline theme script would need a hash if a Content Security Policy is added later.
- `foundations/system.md` still references `foundations-system.svg`; the other agent is replacing that.

## Files changed
- `scripts/build-site.mjs`
- `platform/site.mjs`
- `platform/site.css`
- `docs/_sidebar.md`
- `docs/README.md`
- `docs/guides/knowledge-checks.md`

I didn't add `platform/icons.mjs`; the builder reads the icons directly.
