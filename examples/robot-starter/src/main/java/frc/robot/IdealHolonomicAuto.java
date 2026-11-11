package frc.robot;
import edu.wpi.first.math.controller.HolonomicDriveController;
import edu.wpi.first.math.controller.PIDController;
import edu.wpi.first.math.controller.ProfiledPIDController;
import edu.wpi.first.math.geometry.Pose2d;
import edu.wpi.first.math.geometry.Rotation2d;
import edu.wpi.first.math.geometry.Translation2d;
import edu.wpi.first.math.geometry.Twist2d;
import edu.wpi.first.math.kinematics.ChassisSpeeds;
import edu.wpi.first.math.kinematics.SwerveDriveKinematics;
import edu.wpi.first.math.kinematics.SwerveModuleState;
import edu.wpi.first.math.trajectory.Trajectory;
import edu.wpi.first.math.trajectory.TrajectoryConfig;
import edu.wpi.first.math.trajectory.TrajectoryGenerator;
import edu.wpi.first.math.trajectory.TrapezoidProfile;
import java.util.List;

/** Ideal kinematics only: no actuators, sensors, latency, slip, or motor physics. */
public final class IdealHolonomicAuto {
  public static final double DT = 0.02;
  public static final double MAX_MODULE_MPS = 1.5;
  public static final double SETTLE_SECONDS = 2.0;
  private final SwerveDriveKinematics kinematics = new SwerveDriveKinematics(
      new Translation2d(0.3, 0.3), new Translation2d(0.3, -0.3),
      new Translation2d(-0.3, 0.3), new Translation2d(-0.3, -0.3));
  private final HolonomicDriveController controller = new HolonomicDriveController(
      new PIDController(2.0, 0, 0, DT), new PIDController(2.0, 0, 0, DT),
      new ProfiledPIDController(3.0, 0, 0,
          new TrapezoidProfile.Constraints(2.0, 3.0), DT));
  private final Trajectory trajectory = TrajectoryGenerator.generateTrajectory(
      new Pose2d(0, 0, new Rotation2d()), List.of(),
      new Pose2d(2, 0, new Rotation2d()), new TrajectoryConfig(1.0, 1.0));
  private Pose2d pose;
  private double peakModuleSpeed;
  public IdealHolonomicAuto(Pose2d initialPose) { pose = initialPose; }
  public Trajectory trajectory() { return trajectory; }
  public Pose2d pose() { return pose; }
  public double peakModuleSpeed() { return peakModuleSpeed; }
  /** One 20 ms control step. Time refers to the start of this integration interval. */
  public void step(double timeSeconds) {
    var target = trajectory.sample(Math.min(timeSeconds, trajectory.getTotalTimeSeconds()));
    // Path tangent is travel direction; desired robot heading is independently zero.
    ChassisSpeeds command = controller.calculate(pose, target, new Rotation2d());
    SwerveModuleState[] states = kinematics.toSwerveModuleStates(command);
    SwerveDriveKinematics.desaturateWheelSpeeds(states, MAX_MODULE_MPS);
    for (SwerveModuleState state : states)
      peakModuleSpeed = Math.max(peakModuleSpeed, Math.abs(state.speedMetersPerSecond));
    // Ideal wheels immediately realize the post-desaturation module velocities.
    ChassisSpeeds achieved = kinematics.toChassisSpeeds(states);
    pose = pose.exp(new Twist2d(achieved.vxMetersPerSecond * DT,
        achieved.vyMetersPerSecond * DT, achieved.omegaRadiansPerSecond * DT));
  }
  public void runToEnd() {
    int steps = (int) Math.ceil((trajectory.getTotalTimeSeconds() + SETTLE_SECONDS) / DT);
    for (int i = 0; i < steps; i++) step(i * DT);
  }
}
