<!-- ai-assisted -->

# Filtering and validity: trust the signal before smoothing it

**Prerequisites:** units, periodic loops, basic feedback and [PID](../3-Closed_Loop_Control/2-Basics_of_PID.md). **Time:** approximately 45 minutes. This lesson uses the 2026 WPILib Java API. Numbers below are invented teaching examples, not Team 1257 observations. Filtering can reduce some noise, but it also changes timing and cannot make a disconnected or incorrectly scaled sensor trustworthy.

Imagine a shooter whose speed sensor supplies angular velocity in radians per second. A readiness decision compares speed with a target. A noisy signal may chatter around the boundary; a delayed or stale signal may say “ready” after the wheel has slowed. Decide what the system should do for **invalid, missing, old and out-of-range** data before selecting a filter.

## Choose for the error you expect

| Method | Useful when | Limitation to test |
| --- | --- | --- |
| Median, e.g. `new MedianFilter(3)` | Occasional isolated spikes occur among otherwise credible readings. | A run of bad samples can dominate the window; a true rapid change can be delayed. It does not establish validity. |
| Moving average, e.g. `LinearFilter.movingAverage(3)` | Small, relatively fast fluctuations should be smoothed over a fixed window. | A spike contributes to the average until it leaves the window; a larger window delays a real change. |
| Single-pole IIR, e.g. `LinearFilter.singlePoleIIR(0.1, 0.02)` | A compact exponential smoother with a defined time constant is appropriate. | Past inputs persist in its state; it lags changing input and depends on the configured update period. |

Use one stateful filter per independent signal. For an IIR, the first argument is time constant in seconds, and the second is the assumed interval between `calculate()` calls, also in seconds. A 0.02 s configured period assumes a regular 20 ms update; calling it irregularly changes its effective real-time behavior. Sampling a repeated stale value more often is **not** receiving more independent measurements. Check actual sensor update rates and timestamps, not just the robot loop period. WPILib documents [linear filters and periodic calling](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/filters/linear-filter.html) and its [median filter](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/filters/median-filter.html).

### Worked example: one spike

Suppose a fully populated three-sample window contains **100, 102, 300 rad/s**. Its median is **102 rad/s** and its arithmetic mean is **167.33 rad/s**. The average is pulled toward the spike, even if 300 is erroneous. The median rejects this isolated value, but it cannot know whether a genuine step occurred.

For a single-pole IIR with `T = 0.1 s`, `dt = 0.02 s`, previous output `100 rad/s`, and new input `300 rad/s`, WPILib's documented recurrence is `y = (1 − g)x + g·previous`, where `g = exp(−dt/T) ≈ 0.8187`. The next output is approximately **136.25 rad/s**. This is a single step from a stated prior output, not a prediction of motor behavior. Startup state and earlier samples affect results. Reset or initialize state deliberately when changing modes or recovering after a gap, and test the resulting transient. See the [2026 `LinearFilter` API](https://github.wpilib.org/allwpilib/docs/release/java/edu/wpi/first/math/filter/LinearFilter.html).

A fully populated 3-sample moving average at regular 20 ms intervals spans 40 ms from oldest to newest sample. For a slowly varying signal, its nominal center lies one sample, or 20 ms, behind the newest sample; this is not a universal delay for all signals or the filter's startup. The IIR's lag depends on frequency and time constant. Filtering in a feedback loop changes phase and can worsen stability. Compare raw, filtered and target signals with timestamps before adjusting control gains; avoid copying a smoothing value directly onto hardware.

## Three different jobs

- **Debounce** applies a time condition to a boolean. WPILib's `Debouncer` can debounce rising, falling or both edges. A rising debounce can require a ready condition to remain true for a selected time, but a short real event may be missed and the decision is delayed. Choose edge behavior intentionally. [WPILib debouncer](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/filters/debouncer.html).
- **Hysteresis** uses different entry and exit thresholds to reduce boundary chatter. For example, enter ready when absolute speed error is below 5 rad/s; once ready, leave when it is above 8 rad/s. Between thresholds retain the prior state. These thresholds are hypothetical and require validation; a stale or invalid reading must still override readiness.
- **Slew-rate limiting** limits how fast a value changes per second, often a driver or setpoint request. It does not verify a sensor or debounce a switch. Reset or initialize the limiter appropriately on an intentional mode change, and consider whether a limited request prevents a needed response. [WPILib slew-rate limiter](https://docs.wpilib.org/en/stable/docs/software/advanced-controls/filters/slew-rate-limiter.html).

## Keep quality separate from the number

Represent a reading as a value **plus quality and time**, such as `(speed, deviceStatus, sampleTimestamp)`. Check device health, `Double.isFinite(speed)` to reject NaN and infinities, plausible units/range, and age against a requirement for the task. Calculate age using a shared, monotonic time base; reject a future timestamp or a mismatched clock rather than treating negative age as fresh. A physically plausible value can still be wrong, and a legitimate zero can mean the wheel is stopped.

Do not replace a missing or bad reading with zero and then run the normal readiness calculation: that turns an unknown into a measurement. A design can instead mark the reading invalid, report a fault, inhibit the sensor-dependent action, and use a separately reviewed recovery behavior. The exact safe behavior depends on the mechanism; a filter is not a safety interlock. Preserve the last value only if it is clearly labeled stale and is not treated as current. On reconnection, validate fresh samples and explicitly decide how to reset or reinitialize filter and debounce state; do not blend old data into a new session blindly. Log raw value, filtered value, status, sample time, age and resulting decision so an unexpected transition can be investigated.

## Exercises and expected results

1. A three-sample window is `100, 102, 300 rad/s`. Calculate median and mean. **Expected:** 102 and about 167.33 rad/s. Replace `300` with `104`: the mean is 102 and the median is 102 rad/s. Explain why neither method proves the sensor is healthy.
2. For a 20 ms period and a 3-sample moving average, how much time separates the oldest and newest samples? **Expected:** 40 ms after the window fills. Describe why a delayed readiness decision could matter.
3. A hypothetical reading is `NaN` with a current timestamp. **Expected:** invalid despite its freshness. A finite reading received 500 ms ago is not automatically fresh; compare its age to a task-specific limit. Do not substitute zero for either unknown.
4. Starting not ready, errors are `4, 6, 9, 6, 4 rad/s`, and the hysteresis thresholds are enter below 5 and exit above 8. **Expected states:** ready, ready, not ready, not ready, ready. Assume all readings are valid; ask what the state should be when one becomes stale.

Review the [2026 mechanism code study](../../robots/2026-code.md) for real logging and IO patterns, but do not infer sensor health or match behavior from the existence of a filter or trigger in source code.
