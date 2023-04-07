# PhotonVision
PhotonVision is a cross-platform vision processing library that can be used on a Raspberry Pi or a desktop computer. The software can be found [here](https://photonvision.org/) and is available for Windows, Mac, and Linux. 

PhotonVision allows you to configure the vision processing pipeline and then send the target data to the RoboRIO on the Network table.

For information about how to install the PhotonVision software and access the dashboard, visit the [official PhotonVision documentation](https://docs.photonvision.org/en/latest/)

## Hardware
PhotonVision can be used with any camera that supports the [Video for Linux](https://en.wikipedia.org/wiki/Video4Linux) (V4L) standard. This includes USB cameras, the Raspberry Pi camera, and the [Axis 206 camera](https://www.axis.com/en-us/products/axis-206).

Our setup uses 2 USB cameras, one for the front and one for the back. We also use a Raspberry Pi 4 which runs PhotonVision. The Raspberry Pi is connected to the radio via Ethernet as well.
