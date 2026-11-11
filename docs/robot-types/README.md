<!-- ai-assisted -->

# Program different kinds of FRC robots

A robot's job and physical architecture determine the software contract: one shooter turns the whole chassis to aim, another must manage a turret's angle and cable travel; an elevator and a telescoping arm reach similar endpoints through different collision and stability constraints. These lessons use **documented 2022–2026 team-season examples** as starting points and then design **hypothetical teaching software**. The proposed states and pseudocode are not descriptions of the teams' exact implementations unless specifically identified as such.

| Family and task | What changes in the programming? | Before you begin |
| --- | --- | --- |
| [Fixed-heading shooter](fixed-shooter.md) | Aim with the chassis, coordinate wheel speed and feed readiness | Commands, velocity, frames |
| [Turreted shooter](turret-shooter.md) | Coordinate turret, hood, pose, cable limits and release gating | Fixed shooter, angular units |
| [Intake, conveyor and hopper](piece-handling.md) | Track uncertain possession, handoff, buffering and jam recovery | Sensors, state machines |
| [Elevator and wrist scorer](elevator-wrist.md) | Sequence height, extension and wrist through collision-safe envelopes | Position control, limits |
| [Pivoting telescoping arm](telescoping-arm.md) | Couple shoulder, extension, end-effector offset and stability | Elevator lesson, geometry |
| [Differential and swerve drive](drivetrain.md) | Convert desired motion into wheel speeds or module angles in the correct frame | Units, coordinate frames |
| [Climb and balance](climb-balance.md) | Handle multi-stage sequencing, load uncertainty and explicit aborts | State machines, safety |

The sibling research project selected 500 team-seasons as research queues and identifies source-reviewed seed cases; it does **not** claim 500 fully reviewed robot studies. A team report establishes what the team describes, not independently measured reliability, a particular event's configuration or why an alliance won. The research concepts are unbuilt analyst proposals. Each lesson links primary sources and their research source IDs; no match observation, CAD dimension or real performance value is invented. Source inventory is retained with this project at `research_sources/robot-type-teaching.json`.

Each lesson pairs a working browser model with excerpts linked to actual team source. The model is an original teaching simulation; it does not execute the team’s Java or reproduce its robot physics. The surrounding design snippets are **pseudocode, not executable Java** and do not claim to implement a team’s code. Model validation, source review and real hardware testing are distinct activities; physical work requires robot-specific review, current rules, units, limits and sensor checks. Use the [Team 1257 2026 code walkthrough](../robots/2026-code.md) when you want a pinned, concrete implementation.

## Map all 15 research concepts to software

These are the sibling research project's **original, unbuilt concept names and IDs**, not claims that real robots with those designs were built or tested. The matrix makes the role-specific software choice visible; each linked family lesson supplies the reusable control and test pattern. Concepts can combine several lessons. Season-specific game rules must be checked in the applicable official manual.

| Concept from the research synthesis | Programming emphasis and lesson |
| --- | --- |
| **22-A — Repeatable cargo scorer** | [Fixed shooter](fixed-shooter.md) plus [indexing](piece-handling.md): track up to the proposed capacity, classify possession and gate a driver-confirmed fixed-heading shot. |
| **22-B — Turret cycle scorer** | [Turret shooter](turret-shooter.md): add turret/hood calibration and cable bounds; first solve a stationary shot before considering motion compensation. |
| **22-C — Climb and support specialist** | [Climb](climb-balance.md) plus [handling](piece-handling.md): explicit engagement/recovery and limited cargo routing; partner role and compliance remain external decisions. |
| **23-A — Cube/link specialist** | [Elevator and wrist](elevator-wrist.md): single-piece cradle/elevator poses, selected compatible node and confirmed release; add a separate [2023 balance](climb-balance.md) sequence only after testing. |
| **23-B — Elevator plus short horizontal reach** | [Elevator and wrist](elevator-wrist.md): confirm handoff, retract before lowering and require clearance before extending; [balance](climb-balance.md) has its own travel pose. |
| **23-C — Low-stowed shoulder and extension** | [Telescoping arm](telescoping-arm.md): shoulder clearance before extension, endpoint and piece-offset calculation, pitch-aware release and recovery. |
| **C24-A — chassis-aimed speaker scorer** | [Fixed shooter](fixed-shooter.md): coordinate drive heading and flywheel readiness with a confirmed note and feed timeout. |
| **C24-B — amp supply and chain-climb support** | [Piece handling](piece-handling.md) and [climb](climb-balance.md): select the handoff/release path and separately confirm climb engagement; coordinate the role with partners. |
| **C24-C — independently aimed speaker scorer with amp/climb options** | [Turret shooter](turret-shooter.md): manage field-to-turret angle, safe travel and readiness; make amp/climb mutually compatible states. |
| **C25-A — fixed elevator coral scorer** | [Elevator and wrist](elevator-wrist.md): station possession, travel pose, driver-selected branch/level and verified release; vision loss needs a reviewed fallback. |
| **C25-B — algae access and low-coral utility robot** | [Telescoping arm](telescoping-arm.md) plus [handling](piece-handling.md): piece-type mode, low-reach envelopes and processor/low-coral release, with partner-task coordination. |
| **C25-C — pivoting telescoping-arm all-rounder** | [Telescoping arm](telescoping-arm.md): coordinate shoulder, extension, wrist and handoff; manage shared requirements and multiple task modes. |
| **26-A — buffered primary scorer** | [Buffered handling](piece-handling.md) plus [fixed shooter](fixed-shooter.md): maintain an uncertain occupancy estimate and feed only when readiness, legal location and actual field/hub state allow. |
| **26-B — collector/passer with a scoring fallback** | [Piece handling](piece-handling.md) and [fixed shooter](fixed-shooter.md): select distinct pass and scoring modes, destination and legal-location checks, and bounded recovery. |
| **26-C — climb and utility specialist** | [Climb](climb-balance.md): confirmation, abort and retention-aware recovery; use a limited [handling](piece-handling.md) mode only if implemented and validated. |

For the 2026 proposals, acquire relevant field/shift information from an actual authoritative state source where available, validate freshness and location, and define a safe fallback when state is unknown. **Do not hardcode a timer and assume it represents field state.** See the [2026 FIRST game manual](https://firstfrc.blob.core.windows.net/frc2026/Manual/HTML/2026GameManual.htm) (`E26-RULES`) and [Team 1678's 2026 robot description](https://www.citruscircuits.org/2026-robot) (`E26-1678-ROBOT`) for the researched context. The proposed programs and thresholds remain hypothetical.
