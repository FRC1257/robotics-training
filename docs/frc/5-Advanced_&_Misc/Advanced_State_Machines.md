# Advanced State Machines

In the past, we've covered some very basic state machines such as for an intake, which only has three states: neutral, intaking, and ejecting. We transitioned between these states depending on button presses, and there wasn't really much else about it. We then added some more spice to the mix by introducing various PID states we can use, where we stay in that PID state until we're finished going to our setpoint. We can automate leaving the PID state, which adds a bit more complexity to our subsystems. However, we're not really using the full power of a state machine, so we're going to go over some more complex examples from previous years that can hopefully show you why they are so powerful.

## 2019 Climb

In 2019, one of the hardest tasks of the game was to build a climbing mechanism that could elevate our robot around 4 feet into the air and then go onto a podium-like platform. To do so, we build something we called the "hovercar," where we would use pneumatics to push up on a set of pistons (one in front, one in back) to raise our entire robot. Then, there would be wheels on the bottom of each set of pistons to allow us to drive around. We could then retract one side of the pistons and drive our robot on top of the platform. Then, we could retract the other set of pistons.

There are two parts of the state machine that I want to talk about here. First of all, we will go over the initial basic transition system we used. Rather than having it be manual control where the user can control whether or not the front and back pistons are extended or raised, we decided to utilize the power of a state machine. Essentially, our climb would be broken down into a series of stages that we could move between.

- On the ground with both pistons retracted (starting)
- Fully raised with both pistons extended. We can now control the hovercar wheels as well.
- Half raised with one side retracted. We can still control the hovercar wheels
- Fully retract the pistons (back to start)

Since the 4th stage is technically the same as the beginning, we really only have 3 different stages to consider. To make the process as easy as possible, we made it so that we would use the same button to advance from one stage to the next (we also had a back button in case we double-tapped the button or something went wrong). Therefore, we had a bit more advanced of a state machine where once we pressed the button, we had to transition to a **different** state depending on which one we were already in. Let's take a look at the code to break this down.

```java
public void update() {
    switch (state) {
        case GROUND:
            retractFront();
            retractBack();
            break;
        case EXTENDED:
            extendFront();
            extendBack();
            break;
        case HALF:
            extendFront();
            retractBack();
            break;
}


/**
  * Go to the next state of the climb
  */
public void advanceClimb() {
    switch (state) {
        case GROUND:
            state = State.EXTENDED;
            break;
        case EXTENDED:
            state = State.HALF;
            break;
        case HALF:
            state = State.GROUND;
            break;
    }
}
```

As you can see, the code really isn't that complicated, but it makes good use of the state machine! Our actual final climb code was a bit more complicated than this, but we'll get into that when we do a full case study on that later.

## 2020 Indexer

In 2020, we built a system where the balls would be fed from our roller intake into a series of conveyor belts known as an **indexer**. It was very important in that year to maintain good, consistent spacing between the balls so that a) we could fit our maximum amount (5) and b) the balls didn't collide with each other and stick together. We had a few options to fix this issue:

- Use PID to move the conveyor belts a certain distance each time.
  - This was our original plan, but it unfortunately didn't work because the distance we had to move and the control effort we had to put in were varied due to the friction of balls on the ground and the compression of the balls.
- Put 2 breakbeam sensors in our indexer and after detecting a ball in the starting breakbeam, run the indexer until the ending breakbeam was no longer triggered.
  - Sometimes, there would be cases where the ball would overshoot the desired destination, leading to inconsistent spacing. This could be fixed by lowering the speed, but that would lead to a slow indexing process.
- Use the same two breakbeam sensor setup as before, but use a more advanced control sequence that we will discuss in a bit.
  - This was a good idea in theory, but unfortunately it didn't work out because the compression of the ball would still lead to wide gaps between balls. If our indexer had been better designed to reduce compression, this idea may have worked out.
- Control the indexer manually.
  - This was possible, but hard to control accurately and quickly to get 5 balls. With this, we had to mostly settle for 3-5.

Ultimately, we settled for the last one (manual control), but the second to last one definitely had merit. Even if it didn't end up being the final decision choice, it's still a good idea to review exactly what it was and how we implemented it with a state machine.

### Indexer Procedure

- Constantly check if the bottom breakbeam is triggered. Once it is, begin the procedure.
- At a medium speed, move the ball up until it is outside of the top breakbeam. At this point, it may have overshot due to the medium speed and gone to an unknown location
- At a slow speed, move the ball down until it is touching the top breakbeam again.
- Finally, nudge the ball up until it is no longer touching the bottom breakbeam.

With this simple setup, we can practically guarantee the ball will be in the same position, while still moving up at a pretty decent speed. Additionally, it looks really cool while in action to see the ball settle in place properly.

### Implementation

To implement this in code, we took full advantage of our state machines. All of the code is below:

```java
public void update() {
    updateDistance();

    switch(state) {
        case NEUTRAL:
            conveyorMotorFrontBottom.set(Constants.Indexer.INDEXER_CONVEYOR_NEUTRAL_SPEED);

            // automatically index once it sees a ball
            if (ballAtBot()) {
                state = State.CELL_RAISING;
            }
            break;
        // automatic indexing
        case CELL_RAISING:
            if (!ballAtBot()) {
                state = State.CELL_RETURNING;
            }
            else {
                conveyorMotorFrontBottom.set(Constants.Indexer.INDEXER_CONVEYOR_RAISE_SPEED);
            }
            break;
        case CELL_RETURNING:
            if (ballAtBot()) {
                state = State.CELL_NUDGING;
            }
            else {
                conveyorMotorFrontBottom.set(Constants.Indexer.INDEXER_CONVEYOR_RETURN_SPEED);
            }
            break;
        case CELL_NUDGING:
            if (!ballAtBot()) {
                state = State.NEUTRAL;
            }
            else {
                conveyorMotorFrontBottom.set(Constants.Indexer.INDEXER_CONVEYOR_NUDGE_SPEED);
            }
            break;
    }
}
```

Here, we have the utility functions `ballAtBot()` which just returns if either one of the bottom breakbeams is being triggered. I would recommend taking a deep look at the code to understand how it works and how it matches up with the procedure.

## Other Teams

However, we've pretty much only scratched the surface of what advanced state machines can do. Some teams like 254 have incredible complex diagrams describing their subsystems, and I've linked some slides [here](https://docs.google.com/presentation/d/1vrv-aebFZg28hukV3vMppd1Hblmn5c8zNrXZs6sEqlE/edit#slide=id.g75dbcb7fac_0_95).
