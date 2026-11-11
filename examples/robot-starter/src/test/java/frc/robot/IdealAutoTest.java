package frc.robot;
import static org.junit.jupiter.api.Assertions.*;
import edu.wpi.first.hal.HAL;
import edu.wpi.first.math.geometry.Pose2d;
import edu.wpi.first.math.geometry.Rotation2d;
import edu.wpi.first.math.kinematics.ChassisSpeeds;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class IdealAutoTest {
  private static final double EPS = 1e-8;
  @BeforeAll static void initialize() { assertTrue(HAL.initialize(500, 0)); }
  private IdealHolonomicAuto newAuto() {
    return new IdealHolonomicAuto(new Pose2d(-0.25, 0.30, Rotation2d.fromDegrees(20)));
  }
  @Test void trajectoryStartsAndEndsAtRequestedRestPoses() {
    var path = newAuto().trajectory();
    var start = path.sample(0); var end = path.sample(path.getTotalTimeSeconds());
    assertEquals(0, start.poseMeters.getX(), EPS); assertEquals(0, start.poseMeters.getY(), EPS);
    assertEquals(0, start.velocityMetersPerSecond, EPS);
    assertEquals(2, end.poseMeters.getX(), EPS); assertEquals(0, end.poseMeters.getY(), EPS);
    assertEquals(0, end.velocityMetersPerSecond, EPS);
  }
  @Test void fieldForwardAtNinetyDegreesIsRobotRight() {
    ChassisSpeeds robot = ChassisSpeeds.fromFieldRelativeSpeeds(1, 0, 0, Rotation2d.fromDegrees(90));
    assertEquals(0, robot.vxMetersPerSecond, EPS); assertEquals(-1, robot.vyMetersPerSecond, EPS);
    assertEquals(0, robot.omegaRadiansPerSecond, EPS);
  }
  @Test void tracksFromOffsetAndRespectsModuleLimit() {
    var auto = newAuto();
    double initialError = auto.pose().getTranslation().getDistance(auto.trajectory().getInitialPose().getTranslation());
    auto.runToEnd();
    double finalError = auto.pose().getTranslation().getDistance(auto.trajectory().sample(auto.trajectory().getTotalTimeSeconds()).poseMeters.getTranslation());
    assertTrue(initialError > 0.3);
    assertTrue(finalError < 0.03, "final position error " + finalError);
    assertTrue(Math.abs(auto.pose().getRotation().getRadians()) < Math.toRadians(2));
    assertTrue(auto.peakModuleSpeed() <= IdealHolonomicAuto.MAX_MODULE_MPS + EPS);
    assertTrue(auto.peakModuleSpeed() > 0.5);
  }
  @Test void desaturatesALargeInitialCorrection() {
    var auto = new IdealHolonomicAuto(new Pose2d(-2, 1, Rotation2d.fromDegrees(90)));
    auto.step(0);
    assertEquals(IdealHolonomicAuto.MAX_MODULE_MPS, auto.peakModuleSpeed(), 1e-8);
  }
  @Test void fieldCorrectionMovesTowardTargetWhenRobotFacesLeft() {
    var auto = new IdealHolonomicAuto(new Pose2d(0, -0.5, Rotation2d.fromDegrees(90)));
    auto.step(0);
    // Target is at field origin; field +y is initially robot +x at heading +90 degrees.
    assertTrue(auto.pose().getY() > -0.5);
    assertEquals(0, auto.pose().getX(), 0.001);
  }
  @Test void reportRun() {
    var auto = newAuto(); auto.runToEnd();
    System.out.printf("Ideal auto: trajectory %.2f s; final pose x=%.3f m y=%.3f m heading=%.2f deg; peak module speed=%.3f m/s%n",
        auto.trajectory().getTotalTimeSeconds(), auto.pose().getX(), auto.pose().getY(),
        auto.pose().getRotation().getDegrees(), auto.peakModuleSpeed());
    assertTrue(auto.pose().getTranslation().getDistance(auto.trajectory().sample(auto.trajectory().getTotalTimeSeconds()).poseMeters.getTranslation()) < 0.03);
  }
}
