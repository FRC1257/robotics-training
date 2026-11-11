# Claude UI review

Requested by the user on November 10, 2026. Claude Code reviewed actual desktop/mobile CI screenshots and the UI source using read-only tools. The CLI reported model `claude-opus-5-5` and no denied tools.

The following is the review as returned. Its duplicate-H1 observation was checked against the current branch: the builder had already corrected that issue. Suggestions remain subject to implementation and browser verification.

I've finished reading the three screenshots and the five source files. I didn't edit anything or run any commands.

# The verdict

The content is solid, but the frame around it looks like a SaaS landing page placed on top of a handbook. On the home page, the first useful thing a student can act on (the "Choose your next step" table) starts about **1,100px down on desktop and about 2,600px down on mobile**. The structural problem is that the old Docsify tree is still there, but it's flattened, put in a new order, and repeated in a second nav bar.

## What the screenshots show

**Desktop home (1440px)**
- **Hero:** a 4.2rem headline ("Build the skills to build robots."), an uppercase letter-spaced eyebrow, a green CTA button, and a diagram shrunk so far its labels can't be read. This is the "AI landing page" look, and it adds nothing a student can use.
- **The page offers the same choices three times.** "Choose a learning path" (4 cards), then "Choose your next step" (table), then "Try a hands-on lab" (PID + swerve) followed by "Try an idea before wiring hardware" (the same PID + swerve links again).
- **Path cards look like an empty dashboard.** There are four grey "0 of N completed" bars. "Time is an approximate self-paced estimate." is repeated word for word in all four cards (it's in all four descriptions in `platform/catalog.json`). Times are shown as "240 minutes" and "330 minutes" instead of "~4 h".
- **Two navigation systems.** The top nav (Start Here, Foundations, Java, Robot Programming, Labs, Real Robots, Reference) uses different names from the sidebar for the same pages (Foundations vs. "Robot foundations", Robot Programming vs. "FRC" in `_sidebar.md`, Reference vs. "Resources").
- **The sidebar order buries the core curriculum.** Thirteen guide links (Start here … For mentors) come before **Java**, and FRC isn't visible in the first viewport at all. Every top-level item is bold with a top margin, so 13 guide pages look like 13 section headings. Java's tree is fully expanded, while the old Docsify sidebar showed one readable hierarchy.
- **The home page has "Mark lesson complete" / "0 lessons completed" / "Manage progress"**, which makes no sense there.
- **The header buttons are text** ("Search", "Dark theme"), and the header is 80px tall and sticky.

**Mobile home (390px)**
- The header crams the logo, "Search", "Dark theme" and "Menu" in at 0.72rem.
- **The hero diagram still shows at 390px** and can't be read. This is a bug: CSS hides `.hero figure`, but the build outputs `<img class="hero-illustration">`, so `.hero figure { display:none }` (site.css:766) and `max-width: 28rem` (site.css:677) never match anything.
- The four path cards stack to roughly 1,000px.
- **The "Choose your next step" table is cut off on the right.** The "Finish with" column is clipped mid-word ("investigatio…") and nothing shows that it scrolls. The cause is `th, td { min-width: 7rem }` together with `table { display:block; overflow:auto }`.

**Knowledge checks (desktop)**
- The interactive quiz card is good: clear choices, a sensible selected state, one action.
- Underneath it, the **same 12 questions are listed again as 1.65rem bold `##` headings** (knowledge-checks.md:7 onward), which makes the page 4,700px tall. The "On this page" rail repeats each full question as a 3–5 line link and runs off the bottom of the viewport.
- "Mark lesson complete" sits below a quiz that has its own idea of being finished.

## Root causes in the code

- `build-site.mjs:187-195`: the `top` array creates the duplicate nav.
- `build-site.mjs:214-216`: `sidebar()` outputs **one flat `<ul>`** with `nav-depth-N` classes. That removes the nesting, so collapsing is impossible and screen readers get a 150-item flat list.
- `build-site.mjs:231`: `homeHero()` outputs a second `<h1>`. The README's own `# Learn to program a robot` is only *visually* demoted by `.hero ~ article > h1:first-child`, so **the home page has two h1 elements**.
- `site.mjs:193-195`: the theme toggle's `textContent` is rewritten on every toggle. That would also delete any icon markup you add, and it moves the label from "Theme" to "Dark theme" after load. The theme is set from a deferred module, so dark-mode users see a **flash of the light theme**.
- `build-site.mjs:254`: `.lesson-actions` is output on every page, including README.md.
- Motion: there's very little, which is good. The only problems are `.path-card:hover { transform: translateY(-2px) }` and a dialog backdrop at 85% opacity with `blur(3px)`. The mobile drawer jumps between `display:none` and `block` with no backdrop, no focus handling, and doesn't close when you tap a link.

# Redesign: a modest engineering handbook

## P0: Navigation (closest to Docsify, and better)

**1. Delete the top nav.** Remove the `top` array and the `<nav class="top-nav">` markup, plus `.top-nav*` in the CSS. The sidebar becomes the only map.

**2. Reorder `docs/_sidebar.md` back to the old spine** and put the new material in two groups instead of 13 loose links:

```
* [Home](/)
* [Start here](guides/start-here.md)
* [Java](java/README.md)            ← existing subtree unchanged
* [FRC](frc/README.md)              ← existing subtree unchanged
* [Labs and real robots](labs/README.md)
  * [Robot foundations](foundations/README.md)
  * [Interactive labs](labs/README.md)   (or drop the duplicate)
  * [Real robot code and logs](robots/README.md) …children
* [Git / GitHub](git/README.md) …
* [Vision](vision/README.md) …
* [Documentation](documentation/README.md)
* [Website](website/README.md) …
* [Guides](guides/learning-paths.md)
  * Learning paths, Practice projects, Knowledge checks, Lab tour,
    Troubleshooting, Glossary, Resources, For mentors
```

This keeps every page URL the same. `hrefFor(source)` and `legacyRoutes(source)` depend on the file path, not the sidebar position, so old `#/…` deep links still redirect. The one side effect is that **prev/next links change**, because `build-site.mjs:277-279` takes them from the sidebar order. Reading straight through Java → FRC is what the old site did, so that's probably what you want. Check the "Guides" group's prev/next anyway.

**3. Output real nested lists with collapsible branches.** Change `sidebarEntries()` to build a tree from the `depth` values. Then render each branch like this:

```html
<li class="nav-branch">
  <div class="nav-row">
    <a href="…java/">Java</a>
    <button class="nav-twisty" aria-expanded="false" aria-controls="nav-java"
            aria-label="Expand Java"><svg aria-hidden="true">…chevron…</svg></button>
  </div>
  <ul id="nav-java" hidden>…</ul>
</li>
```

- At build time, leave `hidden` off the branch containing the current page and all its ancestors. That page is open with no JS and no layout shift.
- Use a separate button for the chevron rather than `<details><summary><a>`, because a link inside a summary is an interactive element nested in another.
- Add `<noscript><style>.nav-branch>ul[hidden]{display:block}</style></noscript>` so the "works without JS" promise still holds.
- In `site.mjs`, toggle `hidden` and `aria-expanded`. Optionally remember open branches in `localStorage` under a separate key from progress.
- After load, call `scrollIntoView({block:"nearest"})` on `.sidebar [aria-current]` so deep pages don't open with the current item out of view.

CSS:

```css
.sidebar > nav > ul > li > .nav-row a { font-weight: 600; color: var(--ink); }
.sidebar ul ul { padding-left: .75rem; border-left: 1px solid var(--line); margin-left: .65rem; }
.sidebar a[aria-current="page"] { box-shadow: inset 2px 0 var(--green); background: var(--green-soft); }
.nav-twisty { border: 0; background: none; width: 1.75rem; height: 1.75rem; padding: 0; }
.nav-twisty svg { transition: transform .12s; }
.nav-twisty[aria-expanded="true"] svg { transform: rotate(90deg); }
```

Delete the `.nav-depth-*` rules and `.sidebar .nav-depth-0 { margin-top }`. Indentation plus a guide line then show the hierarchy without making every page look like a heading.

## P0: Header with icon buttons

Change the header markup to: logo · spacer · search · theme · (menu, mobile only).

```html
<button id="search-open" class="icon-btn" type="button" aria-haspopup="dialog"
        aria-label="Search lessons" aria-keyshortcuts="Control+K Meta+K"
        data-tip="Search (Ctrl/⌘ K)"><svg aria-hidden="true" focusable="false">…</svg></button>
<button id="theme-toggle" class="icon-btn" type="button" aria-label="Dark theme"
        aria-pressed="false" data-tip="Dark theme"><svg class="i-moon">…</svg><svg class="i-sun">…</svg></button>
```

- **Theme toggle:** in `applyTheme()` (site.mjs:187-196), delete the `textContent` lines. Keep the label fixed as "Dark theme" and set `aria-pressed` to match the state. Show the right icon with CSS: `:root[data-theme=dark] .i-moon, :root:not([data-theme=dark]) .i-sun { display:none }`.
- **Prevent the light-theme flash:** add a tiny inline `<script>` in `<head>` that reads `frc1257-theme` / `prefers-color-scheme` and sets `data-theme` before first paint.
- **Tooltips:** use a CSS tooltip on `.icon-btn:hover::after, .icon-btn:focus-visible::after { content: attr(data-tip) }` with a ~300ms `transition-delay`. Don't use `title`: it doesn't appear on keyboard focus and shows twice next to the custom tooltip.
- **Size:** make `.icon-btn` 2.5rem square (40px; WCAG 2.2 requires at least 24px).
- **Header height:** add `--header-h: 3.5rem` and use it in `.site-header{min-height}`, `.sidebar{top;height}`, the mobile drawer `top`, and `html{scroll-padding-top}`. Right now 5rem / 5.1rem / 6rem are hard-coded in three places.

## P1: Home page

- **Remove `homeHero()`** and let `docs/README.md` be the page, with one h1. Either delete `.hero ~ article > h1:first-child` or make the README h1 plain: "Team 1257 Robotics Training".
- **Order:**
  1. Intro paragraph.
  2. The existing **"Choose your next step" table**. It's the best orientation piece on the site.
  3. A compact **Learning paths** table (path · activities · time · progress) output from the catalog, with "~4 h" formatting. Show the progress column only after `refreshProgress()` finds at least one completion. Otherwise it's four zero bars.
  4. The existing "Try an idea…" and "Learn from Team 1257" sections.
- **Delete `.featured-labs`**, since README already links both labs.
- **Remove the repeated sentence** from the four catalog descriptions. Say it once under the table heading.
- **Move the systems diagram** to `foundations/README.md`, where it's large enough to read. Or drop it from home.
- **Don't output `.lesson-actions` when `source === "README.md"`.** The landing page for each section probably shouldn't have it either. Put the progress summary and export/import/reset on the Learning paths page, so it has one home.
- `recommendNext()` (site.mjs:39-45) updates `.path-card[data-path-id]` links. Keep the same `data-path-id` / `data-path-lessons` attributes on the new table rows (`<tr>` plus an `<a>` in the first cell) and both features keep working.

## P1: Typography and density

- h1 `clamp(1.9rem, 2.6vw, 2.4rem)`, h2 `1.45rem` with `margin: 2.2rem 0 .8rem`, h3 `1.15rem`. Remove `letter-spacing: -.025em` from h2/h3.
- `.lesson { padding-top: 2rem }`. Keep `article { max-width: 76ch }`, body 16px / 1.65, and the sidebar at 0.84rem.
- **TOC rail:** output only h2 entries. Clamp each link to two lines (`display:-webkit-box; -webkit-line-clamp:2; overflow:hidden`). Leave out the rail if a page has more than about 12 entries.
- **Knowledge checks page:** the reading-version questions should be visually smaller and stop flooding the TOC. With the CSS-only fix below, no markdown changes:

```css
body[data-page-id="guides/knowledge-checks.md"] article > h2 { font-size: 1.05rem; margin-top: 1.6rem; }
```

  The cleaner fix is wrapping the list under one `## Reading version` with `###` questions. That changes a content file, so ask the content owner first.

## P1: Motion

Keep it to state changes only:
- Chevron rotation and drawer slide-in, 120–160ms.
- Dialog fade, 120ms (`dialog[open]{animation: fade .12s}`).
- Remove the card `translateY`.
- Change the backdrop to `#0007` with no blur.

Your `prefers-reduced-motion` block (site.css:787) already turns off transitions and animations everywhere, so these are covered. Optionally hide `#reading-progress` on the home page.

## P1: Mobile

- **Header:** logo, search icon, theme icon, menu icon, all 40px. The three text buttons go away.
- **Drawer:** open it with `transform: translateX(-100%)` → `0` instead of `display` toggling, and add a scrim `::before` that closes it on tap.
- **Drawer behaviour:** when it opens, move focus to the `[aria-current]` link and set `inert` on `<main>`. Close it when a link is tapped. Return focus to the menu button. Escape already works.
- **Tables:** at 560px and below, set `th, td { min-width: 0; padding: .5rem .6rem }` and `table { font-size: .88rem }`. The three-column next-step table then fits at 390px. Keep `overflow:auto` for wide code-like tables, and add a right-edge shadow so it's clear they scroll.
- **Hero bug:** removing the hero fixes this one. If you keep any image there, target `.hero-illustration` rather than `.hero figure`.

## P2

- Make the "Lesson progression" footer read "Previous: X / Next: Y" with smaller text.
- Rename the completion button on quiz pages to "Mark checks reviewed", or hide it there.
- Make search a header *field* on desktop (an input-shaped button with a "⌘K" hint) and an icon-only button on mobile.

# What I didn't check

- I didn't render or measure the dark theme, the open search dialog, the mobile drawer, any lab page (`labs/*.html`), or code-block and KaTeX rendering. I had no screenshots of those.
- I didn't run the build or tests, and didn't verify legacy redirects. My statement that deep links survive the reorder is based on reading `hrefFor` and `legacyRoutes(source)`, not on testing.
- I didn't open `audit/code-blocks.json`, `learning.mjs`, `practice.mjs`, or the original Docsify `index.html`. The original order is taken from your description and `_sidebar.md`.
- Contrast ratios and tooltip timing are design suggestions; I haven't measured them.
- The desktop screenshot only shows the part of the sidebar that fits in one viewport (down to "Operators"). Any claim about deeper sidebar items comes from `_sidebar.md`, not the image.
