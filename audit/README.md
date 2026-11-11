# Team 1257 robotics training audit

> Historical audit of commit `53ceaf6`, before modernization. See the repository changelog for subsequent repairs. Evidence outputs describe that baseline, not the current site.

Team 1257 has a substantial programming curriculum worth preserving. Its most urgent needs are correct, executable examples; a coherent versioned learning path; and completion of the controls, simulation, vision, and logging material. Interactive lessons can make this much more useful, especially when they lead students from a prediction to an experiment and then to working robot code.

Recommendation: repair the core lessons and publish one excellent PID lab and one swerve lab before committing to a whole-site redesign. Keep Markdown easy for students to maintain. Expand into other FRC departments through a small foundation course and curated specialist resources.

## Scope and evidence

Checked November 10, 2026, America/New_York. Clone: `/Users/family/Documents/CodingProjects/robotics-training`. Revision: `53ceaf61aeb80be597791c99bb50a3b123e8c71b`; latest cloned commit is June 14, 2025. No application files were changed, no commits were created, and nothing was published.

The audit inventories every Markdown file, scans Markdown destinations and embedded HTML, reviews the principal learner journeys and representative code in depth, checks 89 distinct HTTP request URLs, compiles selected complete introductory Java examples, and reproduces two PID arithmetic defects. The live homepage Markdown and HTML match the cloned files byte for byte. The 89 requests include diagnostic candidate paths, so their status totals are not a site-wide broken-link count.

Browser control was unavailable because local browser use is disabled in Work settings. Rendered search behavior, keyboard journeys, mobile layout, screen-reader behavior, actual dependency execution, and performance remain unverified. No Lighthouse, WCAG conformance, hardware, or full robot-build result is claimed. Linked recordings were not viewed. No CAD was inspected. Semantic review sampled the principal learning paths; this is not certification of every sentence or snippet.

Evidence files:

- [Summary](summary.json), [per-file inventory and hashes](inventory.json), [link occurrences](links.json), [unfinished material](todos.json), [assets](assets.json), [embedded frames](embeds.json), and [script dependencies](scripts.json).
- [HTTP evidence](http.json) records request URLs, final URLs, UTC retrieval times, response status, headers excluding cookies, SHA-256, and raw snapshot paths. Snapshots are under `snapshots/`.
- [Example checks](example-checks.json) records compiler results and numerical reproductions. Twelve groups of complete Java examples compile with Java 17.0.18. One separately tested class fails as predicted. Two arithmetic checks reproduce the PID defects. Robot examples were not compiled.
- Reproduce with `python3 audit/collect.py` and `python3 audit/verify_examples.py`. The collector fetches public pages and writes only under `audit/`; the verifier compiles in temporary directories. Link parsing is heuristic, and nested Docsify sidebar resolution requires a renderer check.

## What exists

This is a static Docsify site hosted on GitHub Pages. Markdown is fetched and rendered in the browser, with hash routes, search, pagination, a collapsible sidebar, a table of contents, syntax highlighting, math, callouts, and GitHub edit links. It has no application backend, package manifest, dependency lockfile, or checked-in CI workflow. A static Docsify site does not require a Node build; the missing build is not itself a defect.

| Area | Markdown files | Existing value | Main gap |
| --- | ---: | --- | --- |
| Java | 56 | Variables through objects, example programs, exercises, formatting | Broken inline examples; unfinished lambdas; no clearly versioned, executable exercise path |
| FRC programming | 63 | Subsystems, commands, mechanisms, sensors, PID, feedforward, motion profiles, differential-drive autonomous | Mixed API generations and architectures; no swerve course; incomplete simulation, SysId, logging |
| Vision | 6 | Introductory overview, Limelight notes, PhotonVision headings | Calibration and pose-estimation implementation are unfinished |
| Git | 3 | Workflow and reference | Connect exercises to actual student branches, review, and recovery tasks |
| Website | 9 | Team website maintenance instructions | Distinguish internal maintainer material from robot learning |
| Documentation | 1 | Useful authoring instructions | Add lesson standards, technical review, and example verification |
| Home and navigation | 3 | Entry page, sidebar, unused cover page | Guided start, prerequisites, completion criteria, and current-version labels |

Total: 141 Markdown files, approximately 75,482 whitespace-delimited tokens including code. This is not 141 complete lessons. Fourteen files contain explicit unfinished-work markers or update promises, and the logging page is empty. `docs/` occupies approximately 27 MB on disk; this is not the download size of a single page.

The user journeys are: GitHub README → GitHub Pages → home/sidebar → lesson → linked templates, historical robot repositories, vendor documentation, Google documents/diagrams, or YouTube. External resources are useful, but students need a tested starting project and a concrete way to tell whether their work succeeded.

## Findings and recommended repairs

Priorities describe teaching and product impact, not security severity. High confidence means directly present in the checked source or reproduced. Medium confidence means an implementation risk or a route-dependent candidate awaiting browser verification.

### A01 Correct the PID equations before expanding controls lessons

**Priority: immediate. Confidence: high.** [PID lesson](https://github.com/FRC1257/robotics-training/blob/53ceaf61aeb80be597791c99bb50a3b123e8c71b/docs/frc/3-Closed_Loop_Control/2-Basics_of_PID.md#L65).

With `error = setpoint - measurement`, line 70 subtracts the finite difference of error. For a fixed setpoint and positive gains this reverses the damping contribution: as measurement rises toward the setpoint, the published derivative adds effort. The integral at line 104 sums changes in error multiplied by time, rather than error multiplied by time. A constant nonzero error therefore adds no further integral effort after initialization. The combined formula repeats the sign problem. There is also a missing semicolon in the P example.

Use a consistent error convention and explain that derivative of measurement has the opposite sign to derivative of error for a fixed setpoint. Teach `integral += error * dt`, output limits, integral limiting, reset behavior, sensor noise, and setpoint changes. Avoid presenting P, I, and D together as universally best. The [WPILib explanation](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/introduction/introduction-to-pid.html) is an appropriate mathematical reference. Prefer WPILib's tested controller for implementation after students understand the terms.

Acceptance: constant-error accumulation and damping-direction checks pass; the full runnable example builds; the lab agrees with its stated equations and units.

### A02 Replace the hardware tuning instruction that accepts violent oscillation

**Priority: immediate. Confidence: high.** The same PID lesson, line 139, explicitly accepts violent oscillations as part of tuning. This should become an unstable example students explore in simulation. Hardware exercises need bounded output and travel, a cleared test area, an immediate disable plan, and a mentor-reviewed procedure. The [Choreo testing guidance](https://choreo.autos/#safety) illustrates concrete operating precautions.

Acceptance: no beginner procedure asks students to deliberately create violent hardware motion; simulation and hardware activities are visibly distinguished.

### A03 Establish one tested software baseline

**Priority: high. Confidence: high.** `CANSparkMax` appears in 11 Markdown files, `CommandBase` in 12, and `SnailSubsystem` in 22. The architecture page announces an Advantage Kit transition for 2024 but still teaches the old template. Vendor installation instructions name 2020 directories. The first-subsystem series mixes the promised IO architecture with legacy state-machine examples.

[REV's migration guide](https://docs.revrobotics.com/revlib/archive/24-to-present.md) documents the class, import, and configuration changes beginning in 2025. [Current stable command documentation](https://docs.wpilib.org/en/stable/docs/software/commandbased/commands.html) uses `Command` and modern factories. This is evidence for a migration review, not proof that all historical code was wrong in its original environment.

Pick a tested WPILib release, JDK, vendordep set, and template commit. Mark historical material clearly. Separate standard WPILib behavior from 1257-specific wrappers and explain why the team adds them. Introduce ordinary subsystems and commands before IO/replay abstractions unless the selected template genuinely requires those abstractions from the first exercise.

At audit time `/en/stable/` describes 2026 and `/en/latest/` describes 2027 development. The [2027 changelog](https://docs.wpilib.org/en/latest/docs/yearly-overview/yearly-changelog.html) documents removal of Shuffleboard, SmartDashboard, and PathWeaver for 2027. Keep that forthcoming migration separate from a verified 2026 course; record exact tested versions rather than assuming `latest` is suitable for the selected season.

Acceptance: a new student can clone the exact template, build it, run simulation, and complete the first subsystem without translating between architectures or API generations.

### A04 Verify inline examples as well as complete program files

**Priority: high. Confidence: high for the reproduced Java defect; medium for unbuilt robot behaviors.** [Classes lesson](https://github.com/FRC1257/robotics-training/blob/53ceaf61aeb80be597791c99bb50a3b123e8c71b/docs/java/4-Objects/2-Classes.md#L75).

The Actions example declares `int distance(double time)` but returns a `double` expression; `javac` reproduces the lossy-conversion error. The following example declares `carObject` but calls `car`, then tries to print the return of a `void` method. The claim that a program can contain only one `main` method also needs correction: multiple classes can have entry methods; the launcher selects one.

The separate complete Cars project compiles. That distinction matters: checking only final program files would miss errors in the teaching sequence.

Additional robot review queue: the drivetrain example assigns an undeclared `defaultState` in `manualDrive()` and configures followers before factory resets; the PID elevator example returns to manual mode on reaching tolerance without a clearly defined hold policy. Review these against the chosen template and vendor version, then simulate interruption, hold, and reset behavior. These behaviors were not hardware-tested.

Keep complete source examples as the authoritative files and include tested excerpts in lessons. Label incomplete scaffolds. CI should compile complete examples and exercise controller math, command interruption, sensor polarity, and mechanism limits where relevant.

### A05 Repair confirmed broken navigation and reference links

**Priority: high. Confidence: high for direct 404 destinations; medium for relative-route warnings.** [Sidebar](https://github.com/FRC1257/robotics-training/blob/53ceaf61aeb80be597791c99bb50a3b123e8c71b/docs/_sidebar.md#L109).

The SysId sidebar points to nonexistent `Characterization-Sysid.md`; `Sysid.md` exists and is not linked by the root sidebar. Motors links in Vendor Dependencies and Pneumatics target nonexistent `2-Motors`, while the real page is `2a-Motors.md`. The zeroing-sensors page is also absent from the root sidebar.

Ten distinct sampled external reference URLs return 404, including the old WPI Javadocs, the PhotonVision Raspberry Pi setup URL, and the old Limelight NetworkTables API URL. The full request/source mapping is in the evidence files. Some old WPILib content URLs return 200 through compatibility behavior, so status alone is insufficient to establish relevance.

The heuristic also flags relative links in Elevator, Notifier, and the nested Access sidebar. Do not report its 27 missing-path occurrences as 27 confirmed broken user journeys: 22 arise from nested sidebar base assumptions. Validate these routes in Docsify before changing them. Add link checks that understand the deployment prefix, hash routes, anchors, and sidebar behavior.

Acceptance: all primary sidebar destinations load useful content; old URLs redirect or provide a useful migration route; external failures are reviewed rather than blindly rewritten.

### A06 Complete the advertised lessons

**Priority: high. Confidence: high.** `Advanced_Logging.md` has zero bytes. PhotonVision Code contains only headings and TODO. PhotonVision Setup leaves configuration, calibration, and AprilTag setup unfinished. Lambdas, the first simulation lesson, SysId, Limelight usage, and parts of command creation also need completion.

Publish a lesson status of draft, reviewed, or tested. Drafts need a useful replacement resource rather than a navigation promise leading to no instruction. Prioritize logging, lambdas, simulation, and calibration because the intended advanced architecture depends on them.

Acceptance: each advertised core lesson has prerequisites, explanation, a working example, a task, expected results, troubleshooting, and named sources.

### A07 Add a modern drivetrain and localization path

**Priority: high. Confidence: high within the scanned corpus.** No Markdown file mentions swerve, PathPlanner, or Choreo. Odometry occurs in one autonomous page; pose estimation appears as an unfinished PhotonVision heading. Existing drivetrain teaching centers on differential drive, which remains valuable.

Add coordinates and units → differential/swerve comparison → module mechanics and calibration → chassis/module kinematics → field-relative driving → odometry → vision pose correction → trajectory following. Use [WPILib kinematics](https://docs.wpilib.org/en/stable/docs/software/kinematics-and-odometry/swerve-drive-kinematics.html) and version-matched vendor docs for correctness. Use [PhotonVision MultiTag documentation](https://docs.photonvision.org/en/v2026.3.3/docs/apriltag-pipelines/multitag.html) for calibration and field-layout prerequisites. Introduce one supported autonomous tool in the main path, with [PathPlanner](https://pathplanner.dev/home.html) and [Choreo](https://choreo.autos/) compared in a short decision guide.

Acceptance: a learner can explain coordinate frames, interpret module states, diagnose a bad offset, and demonstrate a basic autonomous routine in the selected simulator.

### A08 Turn the folder browser into a learning path

**Priority: high. Confidence: high for content structure; usability impact is an inference.** Existing goal and exercise sections are a good base. Home mainly lists folders, and many lessons assume the reader already understands team-specific infrastructure. No quiz or learner-progress system was found in the checked source.

Provide entry points for new programmers, experienced programmers new to FRC, and current members debugging a robot. Put prerequisites, expected duration, tools, measurable outcomes, next lesson, and a small challenge on each core lesson. Add a glossary and debugging playbooks. Save progress locally first, with reset/export, and use practical mentor review for physical skills. Reading completion and quiz scores should not imply hardware competence.

Suggested project ladder: trace a robot's signals → write Java exercises → command a simulated intake → tune an elevator → drive a simulated robot → follow a path → add vision → diagnose a supplied log.

### A09 Remove known accessibility barriers and verify the rest

**Priority: high for zoom; medium for remaining QA. Confidence: high for source attributes.** `index.html:8` explicitly disables user scaling and caps zoom. Ten of eleven actual iframe tags outside code examples lack a `title` attribute. Several videos have fixed 560-pixel widths. Query-string text such as `title=...` inside an iframe `src` is not an accessible frame title.

Allow zoom, provide descriptive iframe titles, use responsive aspect-ratio wrappers, and supply equivalent text explanations. Test sidebar navigation, focus order, visible focus, math/code reading, table overflow, and 200% zoom. Verify contrast against actual computed backgrounds. The custom table-of-contents CSS has a responsive breakpoint; that is not proof of either good or broken mobile behavior.

New labs must support keyboard and touch controls, pause/reset, reduced motion, labeled units, and numeric/table equivalents to canvas graphics.

### A10 Make site dependencies and authoring reproducible

**Priority: medium. Confidence: high for source configuration.** The shell requests 13 external scripts. Many use no exact version, a major-version range, or `latest`; core and plugins come from two CDNs. This creates reproducibility and availability risk, not a demonstrated current outage. No checked-in automated checks or local-development instructions beyond the short README were found.

Pin compatible versions or bundle/self-host the small set of required assets, document local serving, and add a preview workflow. Keep the GitHub Pages deployment base explicit. The edit-link hook assigns an undeclared `url` and constructs a repository path from `vm.route.file`; test root and nested edit links and make that construction explicit. Do not claim the edit button is broken without the missing browser check.

Acceptance: the same revision produces a predictable site; a student maintainer can preview, validate, and publish a small lesson change.

### A11 Improve page sharing, discovery, and asset weight

**Priority: medium. Confidence: high for static evidence; real-user performance unmeasured.** The shell has a generic description of `Description`, one document title, and no canonical or social-card metadata. The project sitemap and host-root robots file return 404. Missing robots.txt is not a crawl-blocking defect. Hash routes and client-loaded Markdown limit control over per-lesson HTML and sharing metadata; actual search-engine indexing was not measured.

The documentation page references a 7.7 MB decorative GIF; two other decorative GIFs add another 4.8 MB in the repository. Remove unnecessary animation or replace with small stills, and lazy-load optional embeds. Keep critical diagrams local where reuse rights permit. Measure representative pages on a constrained network before setting performance budgets.

If adopting static generation, give lessons ordinary URLs, per-page metadata, a sitemap, redirects from old links, and generated full-text search. Test searches for PID, SysId, swerve, encoder conversion, pose estimation, and common synonyms.

### A12 Expand FRC breadth without duplicating specialist curricula

**Priority: medium. Confidence: high for the existing programming focus.** The homepage explicitly describes software training. Mechanical/CAD, electrical build skills, scouting, and team operations are expansion opportunities if this is to become the team's general training site, not defects against its original scope.

Add a shared introduction to robot components, safety, electrical interfaces, gear ratios, sensor installation, controls, and competition roles. Then offer small department paths with practical checklists and curated external modules. Maintain detailed 1257-specific setup, calibration, troubleshooting, and tested code locally. Link to strong specialist instruction for topics the team cannot yet maintain accurately.

## What to learn from other resources

These are patterns to adapt, not guarantees about lesson accuracy or measured student outcomes. Homepages and selected primary documentation were inspected; videos and interactive controls were not exercised. Preserve attribution and check licenses before copying code, diagrams, or media. Public availability does not establish permission to republish.

| Resource | Verified pattern | Application to 1257 |
| --- | --- | --- |
| [WPILib](https://docs.wpilib.org/en/stable/) and [REV migration docs](https://docs.revrobotics.com/revlib/archive/24-to-present.md) | Maintained technical documentation and explicit migration guidance | Technical source of truth; cite exact tested versions and maintain upgrade notes |
| [Spectrum training](https://spectrum3847.org/resources/training/) | Courses on motors, control modes, swerve, vision, autonomous, and telemetry tied to team artifacts | Short explanation plus experiment, followed by a real 1257 code or log example |
| [MARS/WARS labs](https://docs.marswars.org/labs) | Guided/free-play PID, state-machine, pose, swerve, and filter labs; explicit upstream attribution | Pair each lab with its lesson and recognize adapted work |
| [Team 1241 resources](https://team1241.github.io/) | Public source lists a controls sequence from block diagrams through PID, feedforward, kinematics, odometry, and fusion | Teach prerequisites in order instead of introducing advanced jargon in isolation |
| [LearnFRC](https://learnfrc.com/) | Department paths, quizzes, troubleshooting articles, and calculators; discloses AI assistance | Use clear onboarding and review status; verify technical claims against primary sources |
| [FRCDesign](https://frcdesign.org/) | Separates guided learning, reference handbook, mechanism examples, and educator guidance | Distinguish Learn, Reference, Labs, and Mentor material |
| [FRCElectrical](https://frcelectrical.org/) | Practical connections, tools, mechanism wiring, and educator content | Tie each physical skill to inspection criteria and mentor observation |
| [971 workshops](https://www.spartanrobotics.org/workshops) and [254 resources](https://www.team254.com/resources/) | Workshops, presentations, robot archives and engineering artifacts | Offer bounded case studies about design reasoning, constraints, and iterations |
| [AdvantageKit](https://docs.advantagekit.org/) and [AdvantageScope](https://docs.advantagescope.org/) | Replay architecture and log visualization have distinct roles; Scope can work without Kit | Finish logging with a real log-reading exercise before requiring replay architecture |
| [1678 resources](https://www.citruscircuits.org/resources) and [1114 resources](https://www.simbotics.org/resources/) | Scouting whitepapers and a dedicated strategy/resource library | Add scouting and game-analysis tasks with explicit data limitations |
| [FIRST](https://www.firstinspires.org/resources/library/frc/technical-resources) and [NASA's directory](https://robotics.nasa.gov/frc-resources/) | Official technical resources and a curated community directory | Provide authoritative entry points; a directory listing is discovery, not technical verification |

The supplied resource list is a useful discovery queue. Tool names and APIs must still be checked against the teaching baseline. Chief Delphi is valuable for finding team explanations and alternative approaches; use the actual team release, manual, code, or technical document for the resulting claim.

## Interactive labs worth building

Every lab should have a question to predict, a small guided experiment, free exploration, a challenge with feedback, and a matching code example. A simulator needs explicit equations, units, assumptions, and limits. A visually attractive result is not evidence of accurate physics.

| Order | Lab | Student controls and visible results | Completion task |
| --- | --- | --- | --- |
| 1 | PID and feedforward | Setpoint and P/I/D, gravity feedforward, disturbance, friction, noise, voltage limit; mechanism animation and response/output plots | Explain overshoot, reduce settling error, and demonstrate windup and its mitigation |
| 2 | Swerve kinematics | Translation/rotation inputs, heading, module geometry, center of rotation, field/robot frame, speed limit; module vectors and numeric states | Predict pure rotation, combine translation and rotation, explain desaturation and angle optimization |
| 3 | Command scheduler | Step the loop, press/release bindings, schedule conflicting commands; timeline of requirements and lifecycle calls | Explain cancellation and make motor behavior correct after release/interruption |
| 4 | Encoder units and homing | Gear ratio, wheel/pulley diameter, encoder turns, offset and polarity; traced unit conversions and limit-switch state | Convert encoder readings to meters/radians and distinguish assumed zero from measured home |
| 5 | Odometry and vision | Drive a robot with seeded drift/noise, tag observations, latency, and confidence; truth/odometry/fused tracks | Explain drift and show why a delayed observation needs its capture timestamp |
| 6 | Motion profiles and autonomous | Waypoints, velocity/acceleration limits, heading, events; path plus position/velocity/acceleration plots | Compare a path with its timed trajectory and find an infeasible request |
| 7 | Electrical and power | Simplified loads, wire resistance and battery resistance; voltage/current diagram | Explain voltage sag and locate an assumed high-resistance connection |
| 8 | Mechanisms and strategy | Gear ratios and torque/speed; later, cycle-time variability and simple alliance scenarios | Defend a tradeoff under stated assumptions rather than maximize one number |

Start the PID lab with one elevator or flywheel plant. Add arms only when gravity, units, and limits are correct. Include a toggle comparing feedforward alone, feedback alone, and both. For each run, show overshoot, settling time with a declared tolerance/window, steady error, and saturation time. Never export browser gains as certified hardware tuning values.

Build the swerve lab as 2D SVG first. The core module velocity is `v_i = [vx - omega*y_i, vy + omega*x_i]` for positions relative to the chosen center of rotation, under WPILib's documented axes. Show frame transforms and module ordering explicitly. An ideal kinematics model should not imply tire slip, torque limits, or actuator dynamics have been modeled. Tests should cover pure translation, pure rotation, mixed motion, frame rotation, desaturation, and near-zero speed.

Both initial labs should have resettable presets, a single-step option where useful, labeled accessible inputs, shareable settings, textual output, and no required login. Numerical simulations should use a fixed integration step independent of animation frame rate, a separate controller sample interval, deterministic scenarios, and bounded parameters. Pause when hidden and check behavior across devices. Test against known equations and version-matched WPILib results.

## Delivery approach

The first pilot can stay on Docsify. Put lab HTML and modules under `docs/labs/`, with a shared small UI/simulation layer. Link or embed them from the corrected lessons, keeping text and fallback diagrams useful without the lab. This tests the teaching format while preserving the existing URLs and student authoring workflow.

If the pilot succeeds, Astro with MDX is a strong candidate for a static learning site with selectively interactive components and ordinary page URLs. Docusaurus is another reasonable option if its documentation/versioning model fits the maintainers better. Evaluate contribution difficulty and the GitHub Pages base path with a small representative migration before deciding. Preserve Markdown, images, edit links, and old deep links. A framework migration alone will not correct the curriculum.

Proposed navigation: Start Here, Learn, Labs, Projects, Reference, Team 1257, and For Mentors. Keep internal website-maintenance and documentation-authoring instructions under Team/For Maintainers. Avoid starting with accounts, a database, certificates, a 3D robot renderer, or a large chat feature; each adds maintenance before the core teaching loop is proven.

Suggested lesson metadata: stable ID, title, level, prerequisites, duration estimate, learning outcomes, software/vendor baseline, review status and date, source links, exercise ID, and example commit. Software examples need a reproducible build. Physics lessons need explicit assumptions. Rule-dependent material needs a season and manual revision.

## Prioritized implementation plan

| Phase | Work | Reviewable exit criteria |
| --- | --- | --- |
| 1 Restore trust | PID math/tuning, Classes defects, confirmed links, empty-page handling, zoom, software baseline | Corrected core examples; baseline template builds and simulates; primary navigation and zoom verified in browser |
| 2 Prove the teaching format | Corrected controls lesson plus PID lab; coordinates lesson plus swerve lab | Numerical checks pass; keyboard/mobile QA; a novice completes each challenge and explains the result |
| 3 Complete the programmer path | Commands/lambdas, simulation, homing, telemetry/logs, SysId, vision, one autonomous tool | End-to-end simulated robot project; intentional fault diagnosis; mentor review guide |
| 4 Improve the platform and breadth | Decide static generator, migrate representative routes, add paths/search/progress, shared FRC foundations | Old links preserved; source/review metadata present; contributor instructions verified; representative user journeys pass |

Small repairs include individual links, zoom, iframe titles, and obvious Java defects. Baseline migration and lab creation are medium-to-large tasks requiring review and tests. Full curriculum completion and a site migration are separate projects; estimate them after the pilot, not from file count.

Before a release, verify discover → start → learn → experiment → complete task → continue, on desktop and a narrow viewport. Search must locate both topics and common troubleshooting terms. Validate math, check matching Java APIs, confirm the selected template builds, inspect console/network failures, test no-JavaScript fallbacks where provided, and review all main navigation routes. Deferred browser checks in this audit remain a release prerequisite.

Success measures should be practical: a student can build the starter project, finish a simulation challenge, explain what changed, diagnose a fault, and have a mentor review the relevant physical task. Use observed task completion and stumbling points to choose the next improvement; page views and reading checkmarks alone cannot establish competence.

## Connecting this to the existing FRC research

The research repository can eventually supply source-backed robot case studies, diagrams, and comparison exercises. Keep its operations and evidence pipeline separate from the training-site runtime. Promote only bounded claims with explicit source IDs and review status. A video pointer is not a viewed observation, a statistical rating is not causal proof of mechanism quality, and a whole-season robot configuration should not be assumed constant.

Begin with a few reviewed case studies and link to the original team artifacts. Treat raw scouting data, calculated metrics, reported designs, observed behavior, and hypotheses as different types of evidence. This is a useful differentiator for 1257 once the foundational curriculum works reliably.
