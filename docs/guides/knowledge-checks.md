# Knowledge checks

<section id="knowledge-check" aria-labelledby="knowledge-check-title"><h2 id="knowledge-check-title">Try a quick knowledge check</h2><div id="quiz-body"></div><p id="quiz-status" role="status"></p></section>

Use these questions to practice recall after the lessons. Choose one answer, then use the answer key to explain your choice. The JavaScript quiz uses the same questions; this page works as a standalone reading version.

## Reading version

<details class="reading-question">
<summary>1. A readiness rule is enabled AND sensorHealthy. What is the result when enabled is true and sensorHealthy is false?</summary>

- **A.** true
- **B.** false
- **C.** It depends on the previous result
- **D.** Java cannot evaluate it

</details>

<details class="reading-question">
<summary>2. What does a DoubleSupplier such as () -&gt; joystick.getY() let a command do?</summary>

- **A.** Read the joystick whenever the supplier is called
- **B.** Read the joystick only when the supplier is created
- **C.** Automatically reserve the drivetrain subsystem
- **D.** Run the scheduler in a separate thread

</details>

<details class="reading-question">
<summary>3. Two interruptible commands require the same subsystem. If the second is scheduled while the first is running, what should you expect?</summary>

- **A.** Both normally control the subsystem at the same time
- **B.** The first is interrupted and the second may take the requirement
- **C.** The subsystem is permanently disabled
- **D.** The first command finishes naturally before the second starts

</details>

<details class="reading-question">
<summary>4. When can a subsystem default command run?</summary>

- **A.** Only once at startup
- **B.** When the subsystem is available and the scheduler schedules its default
- **C.** While a conflicting command owns the same requirement
- **D.** Only while the robot is powered off

</details>

<details class="reading-question">
<summary>5. With error defined as target minus measurement, previous error 1.0 m and current error 0.8 m after 0.1 s, what is the error derivative?</summary>

- **A.** +2 m/s
- **B.** −2 m/s
- **C.** −0.2 m/s
- **D.** +0.2 m/s

</details>

<details class="reading-question">
<summary>6. What can happen when a controller output is saturated while integral error continues to accumulate?</summary>

- **A.** Integral windup may delay recovery after the error changes
- **B.** The integral term is guaranteed to remain zero
- **C.** A motor gains unlimited torque
- **D.** The sensor automatically recalibrates

</details>

<details class="reading-question">
<summary>7. What is the role of a gravity feedforward term on an arm?</summary>

- **A.** Provide an estimated output to help counter gravity
- **B.** Replace every sensor and safety limit
- **C.** Measure the arm angle directly
- **D.** Guarantee perfect tracking under any load

</details>

<details class="reading-question">
<summary>8. Using +x forward, +y left and counterclockwise positive heading, what robot-relative vector corresponds to field-forward (1, 0) m/s when the robot heading is +90°?</summary>

- **A.** (1, 0) m/s
- **B.** (0, −1) m/s
- **C.** (0, +1) m/s
- **D.** (−1, 0) m/s

</details>

<details class="reading-question">
<summary>9. An encoder measures 12 motor turns through a 6:1 motor-to-output reduction. Ignoring slip and sign, how many turns does the output make?</summary>

- **A.** 2
- **B.** 6
- **C.** 12
- **D.** 72

</details>

<details class="reading-question">
<summary>10. Before a home reference is recorded, what does the encoder lab assume about its reference?</summary>

- **A.** It assumes zero reference turns; that does not prove physical home
- **B.** It proves the mechanism is at its physical home switch
- **C.** It reads a limit switch without wiring or simulation
- **D.** It automatically knows the drum diameter

</details>

<details class="reading-question">
<summary>11. A camera observation arrives after a delay. Which time is needed to associate it with the robot state when the image was taken?</summary>

- **A.** The image capture timestamp
- **B.** Only the time at which the dashboard displayed it
- **C.** The scheduled end of the next match
- **D.** The moment the code file was saved

</details>

<details class="reading-question">
<summary>12. A historical log shows an enable transition near a battery-voltage sample. What is supported by that proximity alone?</summary>

- **A.** The transition caused the voltage change
- **B.** The two samples occurred near each other in recorded time
- **C.** The robot won its match
- **D.** The sampled voltage was the lowest voltage in the full log

</details>

<details class="answer-key">
<summary>Show answers and explanations</summary>


1. **B.** Both conditions must be true for an AND expression to be true. [Review the lesson](../java/2-Control_Flow/2-Logical_Operators.md).

2. **A.** The callback is evaluated when called; a subsystem requirement must still be specified separately. [Review the lesson](../java/3-Functions/5-Lambdas.md).

3. **B.** Under the normal interruptible behavior the scheduler interrupts the conflicting command. Commands can have different interruption policies, so inspect their configuration. [Review the lesson](../labs/scheduler.html ':ignore').

4. **B.** A default is scheduled when the subsystem is available; it yields to a command that requires that subsystem. [Review the lesson](../frc/1-Basics/4a-Command_Based.md).

5. **B.** (0.8 − 1.0) / 0.1 = −2 m/s. The error is decreasing. [Review the lesson](../frc/3-Closed_Loop_Control/2-Basics_of_PID.md).

6. **A.** Integral windup can build up while the actuator cannot provide more output; limiting or resetting integral state may help. [Review the lesson](../frc/3-Closed_Loop_Control/2-Basics_of_PID.md).

7. **A.** Feedforward estimates an output needed for a known effect; feedback and safe limits still matter, and the estimate can be imperfect. [Review the lesson](../frc/3-Closed_Loop_Control/2-Basics_of_PID.md).

8. **B.** Rotate the field-relative vector by the negative heading: field-forward is robot-right at +90°, or (0, −1) m/s. [Review the lesson](../frc/1-Basics/Modern_Drivetrain_Project.md).

9. **A.** A 6:1 motor-to-output reduction means six motor turns per output turn, so 12 / 6 = 2. [Review the lesson](../labs/encoder.html ':ignore').

10. **A.** The model assumes a zero reference until homing; a numerical zero alone is not evidence of the mechanism’s physical position. [Review the lesson](../labs/encoder.html ':ignore').

11. **A.** Capture and delivery times differ. Time-aware pose estimation needs a capture timestamp compatible with the estimator clock. [Review the lesson](../labs/odometry.html ':ignore').

12. **B.** The samples have recorded times, but a causal claim requires additional context and evidence. Sparse sampling also can miss extrema. [Review the lesson](../robots/2024-log.md).

</details>

Try explaining an answer aloud, then revisit any lesson you missed. These checks teach concepts; a correct answer does not establish robot readiness or replace a mentor-reviewed hardware test.
