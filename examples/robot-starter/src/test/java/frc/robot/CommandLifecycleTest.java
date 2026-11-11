package frc.robot;

import static org.junit.jupiter.api.Assertions.*;
import edu.wpi.first.hal.HAL;
import edu.wpi.first.wpilibj.DriverStation;
import edu.wpi.first.wpilibj.simulation.DriverStationSim;
import edu.wpi.first.wpilibj.simulation.SimHooks;
import edu.wpi.first.wpilibj2.command.Command;
import edu.wpi.first.wpilibj2.command.CommandScheduler;
import edu.wpi.first.wpilibj2.command.Commands;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CommandLifecycleTest {
  private final CommandScheduler scheduler = CommandScheduler.getInstance();
  private SimIntake intake;
  @BeforeEach void setUp() {
    assertTrue(HAL.initialize(500, 0));
    DriverStationSim.setEnabled(true);
    DriverStationSim.notifyNewData(); DriverStation.refreshData();
    intake = new SimIntake();
  }
  @AfterEach void cleanUp() {
    scheduler.cancelAll(); scheduler.unregisterAllSubsystems();
    DriverStationSim.setEnabled(false);
    DriverStationSim.notifyNewData(); DriverStation.refreshData();
  }
  @Test void cancellationStopsOutput() {
    Command run = Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake);
    scheduler.schedule(run); scheduler.run();
    assertEquals(0.5, intake.getSpeed());
    scheduler.cancel(run);
    assertEquals(0.0, intake.getSpeed());
  }
  @Test void conflictingRequirementInterruptsFirst() {
    Command first = Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake);
    Command second = Commands.run(() -> intake.setSpeed(-0.25), intake);
    scheduler.schedule(first); scheduler.run();
    scheduler.schedule(second);
    assertFalse(scheduler.isScheduled(first));
    assertEquals(0.0, intake.getSpeed());
    scheduler.run(); assertEquals(-0.25, intake.getSpeed());
  }
  @Test void timeoutStopsOutput() {
    SimHooks.pauseTiming();
    try {
      Command run = Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake)
          .withTimeout(2.0);
      scheduler.schedule(run); scheduler.run();
      assertEquals(0.5, intake.getSpeed());
      SimHooks.stepTiming(2.02); scheduler.run();
      assertFalse(scheduler.isScheduled(run));
      assertEquals(0.0, intake.getSpeed());
    } finally { SimHooks.resumeTiming(); }
  }
  @Test void disablingCancelsAndStops() {
    Command run = Commands.runEnd(() -> intake.setSpeed(0.5), () -> intake.setSpeed(0), intake);
    scheduler.schedule(run); scheduler.run();
    DriverStationSim.setEnabled(false);
    DriverStationSim.notifyNewData(); DriverStation.refreshData();
    scheduler.run();
    assertFalse(scheduler.isScheduled(run));
    assertEquals(0.0, intake.getSpeed());
  }
}
