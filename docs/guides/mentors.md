# Teach and review a practical skill

Ask students to predict behavior, demonstrate it, explain the result, and diagnose a small intentional fault. Reading completion alone does not establish readiness for hardware.

## A meeting plan

1. Show an outcome, such as stopping on release; ask which code makes it stop.
2. Work in pairs through a lesson or lab, alternating driver and reviewer.
3. Change one parameter. State a prediction before running.
4. Explain a failed prediction and review a small commit.
5. Record what worked, what remains unclear, and the next task.

| Project | Demonstration | Follow-up question |
| --- | --- | --- |
| Java | Runnable program with known outputs | What happens for an empty input? |
| Commands | Start, release, interrupt, disable | Who owns the requirement at each step? |
| PID | Explain response and limits | What does feedforward do at zero error? |
| Swerve | Predict wheel vectors | Which frame are velocities in? |
| Logging | Identify signal/time/unit | What would disprove your diagnosis? |
| Vision | Explain transform and timestamp | Why is a tag detection insufficient? |

## Author and review lessons

Each core lesson needs prerequisites, outcomes, software versions, explanation, runnable code or labeled pseudocode, a task, expected results, troubleshooting, sources, and a next step. Cite code at a commit. State diagram units and assumptions. Separate source inspection, build tests, simulation, and physical testing. Keep credentials and student data out of examples.

Before hardware operation use current team procedures and qualified mentor review. Select limits for the actual mechanism and establish an immediate-disable procedure.
