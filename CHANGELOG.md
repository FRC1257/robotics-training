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

A second review expands the course with seven architecture lessons: IO interfaces, simulation IO, logging/replay, interpolation, integration, timing/state and filtering/validity. Five new runnable Java tests cover IO sample ordering and calibration policies. Search adds advanced robotics terminology, and six additional knowledge questions cover those topics. Real attributed WPILib media illustrates relevant generated pages. AI-assisted material has explicit provenance labels.

The programming-by-robot-type section maps all fifteen unbuilt 2022–2026 research concepts into seven software families, with source-bounded comparisons, sensor/units contracts, state sequences, autonomous considerations and fault-injection exercises. Peer review corrected homing, digital sensor fault detection, continuous collision checks, turret wraparound/pivot transforms, and a binder page locator.

Claude's second UI pass adds a keyboard command palette, safe highlighted results, near-black/purple dark mode, a top completion icon, footer progress tools, callout rendering and locally embedded labs with theme and height synchronization. Visiting lessons records completion without changing existing dates; manually undone visits remain undone. Six paths and eighteen knowledge checks connect the expanded content.

Seven robot-type lessons now embed interactive mechanism/code demos. Students can pause, step 20 ms, adjust requests, goals and simulated sensors, inspect gates and recover from a fault. A synchronized mechanism view sits beside pinned, licensed real robot Java excerpts with source-line annotations. The models distinguish chassis and turret aiming, clearance coordination, indexing priority, differential/holonomic motion and climbing prerequisites. The code panel identifies original model behavior separately from team implementation. Added exact source verification, model tests, narrow-layout checks, and static/no-JavaScript source links. Claude authored the shared UI; Codex completed and verified integration with the user’s approval.

- Added automatic SEO and social previews for every lesson and lab: unique titles, prose descriptions, canonical URLs, branded PNG cards, JSON-LD, and a complete sitemap.
- Expanded vision from image formation through calibration, pose fusion and alignment; added worked lessons on state estimation and end-to-end control-loop design.
- Added a guided default for all 14 labs, with deterministic steps and an explicit Explore mode for the full controls.
