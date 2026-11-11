package frc.robot;

import java.util.Objects;
import java.util.function.Consumer;

/** A deterministic teaching plant, not a hardware or AdvantageKit implementation. */
public final class RollerIOTraining {
  public static final double DT_SECONDS = 0.02;

  public record Inputs(double velocityRadPerSec, double appliedVolts) {}

  public interface RollerIO {
    Inputs updateInputs();

    void setVoltage(double volts);
  }

  /** First-order model: dv/dt = (10*voltage - velocity)/0.20. */
  public static final class RollerIOSim implements RollerIO {
    private double velocity;
    private double volts;

    @Override
    public Inputs updateInputs() {
      // Exact solution for constant voltage over one fixed 20 ms interval.
      velocity += (10.0 * volts - velocity) * (1.0 - Math.exp(-DT_SECONDS / 0.20));
      return new Inputs(velocity, volts);
    }

    @Override
    public void setVoltage(double requested) {
      if (!Double.isFinite(requested)) {
        throw new IllegalArgumentException("voltage must be finite");
      }
      volts = Math.max(-12.0, Math.min(12.0, requested));
    }
  }

  private final RollerIO io;
  private final Consumer<Inputs> inputObserver;

  public RollerIOTraining(RollerIO io, Consumer<Inputs> inputObserver) {
    this.io = Objects.requireNonNull(io);
    this.inputObserver = Objects.requireNonNull(inputObserver);
  }

  /** Read once, publish the same sample, then calculate next-interval output. */
  public Inputs periodic(double targetRadPerSec) {
    if (!Double.isFinite(targetRadPerSec)) {
      throw new IllegalArgumentException("target must be finite");
    }
    Inputs inputs = io.updateInputs();
    inputObserver.accept(inputs);
    io.setVoltage(0.1 * (targetRadPerSec - inputs.velocityRadPerSec()));
    return inputs;
  }
}
