/** A numerical PID lesson, not a motor controller. Units: meters, seconds, normalized output. */
public final class PidDemo {
  static double integral;
  static double previousError;
  static boolean initialized;
  static double step(double error, double dt, double kp, double ki, double kd) {
    if (!(dt > 0)) throw new IllegalArgumentException("dt must be positive");
    integral = Math.max(-1.0, Math.min(1.0, integral + error * dt));
    double derivative = initialized ? (error - previousError) / dt : 0.0;
    initialized = true;
    previousError = error;
    return Math.max(-1.0, Math.min(1.0, kp * error + ki * integral + kd * derivative));
  }
  static void reset() { integral = 0; previousError = 0; initialized = false; }
  static void check(boolean condition) { if (!condition) throw new AssertionError(); }
  public static void main(String[] args) {
    reset(); for (int i = 0; i < 3; i++) step(2, 0.1, 0, 0, 0);
    check(Math.abs(integral - 0.6) < 1e-9);
    reset(); step(1, 0.1, 0, 0, 0.1);
    double damping = step(0.8, 0.1, 0, 0, 0.1);
    check(Math.abs(damping + 0.2) < 1e-9);
    System.out.println("integral = 0.6 m*s; derivative contribution = -0.2; checks passed");
  }
}
