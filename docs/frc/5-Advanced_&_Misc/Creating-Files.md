# Creating Files

Sometimes, we want to be able to write to files on our robot's local storage and then read this data at a later time. This is useful for logging information and then later reading it to create a graph. Here, we'll go over how exactly you can a) write a file during robot code and b) retrieve this file.

## Writing Files

Writing files on the RoboRIO is very similar to writing files in normal Java. However, there are two main things we could write to: the RoboRIO local storage itself or a flash drive plugged directly into the RoboRIO.

To write to a specific directory on the RoboRIO, we need to put `/home/lvuser` before the rest of the file path. This is because we want to write to the files for the `lvuser` account, which is the user account on the RoboRIO that runs all of the code.

To write to a flashdrive, we instead have to use the path `/u` or `/media/sda1`, provided that there is a flashdrive plugged into the USB port of the RoboRIO.

Once we have our path, we can use the following code (this example allows us to write directly to the RoboRIO):

```java
PrintWriter writer = null;

try {
    writer = new PrintWriter(new BufferedWriter(new FileWriter("/home/lvuser/test.txt")));
}
catch(IOException e) {
    e.printStackTrace();
}

if(writer != null) {
    writer.println("Hello World!");
    writer.close();
}

```

Let's break this down, since there are a lot of things that may be new here!

First of all, we create a `PrintWriter` object, which can essentially output data in a stream that leads to a destination we want. In this case, our target destination for the stream is the file.

Next, we have a `try catch` block. Essentially, there is a chance that an error could occur when trying to write this file. For instance, the file could be inaccessible. Java essentially tells us that we have to be ready to catch this error when if it occurs, which is what the try catch block does. We **try** to execute this code, and we **catch** the error (in this case `IOException`) if it occurs. In this case, we will print out the stack trace, which will tell us where the error was.

Inside of the `try` section, we're creating a lot of objects and passing them into each other. We first create a `FileWriter`, which points to the file we want to write to. Then, we surround it with a `BufferedWriter`, which allows us to buffer the data we send to it, enabling us to send large amounts of data efficiently. Then, we surround this again with a `PrintWriter`, which allows us to send formatted text easily.

Once we create this object, we can finally send some data to it. However, before we send data, we first have to check if the `PrintWriter` was even successfully created in the first place. If it wasn't, and we tried to write data to it, we would get a `NullPointerException`. However, if this check passes, we can then write data to it the exact same way we would write data to `System.out`: we can use `println` and `print`.

Finally, we have to close our `PrintWriter`, which is very important to make sure the resources are freed and we terminate the file properly. If we didn't do this, there would be a chance the file could corrupt.

If you want more info about `try catch` blocks, check out [this article](https://www.w3schools.com/java/java_try_catch.asp).

## Accessing Files on the RoboRIO

To access files on the RoboRIO, you must first install a program called [FileZilla](https://filezilla-project.org/download.php?type=client). Then, do the following steps:

1. Connect to the robot via a USB cable.
2. Enter `roboRIO-####-frc.local` in the Host box, where `####` is the team number.
3. Enter `lvuser` in the Username box.
4. Leave the Password box blank.
5. Enter `22` in the port box.
6. Press `Quickconnect`.

After this, you can browse through the RoboRIO filesystem on the right hand side, and you can drag and drop files to either add them to the robot or download them from the robot.

Refer to [this document from WPILib](https://docs.wpilib.org/en/stable/docs/software/roborio-info/roborio-ftp.html) for more details.
