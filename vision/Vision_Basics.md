All of the material in this documentation was found at this [link](https://www.youtube.com/watch?v=rLwOkAJqImo) to a youtube video (1:06:39) from Team #254.
# When is vision used?
* The game has a reliable target
* A simpler sensor could not be used
* Can not align the robot manually (well or quickly)
* Quick alignment to the goal is required

##### Visual servoing - reliable pointing your robot at the target

## Requirements to use vision:
* Camera
* Hardware
* Target Detection (Limelight does all of these three)
* Control Loop

### Camera and Hardware
* Camera + Driver Station (latency but you get visual feedback)
* Camera + Roborio (slow but easy to do)
* External camera + External CPU (fast) - This is what the limelight allows

##### Reduce exposure, brightness, white balance, focus, and other settings to make the image as black as possible.

### Target Detection
Libraries that can be used are OpenCV, NIVision, and GRIP. Limelight uses its own software to do vision.
#### A vision algorithm consists of:
* Color threshold (Everything that is not the target is removed) - HSV Color thresholding is the best. HSV - hue, saturation, value
* Group together nearby pixels
* Shape threshold
  * Size/Shape
  * Countours
  * Fullness
  * Skew
* Find pixel locations of important points on the target

### Control Loop

##### Note: A green LED ring will not always produce a green light when you overexposure the image, which could affect your algorithm. This can be seen [here](https://youtu.be/rLwOkAJqImo?t=1046) in the video.
As long as you are not overexposing, Hue is the most important value for vision and should be tuned first.
* Hue is an angle
  * Green is 120 degrees
  * Blue is 0 degrees
  * Red is 240 degrees
##### Hue should be filtered as narrowly as possible. 



