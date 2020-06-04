# Setting Up

Welcome to the beginning of learning to program robots! Here we're going to get you started on programming some basic robots and later we can learn more about programming more advanced functionality such as closed loop control or outputting diagnostic data. First of all, we need to get set up with some projects.

## Using the GitHub template

First, you must make a GitHub account. I would recommend using a personal email for this. Then, go to this link:

[Snail Robot Template](https://github.com/FRC1257/snail-robot-template).

Then, click the green button labeled `Use this template`. Make sure that the `Owner` tag has **your** account under it. For the name, you can put anything you want, like `Learning-Robot-Code`. For repository visibility, you can choose either `Public` or `Private`, but I would personally choose `Private`. Every time you want to make a new robot project, you should follow these steps.

If you have a personal computer, please read the section `Visual Studio Code`. If you do not, read the section `Editing on GitHub`.

## Visual Studio Code

Please perform the following steps on a **personal** computer.

Go to this link:

[Setting Up WPILib](https://docs.wpilib.org/en/latest/docs/getting-started/getting-started-frc-control-system/wpilib-setup.html)

Follow the appropriate directions for your operating system. For the `Download VS Code` section, click the `Download` button. Afterwards, you should see WPILib VS Code icon on your desktop.

> [!TIP]
> Make sure you move the installer from the .zip file or else the installation of VS Code will not work

### Installing GitHub Desktop

Go to this link:

[GitHub Desktop Download](https://desktop.github.com/)

### Cloning the GitHub repository

Now, we have to bring the repository we created on GitHub into our computer. Open GitHub Desktop and sign into your account. Next, click `Clone a repository from the Internet` and find your repository. Click it and then edit the `Local path` to point to the location where you want the code to be stored. Essentially, this will allow you to bring a copy of the code from GitHub onto your computer. Then, you can edit the code on your computer and `Commit` them so that the changes are sent online.

### Editing in Visual Studio Code

GitHub desktop is important for managing your changes and sending them online, but we will be using Visual Studio Code to actually edit the robot code. Open Visual Studio Code (make sure you use the WPILib icon on your desktop) and in the top left, go to `File > Open Folder...`. Then, you can navigate to the folder that you cloned to and select it. Once the folder opens in VS Code, on the left you will see the entire project and all of the files / folders in it.

To build the robot code, or essentially compile it and check for syntax errors, you can open any file in the project and go to the top right where you will see the WPILib icon. Press it, and you will be greeted with various options such as `Build Robot Code` and `Deploy Robot Code`.

### Committing and Pushing Changes

After you make a change on your local version of the code in something like Visual Studio Code, make sure you **save** the file. If you see any white circles next to any of the tabs in VS Code, this means that the file is **not** saved. After making sure everything you want is saved, go back to GitHub Desktop. On the left, you should see any changed files appear. Make sure all of the file you want to commit are checked off, and then go to the bottom left, where you will see a box to enter your commit information. Essentially, you can package all of your changes into something known as a `commit`, which can contain a message describing what changes that commit did. For instance, some commit messages could be something like, "Adds Elevator Subsystem".

Once you commit your changes, you then need to `push` that commit to the online version of your repository. To do this, go to `Repository > Push`. After this, go back to the GitHub website in your browser and you should see the changes (you might need to refresh).

## Editing on GitHub

Editing the code directly on GitHub is not reccomended, but it can work to get you accustomed to robot code. However you will not be able to run your code / see errors on the GitHub website, which is unfortunate. Periodically, we will allow students to access computers so that they can test the code they have written on GitHub.

To edit a file on GitHub, navigate to the file and click the pencil icon in the top right corner. This will allow you to edit the file directly in the browser. After you are done editing, you can go to the bottom where you can add a message describing your edit and then finally `commit` it.
