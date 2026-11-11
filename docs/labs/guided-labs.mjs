// A progressive-disclosure layer over the existing labs. It does not change models.
const click = (id) => ["click", id];
const change = (id, value) => ["change", id, value];
const scenario = (id) => ["scenario", id];
const advance = (steps) => ["advance", steps];
const pidSteps = (steps) => ["pidSteps", steps];
const stage = (title, explanation, actions = []) => ({
  title,
  explanation,
  actions,
});
const mechanism = (title, stages) => ({ title, mechanism: true, stages });
export const GUIDES = {
  pid: {
    title: "See feedback and gravity",
    stages: [
      stage(
        "Gravity leaves a gap",
        "The dashed line is the 1 m target. The blue position settles below it: feedback needs a persistent error to support the constant downward load.",
        [change("preset", "default"), pidSteps(500)],
      ),
      stage(
        "Add gravity compensation",
        "Now the model adds 2 N of feedforward. Compare the position and error with the previous step; the controller needs less persistent error to support the load.",
        [change("preset", "default"), change("ff", 2), pidSteps(500)],
      ),
      stage(
        "Change the target",
        "This new experiment starts at zero with a 1.5 m target and the same gravity compensation. The blue position follows the new target. Output limits and windup are available in Explore controls.",
        [
          change("preset", "default"),
          change("ff", 2),
          change("setpoint", 1.5),
          pidSteps(500),
        ],
      ),
    ],
  },
  swerve: {
    title: "Predict the wheel directions",
    stages: [
      stage(
        "Move forward",
        "All four velocity arrows point forward when the chassis translates without turning.",
        [change("preset", "translation"), change("optimize", false)],
      ),
      stage(
        "Rotate in place",
        "With no translation, each module's velocity is tangent to its circle around the center.",
        [change("preset", "rotation"), change("optimize", false)],
      ),
      stage(
        "Combine and limit",
        "Translation and rotation combine. A single scale reduces every module velocity when the speed limit is exceeded.",
        [change("preset", "mixed"), change("optimize", false)],
      ),
    ],
  },
  scheduler: {
    title: "Who owns the motor?",
    stages: [
      stage(
        "An idle subsystem",
        "After one cycle the default command owns the available requirement.",
        [click("tick")],
      ),
      stage(
        "Press the button",
        "The held command interrupts the default and requests positive output.",
        [click("tick"), click("press")],
      ),
      stage(
        "Schedule a conflict",
        "The new command takes the same requirement; the held command ends and the motor reverses.",
        [click("tick"), click("press"), click("conflict")],
      ),
      stage(
        "Finish the conflict",
        "The default is scheduled again. A held command interrupted while its button stays held does not restart until another press.",
        [click("tick"), click("press"), click("conflict"), click("finish")],
      ),
    ],
  },
  encoder: {
    title: "From turns to a known zero",
    stages: [
      stage(
        "Convert motor turns",
        "Twelve motor turns through a 6:1 reduction make two output turns. The displayed distance assumes a 0.1 m pulley and no slip.",
      ),
      stage(
        "Interpret the switch",
        "For an active-low switch, raw low means pressed. Electrical state and interpreted switch state are different.",
        [change("activeLow", true)],
      ),
      stage(
        "Record home, then move",
        "The pressed switch records the current 12-turn reading as home. At 18 motor turns, the displayed travel is one pulley revolution from that reference.",
        [change("activeLow", true), click("home"), change("motorTurns", 18)],
      ),
    ],
  },
  motion: {
    title: "Compare motion references",
    stages: [
      stage(
        "A long move",
        "For 8 m, the reference reaches its speed limit and has a cruise phase. It describes a requested move, not actual tracking.",
        [change("distance", 8)],
      ),
      stage(
        "A short move",
        "At 1 m there is not enough distance to reach the same speed limit: acceleration changes directly to deceleration.",
        [change("distance", 1)],
      ),
      stage(
        "Reduce acceleration",
        "With the same 1 m distance and a lower acceleration limit, compare the reported duration and peak speed.",
        [change("distance", 1), change("maxAcceleration", 0.25)],
      ),
    ],
  },
  log: {
    title: "Read independent log samples",
    stages: [
      stage(
        "Find enabled time",
        "Green shading follows recorded enable transitions. Before the first transition, an unshaded area does not establish the state.",
      ),
      stage(
        "Find a voltage sample",
        "A battery sample at 19.690089 s is about 11.66 V. Blue and orange points use separate vertical axes.",
      ),
      stage(
        "Compare timestamps carefully",
        "Module velocity at 20.434111 s is a separate sample, about 0.044 rad/s. Nearby samples alone do not establish cause, displacement, or a transient peak.",
      ),
    ],
  },
  odometry: {
    title: "See drift and delayed evidence",
    stages: [
      stage(
        "Odometry without correction",
        "Correction strength is zero. The synthetic estimate accumulates its modeled bias as it follows the path.",
        [change("gain", 0)],
      ),
      stage(
        "Apply an observation",
        "A partial correction uses a simulated observation at its capture time. Compare final errors, while remembering observations also contain error.",
        [change("gain", 0.5)],
      ),
      stage(
        "Deliver observations later",
        "The observation delay is now 2 seconds. Compare the capture and delivery times; pending observations at the end are not applied.",
        [change("gain", 0.5), change("latencySteps", 20)],
      ),
    ],
  },
  "fixed-shooter": mechanism("Aim before feeding", [
    stage(
      "Start at rest",
      "The fixed shooter turns the whole chassis. A detected piece alone does not make it ready.",
    ),
    stage(
      "Spin up and turn",
      "At 1.5 simulated seconds, the wheel is near target but the chassis has not yet reached its 3 rad goal.",
      [scenario("ready"), scenario("heading"), advance(75)],
    ),
    stage(
      "Both gates are met",
      "After 1.98 simulated seconds, the model is aimed and at speed, so it requests feed.",
      [scenario("ready"), scenario("heading"), advance(99)],
    ),
    stage(
      "The piece is spent",
      "Once fed, this model requires the simulated piece sensor to clear before reloading. This is a teaching model, not team Java execution.",
      [scenario("ready"), scenario("heading"), advance(149)],
    ),
  ]),
  "turret-shooter": mechanism("Aim within travel limits", [
    stage(
      "Start at rest",
      "The turret can turn independently of the chassis; the marked travel envelope is an illustrative model assumption.",
    ),
    stage(
      "Request an unreachable direction",
      "No equivalent of 3.1 rad lies inside ±2.6 rad, so this model blocks turning and feeding.",
      [scenario("ready"), scenario("unreachable"), advance(1)],
    ),
    stage(
      "Choose an equivalent direction",
      "The target 2π + 0.5 rad has an equivalent at 0.5 rad within the limits. After moving and spinning up, feeding can begin.",
      [scenario("ready"), scenario("equivalent"), advance(70)],
    ),
  ]),
  "piece-handling": mechanism("Follow the sensor priority", [
    stage(
      "Collect",
      "With a request and clear sensors, the model runs the rollers to collect.",
      [scenario("ready"), advance(30)],
    ),
    stage(
      "Both front sensors",
      "When both front inputs are true, the handoff branch requests a slower roller output.",
      [scenario("ready"), scenario("both-front"), advance(1)],
    ),
    stage(
      "Back sensor takes priority",
      "The back sensor is checked first. With it asserted, the model holds even when the front inputs are also true.",
      [scenario("ready"), scenario("both-front"), scenario("back"), advance(1)],
    ),
  ]),
  "elevator-wrist": mechanism("Make room for the wrist", [
    stage(
      "No home reference",
      "A fresh request cannot move this model until a home reference is recorded.",
      [scenario("unhomed"), advance(1)],
    ),
    stage(
      "Home, then raise",
      "The home scenario records a simulated switch. The elevator raises before the wrist may pass the illustrative 0.2 rad clearance.",
      [scenario("ready"), advance(14)],
    ),
    stage(
      "Move into the goal",
      "Once above the 0.3 m clearance, the wrist can continue toward its goal as the elevator rises.",
      [scenario("ready"), advance(100)],
    ),
    stage(
      "Reject incompatible goals",
      "A low height together with an extended wrist is rejected by this teaching rule; it is not a measured robot safety envelope.",
      [scenario("ready"), advance(100), scenario("low"), advance(1)],
    ),
  ]),
  "telescoping-arm": mechanism("Align before extending", [
    stage(
      "No home reference",
      "A fresh request is blocked until the model records its simulated home switch.",
      [scenario("unhomed"), advance(1)],
    ),
    stage(
      "Turn the shoulder",
      "After homing, the shoulder moves toward its goal while the extension stays near zero.",
      [scenario("ready"), scenario("swing"), advance(74)],
    ),
    stage(
      "Extend after alignment",
      "Once shoulder error reaches the model’s 0.1 rad tolerance, extension is allowed.",
      [scenario("ready"), scenario("swing"), advance(100)],
    ),
  ]),
  drivetrain: mechanism("Compare swerve and differential", [
    stage(
      "Swerve can move sideways",
      "A robot-relative sideways request moves the ideal swerve model left.",
      [scenario("ready"), scenario("swerve"), scenario("strafe"), advance(50)],
    ),
    stage(
      "Differential cannot strafe",
      "The same lateral request is discarded in differential mode; it can still move forward and turn.",
      [
        scenario("ready"),
        scenario("differential"),
        scenario("strafe"),
        advance(50),
      ],
    ),
    stage(
      "Drive a turning arc",
      "Forward velocity and rotation together trace an arc. This ideal kinematic model omits slip and motor dynamics.",
      [scenario("ready"), advance(50)],
    ),
  ]),
  "climb-balance": mechanism("Home and detect before lifting", [
    stage(
      "No home reference",
      "A fresh request is blocked before the model records home.",
      [scenario("unhomed"), advance(1)],
    ),
    stage(
      "Homed but waiting",
      "After a simulated home event, the lift still waits for the cage sensor.",
      [scenario("ready"), advance(1)],
    ),
    stage(
      "Cage detected",
      "The model permits lifting after the sensor is asserted. Detection does not prove engagement or load retention.",
      [scenario("ready"), scenario("cage"), advance(100)],
    ),
    stage(
      "Sensor lost",
      "When the sensor is no longer asserted, the modeled lift stops. This is not a balance simulation.",
      [
        scenario("ready"),
        scenario("cage"),
        advance(100),
        scenario("cage-lost"),
        advance(1),
      ],
    ),
  ]),
};

function detectLab(doc) {
  if (doc.body.dataset.demo) return doc.body.dataset.demo;
  const page = doc.body.dataset.pageId || globalThis.location?.pathname || "";
  return page
    .split("/")
    .pop()
    .replace(/\.html$/i, "")
    .replace(/^mechanism-/, "");
}
function inputChange(element, value) {
  if (element.type === "checkbox") element.checked = Boolean(value);
  else element.value = String(value);
  element.dispatchEvent(
    new Event(element.type === "range" ? "input" : "change", { bubbles: true }),
  );
}
function findAction(doc, action) {
  const [type, id] = action;
  if (type === "scenario") return doc.querySelector(`[data-scenario="${id}"]`);
  if (type === "click" || type === "change") return doc.getElementById(id);
  if (type === "pidSteps") return doc.getElementById("step");
  return type === "advance" ? globalThis.mechanismDemo : null;
}
function markHidden(doc, id, isMechanism) {
  const main = doc.querySelector("main");
  if (isMechanism) {
    for (const element of main.querySelectorAll(
      ":scope > .mech-toolbar, :scope > .mech-pending, :scope > .card, .mech-controls, .mech-readouts",
    ))
      element.dataset.guidedHide = "";
    return;
  }
  const target = {
    pid: "plot",
    swerve: "diagram",
    scheduler: "state",
    encoder: "result",
    motion: "result",
    log: "plot",
    odometry: "plot",
  }[id];
  const view = doc.getElementById(target)?.closest(".card");
  if (!view) throw new Error(`Missing visual for ${id}`);
  for (const element of main.querySelectorAll(
    ":scope > .intro, :scope > .card, :scope > .layout > .card",
  ))
    if (element !== view) element.dataset.guidedHide = "";
  if (id === "scheduler") {
    const controls = view.querySelector(".buttons");
    if (controls) controls.dataset.guidedHide = "";
  }
  if (id === "pid" || id === "log")
    for (const table of view.querySelectorAll("table"))
      table.dataset.guidedHide = "";
}
function waitForMechanism(doc) {
  if (globalThis.mechanismDemo && doc.querySelector('#mech[data-ready="1"]'))
    return Promise.resolve(true);
  return new Promise((resolve) => {
    let finished = false;
    const finish = (value) => {
      if (finished) return;
      finished = true;
      observer.disconnect();
      clearTimeout(timer);
      resolve(value);
    };
    const observer = new MutationObserver(() => {
      if (
        globalThis.mechanismDemo &&
        doc.querySelector('#mech[data-ready="1"]')
      )
        finish(true);
    });
    observer.observe(doc.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-ready"],
    });
    const timer = setTimeout(() => finish(false), 10000);
  });
}
export async function initializeGuided(doc = globalThis.document) {
  if (!doc?.body || doc.body.dataset.guidedInitialized) return false;
  const id = detectLab(doc),
    guide = GUIDES[id];
  if (!guide) return false;
  if (guide.mechanism && !(await waitForMechanism(doc))) return false;
  const main = doc.querySelector("main");
  if (!main) return false;
  // Check the whole guide before changing the interface; failed integrations stay usable.
  const reset = doc.getElementById(guide.mechanism ? "mech-reset" : "reset");
  if (id !== "log" && !reset) return false;
  for (const step of guide.stages)
    for (const action of step.actions)
      if (!findAction(doc, action)) return false;
  if (id === "pid" && !doc.getElementById("toggle")) return false;
  if (id === "pid") {
    const compact = doc.createElement("output");
    compact.id = "guided-result";
    compact.className = "guided-result";
    doc.getElementById("plot").closest(".card").append(compact);
    const source = doc.getElementById("summary");
    const sync = () => {
      compact.textContent = source.textContent
        .split(" · ")
        .slice(1, 3)
        .join(" · ");
    };
    sync();
    new MutationObserver(sync).observe(source, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    for (const id of ["summary", "feedback"])
      doc.getElementById(id).dataset.guidedHide = "";
  }
  const panel = doc.createElement("section");
  panel.id = "lab-guide";
  panel.className = "guided-panel";
  panel.setAttribute("aria-labelledby", "guided-heading");
  const eyebrow = doc.createElement("p");
  eyebrow.className = "guided-kicker";
  eyebrow.textContent = "GUIDED WALKTHROUGH";
  const heading = doc.createElement("h2");
  heading.id = "guided-heading";
  heading.textContent = guide.title;
  const progress = doc.createElement("p");
  progress.className = "guided-progress";
  const live = doc.createElement("div");
  live.className = "guided-copy";
  live.setAttribute("role", "status");
  live.setAttribute("aria-live", "polite");
  live.setAttribute("aria-atomic", "true");
  const stepTitle = doc.createElement("h3"),
    explanation = doc.createElement("p");
  live.append(stepTitle, explanation);
  const sourceStatus = doc.createElement("p");
  sourceStatus.className = "guided-data-status";
  if (id === "log") {
    const source = doc.getElementById("status");
    const sync = () => {
      sourceStatus.textContent = source.textContent;
    };
    sync();
    new MutationObserver(sync).observe(source, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }
  const controls = doc.createElement("div");
  controls.className = "guided-actions";
  const back = doc.createElement("button");
  back.id = "lab-guide-prev";
  back.type = "button";
  back.textContent = "Back";
  back.setAttribute("aria-label", "Previous guided step");
  const next = doc.createElement("button");
  next.id = "lab-guide-next";
  next.type = "button";
  next.textContent = "Next";
  next.setAttribute("aria-label", "Next guided step");
  const explore = doc.createElement("button");
  explore.id = "lab-guide-explore";
  explore.type = "button";
  explore.className = "guided-explore";
  explore.textContent = "Explore controls";
  explore.setAttribute("aria-pressed", "false");
  const returnButton = doc.createElement("button");
  returnButton.id = "lab-guide-return";
  returnButton.type = "button";
  returnButton.className = "guided-return";
  returnButton.textContent = "Return to guide";
  returnButton.hidden = true;
  const note = doc.createElement("p");
  note.className = "guided-note";
  note.textContent = guide.mechanism
    ? "Each step resets and advances an original teaching model; it does not run team Java."
    : "Each guided step resets its experiment. Explore keeps the current state; returning to the guide resets the current step.";
  controls.append(back, next, explore, returnButton);
  panel.append(eyebrow, heading, progress, live, sourceStatus, controls, note);
  let index = 0,
    exploring = false;
  const apply = () => {
    try {
      if (
        id === "pid" &&
        doc.getElementById("toggle").textContent.trim() === "Pause"
      )
        doc.getElementById("toggle").click();
      if (reset) reset.click();
      for (const action of guide.stages[index].actions) {
        const [type, , value] = action,
          target = findAction(doc, action);
        if (type === "change") inputChange(target, value);
        else if (type === "click" || type === "scenario") target.click();
        else if (type === "advance") globalThis.mechanismDemo.step(action[1]);
        else if (type === "pidSteps")
          for (let i = 0; i < action[1]; i++) target.click();
      }
      doc.body.dataset.guideStep = String(index + 1);
      progress.textContent = `Step ${index + 1} of ${guide.stages.length}`;
      stepTitle.textContent = guide.stages[index].title;
      explanation.textContent = guide.stages[index].explanation;
      back.disabled = index === 0;
      next.disabled = index === guide.stages.length - 1;
    } catch (error) {
      doc.body.classList.remove("guided-mode", "guided-ready");
      panel.remove();
      console.error("Guided walkthrough unavailable:", error);
    }
  };
  back.addEventListener("click", () => {
    if (index > 0) {
      index--;
      apply();
    }
  });
  next.addEventListener("click", () => {
    if (index < guide.stages.length - 1) {
      index++;
      apply();
    }
  });
  const setExploring = (value) => {
    exploring = value;
    doc.body.classList.toggle("guided-mode", !exploring);
    doc.body.dataset.labMode = exploring ? "explore" : "guided";
    panel.classList.toggle("is-exploring", exploring);
    explore.hidden = exploring;
    returnButton.hidden = !exploring;
    explore.setAttribute("aria-pressed", String(exploring));
    note.textContent = exploring
      ? "Explore the current state with all controls. Returning to the guide resets the current step."
      : guide.mechanism
        ? "Each step resets and advances an original teaching model; it does not run team Java."
        : "Each guided step resets its experiment. Explore keeps the current state; returning to the guide resets the current step.";
    if (!exploring) apply();
    doc.dispatchEvent(new Event("labmodechange"));
  };
  explore.addEventListener("click", () => setExploring(true));
  returnButton.addEventListener("click", () => setExploring(false));
  try {
    markHidden(doc, id, guide.mechanism);
    main.prepend(panel);
    doc.body.dataset.guidedInitialized = "1";
    doc.body.dataset.labMode = "guided";
    doc.body.dataset.guideTotal = String(guide.stages.length);
    doc.body.classList.add("guided-ready", "guided-mode");
    apply();
    return doc.body.classList.contains("guided-ready");
  } catch (error) {
    panel.remove();
    doc.body.classList.remove("guided-ready", "guided-mode");
    console.error("Guided walkthrough unavailable:", error);
    return false;
  }
}
if (typeof document !== "undefined") {
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", () => initializeGuided(), {
      once: true,
    });
  else initializeGuided();
}
