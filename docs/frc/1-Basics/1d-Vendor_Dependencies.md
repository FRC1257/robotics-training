# Vendor Dependencies

When we use hardware from a third-party source, we need to place what are called "vendor dependency" files into our robot program.

A prime example of such hardware would be a motor controller (see [Motors](https://frc1257.github.io/robotics-training/#/frc/1-Basics/2-Motors) for more detail). Say we are using a SPARK MAX controller from REV Robotics--in order for the controller to actually function, we need to get the vendor dependency (a `.json` file) from REV Robotics' [website](http://www.revrobotics.com/sparkmax-software/).

## Installing

The following steps for managing vendor dependencies **online** can be found on that site:

1. Open your robot project in VSCode.
2. Click on the WPI icon in the corner to open the WPI Command Pallet.
3. Select **Manage Vendor Libraries**.
4. Select **Install new library (online)**.
5. Enter the following installation URL and press ENTER:
`http://www.revrobotics.com/content/sw/max/sdk/REVRobotics.json`

If you are managing vendor dependencies **offline**, you must:

1. Download and unzip the latest SPARK MAX C++ API into the C:\Users\Public\wpilib\2020 directory on windows and ~/wpilib/2020 directory on Unix systems.
2. Follow the [Adding an offline-installed Library](https://docs.wpilib.org/en/latest/docs/software/wpilib-overview/3rd-party-libraries.html) instructions from WPI.

Similar steps can be followed with other devices, such as the [Talon SRX motor controller (or other motor controllers from CTRE)](https://phoenix-documentation.readthedocs.io/en/latest/ch05a_CppJava.html) and [navX-MXP gyroscope](https://pdocs.kauailabs.com/navx-mxp/software/roborio-libraries/java/).

## Updating

Over time, those third-party vendors will most likely release new updates, and will do so through a new vendor dependency file. Therefore, it's our job to check for updates regularly.

To update the vendor dependencies, the steps are similar to those above:

1. Open your robot project in VSCode.
2. Click on the WPI icon in the corner to open the WPI Command Pallet.
3. Select **Manage Vendor Libraries**.
4. Select **Check for updates (online)**. (Can also be **(offline)**).
5. If an update appears, click on it. Otherwise, you're all set.
