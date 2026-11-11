<!-- ai-assisted -->

# Program intake, indexing and buffered feeding

An intake may acquire a piece, but another sensor is often needed to establish that it reached the next stage. Team 254's [2022 binder](https://media.team254.com/2022/10/8f2407a5-Team_254_Tech_Binder_2022.pdf), pages 13–19, describes a serializer with beam breaks and color sensors (`E22-254-BINDER`). Team 1678's [2026 Limestone description](https://www.citruscircuits.org/2026-robot) describes a powered roller floor, ball tunnel and shooter (`E26-1678-ROBOT`); its [code README](https://github.com/frc1678/C2026-Public) describes coordinated hopper contraction while shooting (`E26-1678-CODE`). Neither source establishes the generic algorithm below or a measured jam rate.

## Model what is known, not what is hoped

IO reports entrance and exit beam breaks, motor speed in rad/s, current in A, applied voltage and device health, each with appropriate timestamps or freshness. Design sensor polarity and debounce explicitly. A single digital beam-break level does not inherently distinguish an unblocked beam from every disconnect: use suitable hardware diagnostics or redundant evidence where available, and leave possession unknown when the system cannot establish validity. A single-piece robot might track `EMPTY`, `ENTERING`, `STAGED`, `FEEDING` and `UNKNOWN`; a buffered hopper may need bounded counts or occupancy estimates, not an invented exact count from one sensor. Treat simultaneous or contradictory sensors as ambiguous until the model explains them.

**Illustrative pseudocode — not executable and not team code:**

```text
EMPTY + entrance_seen -> ENTERING
ENTERING + stage_seen -> STAGED
ENTERING + timeout -> UNKNOWN and stop or reviewed recovery
STAGED + feed_authorized -> FEEDING
FEEDING + stage_cleared + exit_confirmed -> EMPTY
FEEDING + jam_suspected -> RECOVERY with bounded retries
detected_sensor_fault or unresolvable_sensor_state -> UNKNOWN, inhibit automatic feed
```

A current increase combined with low speed can suggest a jam but can also reflect startup or load; distinguish detection from diagnosis. Log the underlying measurements and time. Give drivers explicit status and an intentional, bounded recovery command. For a multi-piece hopper, specify how collection and scoring windows affect buffer capacity and what happens when full; assumed fill/feed rates are only a toy model. Do not model contact compression as guaranteed.

## Exercise and auto behavior

An autonomous sequence attempts acquisition, checks a confirmed stage sensor and either continues to a scoring command or takes a timeout branch. In fake IO, inject (1) entrance blocked with no downstream confirmation, (2) a sensor disconnect that the chosen hardware diagnostics can detect, and (3) high current at near-zero speed after startup. Expected: never claim confirmed possession based solely on case 1; mark case 2 unknown; also test an undetectable disconnect and document that one level alone cannot reveal it; only enter the defined jam candidate after the chosen qualification in case 3. Test interruption and release as well as success. Physical testing must establish actual sensor placement, false detections, recovery forces and stop procedures; a software state machine alone does not prevent mechanical harm.

## Predict, experiment, explain

**Predict:** Does an entrance detection by itself prove that a piece reached the staging location? What should a controller do when a required sensor becomes invalid?

**Experiment:** Enable and request the handling sequence; change the front-left, front-right and back sensor inputs and observe the phase and motor requests. Add an obstruction during the sequence. Inspect the fault and outputs, then clear the condition, release the request and reset.

**Explain:** Identify which observation supported each transition and which information was still unknown. Compare the conceptual stages to the source method; the browser model does not run the team’s Java or model game-piece contact.

**Compare the source:** [Team 2910 2025 `IntakeSubsystem.java`](https://github.com/FRCTeam2910/2025CompetitionRobot-Public/blob/1b9e161c7719da0522ec826e2a48d2afb63232a5/src/main/java/org/frc2910/robot/subsystems/intake/IntakeSubsystem.java#L131-L140). During the straight coral collection case, back-sensor detection is checked before the two-front-sensor condition. The demo adapts this idea and does not implement the source method.

<!-- lab: mechanism-piece-handling -->
