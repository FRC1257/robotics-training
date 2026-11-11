# Changes

## November 10 2026

First modernization batch addresses curriculum correctness, interactive teaching and the programmer path:

- Correct PID derivative/integral math, replace unsafe tuning advice, fix Java inline examples and repair known links.
- Establish a Java 17/WPILib 2026.2.1 starter with command interruption/disable tests; retain clearly labeled historical content.
- Add seven standalone, accessible teaching labs with tested numerical models, including a real-log explorer.
- Expand simulation, logging, SysId, vision, modern drivetrain/localization, textbook exercises and broader robotics foundations.
- Add pinned 2025/2026 code walkthroughs, original diagrams and a provenance-backed 2024 log excerpt.
- Allow zoom, improve embed behavior and source links, vendor exact runtime dependencies, and add automated content/model/Java/browser checks.

Hardware behavior, surveyed geometry and classroom outcomes are not inferred from build or simulation results. Browser screenshot evidence is produced by the CI workflow.

Platform modernization adds statically generated lesson pages with normal URLs, per-page sharing metadata, a sitemap, full-text search with code/FRC synonyms and spelling tolerance, four curated paths, local progress import/export, next-activity suggestions, and twelve knowledge checks with explanations. Legacy hash links remain supported. Actual desktop/mobile lab screenshots are included with source revisions. A later review corrected feedforward concepts, Boolean sensor polarity, homing, and additional historical links.

PostHog integration was explicitly deferred by the user. The site initializes no analytics tracking.

The runnable starter now includes an original idealized holonomic autonomous trajectory exercise with offset recovery and module speed limits. Its eleven tests separate numerical/command behavior from hardware validation.

After user feedback, Claude reviewed actual screenshots and implemented a compact handbook UI: restored nested navigation, icon controls, keyboard tooltips, a mobile drawer and restrained motion. The homepage no longer uses the generic system diagram; the hardware lesson uses an attributed WPILib diagram and actual component photographs.
