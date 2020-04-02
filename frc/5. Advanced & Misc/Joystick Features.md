# Joystick Features

(Note: this post is mainly based off a paper from [this](https://www.chiefdelphi.com/t/joystick-scaling-deadband/355153) forum post.)

1257 generally uses Xbox controllers to interact with a robot. One is pictured below.

<img src="img/AmazonBasicsController.jpg" width="300px">

The two joysticks on such a controller are almost always in use, whether it be for moving a drivebase, an arm, or some other mechanism easily controlled with joystick input. However, the joysticks may not always be manufactured properly, and may return defective input due to mechanical error.  

To counteract this physical issue, we implement a few things in code. 

## Scaled Input

squared, cubed inputs

<img src="img/ScaledInputsDesmos.jpg" width="400px">


## Deadbanding

deadbanding!






