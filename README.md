# Team 1257 Robotics Training

Guided Java and FRC lessons, seven interactive labs, a tested Java 17/WPILib 2026.2.1 starter, and source-backed robot code/log case studies.

[Open the training site](https://frc1257.github.io/robotics-training/) · [Learning paths](docs/guides/learning-paths.md) · [Robot starter](examples/robot-starter/README.md)

## Preview and verify

Requires Node 22+, Python 3 and Java 17 for example checks.

```sh
npm ci --ignore-scripts
npm run check
npm run check:java
npm run dev
```

Open `http://localhost:4173`. Lessons are statically generated from Markdown; no backend or account is needed. Run `npm run build` to generate production output for `/robotics-training/`. Set `SITE_BASE=/` for a root deployment or `SITE_ORIGIN` for a different origin. Do not edit generated `dist/` files.

The robot starter has its own Gradle wrapper and eleven behavior/model tests. Follow its README. GitHub Actions runs model/content/Java checks plus desktop/mobile browser tests and retains real screenshots. Local browser execution depends on the environment's browser permissions.

## How it works

- `docs/`: Markdown lessons, standalone labs and source media. Historical examples are labeled.
- `platform/`: shared styles, local search, progress, knowledge checks and curated paths.
- `scripts/build-site.mjs`: HTML, code highlighting, math, metadata, sitemap, search index and legacy route generation.
- `tests/`: numerical, routing, search, progress and browser behavior checks.
- `examples/`: independently runnable Java exercises and the WPILib simulation starter.
- `research_sources/`: pinned code/log/media provenance, textbook adaptations and link-check evidence.

Search ranks topics and code identifiers, expands robotics synonyms, tolerates bounded spelling errors, provides contextual snippets and demotes historical material. Search queries stay in the browser. Learning progress is local, exportable and importable; it does not certify hardware competence. Knowledge checks include explanations and links to the matching lessons. PostHog configuration is deferred at the user's request; no tracking is initialized.

Old Docsify hash links are mapped to generated pages. The source shell and vendored compatibility runtime remain in `docs/` for historical tooling; they are excluded from the published static output. The current platform uses local assets and renders lesson text without JavaScript.

## Contribute

See [the authoring guide](docs/documentation/README.md). Include prerequisites, outcomes, tested versions, explanation, exercise, expected results, troubleshooting and primary sources. Add navigation to `docs/_sidebar.md`; update `platform/catalog.json` for curated paths. Keep code readable and test the behavior the lesson teaches.

## Sources and licensing

New course code is MIT except where notices state otherwise. Dependencies and Gradle/WPILib components retain their notices. The real 2024 log excerpt derives from an Unlicense recording with its revision, hash and extraction steps recorded. Walkthroughs link season-specific robot code without importing ambiguously licensed team code. Original diagrams and unedited CI screenshots identify what they depict; no robot photographs or CAD were invented.

The supplied 2026–2027 textbook informs corrected exercises and is not redistributed. The initial audit under `audit/` describes the pre-modernization revision; raw third-party HTML snapshots stay local and can be regenerated.
