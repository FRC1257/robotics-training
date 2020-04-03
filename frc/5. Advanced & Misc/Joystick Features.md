# Joystick Features

(Note: this post is mainly based off a paper from [this](https://www.chiefdelphi.com/t/joystick-scaling-deadband/355153) forum post.)

Once again, 1257 generally uses Xbox controllers to interact with a robot. One is pictured below.

<img src="img/AmazonBasicsController.jpg" width="300px">

The two joysticks on such a controller are almost always in use, whether it be for moving a drivetrain, an arm, or some other mechanism easily controlled with joystick input. However, the joysticks could have mechanical defect, and therefore may return erroneous input. 

To counteract this physical issue, or to just increase precision, we can implement a few adjustments in code. For our purposes here, we'll mainly work with a drivetrain as an example.

## Scaled Input

To control a drivetrain, we would map a joystick's movement on the controller axis to corresponding motors. Take a look at this graph of **linear** joystick input: 

<img src="img/LinearInputDesmos.jpg" width="300px">

Here, the x-axis represents joystick position (where it is being read on the controller axis), and the y-axis is the motor output. In the context of a drivetrain motor, this input above would send unadjusted joystick input to the motor. Think of it this way: if a joystick was at the 0.5 position, the output would subsequently be `motor.set(0.5)`.

Controlling a drivetrain well requires a certain level of precision, especially when lining up to a position or performing slight turns. Once again, we generally try to increase precision through manipulating controller input. 

In order to make control more precise, especially at the smaller levels of input (0.0-0.4), we can raise joystick input to a certain power (moving from a linear to higher-order function). Lower inputs are achieved for the same joystick movement:

<img src="img/ScaledInputsDesmos.jpg" width="300px">

The blue curve represents **"squared input"** (x<sup>2</sup>), and the green curve represents **"cubed input"** (x<sup>3</sup>). We usually settle with just squared input, as cubing is generally a bit too drastic, but at the end of day, it all depends on the mechanism. 

Scaling inputs is just one way to achieve greater precision (especially at the lower levels) on mechanism control. 

## Deadbanding

We'll now move into another topic: deadbanding. This is a process that helps us adjust for any defect in the joysticks themselves that affects controller input. 

One situation where the joystick is inexact might be when it defaults to an input value *slightly* higher than 0, i.e. when no one touches the joystick but it still sends input. While that miniscule input probably won't move a large mechanism, it can definitely be problematic at times. Thus, implementing deadbanding is a good practice.

The general idea is to create what's called a "deadband," or essentially a neutral zone in which we dictate the input to be 0. This helps us avoid that slight "default" input described above. 

Here's a basic deadband input graph: 

<img src="img/BasicDeadband.jpg" width="350">

In this case, the deadband lies between -0.4 and 0.4. If the joystick defaults to any value between that range, the input is commanded to be 0. 

### Scaled Deadbanding








