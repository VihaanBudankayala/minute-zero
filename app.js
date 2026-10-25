/*
 * app.js — Minute Zero app logic.
 *
 * This file handles state, timing, the event log, and switching screens.
 * It contains NO medical instructions: all user-facing text comes from the
 * CONTENT object defined in content.js (loaded first by index.html).
 *
 * Big idea: the TIMELINE is the "single source of truth". Things like
 * "has 911 been called?" or "when was CPR logged?" are worked out by
 * looking through the timeline, instead of being stored twice. That way
 * they can never disagree (for example, after Undo).
 */
"use strict"; // Turns some silent JavaScript mistakes into real errors.

// ============================================================
// 1. APP STATE
// One object holds everything about the current emergency.
// It's also what gets auto-saved (see section 12).
// ============================================================
const state = {
  startTime: null,  // Date.now() value (ms since 1970) when the emergency started, or null
  timeline: [],     // list of { time, action, ... } objects, oldest first
  scenarioId: null, // "cardiac", "stroke" or "bleeding" (keys of CONTENT.scenarios)
  mode: null,       // "dispatcher", "guided" or "cpr"
  stepIndex: 0,     // which guided step is showing (0 = first, like a Java array index)
  trained: false,   // CPR: false = hands-only, true = 30 compressions + 2 breaths
  readAloud: false, // read guided steps out loud
};

// CPR-screen state that does NOT need saving (it restarts when the screen opens).
const cpr = {
  running: false,
  cycleStart: 0,        // Date.now() when the current 2-minute cycle began
  alertShownAt: null,   // when the 2-minute alert appeared (it hides after 15 s)
  count: 0,             // compressions in the current set of 30 (30:2 mode only)
  waitingForBreaths: false,
};

const CPR_CYCLE_MS = 2 * 60 * 1000; // 2 minutes
const SWITCH_ALERT_MS = 15 * 1000;  // how long the 2-minute alert stays up by itself
const SAVE_KEY = "minutezero.session"; // name of our saved data in localStorage

let clockTimerId = null; // id returned by setInterval, so we could stop it later

// Finds the log text of a one-tap button in content.js, e.g. ("cardiac", "shock")
// -> "AED shock delivered". Used so the handoff never has to repeat that text.
function actionLog(scenarioId, actionId) {
  return CONTENT.scenarios[scenarioId].logActions.find((a) => a.id === actionId).log;
}
const EMS_LOG = actionLog("cardiac", "ems");

// ============================================================
// 2. SMALL HELPERS
// ============================================================

// Shorthand for document.getElementById.
function byId(id) {
  return document.getElementById(id);
}

// Looks up a value in CONTENT using a "dotted path".
// getContent("beatNote.text") is the same as CONTENT.beatNote.text.
// It walks one key at a time and returns undefined if any part is missing
// (instead of crashing), so a typo just leaves the HTML fallback text.
function getContent(path) {
  let value = CONTENT;
  for (const key of path.split(".")) {
    if (value === undefined || value === null) return undefined;
    value = value[key];
  }
  return value;
}

// Any element with data-content="someKey" gets its text from CONTENT.someKey.
// This keeps all wording in content.js instead of scattered through the HTML.
function fillContent() {
  document.querySelectorAll("[data-content]").forEach((el) => {
    const text = getContent(el.dataset.content); // data-content="x" -> el.dataset.content === "x"
    if (typeof text === "string") {
      el.textContent = text;
    }
  });
}

// Makes the phone vibrate, if it can. `pattern` is milliseconds:
// 200 = buzz once; [100, 60, 100] = buzz, pause, buzz.
// Android Chrome supports this; iPhones don't, so we check first and
// simply skip it there (the app works the same either way).
function buzz(pattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}

// Turns a duration in milliseconds into "mm:ss" (or "h:mm:ss" after an hour).
function formatElapsed(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}

// Turns a timestamp into a wall-clock time like "2:14:05 PM" in the phone's locale.
function formatClockTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Short version without seconds, like "2:14 PM" (fits on small buttons).
function formatShortTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Turns "14:05" (what <input type="time"> gives us) into "2:05 PM".
function formatHourMinute(hhmm) {
  const [hours, minutes] = hhmm.split(":").map(Number); // like Python: h, m = map(int, s.split(":"))
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// Shows exactly one <section class="screen"> and hides the rest.
function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.hidden = screen.id !== screenId;
  });
  // On the handoff screen, CSS hides the 911 card, banner and event log.
  document.body.classList.toggle("on-handoff", screenId === "screen-handoff");
  window.scrollTo(0, 0);
}

// True on a laptop/desktop: a mouse or trackpad that can hover, not a touch screen.
// matchMedia asks the browser the same questions CSS media queries ask.
function isComputer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

// The current scenario's data from content.js (or null before one is chosen).
function currentScenario() {
  return state.scenarioId ? CONTENT.scenarios[state.scenarioId] : null;
}

// ============================================================
// 3. EVENT LOG (TIMELINE)
// ============================================================

// Records one event with the current time, then redraws the screen.
// `details` lets callers attach extra info, e.g. { undoable: true }.
// The "..." (spread) copies details' keys into the new object,
// a bit like **kwargs in Python.
function logEvent(action, details = {}) {
  const entry = { time: Date.now(), action: action, ...details };
  state.timeline.push(entry);
  refreshUI();
  return entry;
}

// Finds the most recent entry with this exact action text, or null.
// We loop backwards so the newest match is found first.
function lastEntryFor(action) {
  for (let i = state.timeline.length - 1; i >= 0; i--) {
    if (state.timeline[i].action === action) return state.timeline[i];
  }
  return null;
}

// Removes the last entry, but ONLY if the user created it by tapping a log
// button or writing a note (undoable: true). Automatic entries like
// "Emergency started" or "911 called" can't be undone.
function undoLast() {
  const last = state.timeline[state.timeline.length - 1];
  if (last && last.undoable) {
    state.timeline.pop();
    refreshUI();
  }
}

// Rebuilds the <ol id="timeline"> from state.timeline.
function renderTimeline() {
  const list = byId("timeline");
  list.replaceChildren(); // remove all old <li> items

  for (const entry of state.timeline) {
    const item = document.createElement("li");

    const when = document.createElement("span");
    when.className = "timeline-time";
    // e.g. "+01:23 · 2:14:05 PM"  (time since start, then clock time)
    when.textContent =
      `+${formatElapsed(entry.time - state.startTime)} · ${formatClockTime(entry.time)}`;

    const what = document.createElement("span");
    what.className = "timeline-action";
    // textContent (not innerHTML) so typed notes can never be
    // interpreted as HTML/code.
    what.textContent = entry.action;

    item.append(when, what);
    list.append(item);
  }

  byId("log-summary").textContent = `${CONTENT.showLog} (${state.timeline.length})`;

  // Undo is only enabled when the newest entry is one the user can undo.
  const last = state.timeline[state.timeline.length - 1];
  byId("btn-undo").disabled = !(last && last.undoable);
}

// Redraws everything that depends on the timeline, then auto-saves.
// Called after every change.
function refreshUI() {
  renderTimeline();
  refreshStatus911();
  if (currentScenario()) {
    renderLogActions();
  }
  refreshTimeSaved();
  renderHelpers();
  byId("ems-banner").hidden = !lastEntryFor(EMS_LOG);
  updateTextLinks();
  saveSession();
}

// ============================================================
// 4. ELAPSED-TIME CLOCK
// ============================================================

// We never "count seconds". We always compute (now - startTime).
// So even if the timer fires late, or the phone pauses it while the screen
// is off, the display is correct the next time it updates.
function updateClock() {
  const clock = byId("clock");
  if (state.startTime === null) {
    clock.textContent = "--:--";
    return;
  }
  clock.textContent = formatElapsed(Date.now() - clockZero());
  updateCprTimer(); // the 2-minute CPR countdown uses the same tick
  if (!byId("screen-handoff").hidden) refreshHandoffAgo();
}

// When the top-bar clock counts from: the newest "Reset time" entry, or the
// start of the emergency. Kept in the timeline (single source of truth), so
// Undo brings the old time back. The log and handoff still use the real start.
function clockZero() {
  const reset = state.timeline.filter((e) => e.kind === "timerReset").pop();
  return reset ? reset.time : state.startTime;
}

// "Reset time": the clock starts again at 0:00 (and the reset is logged).
function resetTime() {
  logEvent(CONTENT.reset.timeLog, { kind: "timerReset", undoable: true });
  updateClock();
  buzz(40);
}

// Things every running emergency needs, whether it's new or resumed:
// the clock, the shared status card and log, and keeping the screen on.
function beginSession() {
  byId("status-911").hidden = false;
  byId("log-panel").hidden = false;
  byId("resume-card").hidden = true;

  updateClock();
  // 4 updates per second keeps the display within a quarter-second of the truth.
  clockTimerId = setInterval(updateClock, 250);

  // CSS uses this class to show the blinking red "recording" dot.
  document.body.classList.add("is-active");
  keepScreenOn();
}

// Starts the clock and a fresh event log. Safe to call more than once:
// if an emergency is already running, it does nothing.
function startEmergency() {
  if (state.startTime !== null) return;

  state.startTime = Date.now();
  state.timeline = [];
  state.readAloud = settings.readAloud; // default from Settings
  refreshReadAloudButton();
  beginSession();

  logEvent(CONTENT.log.emergencyStarted); // this also replaces any old saved session
  buzz(200);
  showScreen("screen-picker");
}

// ============================================================
// 5. CALL 911
// ============================================================

// Runs when the "Call 911" link is tapped. If the rescuer taps 911 before
// START, we start the emergency automatically so the call is still timestamped.
function handleCall911() {
  startEmergency(); // does nothing if already started
  logEvent(CONTENT.log.called911);
  buzz([100, 60, 100]);
  // We do NOT call event.preventDefault(), so the browser still follows
  // href="tel:911" and opens the phone's dialer.
}

// Updates the 911 card from the timeline: amber "!" until 911 is called,
// then green "✓ 911 called at <time>" plus the speakerphone tip.
// Also stops the 911 button from pulsing once it has been called.
function refreshStatus911() {
  const call = lastEntryFor(CONTENT.log.called911);
  const called = call !== null;

  byId("status-911").className = called ? "status status-done" : "status status-pending";
  byId("status-911-icon").textContent = called ? "✓" : "!";
  byId("status-911-text").textContent = called
    ? `${CONTENT.status911.calledAt} ${formatShortTime(call.time)}` // no seconds: fits on one line
    : CONTENT.status911.notCalled;
  // The speakerphone tip only shows until a mode is chosen, so the card
  // stays small and the step or log buttons fit on the screen.
  byId("status-911-tip").hidden = !called || state.mode !== null;
  // These extra lines only show while choosing what's happening (no mode yet),
  // so the card stays one line on the CPR and step screens and everything fits.
  byId("status-911-fallback").hidden = !called || state.mode !== null;
  // On a computer, say plainly that it can't call 911 (tel: just opens an app).
  byId("status-911-fallback-text").textContent =
    isComputer() ? CONTENT.status911.computer : CONTENT.status911.didntOpen;
  byId("status-911-textlink").hidden = called || state.mode !== null;
  document.querySelectorAll(".js-call911").forEach((link) => {
    link.classList.toggle("is-called", called);
  });
}

// ============================================================
// 6. SCENARIO PICKER
// ============================================================

// Creates one big button per scenario in CONTENT.scenarios.
// Object.entries turns { cardiac: {...}, stroke: {...} } into
// [["cardiac", {...}], ["stroke", {...}]], like dict.items() in Python.
// Makes one situation button: the name in bold, the signs underneath
// (so people can choose by what they SEE, not by a medical word), and an arrow.
function makeChoiceButton(className, labelText, hintText, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;

  const text = document.createElement("span");
  text.className = "choice-text";
  const label = document.createElement("span");
  label.className = "choice-label";
  label.textContent = labelText;
  const hint = document.createElement("span");
  hint.className = "choice-hint";
  hint.textContent = hintText;
  text.append(label, hint);

  const arrow = document.createElement("span");
  arrow.className = "chevron";
  arrow.setAttribute("aria-hidden", "true");
  arrow.textContent = "›";

  button.append(text, arrow);
  button.addEventListener("click", onClick);
  return button;
}

// "What's happening?": a slim "Not sure?" button, then the urgent
// situations (big), then the other situations (smaller).
function renderPicker() {
  const list = byId("scenario-list");
  list.replaceChildren(); // can be redrawn (e.g. after editing "My people")
  const ids = CONTENT.scenarioOrder;
  const urgent = ids.filter((id) => CONTENT.scenarios[id].urgent);
  const others = ids.filter((id) => !CONTENT.scenarios[id].urgent);

  // "Not sure?" first: one slim line, so on every phone it's on the first screen,
  // and the urgent situations are still right below it.
  const unsure = document.createElement("button");
  unsure.type = "button";
  unsure.className = "btn btn-unsure-compact";
  unsure.textContent = CONTENT.pickerUnsureShort;
  unsure.addEventListener("click", startSurvey);
  list.append(unsure);

  for (const id of urgent) {
    const scenario = CONTENT.scenarios[id];
    list.append(makeChoiceButton("btn scenario-btn is-urgent", scenario.label, scenario.hint,
      () => chooseScenario(id)));
  }

  // "Your people": situations linked to conditions saved in My people (Update 7).
  const people = loadPeople();
  const personButtons = [];
  for (const person of people) {
    for (const conditionId of person.conditions) {
      const condition = CONTENT.myPeople.conditions.find((c) => c.id === conditionId);
      if (!condition) continue;
      const scenario = CONTENT.scenarios[condition.scenario];
      personButtons.push(makeChoiceButton("btn scenario-btn is-person",
        `${scenario.label} ${CONTENT.myPeople.pickerFor} ${person.name}`, condition.label,
        () => choosePerson(person, condition.scenario)));
    }
  }
  if (personButtons.length > 0) {
    const peopleHeading = document.createElement("h3");
    peopleHeading.className = "picker-subheading";
    peopleHeading.textContent = CONTENT.myPeople.pickerHeading;
    list.append(peopleHeading, ...personButtons); // "..." spreads the list into separate arguments
  }

  const heading = document.createElement("h3");
  heading.className = "picker-subheading";
  heading.textContent = CONTENT.pickerOthers;
  list.append(heading);

  for (const id of others) {
    const scenario = CONTENT.scenarios[id];
    list.append(makeChoiceButton("btn scenario-btn is-other", scenario.label, scenario.hint,
      () => chooseScenario(id)));
  }
}

function chooseScenario(id) {
  if (id !== state.scenarioId) {
    state.scenarioId = id;
    state.stepIndex = 0; // a new scenario starts at its first step
    state.mode = null;   // ...and asks again how the rescuer is being helped
    logEvent(`${CONTENT.log.scenario} ${currentScenario().label}`);
  }
  const scenario = currentScenario();

  // Every element with class "js-scenario-label" shows the scenario's name.
  document.querySelectorAll(".js-scenario-label").forEach((el) => {
    el.textContent = scenario.label;
  });
  byId("btn-to-guided").textContent = scenario.guidedButton || CONTENT.switchToGuided;

  if (scenario.cprMode) {
    // Cardiac: straight to the CPR screen, no question first. This tap is
    // also the "user gesture" browsers require before playing sound.
    chooseMode("cpr");
  } else {
    stopCpr(); // switching away from cardiac stops the beat
    showScreen("screen-mode");
  }
}

// ============================================================
// 7. MODES: DISPATCHER, GUIDED, CPR
// ============================================================

// Switches mode. Dispatcher/guided switches are logged only if they actually
// changed, so the handoff shows when the rescuer stopped/started following
// the dispatcher. (The CPR screen logs "CPR started" itself.)
function chooseMode(mode) {
  if (state.mode !== mode) {
    state.mode = mode;
    // For cardiac, opening step-by-step help doesn't mean the rescuer
    // stopped following the dispatcher, so it isn't logged as a switch.
    const scenario = currentScenario();
    if (scenario && !scenario.cprMode) {
      if (mode === "dispatcher") logEvent(CONTENT.log.modeDispatcher);
      if (mode === "guided") logEvent(CONTENT.log.modeGuided);
    }
  }

  if (mode === "cpr") {
    showCprPhase();
    showScreen("screen-cpr");
  } else if (mode === "guided") {
    renderGuidedStep();
    showScreen("screen-guided");
  } else if (mode === "self") {
    showScreen("screen-self");
  } else {
    showScreen("screen-dispatcher");
  }
  placeTimeBox();
  placeHelpers();
  refreshStatus911(); // the speakerphone tip hides once a mode is chosen
  saveSession();
}

// Builds the big one-tap log buttons for the current scenario, in every
// container with class "js-log-actions" (Dispatcher screen and CPR screen).
// Each button shows when it was last tapped, worked out from the timeline.
function renderLogActions() {
  document.querySelectorAll(".js-log-actions").forEach((grid) => {
    grid.replaceChildren();

    for (const action of currentScenario().logActions) {
      const last = lastEntryFor(action.log);

      const button = document.createElement("button");
      button.type = "button";
      button.className = last ? "btn log-btn is-logged" : "btn log-btn";

      const label = document.createElement("span");
      label.className = "log-btn-label";
      label.textContent = action.label;

      const status = document.createElement("span");
      status.className = "log-btn-status";
      status.textContent = last
        ? `${CONTENT.loggedAt} ${formatShortTime(last.time)}`
        : CONTENT.tapToLog;

      button.append(label, status);
      button.addEventListener("click", () => {
        logEvent(action.log, { undoable: true });
        buzz(60);
        // e.g. choking -> "Stopped responding: start CPR" opens the CPR screen.
        if (action.switchTo) chooseScenario(action.switchTo);
      });
      grid.append(button);
    }
  });
}

// ============================================================
// 8. GUIDED STEPS (backup when there are no dispatcher instructions)
// ============================================================

// Shows the step at state.stepIndex: counter, image, text, detail.
// When stepIndex has gone past the last step, shows the "finished" panel.
function renderGuidedStep() {
  const scenario = currentScenario();
  const steps = scenario.guidedSteps;
  const finished = state.stepIndex >= steps.length;

  // The switch button goes back to the CPR beat (cardiac) or to the log buttons.
  byId("btn-guided-switch").textContent =
    scenario.cprMode ? CONTENT.cpr.backToCpr : CONTENT.switchToDispatcher;

  // Check steps (with a `finding`) show Yes / No / Not sure instead of Done.
  const isCheck = !finished && Boolean(steps[state.stepIndex].finding);
  byId("steps-finished").hidden = !finished;
  byId("btn-step-done").hidden = finished || isCheck;
  byId("step-answers").hidden = !isCheck;
  byId("btn-step-skip").hidden = finished;
  byId("step-text").hidden = finished;
  byId("btn-step-back").disabled = state.stepIndex === 0;

  byId("step-source").hidden = finished;
  if (finished) byId("btn-step-emergency").hidden = true;
  if (finished) {
    byId("step-counter").textContent = "";
    byId("step-figure").hidden = true;
    byId("step-detail").hidden = true;
    placeTimeBox();
    return;
  }

  const step = steps[state.stepIndex];
  byId("step-counter").textContent =
    `${CONTENT.stepLabel} ${state.stepIndex + 1} ${CONTENT.ofLabel} ${steps.length}`;
  byId("step-text").textContent = step.text;

  byId("step-source").textContent = `${CONTENT.about.sourceLabel} ${step.source}`;
  speak(step.detail ? `${step.text} ${step.detail.split(" · ").join(". ")}` : step.text);
  byId("btn-step-done").textContent = step.doneLabel || CONTENT.done;

  // Some steps have a red "they stopped responding: start CPR" button.
  const emergency = byId("btn-step-emergency");
  emergency.hidden = !step.emergencyButton;
  if (step.emergencyButton) emergency.textContent = step.emergencyButton.label;

  const detail = byId("step-detail");
  detail.hidden = !step.detail;
  detail.replaceChildren();
  if (step.detail && step.detail.includes(" · ")) {
    // Several items -> a bullet list (easier to scan than one long sentence).
    const ul = document.createElement("ul");
    for (const item of step.detail.split(" · ")) { // like Python's str.split(" · ")
      const li = document.createElement("li");
      li.textContent = item;
      ul.append(li);
    }
    detail.append(ul);
  } else {
    detail.textContent = step.detail || ""; // || "" means "or an empty string if there's no detail"
  }

  // Image: only steps with an `image` field show one.
  const figure = byId("step-figure");
  if (step.image) {
    const img = byId("step-image");
    img.src = step.image.src;
    img.alt = step.image.alt; // read aloud by screen readers instead of the picture
    figure.hidden = false;
  } else {
    figure.hidden = true;
  }

  placeTimeBox();
}

// "Done": log the step (if it has a log text), then go to the next step.
function stepDone() {
  const step = currentScenario().guidedSteps[state.stepIndex];
  if (step.log) {
    logEvent(step.log, { undoable: true });
  }
  buzz(60);
  goToStep(state.stepIndex + 1);
}

// Yes / No / Not sure on a check step (e.g. "Face drooping: yes").
// kind: "finding" lets the handoff screen list every check and its answer.
function answerStep(answer) {
  const step = currentScenario().guidedSteps[state.stepIndex];
  logEvent(`${step.finding}: ${CONTENT.survey.answers[answer]}`, {
    kind: "finding",
    finding: step.finding,
    answer: answer,
    undoable: true,
  });
  buzz(40);
  goToStep(state.stepIndex + 1);
}

// The red emergency button on a step: log it, then switch situation (to CPR).
function stepEmergency() {
  const step = currentScenario().guidedSteps[state.stepIndex];
  logEvent(CONTENT.emergencyLog);
  buzz([100, 60, 100]);
  chooseScenario(step.emergencyButton.switchTo);
}

// Moves to a step number and scrolls up so the new step is in view.
// Skip and Back use this too; they don't log anything.
function goToStep(index) {
  state.stepIndex = Math.max(0, index); // never below step 0
  renderGuidedStep();
  saveSession();
  window.scrollTo(0, 0);
}

// The guided screen's switch button: back to CPR, or to the log buttons.
function leaveGuided() {
  chooseMode(currentScenario().cprMode ? "cpr" : "dispatcher");
}

// ============================================================
// 9. METRONOME (Web Audio API with a look-ahead scheduler)
//
// Why not just setInterval(beep, 545)? Because setInterval is not precise:
// it can fire late, the delays add up ("drift"), and phones slow it down.
// A CPR beat that wobbles is worse than no beat.
//
// The trick ("A Tale of Two Clocks", Chris Wilson): the AUDIO hardware has
// its own very accurate clock (audioCtx.currentTime, in seconds). Every 25 ms
// a sloppy JavaScript timer wakes up and books any beats due in the next
// 0.1 s on the accurate audio clock ("play a click at exactly 12.727 s").
// Even if the timer wakes up late, the clicks were already booked at exact
// times, so the beat stays perfectly even.
// ============================================================
const metronome = {
  audioCtx: null,     // created on the first tap (browsers require a tap before sound)
  bpm: 110,           // beats per minute (AHA: 100–120)
  soundOn: true,
  running: false,
  nextBeatTime: 0,    // audio-clock time (seconds) of the next beat to book
  beatsBooked: 0,     // how many beats have been booked since start
  maxBeats: Infinity, // stop booking after this many (30 in 30:2 mode)
  queue: [],          // booked beats not yet shown on screen: [{ number, time }]
  timerId: null,
  onBeat: null,       // function(number) called when each beat is HEARD
};

const LOOKAHEAD_MS = 25;      // how often the scheduler wakes up
const SCHEDULE_AHEAD_S = 0.1; // how far ahead it books beats

// Creates (or wakes up) the audio system. Must run inside a tap handler.
function ensureAudio() {
  if (!metronome.audioCtx) {
    // Older Safari calls it webkitAudioContext.
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return; // very old browser: the visual beat still works
    metronome.audioCtx = new AudioCtx();
  }
  if (metronome.audioCtx.state === "suspended") {
    metronome.audioCtx.resume();
  }
  // Newer iPhones: ask to play sound even when the silent switch is on.
  if (navigator.audioSession) {
    navigator.audioSession.type = "playback";
  }
}

// Starts the beat. maxBeats = 30 for a set of compressions in 30:2 mode.
function metronomeStart(maxBeats = Infinity) {
  if (!metronome.audioCtx) return;
  metronomeStop();
  metronome.running = true;
  metronome.maxBeats = maxBeats;
  metronome.beatsBooked = 0;
  metronome.nextBeatTime = metronome.audioCtx.currentTime + 0.1; // first beat in 0.1 s
  scheduler();
  requestAnimationFrame(drawBeats);
}

function metronomeStop() {
  metronome.running = false;
  clearTimeout(metronome.timerId);
  metronome.queue = [];
}

// Wakes up every 25 ms and books every beat due in the next 0.1 s.
function scheduler() {
  if (!metronome.running) return;
  const ctx = metronome.audioCtx;
  const secondsPerBeat = 60 / metronome.bpm; // 60 / 110 ≈ 0.545 s

  while (metronome.nextBeatTime < ctx.currentTime + SCHEDULE_AHEAD_S &&
         metronome.beatsBooked < metronome.maxBeats) {
    metronome.beatsBooked++;
    if (metronome.soundOn) playClick(metronome.nextBeatTime);
    metronome.queue.push({ number: metronome.beatsBooked, time: metronome.nextBeatTime });
    metronome.nextBeatTime += secondsPerBeat;
  }
  metronome.timerId = setTimeout(scheduler, LOOKAHEAD_MS);
}

// Books one short "tick" sound at an exact audio-clock time.
// An oscillator makes a tone; a gain node shapes its volume so it's a
// short click instead of a long beep (start silent, jump up, fade out).
function playClick(time, frequency = 1000, length = 0.05) {
  const ctx = metronome.audioCtx;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, time);
  gain.gain.exponentialRampToValueAtTime(0.8, time + 0.002);
  gain.gain.exponentialRampToValueAtTime(0.0001, time + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(time);
  osc.stop(time + length + 0.01);
}

// Two lower, longer tones for the 2-minute alert (different from the beat).
function playAlertTone() {
  if (!metronome.audioCtx || !metronome.soundOn) return;
  const now = metronome.audioCtx.currentTime;
  playClick(now + 0.05, 660, 0.25);
  playClick(now + 0.4, 660, 0.25);
}

// Runs every screen frame (~60 times a second). When the audio clock passes
// a booked beat's time, the beat is being HEARD right now, so we show it.
// That's how the circle pulses exactly with the sound.
function drawBeats() {
  if (!metronome.running && metronome.queue.length === 0) return;
  const now = metronome.audioCtx.currentTime;
  while (metronome.queue.length > 0 && metronome.queue[0].time <= now) {
    const beat = metronome.queue.shift(); // like Python's list.pop(0)
    if (metronome.onBeat) metronome.onBeat(beat.number);
  }
  requestAnimationFrame(drawBeats);
}

// ============================================================
// 10. CPR SCREEN
// ============================================================

// The CPR screen has two parts: "before START" (optional questions + the
// START CPR button) and "running" (the beat). This shows the right one.
function showCprPhase() {
  byId("cpr-prestart").hidden = cpr.running;
  byId("cpr-running").hidden = !cpr.running;
  refreshCprControls();
}

// START CPR: the tap that starts the beat. Logging "CPR started" here
// records when compressions really began. The tap is also the "user
// gesture" browsers require before playing sound.
// logIt = false when resuming a CPR that was already logged.
function startCpr(logIt = true) {
  ensureAudio();
  if (logIt) logEvent(CONTENT.log.cprStarted);
  cpr.running = true;
  cpr.cycleStart = Date.now();
  cpr.alertShownAt = null;
  startCompressionSet();
  buzz(100);

  // Move the two boxes down below the beat, at full size.
  showCprPhase();
  placeTimeBox();
  placeHelpers();
  window.scrollTo(0, 0);
}

function stopCpr() {
  cpr.running = false;
  metronomeStop();
  byId("switch-alert").hidden = true;
  showCprPhase();
}

// Starts pushing: forever (hands-only) or a set of 30 (30:2 mode).
function startCompressionSet() {
  cpr.count = 0;
  cpr.waitingForBreaths = false;
  byId("btn-breaths-done").hidden = true;
  metronome.onBeat = onCprBeat;
  metronomeStart(state.trained ? 30 : Infinity);
  showBeatText();
}

// Called on every beat the rescuer hears.
function onCprBeat(number) {
  cpr.count = number;
  pulseCircle();
  if (state.trained && number >= 30) {
    // 30 pushes done: time for 2 breaths. The metronome already stopped
    // booking beats after 30, so it's quiet now.
    cpr.waitingForBreaths = true;
    byId("btn-breaths-done").hidden = false;
    buzz([80, 60, 80]);
  }
  showBeatText();
}

// Text inside the circle: "PUSH", or "17 / 30" in 30:2 mode, or "2 BREATHS".
function showBeatText() {
  const circle = byId("beat-circle");
  circle.classList.toggle("is-breaths", cpr.waitingForBreaths);
  if (cpr.waitingForBreaths) {
    byId("beat-main").textContent = CONTENT.cpr.breaths;
    byId("beat-sub").textContent = "";
    byId("cpr-instruction").textContent = CONTENT.cpr.breathsText;
  } else {
    byId("beat-main").textContent = CONTENT.cpr.push;
    byId("beat-sub").textContent = state.trained ? `${cpr.count} / 30` : "";
    byId("cpr-instruction").textContent = CONTENT.cpr.instruction;
  }
}

// A quick squeeze of the circle on each beat, using the Web Animations API
// (el.animate). People who turn on "Reduce motion" get a brightness flash
// instead of movement.
function pulseCircle() {
  const circle = byId("beat-circle");
  const reduceMotion = settings.calm || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const frames = reduceMotion
    ? [{ filter: "brightness(1.6)" }, { filter: "brightness(1)" }]
    : [{ transform: "scale(0.9)" }, { transform: "scale(1)" }];
  circle.animate(frames, { duration: 250, easing: "ease-out" });
}

// Updates the 2-minute countdown and shows the alert when it reaches 0.
// Called 4 times a second by updateClock(). Like the main clock, it
// compares timestamps instead of counting.
function updateCprTimer() {
  if (!cpr.running) return;
  const now = Date.now();
  let elapsed = now - cpr.cycleStart;

  if (elapsed >= CPR_CYCLE_MS) {
    cpr.cycleStart = now; // the next 2-minute cycle starts by itself
    elapsed = 0;
    // Nobody to switch with when the rescuer is alone, so no alert then.
    if (helpersCount() !== 1) showSwitchAlert();
  }
  // Hide the alert after 15 s if nobody tapped it (the rescuer may be alone).
  if (cpr.alertShownAt && now - cpr.alertShownAt > SWITCH_ALERT_MS) {
    hideSwitchAlert();
  }

  const remaining = CPR_CYCLE_MS - elapsed;
  byId("cpr-timer-value").textContent = formatElapsed(remaining + 999).replace(/^0/, "");
  byId("cpr-timer-fill").style.width = `${(elapsed / CPR_CYCLE_MS) * 100}%`;
}

function showSwitchAlert() {
  cpr.alertShownAt = Date.now();
  byId("switch-alert").hidden = false;
  playAlertTone();
  buzz([300, 100, 300]);
}

function hideSwitchAlert() {
  cpr.alertShownAt = null;
  byId("switch-alert").hidden = true;
}

function rescuersSwitched() {
  logEvent(CONTENT.log.rescuersSwitched, { undoable: true });
  hideSwitchAlert();
}

// Sound on/off. The beat keeps going on screen either way.
function toggleSound() {
  ensureAudio();
  metronome.soundOn = !metronome.soundOn;
  refreshCprControls();
}

// Hands-only <-> 30:2. Logged, because paramedics want to know.
function toggleTrained() {
  ensureAudio();
  state.trained = !state.trained;
  logEvent(state.trained ? CONTENT.log.cprTrained : CONTENT.log.cprHandsOnly);
  startCompressionSet(); // restart the count with the new type
  refreshCprControls();
}

// Button labels + aria-pressed (screen readers say "on"/"off").
function refreshCprControls() {
  const sound = byId("btn-sound");
  sound.textContent = metronome.soundOn ? CONTENT.cpr.soundOn : CONTENT.cpr.soundOff;
  sound.setAttribute("aria-pressed", String(metronome.soundOn));

  const trained = byId("btn-trained");
  trained.textContent = state.trained ? CONTENT.cpr.trainedOn : CONTENT.cpr.handsOnly;
  trained.setAttribute("aria-pressed", String(state.trained));
  trained.classList.toggle("is-on", state.trained);
}

// ============================================================
// 11. TIME BOX: "Person collapsed at" / "Symptoms started at"
// ============================================================

// There is only one time box in the HTML. This moves it into whichever
// screen needs it and fills in that scenario's labels. append() on an
// element that's already on the page MOVES it (it doesn't copy it).
// Which time box the current screen uses (or null): the self screen's,
// or the current scenario's.
function timeBoxConfig() {
  if (state.mode === "self") return CONTENT.self.timeBox;
  const scenario = currentScenario();
  return scenario && scenario.timeBox ? scenario.timeBox : null;
}

function placeTimeBox() {
  const box = byId("time-box");
  const scenario = currentScenario();
  const config = timeBoxConfig();

  let slot = null;
  if (config) {
    if (state.mode === "self") slot = "self-time-slot";
    if (state.mode === "cpr") slot = cpr.running ? "cpr-time-slot" : "cpr-pre-time-slot";
    if (state.mode === "dispatcher") slot = "dispatcher-time-slot";
    if (state.mode === "guided") {
      const step = scenario.guidedSteps[state.stepIndex]; // undefined after the last step
      if (step && step.widget === "timeBox") slot = "guided-time-slot";
    }
  }

  box.hidden = slot === null;
  // Before START CPR, the box is "compact" (one row, no hint) so the
  // START button still fits on the screen.
  const compact = slot === "cpr-pre-time-slot";
  box.classList.toggle("is-compact", compact);
  if (slot) {
    byId(slot).append(box);
    byId("time-label").textContent = compact ? `${config.label} ${CONTENT.cpr.optional}` : config.label;
    byId("btn-time-save").textContent = compact ? CONTENT.timeBox.saveShort : CONTENT.timeBox.save;
    byId("time-hint").textContent = config.hint;
    refreshTimeSaved();
  }
}

// Fills the time box with the current time ("14:05" format).
function setTimeToNow() {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  byId("time-input").value = `${hh}:${mm}`;
}

// Logs the time. `kind` ("collapse" or "onset") marks the entry so the
// handoff screen (Milestone 5) can find it and show it at the top.
function saveTime() {
  const value = byId("time-input").value; // "" if nothing entered
  if (!value) {
    byId("time-input").focus();
    return;
  }
  const config = timeBoxConfig();
  logEvent(`${config.log} ${formatHourMinute(value)}`, {
    kind: config.kind,
    value: value,
    undoable: true,
  });
  buzz(60);
}

// Shows "Saved: 2:05 PM" under the box, using the newest entry of this kind.
function refreshTimeSaved() {
  const saved = byId("time-saved");
  const config = timeBoxConfig();
  const entry = config ? state.timeline.filter((e) => e.kind === config.kind).pop() : null;
  saved.hidden = !entry;
  if (entry) {
    saved.textContent = `${CONTENT.timeBox.savedAs} ${formatHourMinute(entry.value)}`;
  }
}

// ============================================================
// 12. AUTO-SAVE AND RESUME
//
// After every change we save `state` to localStorage (storage in the
// browser that survives reloads). If the browser closes the tab or the
// page reloads, the home screen offers to resume.
// localStorage only stores text, so we convert with JSON (like Python's
// json.dumps / json.loads). It can fail (private browsing, storage full),
// so every use is wrapped in try/catch: the app keeps working without it.
// ============================================================
function saveSession() {
  if (state.startTime === null) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (err) {
    // Saving isn't possible here; the app still works, it just won't resume.
  }
}

function loadSavedSession() {
  try {
    const text = localStorage.getItem(SAVE_KEY);
    return text ? JSON.parse(text) : null;
  } catch (err) {
    return null;
  }
}

function deleteSavedSession() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch (err) {
    // nothing to do
  }
}

// On the home screen: show the "Unfinished emergency" card if there is one.
function showResumeCard() {
  const saved = loadSavedSession();
  if (!saved || !saved.startTime || !Array.isArray(saved.timeline)) return;

  byId("resume-info").textContent =
    `${CONTENT.resume.startedAt} ${formatShortTime(saved.startTime)} · ` +
    `${saved.timeline.length} ${CONTENT.resume.entries}`;
  byId("resume-card").hidden = false;
}

// "Resume": put the saved data back and reopen the right screen.
// This is a tap, so it's also allowed to restart the CPR sound.
function resumeSession() {
  const saved = loadSavedSession();
  if (!saved) return;
  Object.assign(state, saved); // copy every saved field into state
  refreshReadAloudButton();
  beginSession();
  logEvent(CONTENT.log.resumed);

  if (state.mode === "self") {
    chooseMode("self");
    return;
  }
  const scenario = currentScenario();
  if (!scenario) {
    showScreen("screen-picker");
    return;
  }
  document.querySelectorAll(".js-scenario-label").forEach((el) => {
    el.textContent = scenario.label;
  });
  if (state.mode) {
    chooseMode(state.mode);
  } else {
    chooseScenario(state.scenarioId);
  }
  // CPR was already going before the reload: restart the beat right away
  // (Resume is a tap, so sound is allowed) without logging it twice.
  if (state.mode === "cpr" && lastEntryFor(CONTENT.log.cprStarted)) {
    startCpr(false);
  }
}

// "Delete it" needs two taps, so one accidental tap can't erase a log.
// (We can't use confirm(): it's blocked in some places and tiny on phones.)
let discardArmed = false;
function discardSession() {
  const button = byId("btn-discard");
  if (!discardArmed) {
    discardArmed = true;
    button.textContent = CONTENT.resume.confirmDiscard;
    return;
  }
  deleteSavedSession();
  byId("resume-card").hidden = true;
}

// ============================================================
// 13. KEEP THE SCREEN ON (Screen Wake Lock API)
// "async" functions can "await" slow things without freezing the app.
// The phone may refuse (e.g. battery saver), so it's in try/catch.
// ============================================================
async function keepScreenOn() {
  if (!("wakeLock" in navigator)) return; // not supported: nothing to do
  try {
    await navigator.wakeLock.request("screen");
  } catch (err) {
    // Refused. The app still works; the screen may just dim.
  }
}

// The phone drops the wake lock when you switch apps (for example to the
// dialer to call 911). Ask again when the user comes back.
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && state.startTime !== null) {
    keepScreenOn();
  }
});

// ============================================================
// 14. "I'M NOT SURE WHAT'S HAPPENING" CHECK
// A small decision tree from CONTENT.survey. surveyNode is the id of the
// question showing now. Every answer is logged, and the last answer leads
// to a scenario screen or to a result message.
// ============================================================
let surveyNode = null;

function startSurvey() {
  surveyNode = CONTENT.survey.first;
  renderSurveyQuestion();
  showScreen("screen-survey");
}

function renderSurveyQuestion() {
  const question = CONTENT.survey.questions[surveyNode];
  byId("survey-question").hidden = false;
  byId("survey-result").hidden = true;
  byId("survey-text").textContent = question.text;
  speak(question.text);
  byId("survey-detail").hidden = !question.detail;
  byId("survey-detail").textContent = question.detail || "";
}

// answer is "yes", "no" or "notSure" (from the button's data-answer).
function answerSurvey(answer) {
  const question = CONTENT.survey.questions[surveyNode];
  logEvent(`${CONTENT.survey.logPrefix} ${question.finding}: ${CONTENT.survey.answers[answer]}`, {
    kind: "check",
    undoable: true,
  });
  buzz(40);

  const next = question.next[answer];
  if (next.startsWith("result:")) {
    const resultId = next.slice("result:".length); // like Python's next[len("result:"):]
    if (CONTENT.scenarios[resultId]) {
      // Leads to one of our situations. This tap also lets CPR sound start.
      chooseScenario(resultId);
    } else {
      showSurveyResult(resultId);
    }
    return;
  }
  surveyNode = next;
  renderSurveyQuestion();
  window.scrollTo(0, 0);
}

// A result that isn't one of the three situations (e.g. "doesn't respond,
// but breathing"). Only that result offers the "Start CPR" button.
function showSurveyResult(resultId) {
  const result = CONTENT.survey.results[resultId];
  logEvent(result.log);
  byId("survey-question").hidden = true;
  byId("survey-result").hidden = false;
  byId("survey-result-title").textContent = result.title;
  byId("survey-result-text").textContent = result.text;
  byId("btn-survey-cpr").hidden = resultId !== "unresponsiveBreathing";
}

// ============================================================
// 15. "WHO'S HERE TO HELP?"
// Like everything else, the answer lives in the timeline (kind: "helpers"),
// so Undo works and the handoff can show it.
// ============================================================

// 1, 2 or 3 (3 = "3 or more"), or null if not answered yet.
function helpersCount() {
  const entry = state.timeline.filter((e) => e.kind === "helpers").pop();
  return entry ? entry.value : null;
}

// One shared box, moved into the current screen's slot (like the time box).
function placeHelpers() {
  const box = byId("helpers-box");
  const slots = {
    cpr: cpr.running ? "cpr-helpers-slot" : "cpr-pre-helpers-slot",
    dispatcher: "dispatcher-helpers-slot",
    guided: "guided-helpers-slot",
  };
  const slot = slots[state.mode]; // undefined for "self" or no mode
  box.hidden = !slot || !currentScenario();
  const compact = slot === "cpr-pre-helpers-slot";
  box.classList.toggle("is-compact", compact);
  byId("helpers-question").textContent =
    compact ? `${CONTENT.helpers.question} ${CONTENT.cpr.optional}` : CONTENT.helpers.question;
  if (slot) byId(slot).append(box);
  renderHelpers(); // labels are shorter in the compact version
}

// Draws the 3 buttons (the chosen one marked) and the tips for that answer.
function renderHelpers() {
  const count = helpersCount();
  const scenario = currentScenario();

  const compact = byId("helpers-box").classList.contains("is-compact");
  const options = byId("helpers-options");
  options.replaceChildren();
  for (const option of CONTENT.helpers.options) {
    const button = document.createElement("button");
    button.type = "button";
    const chosen = option.value === count;
    button.className = chosen ? "btn is-on" : "btn";
    button.setAttribute("aria-pressed", String(chosen));
    const label = compact ? option.short : option.label;
    button.textContent = chosen ? `✓ ${label}` : label;
    button.addEventListener("click", () => {
      if (!chosen) {
        logEvent(option.log, { kind: "helpers", value: option.value, undoable: true });
        buzz(40);
      }
    });
    options.append(button);
  }

  let tips = [];
  if (count === 1) tips = CONTENT.helpers.tips.alone;
  if (count >= 2) {
    // [...a, ...b] joins two lists, like a + b in Python.
    tips = [...(scenario && scenario.cprMode ? CONTENT.helpers.tips.groupCardiac : []),
            ...CONTENT.helpers.tips.group];
  }
  const list = byId("helpers-tips");
  list.replaceChildren();
  for (const tip of tips) {
    const item = document.createElement("li");
    item.textContent = tip;
    list.append(item);
  }

  // Alone: no one to switch with, so hide the 2-minute switch timer.
  byId("cpr-timer").hidden = count === 1;
}

// ============================================================
// 16. "IT'S HAPPENING TO ME"
// ============================================================
function startSelf() {
  startEmergency();
  state.scenarioId = null;
  logEvent(CONTENT.log.self);
  chooseMode("self");
}

// ============================================================
// 17. NOTES
// ============================================================

function openNoteForm() {
  byId("note-form").hidden = false;
  byId("btn-add-note").hidden = true;
  byId("note-text").focus(); // opens the phone keyboard
}

function closeNoteForm() {
  byId("note-form").hidden = true;
  byId("btn-add-note").hidden = false;
  byId("note-text").value = "";
}

// Runs when the note form is submitted ("Save note" or Enter on a keyboard).
function saveNote(event) {
  event.preventDefault(); // stop the browser from reloading the page (a form's default)
  const text = byId("note-text").value.trim(); // .trim() is like Python's .strip()
  if (text) {
    logEvent(`${CONTENT.log.note} ${text}`, { undoable: true });
  }
  closeNoteForm();
}

// ============================================================
// 18. PARAMEDIC HANDOFF (Milestone 5)
//
// buildHandoff() reads the timeline and returns a plain object with the
// facts paramedics need. BOTH the screen (renderHandoff) and the copied
// text (handoffText) are made from that one object, so they always match.
// ============================================================

// "14:05" from a time box -> a real timestamp. The time is on the same day
// the rescuer saved it, UNLESS that would be in the future (e.g. at 1 AM,
// "last seen normal at 11 PM" means yesterday), then we go back one day.
function timeFromHHMM(hhmm, savedAt) {
  const [hours, minutes] = hhmm.split(":").map(Number);
  const date = new Date(savedAt);
  date.setHours(hours, minutes, 0, 0);
  let yesterday = false;
  if (date.getTime() > savedAt + 60 * 1000) { // more than a minute in the future
    date.setDate(date.getDate() - 1);
    yesterday = true;
  }
  return { time: date.getTime(), yesterday: yesterday };
}

// 1500000 ms -> "25 min ago", 4500000 -> "1 h 15 min ago".
function formatAgo(ms) {
  const H = CONTENT.handoff;
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return H.justNow;
  const hours = Math.floor(totalMin / 60);
  const minutes = totalMin % 60;
  const text = hours > 0 ? `${hours} ${H.hr} ${minutes} ${H.min}` : `${minutes} ${H.min}`;
  return `${text} ${H.ago}`;
}

function buildHandoff() {
  const H = CONTENT.handoff;
  const L = H.labels;
  const timeline = state.timeline;
  const first = (action) => timeline.find((e) => e.action === action) || null;
  const newestOfKind = (kind) => timeline.filter((e) => e.kind === kind).pop() || null;

  // Situation
  let situation = H.noSituation;
  if (currentScenario()) situation = currentScenario().label;
  if (state.mode === "self") situation = H.selfSituation;

  // Key times, most important first. `important` rows get bigger text;
  // `highlight` (tourniquet) gets an amber border, since EMS must know.
  const keyTimes = [];
  const add = (label, entryTime, extra = {}) => {
    if (entryTime) keyTimes.push({ label: label, time: entryTime, ...extra });
  };
  for (const kind of ["collapse", "onset", "chest", "seizure", "symptoms"]) {
    const entry = newestOfKind(kind);
    if (entry) {
      const t = timeFromHHMM(entry.value, entry.time);
      add(L[kind], t.time, { important: true, yesterday: t.yesterday });
    }
  }
  const tourniquet = first(actionLog("bleeding", "tourniquet"));
  add(L.tourniquet, tourniquet && tourniquet.time, { important: true, highlight: true });
  const cprStart = first(CONTENT.log.cprStarted);
  add(L.cprStarted, cprStart && cprStart.time, { important: true });
  const call = first(CONTENT.log.called911);
  add(L.called911, call && call.time);
  const aed = first(actionLog("cardiac", "aed-arrived"));
  add(L.aedArrived, aed && aed.time);
  const shocks = timeline.filter((e) => e.action === actionLog("cardiac", "shock"));
  if (shocks.length > 0) {
    add(`${L.shocks}: ${shocks.length}, ${L.shocksLast}`, shocks[shocks.length - 1].time);
  }
  // Other one-tap buttons marked with keyTime in content.js (Update 6):
  // "first" = when it first happened; "count" = how many times + the last time.
  // A Set remembers which log texts were already added (two situations can share one).
  const done = new Set();
  for (const scenario of Object.values(CONTENT.scenarios)) {
    for (const action of scenario.logActions) {
      if (!action.keyTime || done.has(action.log)) continue;
      done.add(action.log);
      const entries = timeline.filter((e) => e.action === action.log);
      if (entries.length === 0) continue;
      if (action.keyTime === "count") {
        add(`${action.label}: ${entries.length}, ${L.shocksLast}`, entries[entries.length - 1].time, { important: true });
      } else {
        add(action.label, entries[0].time);
      }
    }
  }
  const ems = first(EMS_LOG);
  add(L.emsArrived, ems && ems.time);
  add(L.started, state.startTime);

  // Warning signs (B.E. F.A.S.T., heart attack): the newest answer for each
  // sign, in the order of the steps. flatMap = map, then join the lists together.
  const findings = [];
  const checkSteps = Object.values(CONTENT.scenarios)
    .flatMap((scenario) => scenario.guidedSteps)
    .filter((step) => step.finding);
  for (const step of checkSteps) {
    const answer = timeline.filter((e) => e.kind === "finding" && e.finding === step.finding).pop();
    if (answer) findings.push(`${step.finding}: ${CONTENT.survey[answer.answer]}`);
  }

  // Quick-check answers, without the "Check:" prefix.
  const checks = timeline
    .filter((e) => e.kind === "check")
    .map((e) => e.action.replace(`${CONTENT.survey.logPrefix} `, ""));

  // Other details
  const details = [];
  const helpers = newestOfKind("helpers");
  if (helpers) {
    const option = CONTENT.helpers.options.find((o) => o.value === helpers.value);
    details.push(`${H.helpers}: ${option.label}`);
  }
  const cprType = timeline.filter((e) =>
    e.action === CONTENT.log.cprTrained || e.action === CONTENT.log.cprHandsOnly).pop();
  if (cprType) details.push(cprType.action);
  else if (cprStart) details.push(CONTENT.log.cprHandsOnly); // hands-only is the default
  const dispatcher = first(CONTENT.log.modeDispatcher);
  if (dispatcher) details.push(`${H.dispatcher}: ${H.yes} (${formatShortTime(dispatcher.time)})`);

  // The person chosen from "Your people" (a snapshot saved in the log).
  const person = [];
  const chosen = newestOfKind("person");
  if (chosen) {
    person.push(chosen.personName);
    if (chosen.conditionLabels.length) person.push(chosen.conditionLabels.join(", "));
    if (chosen.notes) person.push(chosen.notes);
  }

  return {
    person: person,
    situation: situation,
    keyTimes: keyTimes,
    totalTime: formatElapsed(Date.now() - state.startTime),
    findings: findings,
    checks: checks,
    details: details,
    timeline: timeline,
  };
}

// Helper: fills a <ul> with one <li> per string (or hides its box if empty).
function fillList(listId, boxId, items) {
  const list = byId(listId);
  list.replaceChildren();
  for (const text of items) {
    const item = document.createElement("li");
    item.textContent = text;
    list.append(item);
  }
  byId(boxId).hidden = items.length === 0;
}

function renderHandoff() {
  const H = CONTENT.handoff;
  const data = buildHandoff();
  byId("handoff-situation").textContent = data.situation;
  byId("handoff-total").textContent = data.totalTime;

  const times = byId("handoff-times");
  times.replaceChildren();
  for (const row of data.keyTimes) {
    const div = document.createElement("div");
    div.className = "ht-row" + (row.important ? " is-important" : "") + (row.highlight ? " is-highlight" : "");

    const label = document.createElement("span");
    label.className = "ht-label";
    label.textContent = row.label;

    const time = document.createElement("span");
    time.className = "ht-time";
    time.textContent = formatShortTime(row.time) + (row.yesterday ? ` ${H.yesterday}` : "");

    const ago = document.createElement("span");
    ago.className = "ht-ago";
    ago.dataset.time = row.time; // refreshHandoffAgo() reads this every tick
    ago.textContent = formatAgo(Date.now() - row.time);

    div.append(label, time, ago);
    times.append(div);
  }

  fillList("handoff-person", "handoff-person-box", data.person);
  fillList("handoff-findings", "handoff-findings-box", data.findings);
  fillList("handoff-checks", "handoff-checks-box", data.checks);
  fillList("handoff-details", "handoff-details-box", data.details);

  // Full timeline, same format as the event log.
  const list = byId("handoff-timeline");
  list.replaceChildren();
  for (const entry of data.timeline) {
    const item = document.createElement("li");
    const when = document.createElement("span");
    when.className = "timeline-time";
    when.textContent = `+${formatElapsed(entry.time - state.startTime)} · ${formatClockTime(entry.time)}`;
    const what = document.createElement("span");
    what.className = "timeline-action";
    what.textContent = entry.action;
    item.append(when, what);
    list.append(item);
  }
  refreshFullScreenButton();
}

// Every tick: update only the "25 min ago" texts (not the whole screen,
// so the page doesn't jump while someone is reading or selecting text).
function refreshHandoffAgo() {
  document.querySelectorAll(".ht-ago").forEach((el) => {
    el.textContent = formatAgo(Date.now() - Number(el.dataset.time));
  });
  byId("handoff-total").textContent = formatElapsed(Date.now() - state.startTime);
}

// The same facts as plain text, for Copy and Share.
function handoffText() {
  const H = CONTENT.handoff;
  const data = buildHandoff();
  const lines = [H.textTitle, `${H.situation}: ${data.situation}`, ""];

  lines.push(H.keyTimes.toUpperCase());
  for (const row of data.keyTimes) {
    const day = row.yesterday ? ` ${H.yesterday}` : "";
    lines.push(`- ${row.label}: ${formatShortTime(row.time)}${day} (${formatAgo(Date.now() - row.time)})`);
  }
  lines.push(`${H.totalTime}: ${data.totalTime}`, "");

  const section = (title, items) => {
    if (items.length === 0) return;
    lines.push(title.toUpperCase(), ...items.map((x) => `- ${x}`), "");
  };
  section(CONTENT.myPeople.handoffTitle, data.person);
  section(H.findings, data.findings);
  section(H.checks, data.checks);
  section(H.details, data.details);

  lines.push(H.timeline.toUpperCase());
  for (const entry of data.timeline) {
    lines.push(`+${formatElapsed(entry.time - state.startTime)}  ${formatClockTime(entry.time)}  ${entry.action}`);
  }
  lines.push("", H.footer);
  return lines.join("\n"); // "\n" = new line, like Python's "\n".join(lines)
}

let screenBeforeHandoff = "screen-picker";

function openHandoff() {
  const current = document.querySelector(".screen:not([hidden])");
  if (current && current.id !== "screen-handoff") screenBeforeHandoff = current.id;
  byId("copy-status").hidden = true;
  byId("copy-fallback").hidden = true;
  renderHandoff();
  showScreen("screen-handoff");
}

function closeHandoff() {
  exitFullScreen();
  showScreen(screenBeforeHandoff);
}

// Copy: the Clipboard API works on most phones, but can be refused.
// Then we show the text in a box, selected, so it can be copied by hand.
async function copyHandoff() {
  const text = handoffText();
  const status = byId("copy-status");
  const fallback = byId("copy-fallback");
  try {
    await navigator.clipboard.writeText(text);
    status.textContent = CONTENT.handoff.copied;
    fallback.hidden = true;
  } catch (err) {
    status.textContent = CONTENT.handoff.copyFailed;
    fallback.value = text;
    fallback.hidden = false;
    fallback.focus();
    fallback.select();
  }
  status.hidden = false;
}

// Share: opens the phone's own share menu (Messages, email...), if it has one.
async function shareHandoff() {
  try {
    await navigator.share({ title: CONTENT.handoff.textTitle, text: handoffText() });
  } catch (err) {
    // The user closed the share menu, or sharing isn't allowed. Nothing to do.
  }
}

// "Show full screen to paramedic": hides everything except the handoff
// (CSS class), and also asks the browser for real full screen where
// supported. iPhones don't allow it for web pages, so the class alone works there.
function toggleFullScreen() {
  if (document.body.classList.contains("handoff-full")) {
    exitFullScreen();
  } else {
    document.body.classList.add("handoff-full");
    const root = document.documentElement;
    if (root.requestFullscreen) root.requestFullscreen().catch(() => {});
  }
  refreshFullScreenButton();
  window.scrollTo(0, 0);
}

function exitFullScreen() {
  document.body.classList.remove("handoff-full");
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
  refreshFullScreenButton();
}

function refreshFullScreenButton() {
  const full = document.body.classList.contains("handoff-full");
  byId("btn-fullscreen").textContent = full ? CONTENT.handoff.exitFullScreen : CONTENT.handoff.fullScreen;
}

// If the paramedic leaves real full screen with a swipe or the back button,
// leave our full-screen layout too.
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement) {
    document.body.classList.remove("handoff-full");
    refreshFullScreenButton();
  }
});

// ============================================================
// 19. ABOUT & SOURCES (Milestone 6)
// ============================================================

// Builds a list of links from content.js. Each item: { name, url, detail? }.
// target="_blank" opens the source in a new tab, so the app stays open;
// rel="noopener" stops the new page from controlling this one (a safety habit).
function renderLinkList(listId, items) {
  const list = byId(listId);
  list.replaceChildren();
  for (const item of items) {
    const li = document.createElement("li");
    const link = document.createElement("a");
    link.href = item.url;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = item.name;
    li.append(link);
    if (item.detail) {
      const detail = document.createElement("p");
      detail.className = "muted";
      detail.textContent = item.detail;
      li.append(detail);
    }
    list.append(li);
  }
}

function renderAbout() {
  renderLinkList("about-sources", CONTENT.about.sources);
  renderLinkList("about-pages", CONTENT.about.pages);
  renderLinkList("about-research", CONTENT.about.research);
}

function openAbout() {
  byId("delete-status").hidden = true;
  showScreen("screen-about");
}

function closeAbout() {
  showResumeCard(); // may have changed if the user deleted everything
  showScreen("screen-home");
}

// Two taps, like "Delete it" on the resume card.
let deleteAllArmed = false;
function deleteAll() {
  const button = byId("btn-delete-all");
  if (!deleteAllArmed) {
    deleteAllArmed = true;
    button.textContent = CONTENT.about.confirmDeleteAll;
    return;
  }
  deleteSavedSession();
  for (const key of [SETTINGS_KEY, PEOPLE_KEY, TUTORIAL_KEY]) {
    try { localStorage.removeItem(key); } catch (err) { /* nothing to do */ }
  }
  settings = { ...DEFAULT_SETTINGS };
  applySettings();
  refreshHowToButton();
  renderPicker();
  deleteAllArmed = false;
  button.textContent = CONTENT.about.deleteAll;
  byId("resume-card").hidden = true;
  byId("delete-status").textContent = CONTENT.about.deleted;
  byId("delete-status").hidden = false;
}

// ============================================================
// 20. MORE WAYS TO REACH 911 (Update 5): call, Text-to-911, location
//
// A web page can't connect to 911's systems. What it CAN do:
// - open the phone's dialer (tel:911), or its text app (sms:911) with a
//   message already written, so a person who can't talk can still reach 911
//   where Text-to-911 is available;
// - find the phone's GPS position (with permission) to read to the dispatcher.
// ============================================================
let screenBefore911Help = "screen-home";

function openHelp911() {
  const current = document.querySelector(".screen:not([hidden])");
  if (current && current.id !== "screen-911help") screenBefore911Help = current.id;
  renderHelp911();
  showScreen("screen-911help");
}

function closeHelp911() {
  showScreen(screenBefore911Help);
}

// The newest location saved in the timeline (kind: "location"), or null.
function savedLocation() {
  return state.timeline.filter((e) => e.kind === "location").pop() || null;
}

// "40.71280, -74.00600" (5 decimals is about 1 meter)
function formatCoords(loc) {
  return `${loc.lat.toFixed(5)}, ${loc.lon.toFixed(5)}`;
}

// Builds the text message from what the app knows.
function textTo911Message() {
  const H = CONTENT.help911;
  const parts = [H.msgStart];
  const scenario = currentScenario();
  if (state.mode === "self") parts.push(H.msgSelf);
  else if (scenario) parts.push(`${H.msgSituation} ${scenario.label}.`);

  const config = timeBoxConfig();
  const started = config ? state.timeline.filter((e) => e.kind === config.kind).pop() : null;
  if (started) parts.push(`${H.msgStarted} ${formatHourMinute(started.value)}.`);

  const loc = savedLocation();
  parts.push(loc ? `${H.msgLocation} ${formatCoords(loc)}` : H.msgNoLocation);
  return parts.join(" ");
}

// Keeps every "Text 911" link (top bar + 911 help screen) up to date.
// "sms:911?&body=..." opens the text app with the message filled in on both
// iPhone and Android. encodeURIComponent makes spaces and symbols safe in a link.
function updateTextLinks() {
  const href = `sms:911?&body=${encodeURIComponent(textTo911Message())}`;
  document.querySelectorAll(".js-text911").forEach((link) => { link.href = href; });
}

// Runs when a Text 911 link is tapped. Like Call 911: starts the emergency if
// needed and logs only what we know (the text app was opened, not "texted 911").
// The link's href is updated first, so the message includes the latest info.
function handleText911() {
  startEmergency(); // does nothing if already started
  logEvent(CONTENT.log.textOpened);
  updateTextLinks();
  // We do NOT call preventDefault(), so the browser still opens the text app.
}

function renderHelp911() {
  const message = textTo911Message();
  byId("sms-preview").textContent = message;
  updateTextLinks();

  const loc = savedLocation();
  const result = byId("loc-result");
  if (loc) {
    const feet = Math.round(loc.accuracy * 3.28084); // meters -> feet
    result.textContent = `${formatCoords(loc)} (${CONTENT.help911.accuracy} ${feet} ${CONTENT.help911.feet})`;
    result.hidden = false;
    byId("btn-copy-loc").hidden = false;
  }
}

// Asks the phone for its GPS position. The phone shows its own permission
// question the first time. It can fail (permission denied, no signal), so
// there's an error callback.
function findLocation() {
  const result = byId("loc-result");
  if (!("geolocation" in navigator)) {
    result.textContent = CONTENT.help911.locDenied;
    result.hidden = false;
    return;
  }
  result.textContent = CONTENT.help911.locating;
  result.hidden = false;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const loc = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
        accuracy: position.coords.accuracy, // in meters
      };
      logEvent(`${CONTENT.log.location} ${formatCoords(loc)}`, { kind: "location", ...loc });
      renderHelp911();
    },
    () => {
      result.textContent = CONTENT.help911.locDenied;
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
}

async function copyLocation() {
  const loc = savedLocation();
  if (!loc) return;
  try {
    await navigator.clipboard.writeText(formatCoords(loc));
    byId("btn-copy-loc").textContent = CONTENT.help911.copied;
  } catch (err) {
    // Copy refused: the coordinates are still on screen to read out loud.
  }
}

// ============================================================
// 21. READ STEPS ALOUD (optional, off by default)
// The Web Speech API turns text into speech on the phone itself (no
// internet needed on most phones). Off by default so it doesn't talk over
// the 911 dispatcher on speakerphone.
// ============================================================
function speak(text) {
  if (!state.readAloud || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel(); // stop the previous step if it's still talking
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.95;           // a little slower than normal, for stress
  window.speechSynthesis.speak(utterance);
}

function refreshReadAloudButton() {
  const button = byId("btn-read-aloud");
  button.textContent = state.readAloud ? CONTENT.readAloudOn : CONTENT.readAloudOff;
  button.setAttribute("aria-pressed", String(Boolean(state.readAloud)));
  button.classList.toggle("is-on", Boolean(state.readAloud));
}

function toggleReadAloud() {
  state.readAloud = !state.readAloud;
  if (!state.readAloud && "speechSynthesis" in window) window.speechSynthesis.cancel();
  refreshReadAloudButton();
  saveSession();
  if (state.readAloud) speak(byId("step-text").textContent); // read the current step now
}

// ============================================================
// 22. OFFLINE SUPPORT
// Registers sw.js (the service worker), which saves every file on the phone
// so the app opens with no signal. Service workers only run on real web
// addresses (https:// or localhost), not when opening index.html as a file,
// and some previews block them, so this checks first and ignores failures.
// ============================================================
function registerOffline() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  navigator.serviceWorker.register("sw.js").catch(() => {
    // Not allowed here (e.g. inside a preview). The app still works online.
  });
}

// ============================================================
// 23. START OVER (top bar)
// Asks first, in a popup. "Yes" deletes the saved log and reloads the page,
// which is the simplest way to be sure everything (clock, CPR beat, screens)
// starts completely fresh.
// ============================================================
function openResetConfirm() {
  const dialog = byId("startover-dialog");
  if (typeof dialog.showModal === "function") {
    dialog.showModal();                 // the popup, with the page dimmed behind it
  } else {
    dialog.setAttribute("open", "");    // very old browsers: show it in the page
  }
  byId("btn-reset-cancel").focus();     // the safe choice gets focus
}

function closeResetConfirm() {
  const dialog = byId("startover-dialog");
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function resetEverything() {
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  metronomeStop();
  deleteSavedSession();
  location.reload();
}

// ============================================================
// 24. SETTINGS (Update 7): text size, Calm, sound and read-aloud defaults.
// Saved separately from the emergency log, so Start over keeps them.
// ============================================================
const SETTINGS_KEY = "minutezero.settings";
const DEFAULT_SETTINGS = { textSize: "normal", calm: false, sound: true, readAloud: false };
let settings = { ...DEFAULT_SETTINGS }; // { ...x } makes a copy, like dict(x) in Python

function loadSettings() {
  try {
    const text = localStorage.getItem(SETTINGS_KEY);
    if (text) settings = { ...DEFAULT_SETTINGS, ...JSON.parse(text) };
  } catch (err) {
    // keep the defaults
  }
}

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    // not saved, but still applied for now
  }
}

// Text size works by changing the root font size: almost every size in
// styles.css is in "rem" (a multiple of the root size), so everything grows.
function applySettings() {
  const root = document.documentElement;
  root.classList.remove("text-large", "text-xlarge");
  if (settings.textSize !== "normal") root.classList.add(`text-${settings.textSize}`);
  root.classList.toggle("calm", settings.calm);
  metronome.soundOn = settings.sound;
  refreshCprControls();
}

function changeSettings(newValues) {
  settings = { ...settings, ...newValues };
  saveSettings();
  applySettings();
  renderSettings();
  byId("settings-saved").textContent = CONTENT.settings.saved;
  byId("settings-saved").hidden = false;
}

// A row of toggle buttons; the chosen one is marked (aria-pressed + check mark).
function renderSettings() {
  const presets = byId("settings-presets");
  presets.replaceChildren();
  for (const preset of CONTENT.settings.presets) {
    const active = Object.entries(preset.values).every(([key, value]) => settings[key] === value);
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "btn is-on" : "btn";
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? `✓ ${preset.label}` : preset.label;
    button.addEventListener("click", () => changeSettings(preset.values));
    presets.append(button);
  }

  const sizes = byId("settings-textsize");
  sizes.replaceChildren();
  for (const size of CONTENT.settings.textSizes) {
    const active = settings.textSize === size.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "btn is-on" : "btn";
    button.setAttribute("aria-pressed", String(active));
    button.textContent = active ? `✓ ${size.label}` : size.label;
    button.addEventListener("click", () => changeSettings({ textSize: size.id }));
    sizes.append(button);
  }

  byId("set-calm").checked = settings.calm;
  byId("set-sound").checked = settings.sound;
  byId("set-read").checked = settings.readAloud;
}

function openSettings() {
  byId("settings-saved").hidden = true;
  renderSettings();
  showScreen("screen-settings");
}

// ============================================================
// 25. TUTORIAL (Update 7). Only opened from the home screen or About.
// ============================================================
const TUTORIAL_KEY = "minutezero.tutorialSeen";
let tutorialIndex = 0;

function tutorialSeen() {
  try { return localStorage.getItem(TUTORIAL_KEY) === "1"; } catch (err) { return false; }
}

// Until it's been seen once, the home link is highlighted: "New here? ..."
function refreshHowToButton() {
  const seen = tutorialSeen();
  const button = byId("btn-howto");
  button.textContent = seen ? CONTENT.home.howToAgain : CONTENT.home.howTo;
  button.classList.toggle("is-new", !seen);
}

function openTutorial() {
  tutorialIndex = 0;
  renderTutorial();
  showScreen("screen-tutorial");
}

function renderTutorial() {
  const T = CONTENT.tutorial;
  const card = T.cards[tutorialIndex];
  const last = tutorialIndex === T.cards.length - 1;
  byId("tutorial-counter").textContent = `${tutorialIndex + 1} ${CONTENT.ofLabel} ${T.cards.length}`;
  byId("tutorial-title").textContent = card.title;
  byId("tutorial-text").textContent = card.text;
  byId("btn-tutorial-next").textContent = last ? T.done : T.next;
  byId("btn-tutorial-back").disabled = tutorialIndex === 0;
  byId("btn-tutorial-skip").hidden = last;
}

function tutorialNext() {
  if (tutorialIndex === CONTENT.tutorial.cards.length - 1) {
    finishTutorial();
  } else {
    tutorialIndex++;
    renderTutorial();
  }
}

function finishTutorial() {
  try { localStorage.setItem(TUTORIAL_KEY, "1"); } catch (err) { /* fine */ }
  refreshHowToButton();
  showScreen("screen-home");
}

// ============================================================
// 26. MY PEOPLE (Update 7): conditions the user or their family have been
// diagnosed with. Saved only on this phone. The app never diagnoses: these
// are facts the user typed in, used to move situations to the top and to
// show paramedics the person's info if that person is chosen.
// ============================================================
const PEOPLE_KEY = "minutezero.people";
let editingIndex = null;   // which person the form is editing (null = new person)
let removeArmed = null;    // which person's Remove was tapped once

function loadPeople() {
  try {
    const list = JSON.parse(localStorage.getItem(PEOPLE_KEY));
    return Array.isArray(list) ? list : [];
  } catch (err) {
    return [];
  }
}

function savePeople(list) {
  try {
    localStorage.setItem(PEOPLE_KEY, JSON.stringify(list));
  } catch (err) {
    // couldn't save (e.g. private browsing)
  }
}

function conditionLabels(person) {
  return person.conditions
    .map((id) => CONTENT.myPeople.conditions.find((c) => c.id === id))
    .filter(Boolean)          // drop unknown ids
    .map((c) => c.label);
}

function renderPeople() {
  const M = CONTENT.myPeople;
  const list = byId("people-list");
  list.replaceChildren();
  const people = loadPeople();
  if (people.length === 0) {
    const empty = document.createElement("li");
    empty.className = "muted";
    empty.textContent = M.empty;
    list.append(empty);
  }
  people.forEach((person, index) => {
    const item = document.createElement("li");
    item.className = "person-card stack";

    const name = document.createElement("p");
    name.className = "person-name";
    name.textContent = person.name;           // textContent: typed text is never run as code
    const conditions = document.createElement("p");
    conditions.textContent = conditionLabels(person).join(", ");
    item.append(name, conditions);
    if (person.notes) {
      const notes = document.createElement("p");
      notes.className = "muted";
      notes.textContent = person.notes;
      item.append(notes);
    }

    const row = document.createElement("div");
    row.className = "row";
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "btn";
    edit.textContent = M.edit;
    edit.addEventListener("click", () => openPersonForm(index));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "btn";
    remove.textContent = removeArmed === index ? M.confirmRemove : M.remove;
    remove.addEventListener("click", () => removePerson(index));
    row.append(edit, remove);
    item.append(row);
    list.append(item);
  });
}

function openPeople() {
  removeArmed = null;
  closePersonForm();
  renderPeople();
  showScreen("screen-people");
}

function openPersonForm(index = null) {
  editingIndex = index;
  const person = index === null ? { name: "", conditions: [], notes: "" } : loadPeople()[index];
  byId("person-name").value = person.name;
  byId("person-notes").value = person.notes || "";
  byId("person-name").placeholder = CONTENT.myPeople.namePlaceholder;
  byId("person-notes").placeholder = CONTENT.myPeople.notesPlaceholder;

  const box = byId("person-conditions");
  box.replaceChildren();
  for (const condition of CONTENT.myPeople.conditions) {
    const label = document.createElement("label");
    label.className = "toggle";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = condition.id;
    input.checked = person.conditions.includes(condition.id);
    const text = document.createElement("span");
    text.textContent = condition.label;
    label.append(input, text);
    box.append(label);
  }
  byId("person-error").hidden = true;
  byId("person-form").hidden = false;
  byId("btn-add-person").hidden = true;
  byId("person-name").focus();
}

function closePersonForm() {
  byId("person-form").hidden = true;
  byId("btn-add-person").hidden = false;
  editingIndex = null;
}

function savePerson(event) {
  event.preventDefault();
  const name = byId("person-name").value.trim();
  if (!name) {
    byId("person-error").textContent = CONTENT.myPeople.needName;
    byId("person-error").hidden = false;
    byId("person-name").focus();
    return;
  }
  const conditions = [...byId("person-conditions").querySelectorAll("input:checked")].map((i) => i.value);
  const person = { name: name, conditions: conditions, notes: byId("person-notes").value.trim() };

  const people = loadPeople();
  if (editingIndex === null) people.push(person);
  else people[editingIndex] = person;
  savePeople(people);
  closePersonForm();
  renderPeople();
  renderPicker(); // their situations move to the top of "What's happening?"
}

function removePerson(index) {
  if (removeArmed !== index) {   // first tap: ask again
    removeArmed = index;
    renderPeople();
    return;
  }
  const people = loadPeople();
  people.splice(index, 1);       // remove 1 item at that position (like del list[i] in Python)
  savePeople(people);
  removeArmed = null;
  renderPeople();
  renderPicker();
}

// Picking "Seizure for Dad": log who it is (a snapshot of their saved info,
// so the handoff stays right even if the info is edited later), then open
// that situation as usual.
function choosePerson(person, scenarioId) {
  const labels = conditionLabels(person);
  logEvent(`${CONTENT.myPeople.logPerson} ${person.name} (${labels.join(", ")})`, {
    kind: "person",
    personName: person.name,
    conditionLabels: labels,
    notes: person.notes || "",
  });
  chooseScenario(scenarioId);
}

// ============================================================
// 27. START-UP: connect buttons to functions
// ============================================================
function init() {
  loadSettings();
  fillContent();
  byId("note-text").placeholder = CONTENT.notePlaceholder;
  byId("cpr-hands-image").src = HANDS_IMAGE.src;
  byId("cpr-hands-image").alt = HANDS_IMAGE.alt;
  renderPicker();
  renderAbout();
  applySettings();
  refreshHowToButton();
  registerOffline();
  updateClock();
  refreshCprControls();
  showResumeCard();

  // The self screen's tips are a list in content.js.
  for (const tip of CONTENT.self.tips) {
    const item = document.createElement("li");
    item.textContent = tip;
    byId("self-tips").append(item);
  }

  byId("btn-start").addEventListener("click", startEmergency);
  byId("btn-self").addEventListener("click", startSelf);
  document.querySelectorAll(".js-call911").forEach((link) => {
    link.addEventListener("click", handleCall911);
  });
  byId("btn-resume").addEventListener("click", resumeSession);
  byId("btn-discard").addEventListener("click", discardSession);

  byId("btn-mode-dispatcher").addEventListener("click", () => chooseMode("dispatcher"));
  byId("btn-mode-guided").addEventListener("click", () => chooseMode("guided"));
  byId("btn-to-guided").addEventListener("click", () => chooseMode("guided"));
  byId("btn-guided-switch").addEventListener("click", leaveGuided);
  byId("btn-cpr-steps").addEventListener("click", () => chooseMode("guided"));
  document.querySelectorAll(".js-change-scenario").forEach((button) => {
    button.addEventListener("click", () => showScreen("screen-picker"));
  });

  byId("btn-step-done").addEventListener("click", stepDone);
  byId("btn-step-skip").addEventListener("click", () => goToStep(state.stepIndex + 1));
  byId("btn-step-back").addEventListener("click", () => goToStep(state.stepIndex - 1));
  byId("btn-steps-restart").addEventListener("click", () => goToStep(0));
  // If an image file is missing or broken, hide the picture instead of
  // showing a broken-image icon. The step text still works on its own.
  byId("step-image").addEventListener("error", () => {
    byId("step-figure").hidden = true;
  });

  // Yes / No / Not sure buttons. data-answer="yes" -> button.dataset.answer === "yes"
  document.querySelectorAll(".js-survey-answer").forEach((button) => {
    button.addEventListener("click", () => answerSurvey(button.dataset.answer));
  });
  document.querySelectorAll(".js-step-answer").forEach((button) => {
    button.addEventListener("click", () => answerStep(button.dataset.answer));
  });
  byId("btn-survey-restart").addEventListener("click", startSurvey);
  byId("btn-survey-cpr").addEventListener("click", () => chooseScenario("cardiac"));

  byId("btn-cpr-start").addEventListener("click", () => startCpr());
  byId("btn-about").addEventListener("click", openAbout);
  byId("btn-howto").addEventListener("click", openTutorial);
  byId("btn-about-howto").addEventListener("click", openTutorial);
  byId("btn-tutorial-next").addEventListener("click", tutorialNext);
  byId("btn-tutorial-back").addEventListener("click", () => { tutorialIndex--; renderTutorial(); });
  byId("btn-tutorial-skip").addEventListener("click", finishTutorial);
  byId("btn-people").addEventListener("click", openPeople);
  byId("btn-add-person").addEventListener("click", () => openPersonForm());
  byId("btn-person-cancel").addEventListener("click", closePersonForm);
  byId("person-form").addEventListener("submit", savePerson);
  byId("btn-settings").addEventListener("click", openSettings);
  byId("set-calm").addEventListener("change", (e) => changeSettings({ calm: e.target.checked }));
  byId("set-sound").addEventListener("change", (e) => changeSettings({ sound: e.target.checked }));
  byId("set-read").addEventListener("change", (e) => changeSettings({ readAloud: e.target.checked }));
  document.querySelectorAll(".js-back-home").forEach((button) => {
    button.addEventListener("click", () => showScreen("screen-home"));
  });
  byId("btn-reset").addEventListener("click", openResetConfirm);
  byId("btn-reset-time").addEventListener("click", resetTime);
  byId("btn-reset-cancel").addEventListener("click", closeResetConfirm);
  byId("btn-reset-yes").addEventListener("click", resetEverything);
  // Only show "Read steps aloud" if this phone/browser can speak (feature detection).
  if ("speechSynthesis" in window) {
    byId("btn-read-aloud").hidden = false;
    byId("btn-read-aloud").addEventListener("click", toggleReadAloud);
  }
  refreshReadAloudButton();
  byId("btn-step-emergency").addEventListener("click", stepEmergency);
  document.querySelectorAll(".js-open-911help").forEach((button) => {
    button.addEventListener("click", openHelp911);
  });
  byId("btn-911help-back").addEventListener("click", closeHelp911);
  byId("btn-locate").addEventListener("click", findLocation);
  byId("btn-copy-loc").addEventListener("click", copyLocation);
  document.querySelectorAll(".js-text911").forEach((link) => {
    link.addEventListener("click", handleText911);
  });
  byId("btn-about-back").addEventListener("click", closeAbout);
  byId("btn-delete-all").addEventListener("click", deleteAll);

  document.querySelectorAll(".js-open-handoff").forEach((button) => {
    button.addEventListener("click", openHandoff);
  });
  byId("btn-handoff-back").addEventListener("click", closeHandoff);
  byId("btn-copy").addEventListener("click", copyHandoff);
  byId("btn-fullscreen").addEventListener("click", toggleFullScreen);
  // Only show Share on phones/browsers that have a share menu (feature detection).
  if (navigator.share) {
    byId("btn-share").hidden = false;
    byId("btn-share").addEventListener("click", shareHandoff);
  }
  byId("btn-sound").addEventListener("click", toggleSound);
  byId("btn-trained").addEventListener("click", toggleTrained);
  byId("btn-breaths-done").addEventListener("click", startCompressionSet);
  byId("btn-switched").addEventListener("click", rescuersSwitched);

  byId("btn-time-now").addEventListener("click", setTimeToNow);
  byId("btn-time-save").addEventListener("click", saveTime);

  byId("btn-add-note").addEventListener("click", openNoteForm);
  byId("btn-note-cancel").addEventListener("click", closeNoteForm);
  byId("note-form").addEventListener("submit", saveNote);
  byId("btn-undo").addEventListener("click", undoLast);
}

init();
