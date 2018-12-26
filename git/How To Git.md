# How to Git

**Step 1.** Go to the repository you want to clone. For instance, if I wanted to clone 
<https://github.com/FRC1257/robotics-training>, I would go to the link. Click on the big green "Clone or Download"
button and click on the clipboard icon that appears.

**Step 2.** Go to your command line. Type `git clone [Hit Control-V]` into your command line and press Enter. 
For instance, for my purposes, I would type `git clone https://github.com/FRC1257/robotics-training.git`.

**Step 3.** Type `cd [Repository]`. For my purposes, I would type `cd robotics-training`.

**Step 4.** Make your changes. If you want to add new files, make sure to **put them into the repository**.

**Step 5.** Type `git add .`. Hit Enter.

**Step 6.** Type `git commit -m "[Message you want to type]"`. Hit Enter.

**Step 7.** Type `git push` and hit Enter.

# Simpler Version

Just use VSCode. When the repository's folder is open in VSCode, the symbol that looks like a Y on the side offers controls for Git, which can be used.

To add files, hover over the file name and click the `+` icon.
To commit files, type a message in and click the checkmark icon.
To push files and access other commands, go to the `...` icon and inside, there are many useful commands
To use Git branches, it is a bit more complicated. Hit `Ctrl+Shift+P` (`Cmd+Shift+P` on MacOS) and type in `Git Checkout` and use that command for checkout. For creating branches, type `Git Create Branch`.

Note however that understsanding how to use the command line is still encouraged, as VSCode is not flawless and there are times where you might want to use the command line. However, using VSCode is still an easier option.
