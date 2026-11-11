<!-- ai-assisted -->

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

<details>
<summary>Advanced architecture checks — reading version</summary>

### What should change when the same subsystem behavior runs against simulation instead of hardware?

1. The implementation supplied through its IO interface
2. Every command and button binding
3. The meaning of radians per second
4. The command scheduler requirement rules

**Answer: 1.** An IO boundary lets behavior consume the same contract while real and simulated implementations obtain measurements and apply requests differently. The model still needs validation. [Review the lesson](../frc/6-Architecture/1-IO_Interfaces.md).

### In the training roller, a sample is read before the next voltage request is calculated. What does the sample describe?

1. The future effect of the voltage about to be requested
2. The plant after the previously applied output interval
3. Proof that the real motor received its requested voltage
4. A prediction unaffected by timing

**Answer: 2.** The sample describes the plant after the prior output interval. The new output request affects the following interval; update ordering is part of the model contract. [Review the lesson](../frc/6-Architecture/2-Simulation_IO.md).

### Which input must be reproducible to compare a replayed decision with the original decision?

1. Only encoder position
2. Only the final output voltage
3. Every external input relevant to the decision, including requests and time
4. Only the robot class name

**Answer: 3.** A repeatable decision needs all relevant inputs, requests and timing. Replaying recorded sensor values does not guarantee that unlogged operator intent or wall-clock reads are reproduced. [Review the lesson](../frc/6-Architecture/3-Logging_Replay.md).

### A table is validated only from 1 to 3 meters. Our CalibrationTable wrapper is queried at 4 meters. What happens?

1. It proves the 3-meter value works at 4 meters
2. It extrapolates automatically
3. It returns OptionalDouble.empty() for the caller to handle
4. It inserts a new measured sample

**Answer: 3.** The teaching wrapper rejects queries outside its input domain. The underlying WPILib map instead clamps to an endpoint; neither behavior establishes that an unmeasured setting works physically. [Review the lesson](../frc/6-Architecture/4-Interpolation_Tables.md).

### A speed sample is NaN but its timestamp is current. What should the validity check conclude?

1. It is valid because it is fresh
2. It is invalid despite being fresh
3. It is a measured zero
4. A moving average guarantees a valid replacement

**Answer: 2.** Freshness and numerical validity are different checks. Do not turn an unknown measurement into a zero or assume that smoothing proves validity. Choose an explicit fault policy. [Review the lesson](../frc/6-Architecture/7-Filtering_And_Validity.md).

### Ready enters below 5 rad/s error and exits above 8 rad/s. If already ready and the error becomes 6 rad/s, what is the next state?

1. Not ready
2. Ready, retaining the previous state between thresholds
3. Unknown regardless of sensor health
4. The error must be set to zero

**Answer: 2.** Hysteresis retains the prior state between entry and exit thresholds. This example assumes a valid measurement; handling stale or invalid measurements requires a separate explicit policy. [Review the lesson](../frc/6-Architecture/7-Filtering_And_Validity.md).

</details>
