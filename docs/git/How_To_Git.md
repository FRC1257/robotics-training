# How to Git (Command Line and VSCode)

Make sure you install git first from https://git-scm.com/downloads.

## Clone an Existing Repository and Make Changes

**Step 1.** Go to the repository you want to clone. For instance, if I wanted to clone 
<https://github.com/FRC1257/robotics-training>, I would go to the link, click on the big green "Clone or Download"
button, and click on the clipboard icon that appears. For my purposes, I would type `git clone https://github.com/FRC1257/robotics-training.git`.

**Step 2.** Go to your command line. Use `cd [directory]` to get to the desired directory and press enter. Then use `git clone `, paste the link after `clone`, and press enter.

**Step 3.** Type `cd [Repository]` to change your current directory to the desired one. For my purposes, I would type `cd robotics-training`.

**Step 4.** Make your changes. If you want to add new files, make sure to **put them into the repository**.

**Step 5.** Type `git add .` to add all of the changes to the stage. If you only want to add certain files, you can do `git add "[filepath]` for each file you want. Then hit enter.

**Step 6.** Type `git commit -m "[Message]"` and hit enter. Make sure the message is descriptive with the actual contents of the change.

**Step 7.** Type `git push` and hit enter.

### VSCode Integration

After Step 2, you can use VSCode for everything else. When the repository's folder is open in VSCode, the symbol that looks like a Y on the side offers controls for Git, which can be used.

To add files, hover over the file name and click the `+` icon.
To commit files, type a message in and click the checkmark icon.
To push files and access other commands, go to the `...` icon and inside, there are many useful commands
To use Git branches, it is a bit more complicated. Hit `Ctrl+Shift+P` (`Cmd+Shift+P` on MacOS) and type in `Git Checkout` and use that command for checkout. For creating branches, type `Git Create Branch`.

Note however that understsanding how to use the command line is still encouraged, as VSCode is not flawless and there are times where you might want to use the command line. However, using VSCode is still an easier option.

## Add an Existing Local Project to GitHub

**Step 1.** Use `cd [directory]` and press enter to get to the folder you want to put on GitHub.

**Step 2.** Type `git init` and press enter to create a repository in this folder.

**Step 3.** Type `git add .` to add all of the files to the stage. If you only want to add certain files, you can do `git add "[filepath]` for each file you want. Then hit enter.

**Step 4.** Type `git commit -m [Message]`. In this case, the message would probably be something like "Initial Commit" and then a bit more detail. For instance, a message could be "Initial Commit with basic Java/FRC tutorials". Press enter.

**Step 5.** Go on github.com and create a new repository. If you want to make it under a team and not under your own account, make sure you go to the team page and press `New`. Otherwise press the `+` button in the top right.

**Step 6.** Fill in basic details. Do not initialize the repository with a README.md file.

**Step 7.** Scroll down to the section "…or push an existing repository from the command line"

**Step 8.** Copy and paste those 2 commands into your command prompt and press enter.

