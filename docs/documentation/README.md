<!-- ai-assisted -->

# Maintain the learning library

Lessons live in `docs/` as Markdown. The static builder renders ordinary HTML pages, converts local lesson links, highlights code, renders math, and builds a full-text search index. Students can read the lesson without JavaScript; search, progress, and interactive labs add behavior in the browser.

## Preview a change

From a clone of this repository, install Node 22+, Python 3, and Java 17 if checking the examples. Run:

```sh
npm ci --ignore-scripts
npm run check
npm run dev
```

Open the local address printed by the command. The development preview uses a root URL. Production is built for `/robotics-training/`; test that prefix before changing routing. The root README describes the available commands.

## Write a useful lesson

Begin with what the student will be able to do. Include prerequisites and the software baseline, then explain the idea with a small concrete example. Give a task with an expected result and a troubleshooting table. End with sources and a next step. Distinguish complete programs from partial scaffolds and pseudocode.

```md
# Measure an encoder

**Prerequisites:** ratios and units.
**Baseline:** the versions used by the linked starter.

Explain the measured quantity and the conversion.

## Try it

1. Predict the output.
2. Run the example.
3. Compare with the expected result.

## Troubleshooting

Explain a common mistake and the evidence that distinguishes it.

## Sources

Link the relevant official reference and exact code revision.
```

Use a single H1 and sequential H2/H3 headings. Keep paragraphs focused and use lists for steps. Tables work well for comparing symptoms or units; do not force long prose into narrow columns.

## AI assistance and embedded labs

Mark AI-assisted lessons with `<!-- ai-assisted -->` before the H1. The page displays a compact provenance note. This labels the lesson text and teaching code; real photographs and screenshots retain their own captions and source credits. Describe review and execution evidence accurately rather than treating an AI label or a passing test as validation of hardware behavior.

Use `<!-- lab: pid -->` to embed a supported local lab at a deliberate teaching point. The concept names are `pid`, `swerve`, `scheduler`, `encoder`, `motion`, `log`, `odometry` and `vision`. Mechanism demos use `mechanism-` followed by `fixed-shooter`, `turret-shooter`, `piece-handling`, `elevator-wrist`, `telescoping-arm`, `drivetrain` or `climb-balance` (for example, `<!-- lab: mechanism-turret-shooter -->`). Introduce a question before the experiment and explain what to inspect afterwards. Keep the standalone lab link available for a larger workspace. Do not embed every demo in an index page.

Opening a lesson records completion as a visit, not proof of understanding. The top check icon permits a manual toggle, and progress import/export/reset lives in the footer.

## Links and media

Link a lesson using its source path, such as `[PID](../frc/3-Closed_Loop_Control/2-Basics_of_PID.md)`. Link a standalone lab with its HTML path. The builder resolves actual files and preserves external URLs. Old Docsify hash links have a compatibility map, but new material should use source paths.

Store images under `docs/media/` or the lesson's `img/` directory. Add useful alternative text. Prefer an original labeled diagram where it explains more than a stock photo. A real screenshot must identify the software revision and capture method; do not label an illustration as a screenshot. See the [lab tour](../guides/lab-tour.md).

Before copying external media, record its source, retrieval date, revision or hash, applicable license, and what it can establish. Search results alone do not grant reuse permission. Keep large videos and raw CAD outside the site unless permission and delivery size justify including them. Linked videos remain unviewed until someone records an observation.

An embedded resource needs a descriptive `title`, responsive dimensions, lazy loading, and a useful text explanation or direct link. Do not embed a private document as a required teaching step. The earlier inaccessible example presentation was removed; the lesson should remain understandable without third-party embeds.

## Examples and experiments

Keep runnable examples under `examples/` and test the behavior the lesson teaches. The robot starter tests cancellation, timeout, requirement conflicts, disabling, and bounded output. Numerical lab tests check equations and units, not only that a function returns something.

For simulation, identify the model, sample interval, integration method, assumptions, units, and limitations. For real logs, preserve the original and record extraction steps. Do not conflate requested output with measurement, estimated position with surveyed truth, or temporal association with causation.

## Publish and review

Run content/model checks and relevant Java tests before committing. The CI workflow also runs desktop/mobile browser tests and retains screenshots. Check a representative narrow viewport, keyboard operation, zoom, search, progress, and legacy links when editing the platform. GitHub Pages publishes generated static output after checks pass.

Add new entry points to `docs/_sidebar.md`; update `platform/catalog.json` when changing curated paths. The builder generates per-page metadata and a sitemap. Do not hand-edit `dist/`.

Use GitHub review to ask for a correction rather than silently upgrading an uncertain claim. State whether an example was inspected, built, simulated, or tested on hardware, and keep that distinction attached to the result.

## Search results and link previews

The build emits a canonical URL, description, Open Graph and large-image Twitter card, JSON-LD, and a 1200 × 630 PNG for every lesson and standalone lab. Cards use the team logo and bundled OFL-licensed Inter font; no image-generation service, system font, browser or API key is required. Images are fingerprinted from page copy and rendering inputs so updated cards receive new URLs.

Write a clear first paragraph: it supplies the default description. Use `platform/seo.json` for a more precise search title and description, especially on section indexes. Keep descriptions factual and under 160 characters; do not add keywords, ratings or completion claims. Visible lesson headings stay independent of search titles.

`sitemap.xml` contains canonical lesson and lab URLs and excludes the 404 page and embedded query variants. The project-level `robots.txt` points to it, but crawlers only use robots rules at the **host root** (`https://frc1257.github.io/robots.txt`). This project cannot change that file. A site owner can submit the public sitemap in Search Console. No indexing, ranking or rich-result appearance is guaranteed. `SITE_BASE` controls project paths and `SITE_ORIGIN` controls the public origin; set both for another deployment.

## Guided experiments

The original 14 labs open in a short walkthrough with Back/Next and an Explore option. The AprilTag `vision` lab has its own seven-step walkthrough with only stage-relevant controls. The shared `docs/labs/guided-labs.mjs` adapts existing controls; it does not replace the underlying models. Each step resets and applies a deterministic scenario. Keep the narration specific to what the model actually shows, and preserve a useful numeric or textual result for readers who cannot interpret the diagram. Explore restores the full interface and keeps the current model state; returning resets the current walkthrough step. The layer fails open if its controls are unavailable, so static explanations and the original experiment remain available.
