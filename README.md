# Team 1257 Robotics Training

Guided Java and FRC programming lessons, seven interactive labs, a tested Java 17/WPILib 2026.2.1 simulation starter, and source-backed Team 1257 code/log case studies.

[Open the training site](https://frc1257.github.io/robotics-training/) · [Start learning](docs/guides/start-here.md) · [Robot starter](examples/robot-starter/README.md)

## Preview and verify

Requires Node 22+, Python 3 and Java 17 for the example checks.

```sh
npm ci --ignore-scripts
npm run check
python3 scripts/check-java.py
npm run dev
```

Open `http://localhost:4173`. The first modernization batch uses locally vendored, version-pinned Docsify assets; `npm run vendor` reproduces them. See `docs/vendor/manifest.json` for versions, hashes and licenses. No external script CDN is required.

The robot starter has its own Gradle wrapper and tests; follow its README. Browser tests and desktop/mobile screenshots run in GitHub Actions using Playwright. Local browser execution depends on the environment's browser permissions.

## Contribute a lesson

Edit Markdown under `docs/`, add navigation in `docs/_sidebar.md`, and run the checks. Include prerequisites, outcomes, tested versions, an explanation, exercise and expected result, troubleshooting and primary sources. Name source revisions and distinguish inspected code, build-tested code, simulation and hardware tests. Historical lessons are labeled; follow the modern learning path for new work.

## Sources and licensing

New course code is MIT licensed except where notices state otherwise. Vendored dependencies and Gradle/WPILib components retain their notices. The real 2024 log excerpt comes from the team's Unlicense recording with revision and hash recorded in `research_sources/`. Robot walkthroughs link season-specific source without importing ambiguously licensed team code. Search results do not establish permission to republish media.

The user-supplied 2026–2027 textbook informs corrected exercises; the PDF is not redistributed. The initial audit is retained under `audit/`; raw third-party HTML snapshots remain local and are reproducible with its collector.
