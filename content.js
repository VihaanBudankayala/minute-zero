/*
 * content.js — ALL user-facing medical and safety text for Minute Zero.
 *
 * Why a separate file?
 *  - Judges (and you) can review every medical word in one place.
 *  - app.js never contains medical instructions; it only displays what is here.
 *  - Every medical statement includes a `source` field naming which official
 *    guideline it comes from. Anything not yet checked against the official
 *    documents is marked with  // VERIFY
 *
 * This file is loaded BEFORE app.js (see index.html), so app.js can read CONTENT.
 */

// Used twice (CPR screen + guided step), so it's defined once here.
// VERIFY: "heel of one hand ... other hand on top". The AHA summaries only say "center of the chest".
const HANDS_IMAGE = {
  src: "images/cpr-hand-placement.webp",
  alt: "Drawing of a rescuer kneeling beside a person lying on their back, arms straight, with both hands stacked on the center of the person's chest. An arrow points down.",
};

const CONTENT = {
  appName: "Minute Zero",

  tagline:
    "Works alongside your 911 call. Logs what you do, with times, for paramedics, and guides you if no one else can.",

  // Required on the home screen (and later on the About & Sources screen).
  disclaimer:
    "This app does not replace calling 911 or formal first-aid training.",

  // ---------- Home screen ----------
  startButtonMain: "START",
  startButtonSub: "EMERGENCY",
  startHint: "Tap when someone needs help. A timer and event log start right away.",

  // Shown on the home screen if an unfinished emergency was saved on this phone.
  resume: {
    title: "Unfinished emergency",
    startedAt: "Started at",        // + time
    entries: "entries in the log",  // "12 entries in the log"
    resume: "Resume",
    discard: "Delete it",
    confirmDiscard: "Tap again to delete it for good",
    note: "Tapping START begins a new log and replaces this one.",
  },

  // Shown under the START button, which pulses at this rate.
  beatNote: {
    text: "This button beats 110 times a minute: the pace for CPR chest compressions (100–120 per minute).",
    source: "2025 AHA CPR & ECC Guidelines, Part 7",
  },

  call911Button: "Call 911",
  text911Button: "Text 911",

  // ---------- Home screen links (Update 7) ----------
  home: {
    howTo: "New here? See how it works (30 sec)",   // shown until the tutorial is seen once
    howToAgain: "How to use Minute Zero",
    myPeople: "My people (medical info)",
    settings: "Settings",
  },

  // ---------- Tutorial (Update 7) ----------
  // Never shown automatically: someone may open the app for the first time
  // DURING an emergency, so it must never stand between them and START.
  tutorial: {
    heading: "How Minute Zero works",
    next: "Next",
    back: "Back",
    skip: "Skip",
    done: "Got it",
    cards: [
      { title: "1. Call 911 first", text: "The red Call 911 button is always at the top. Can't talk? Use Text 911 next to it. Put the call on speaker." },
      { title: "2. Tap START", text: "It starts a clock and a log of everything you do, with the time. Paramedics need those times." },
      { title: "3. Pick what you see", text: "Each button lists the signs to look for. Not sure? Answer a few yes/no questions. Not responding and not breathing normally goes straight to CPR." },
      { title: "4. Follow the dispatcher, then tap to log", text: "If the 911 dispatcher is giving instructions, follow them and tap the big buttons to log what you do. If no one is helping, the app guides you step by step." },
      { title: "5. Show the handoff to paramedics", text: "When EMS arrives, tap \"Handoff for paramedics\". It shows the key times and everything you logged." },
    ],
  },

  // ---------- My people: known conditions (Update 7) ----------
  // Facts the user enters about themselves or family. The app never diagnoses;
  // it only moves those situations to the top and shows the info to paramedics.
  myPeople: {
    heading: "My people",
    intro: "Add yourself or family members and what they've been diagnosed with. Those situations move to the top of \"What's happening?\", and if you pick that person in an emergency, their info is shown to paramedics.",
    privacy: "Saved only on this phone. Nothing is sent anywhere.",
    add: "Add a person",
    nameLabel: "Name or relationship",
    namePlaceholder: "Example: Dad",
    conditionsLabel: "Diagnosed with (tick all that apply)",
    notesLabel: "Notes for paramedics (optional)",
    notesPlaceholder: "Example: Allergic to peanuts. EpiPen in the kitchen drawer. Takes insulin.",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    remove: "Remove",
    confirmRemove: "Tap again to remove",
    empty: "No one added yet.",
    needName: "Please enter a name or relationship.",
    // Each condition points to the situation it relates to.
    conditions: [
      { id: "epilepsy", label: "Epilepsy or seizures", scenario: "seizure" },
      { id: "diabetes", label: "Diabetes", scenario: "lowsugar" },
      { id: "allergy", label: "Severe allergy (has needed epinephrine)", scenario: "allergy" },
      { id: "heart", label: "Heart disease or a past heart attack", scenario: "heart" },
      { id: "stroke", label: "Had a stroke before", scenario: "stroke" },
      { id: "opioid", label: "Takes opioid pain medicine", scenario: "opioid" },
    ],
    pickerHeading: "Your people",
    pickerFor: "for",                 // "Seizure for Dad"
    logPerson: "Person:",             // "Person: Dad (Epilepsy or seizures)"
    handoffTitle: "Saved medical info (entered by the user)",
    back: "Back",
  },

  // ---------- Settings (Update 7) ----------
  settings: {
    heading: "Settings",
    note: "Saved only on this phone.",
    presetsTitle: "Presets",
    presets: [
      { id: "standard", label: "Standard", values: { textSize: "normal", calm: false, sound: true, readAloud: false } },
      { id: "large", label: "Large text", values: { textSize: "large", calm: false, sound: true, readAloud: false } },
      { id: "calm", label: "Calm (no pulsing)", values: { textSize: "normal", calm: true, sound: true, readAloud: false } },
      { id: "handsfree", label: "Hands-free (reads steps aloud)", values: { textSize: "large", calm: false, sound: true, readAloud: true } },
    ],
    textSizeTitle: "Text size",
    textSizes: [
      { id: "normal", label: "Normal" },
      { id: "large", label: "Large" },
      { id: "xlarge", label: "Extra large" },
    ],
    optionsTitle: "Options",
    calm: "Calm: no pulsing or moving animations",
    sound: "CPR beat sound on when CPR starts",
    readAloud: "Read steps aloud from the start",
    saved: "✓ Saved",
    back: "Back",
  },

  // ---------- Top bar: Reset time + Start over ----------
  reset: {
    timeButton: "Reset time",
    timeLog: "Timer reset to 0:00", // logged, so the record stays honest (and Undo works)
    button: "Start over",
    question: "Are you sure you want to start over?",
    note: "This erases this emergency's log and goes back to the start screen. If paramedics need it, show or copy the handoff first.",
    yes: "Yes, start over",
    cancel: "Cancel",
  },

  // ---------- "It's happening to me" (the person in trouble is using the app) ----------
  selfButton: "It's happening to me",
  self: {
    heading: "Call 911 now.",
    tips: [
      "Tell them where you are.",
      "Stay on the line and follow the dispatcher's instructions.",
    ],
    // No self-treatment steps here unless they are confirmed in our sources.
    timeBox: {
      kind: "symptoms",
      label: "It started at",
      hint: "Paramedics need this time. Tap Now if it just started.",
      log: "Symptoms started (own report):",
    },
    someoneHere: "Someone is here to help me now",
  },

  // ---------- 911 status card (shown on every screen after START) ----------
  status911: {
    notCalled: "911 not called yet.", // the pulsing Call 911 button is right above
    // "tapped", not "called": the app can't know if the phone really
    // started the call (e.g. inside a preview, or on a computer).
    calledAt: "Call 911 tapped at", // the app adds the time after this
    // \u2011 = a hyphen that never breaks across lines, so "9-1-1" stays together.
    didntOpen: "Dialer didn't open? Dial 9\u20111\u20111, or tap Text 911.",
    // Shown instead on computers (no phone line, so tel: links can't call 911).
    computer: "Computers usually can't call 911. Use a phone.",
    speakerTip:
      "Put the call on speaker. If the dispatcher is giving instructions, follow them. Tap below to log what you do.",
  },

  // ---------- Scenario picker ----------
  pickerHeading: "What's happening?",
  pickerHint: "Pick what you see.",
  changeScenario: "Change what's happening",
  pickerUnsure: "I'm not sure what's happening",
  pickerUnsureShort: "Not sure? Answer a few questions", // compact button under the urgent ones
  pickerOthers: "Other situations",

  // ---------- "Not sure" check ----------
  // A short decision tree. Each question's `next` says where each answer goes:
  // another question's id, or "result:<id>" (a scenario id or a result below).
  // "Not sure" always goes to the safer path. The app never diagnoses: it
  // only uses the warning signs from our sources to suggest a situation.
  survey: {
    heading: "Let's check together",
    hint: "One question at a time. If you can't tell, tap Not sure.",
    // Symbols + words, so each button is recognizable at a glance.
    yes: "✓ Yes",
    no: "✗ No",
    notSure: "? Not sure",
    startOver: "Start over",
    logPrefix: "Check:", // "Check: Responds to tap and shout: no"
    answers: { yes: "yes", no: "no", notSure: "not sure" }, // words used in the log
    first: "responds",
    questions: {
      responds: {
        text: "Tap their shoulders and shout, \"Are you OK?\" Do they respond?",
        detail: "Responding means moving, talking, blinking or reacting.",
        finding: "Responds to tap and shout",
        next: { yes: "choking", no: "breathing", notSure: "breathing" },
        source: "AHA (heart.org), Treatment of Cardiac Arrest; American Red Cross",
      },
      breathing: {
        text: "Are they breathing normally?",
        detail: "Gasping is not normal breathing.",
        finding: "Breathing normally",
        next: { yes: "seizure", no: "result:cardiac", notSure: "result:cardiac" },
        source: "AHA (heart.org), Treatment of Cardiac Arrest; 2025 AHA CPR & ECC Guidelines, Part 7",
      },
      choking: {
        text: "Are they unable to breathe, cough or talk, or holding their throat?",
        finding: "Choking signs",
        next: { yes: "result:choking", no: "bleeding", notSure: "result:choking" },
        source: "2025 AHA CPR & ECC Guidelines, Part 7",
      },
      // VERIFY: "won't stop, spurting or pooling" as the description of life-threatening bleeding.
      bleeding: {
        text: "Is there bleeding that won't stop, or blood spurting or pooling?",
        finding: "Severe bleeding",
        next: { yes: "result:bleeding", no: "stroke", notSure: "result:bleeding" },
        source: "STOP THE BLEED (American College of Surgeons)",
      },
      bleedingUnresponsive: {
        text: "Is there bleeding that won't stop, or blood spurting or pooling?",
        finding: "Severe bleeding",
        next: { yes: "result:bleeding", no: "result:unresponsiveBreathing", notSure: "result:bleeding" },
        source: "STOP THE BLEED (American College of Surgeons)",
      },
      stroke: {
        text: "Do you see any of these: loss of balance, vision trouble, face drooping, arm weakness, or speech difficulty?",
        detail: "Count it even if it comes and goes.",
        finding: "Stroke warning signs",
        next: { yes: "result:stroke", no: "chest", notSure: "result:stroke" },
        source: "American Stroke Association B.E. F.A.S.T. warning signs",
      },
      chest: {
        text: "Do they have chest pain or pressure, or pain in the arms, back, neck, jaw or stomach?",
        finding: "Heart attack warning signs",
        next: { yes: "result:heart", no: "allergy", notSure: "result:heart" },
        source: "AHA, Warning Signs of a Heart Attack",
      },
      // VERIFY: wording of the allergy signs (Red Cross anaphylaxis page).
      allergy: {
        text: "Is their face, lips or tongue swelling, or are they struggling to breathe after a food, sting or medicine?",
        finding: "Severe allergic reaction signs",
        next: { yes: "result:allergy", no: "diabetes", notSure: "result:allergy" },
        source: "2024 AHA & American Red Cross First Aid Guidelines; American Red Cross, Allergic Reaction/Anaphylaxis",
      },
      diabetes: {
        text: "Do they have diabetes and seem shaky, sweaty or confused?",
        finding: "Low blood sugar signs",
        next: { yes: "result:lowsugar", no: "result:none", notSure: "result:lowsugar" },
        source: "2024 AHA & American Red Cross First Aid Guidelines",
      },
      // Unresponsive but breathing normally:
      seizure: {
        text: "Are they shaking or jerking, or did they just have a seizure?",
        finding: "Seizure signs",
        next: { yes: "result:seizure", no: "opioid", notSure: "opioid" },
        source: "2024 AHA & American Red Cross First Aid Guidelines",
      },
      // VERIFY: examples of opioids in the question.
      opioid: {
        text: "Could they have taken opioids, like strong pain pills or fentanyl?",
        finding: "Possible opioid use",
        next: { yes: "result:opioid", no: "bleedingUnresponsive", notSure: "bleedingUnresponsive" },
        source: "2025 AHA CPR & ECC Guidelines, Part 7",
      },
    },
    results: {
      // VERIFY: "keep watching their breathing" wording.
      unresponsiveBreathing: {
        title: "They don't respond, but they are breathing.",
        text: "Call 911 and follow the dispatcher. Keep watching their breathing. If it stops or turns into gasping, start CPR.",
        log: "Check result: does not respond, but breathing",
        source: "AHA (heart.org), Treatment of Cardiac Arrest",
      },
      none: {
        title: "This doesn't match the situations in this app.",
        text: "If you're worried, call 911 and follow the dispatcher. Use Add note to log what you see.",
        log: "Check result: none of the app's situations",
      },
    },
    startCpr: "Breathing stopped or gasping? Start CPR",
    pickMyself: "Choose a situation myself",
  },

  // ---------- "Who's here to help?" ----------
  // Never asked before compressions start; it's a row of buttons on the screens.
  helpers: {
    question: "Who's here to help?",
    options: [
      // short = label for the compact version (before START CPR)
      { value: 1, label: "Just me", short: "Just me", log: "Helpers: just the rescuer" },
      { value: 2, label: "2 people", short: "2", log: "Helpers: 2 people" },
      { value: 3, label: "3 or more", short: "3+", log: "Helpers: 3 or more people" },
    ],
    tips: {
      // VERIFY: lone-rescuer phone-on-speaker wording (2025 AHA Part 7).
      alone: ["Put the phone on speaker next to you, so your hands are free."],
      // VERIFY: "meet EMS at the door" is not in the summaries we checked.
      group: ["Ask someone to meet EMS at the door and show them the way."],
      groupCardiac: ["Send someone to get an AED, if one is nearby."],
    },
    source: "AHA (heart.org), Treatment of Cardiac Arrest; 2025 AHA CPR & ECC Guidelines, Part 7",
  },

  // ---------- Choosing a mode ----------
  modeHeading: "Is the 911 dispatcher giving you instructions?",
  modeDispatcher: "Yes, the dispatcher is helping me",
  modeGuided: "No, or the call dropped. Guide me step by step",

  // ---------- Dispatcher mode ----------
  dispatcherHeading: "Follow the dispatcher",
  dispatcherHint: "Tap a button each time something happens. The time is saved.",
  switchToGuided: "No instructions or call dropped? Show steps",
  tapToLog: "Tap to log",
  loggedAt: "✓", // the app adds the time after this, e.g. "✓ 2:14 PM"

  // ---------- Guided steps ----------
  stepLabel: "Step",  // "Step 2 of 8"
  readAloudOff: "Read steps aloud: Off",
  readAloudOn: "Read steps aloud: On",
  ofLabel: "of",
  done: "Done",
  skip: "Skip",
  back: "Back",
  lastStepNote: "That was the last step. Keep going until EMS takes over.",
  restartSteps: "Go back to step 1",
  switchToDispatcher: "Dispatcher giving instructions? Show log buttons",
  emergencyLog: "Stopped responding", // logged when a step's red emergency button is tapped

  // ---------- Time box (collapse time / stroke onset time) ----------
  // The labels for each scenario are in that scenario's `timeBox` below.
  timeBox: {
    now: "Now",
    save: "Save time",
    saveShort: "Save", // compact version
    savedAs: "Saved:",
  },

  // ---------- CPR screen ----------
  cpr: {
    optional: "(optional)", // added to both labels before START CPR
    startButton: "START CPR",
    followDispatcher: "If the 911 dispatcher is giving instructions, follow them.",
    push: "PUSH",
    instruction: "Push hard and fast in the center of the chest, at least 2 inches deep. Follow the beat.",
    instructionSource: "2025 AHA CPR & ECC Guidelines, Part 7; AHA Hands-Only CPR",

    // 30:2 mode (trained lay rescuers). VERIFY: breath technique is not described here on purpose;
    // the app assumes the rescuer was trained in how to give breaths.
    breaths: "2 BREATHS",
    breathsText: "Give 2 breaths, then tap the button and keep pushing.",
    breathsDone: "Breaths given: keep pushing",
    trainedSource: "2025 AHA CPR & ECC Guidelines, Part 7",

    soundOn: "Sound: on",
    soundOff: "Sound: off",
    handsOnly: "Trained? Add breaths (30:2)",
    trainedOn: "✓ Adding breaths (30:2)",

    // VERIFY: switching compressors about every 2 minutes, wording of the AED check.
    timerLabel: "Switch rescuers / check AED in",
    switchTitle: "2 minutes: switch rescuers if someone can take over.",
    switchText: "Check if the AED has arrived. Keep pauses short.",
    switched: "Rescuers switched",
    switchSource: "2025 AHA CPR & ECC Guidelines, Part 7",

    handsTitle: "Where to put your hands",
    stepHelp: "Step-by-step help (AED, positioning)",
    backToCpr: "Back to the CPR beat",
  },

  // ---------- More ways to reach 911 (Update 5) ----------
  // Not medical content. Source for Text-to-911: FCC consumer guide.
  help911: {
    openLink: "Find my location for 911", // opens the 911 help screen (location + text + call)
    shortLink: "text 911",
    heading: "More ways to reach 911",
    callTitle: "Call if you can",
    callText: "A voice call is the fastest way to get help.",
    textTitle: "Can't talk? Text 911",
    textText:
      "Text-to-911 only works in some areas. If it doesn't work where you are, " +
      "you'll get a text back telling you to call instead.",
    textSource: "FCC, Text to 911: What You Need to Know",
    textPreview: "Your text will say:",
    textButton: "Text 911",
    msgStart: "EMERGENCY.",
    msgSelf: "I need help and may not be able to talk.",
    msgSituation: "Situation:",
    msgStarted: "Started at",
    msgLocation: "Location (GPS):",
    msgNoLocation: "Location: [type your address here]",
    locTitle: "Your location",
    locText: "Read it to the dispatcher, or add it to your text.",
    locButton: "Find my location",
    locating: "Finding your location…",
    accuracy: "accurate to about",   // "accurate to about 30 feet"
    feet: "feet",
    locDenied: "Couldn't get your location. Tell the dispatcher your address or what's nearby.",
    copy: "Copy location",
    copied: "✓ Copied",
    back: "Back",
  },

  // ---------- Paramedic handoff (Milestone 5) ----------
  // No medical instructions here: only labels for what the rescuer logged.
  handoff: {
    openButton: "Handoff for paramedics",
    emsBanner: "EMS is here. Show them the handoff.",
    heading: "Handoff for paramedics",
    situation: "Situation",
    selfSituation: "The person in trouble used the app themselves",
    noSituation: "Not chosen yet",
    keyTimes: "Key times",
    labels: {
      collapse: "Collapsed",
      onset: "Symptoms started / last seen normal",
      symptoms: "Symptoms started (own report)",
      chest: "Heart attack symptoms started",
      seizure: "Seizure started",
      tourniquet: "Tourniquet applied",
      cprStarted: "CPR started",
      called911: "Call 911 tapped",
      aedArrived: "AED arrived",
      shocks: "AED shocks",   // "AED shocks: 2, last at" + time
      shocksLast: "last at",
      emsArrived: "EMS arrived",
      started: "App started",
    },
    ago: "ago",          // "25 min ago"
    min: "min",
    hr: "h",
    justNow: "just now",
    yesterday: "(yesterday)",
    totalTime: "Total time since the app started",
    findings: "Warning signs checked",
    checks: "Quick check answers",
    details: "Other details",
    helpers: "Helpers",
    cprType: "CPR type",
    dispatcher: "911 dispatcher instructions followed",
    yes: "Yes",
    timeline: "Full timeline",
    fullScreen: "Show full screen to paramedic",
    exitFullScreen: "Exit full screen",
    copy: "Copy as text",
    copied: "✓ Copied. You can paste it in a message.",
    copyFailed: "Couldn't copy automatically. Select the text below and copy it.",
    share: "Share",
    back: "Back",
    textTitle: "MINUTE ZERO: HANDOFF SUMMARY",
    footer: "Logged by a lay rescuer with Minute Zero. Times come from this phone's clock. Not a medical record.",
  },

  // ---------- About & Sources (Milestone 6) ----------
  about: {
    openButton: "About & Sources",
    heading: "About & Sources",
    alongsideTitle: "Works alongside your 911 call",
    alongsideText:
      "Minute Zero does not replace 911. When a 911 dispatcher gives you instructions, follow them. " +
      "Minute Zero records what you do and when, then gives paramedics a clear summary. " +
      "If no one is giving instructions, or the call drops, it guides you step by step.",
    // TODO (student): when your own drawings replace these, change this to
    // "Illustrations drawn by <your name>."
    // TODO (student): say where the CPR and pressure pictures came from (see CLAUDE.md, Images).
    illustrations: "Illustrations: [source to be added]. The AED and tourniquet pictures were edited for accuracy (pad position; confusing labels removed).",
    madeFor: "Made for the 2026 Congressional App Challenge.",
    sourcesTitle: "Official sources",
    sourcesIntro:
      "The instructions in this app are based only on these sources. " +
      "If anything here is different from what your 911 dispatcher says, follow the dispatcher.",
    sources: [
      {
        name: "2025 American Heart Association Guidelines for CPR and Emergency Cardiovascular Care",
        detail: "Especially Part 7: Adult Basic Life Support. Circulation 2025;152(suppl 2).",
        url: "https://cpr.heart.org/en/resuscitation-science/cpr-and-ecc-guidelines",
      },
      {
        name: "2024 American Heart Association and American Red Cross Guidelines for First Aid",
        detail: "Bleeding control.",
        url: "https://cpr.heart.org/en/resuscitation-science/2024-first-aid-guidelines",
      },
      {
        name: "American Red Cross Scientific Advisory Council guidelines",
        detail: "American Red Cross healthcare guidelines database.",
        url: "https://www.redcross.org/take-a-class/resources/guidelines",
      },
      {
        name: "American Stroke Association: stroke warning signs (B.E. F.A.S.T.)",
        detail: "Balance loss, Eye (vision) changes, Face drooping, Arm weakness, Speech difficulty, Time to call 911.",
        url: "https://www.stroke.org/en/about-stroke/stroke-symptoms",
      },
      {
        name: "STOP THE BLEED (American College of Surgeons)",
        detail: "Pressure, wound packing and tourniquets for severe bleeding.",
        url: "https://www.stopthebleed.org",
      },
    ],
    pagesTitle: "Pages we checked the wording against",
    pages: [
      { name: "AHA: What is CPR", url: "https://cpr.heart.org/en/resources/what-is-cpr" },
      { name: "AHA: Treatment of Cardiac Arrest", url: "https://www.heart.org/en/health-topics/cardiac-arrest/emergency-treatment-of-cardiac-arrest" },
      { name: "American Red Cross: Bleeding (Life-Threatening External)", url: "https://www.redcross.org/take-a-class/resources/learn-first-aid/bleeding-life-threatening-external" },
      { name: "American Red Cross: How to Apply a Tourniquet", url: "https://www.redcross.org/take-a-class/resources/articles/how-to-apply-a-tourniquet" },
      { name: "AHA: Warning Signs of a Heart Attack", url: "https://www.heart.org/en/health-topics/heart-attack/warning-signs-of-a-heart-attack" },
      { name: "American Red Cross: Stroke", url: "https://www.redcross.org/take-a-class/resources/learn-first-aid/stroke" },
      { name: "American Red Cross: Allergic Reaction/Anaphylaxis", url: "https://www.redcross.org/take-a-class/resources/learn-first-aid/allergic-reaction-anaphylaxis" },
      { name: "AHA: Opioid-Associated Emergency for Lay Responders (algorithm)", url: "https://cpr.heart.org/-/media/CPR-Files/CPR-Guidelines-Files/2024-Algorithms/Algorithm-Opioid-Lay-Responder-200615.pdf?sc_lang=en" },
      { name: "FCC: Text to 911: What You Need to Know", url: "https://www.fcc.gov/consumers/guides/what-you-need-know-about-text-911" },
      { name: "American College of Surgeons: Stop the Bleed Month 2025", url: "https://www.facs.org/media-center/press-releases/2025/may-is-national-stop-the-bleed-month-learn-how-to-save-a-life-with-three-simple-actions/" },
    ],
    researchTitle: "Research behind the design",
    research: [
      {
        name: "Sutter J, et al. Telephone CPR Instructions in Emergency Dispatch Systems: Qualitative Survey of 911 Call Centers. West J Emerg Med. 2015;16(5).",
        detail: "In this 2010 national survey, 46% of responding 911 centers gave no instructions for medical emergencies. Dispatcher help has historically been inconsistent.",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4644043/",
      },
      {
        name: "Metelmann C, et al. Smartphone apps to support laypersons in bystander CPR are of ambivalent benefit: a controlled trial using medical simulation. Scand J Trauma Resusc Emerg Med. 2021;29:76.",
        detail: "People required to use a CPR app started compressions later. That's why Minute Zero keeps questions optional and START CPR one tap away.",
        url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8173850/",
      },
    ],
    notAffiliated:
      "Minute Zero is a student project. It is not affiliated with or endorsed by the American Heart Association, " +
      "the American Red Cross, the American Stroke Association or the American College of Surgeons.",
    privacyTitle: "Privacy",
    privacyText:
      "Everything stays on this phone. There are no accounts, and nothing you log is sent anywhere. " +
      "Your log is only shared if you copy or share the handoff yourself.",
    deleteAll: "Delete everything saved on this phone",
    confirmDeleteAll: "Tap again to delete for good",
    deleted: "✓ Deleted. Nothing is saved on this phone.",
    back: "Back",
    sourceLabel: "Source:", // shown under each guided step
    howTo: "How to use Minute Zero",
  },

  // ---------- Event log panel ----------
  timelineHeading: "Event log",
  showLog: "Show event log",          // + "(12)"
  addNote: "Add note",
  noteLabel: "Note",
  notePlaceholder: "What happened? Example: neighbor went to get the AED",
  saveNote: "Save note",
  cancel: "Cancel",
  undo: "Undo last",

  // Text written into the event log (timeline).
  log: {
    emergencyStarted: "Emergency started",
    called911: "Call 911 tapped",
    scenario: "Situation:",
    modeDispatcher: "Following the 911 dispatcher's instructions",
    modeGuided: "Using the app's step-by-step guidance",
    cprStarted: "CPR started",
    cprTrained: "CPR type: compressions + breaths (30:2)",
    cprHandsOnly: "CPR type: hands-only",
    rescuersSwitched: "Rescuers switched",
    resumed: "Log resumed after the app was reopened",
    textOpened: "Text to 911 opened",
    location: "Location found:", // + coordinates
    self: "The person in trouble is using the app themselves",
    note: "Note:",
  },

  // ---------- Scenarios ----------
  // The order here is the order the buttons appear in.
  //
  // cprMode: true = this scenario goes straight to the CPR screen (no mode question).
  // timeBox: the "___ at [time]" box for this scenario. kind tells the handoff
  //   screen which time it is ("collapse" or "onset").
  //
  // logActions: one-tap log buttons (Dispatcher mode, and the CPR screen).
  //   label = text on the button, log = text saved in the event log.
  //   These buttons only RECORD what the rescuer did; they don't instruct.
  //
  // guidedSteps: the backup step-by-step guidance, shown one at a time.
  //   text   = the instruction (short, plain, imperative)
  //   detail = optional extra line in smaller text
  //   log    = what "Done" writes to the event log (optional)
  //   image  = optional { src, alt }. The student draws every image; files
  //            in images/ are placeholders with the final names.
  //   widget = optional extra control shown with the step ("timeBox")
  //   finding = optional: the step is a yes/no check (Yes / No / Not sure buttons)
  //   source = which official source the step comes from
  //
  // Sources checked so far came from search summaries of the official pages
  // (cpr.heart.org, heart.org, stroke.org, redcross.org, stopthebleed.org,
  // facs.org), not the full guideline documents. Steps marked // VERIFY
  // still need checking against the official wording.
  // Order of the buttons on "What's happening?" (most time-critical first).
  scenarioOrder: ["cardiac", "choking", "bleeding", "stroke", "heart", "allergy", "seizure", "opioid", "lowsugar"],

  scenarios: {
    cardiac: {
      label: "Unresponsive / not breathing normally",
      hint: "Doesn't respond to tap and shout, or only gasping", // shown under the button; signs from the source below
      hintSource: "2025 AHA CPR & ECC Guidelines, Part 7",
      urgent: true, // big button at the top of "What's happening?"
      cprMode: true,
      timeBox: {
        kind: "collapse",
        label: "Person collapsed at",
        hint: "Best guess is fine. Paramedics need to know how long the person has been down.",
        log: "Person collapsed at:",
      },
      guidedSteps: [
        {
          text: "Make sure 911 is called. Put the phone on speaker.",
          log: "Step done: 911 on speaker",
          source: "AHA Hands-Only CPR (heart.org); 2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: "send someone" wording against Part 7.
          text: "Send someone to get an AED, if one is nearby.",
          log: "Someone sent for an AED",
          source: "AHA Hands-Only CPR (heart.org); 2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: "on their back" is not in the summaries we checked.
          text: "Lay the person on their back on a firm, flat surface.",
          log: "Person on a firm, flat surface",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          text: "Put the heel of one hand on the center of the chest. Put your other hand on top.",
          image: HANDS_IMAGE,
          log: "Hands on center of chest",
          source: "AHA Hands-Only CPR (heart.org); 2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: "follow its voice prompts" wording.
          text: "When the AED arrives, turn it on and follow its voice prompts.",
          log: "AED arrived",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: exact pad-placement wording.
          text: "Put the pads on bare skin, as shown on the pads. You don't need to fully remove clothing.",
          // VERIFY: pad positions in the alt text (match your drawing to the guideline).
          image: {
            src: "images/aed-pad-placement.webp",
            alt: "Drawing of a person's bare chest with the shirt open: one AED pad below the right collarbone and the other on the left side below the armpit, both wired to an AED.",
          },
          log: "AED pads on",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          text: "Keep pushing hard and fast until EMS takes over.",
          log: "EMS arrived",
          source: "AHA Hands-Only CPR (heart.org)",
        },
      ],
      logActions: [
        { id: "aed-arrived", label: "AED arrived", log: "AED arrived",
          source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "shock", label: "Shock delivered", log: "AED shock delivered",
          source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
    },

    // Choking: adult, still responsive. 2025 AHA change: alternate 5 back blows
    // and 5 abdominal thrusts (back blows first).
    choking: {
      label: "Choking",
      hint: "Can't breathe, cough or talk", // shown under the button; signs from the source below
      hintSource: "2025 AHA CPR & ECC Guidelines, Part 7",
      urgent: true, // big button at the top of "What's happening?"
      timeBox: null,
      logActions: [
        { id: "back-blows", label: "Back blows given", log: "Back blows given",
          source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "thrusts", label: "Abdominal thrusts given", log: "Abdominal thrusts given",
          source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "cleared", label: "Object came out", log: "Object came out" },
        { id: "unresponsive", label: "Stopped responding: start CPR", log: "Stopped responding",
          switchTo: "cardiac", source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          // VERIFY: "let them keep coughing" wording for a mild blockage.
          text: "Ask, \"Are you choking?\" If they can cough or talk, let them keep coughing.",
          log: "Asked if choking",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          text: "If they can't breathe, cough or talk: make sure 911 is called.",
          log: "Severe choking: can't breathe, cough or talk",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: hand position and technique wording.
          text: "Give 5 firm back blows between the shoulder blades with the heel of your hand.",
          log: "Back blows given",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: technique wording. Pregnant person or can't reach around: check the guideline
          // (secondary sources say chest thrusts instead); not included until verified.
          text: "Give 5 abdominal thrusts: stand behind them, put a fist just above the belly button, and pull in and up quickly.",
          log: "Abdominal thrusts given",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          text: "Keep switching: 5 back blows, then 5 abdominal thrusts, until the object comes out or they stop responding.",
          emergencyButton: { label: "They stopped responding and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Object came out",
          doneLabel: "The object came out",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
      ],
    },

    stroke: {
      label: "Possible stroke",
      hint: "Face drooping, arm weakness, speech difficulty", // shown under the button; signs from the source below
      hintSource: "American Stroke Association B.E. F.A.S.T. warning signs",
      timeBox: {
        kind: "onset",
        label: "Symptoms started / last seen normal at",
        hint: "Paramedics need this time. Enter your best guess.",
        log: "Symptoms started / last seen normal:",
        source: "American Stroke Association F.A.S.T. warning signs",
      },
      logActions: [
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      // Dispatcher mode shows this instead of "No instructions? Show steps".
      guidedButton: "Do the B.E. F.A.S.T. check",
      // B.E. F.A.S.T. checks, never a diagnosis. Steps with `finding` show
      // Yes / No / Not sure buttons instead of Done, and each answer is logged
      // (kind: "finding") so the handoff screen can list them.
      // Wording follows the American Stroke Association's B.E. F.A.S.T. pages
      // ("Balance Loss", "Eye (Vision) Changes"). VERIFY: exact question wording.
      guidedSteps: [
        {
          text: "Note the time symptoms started, or when the person was last seen normal.",
          widget: "timeBox", // the time box logs this itself
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        {
          finding: "Balance loss",
          text: "B, Balance loss: Is the person having trouble walking, or are they dizzy?",
          image: {
            src: "images/balance-loss.webp",
            alt: "Drawing of a dizzy man stumbling and holding his head, with stars circling around it.",
          },
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        {
          finding: "Eye (vision) changes",
          text: "E, Eye (vision) changes: Ask the person. Is their vision blurred or doubled, or have they lost sight in one or both eyes?",
          image: {
            src: "images/vision-changes.webp",
            alt: "Drawing of a man's face where one eye looks blurred and doubled.",
          },
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        {
          finding: "Face drooping",
          text: "F, Face drooping: Ask the person to smile. Is the smile uneven, or does one side droop?",
          image: {
            src: "images/face-drooping.webp",
            alt: "Drawing of a man's face where one side of the mouth and the skin below one eye droop.",
          },
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        {
          finding: "Arm weakness",
          text: "A, Arm weakness: Ask the person to raise both arms. Does one arm drift down?",
          image: {
            src: "images/arm-weakness.webp",
            alt: "Drawing of a man who can raise one arm high while his other arm drifts down by his side.",
          },
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        {
          finding: "Speech difficulty",
          text: "S, Speech difficulty: Ask the person to repeat a simple sentence. Is it slurred or hard to understand?",
          image: {
            src: "images/speech-difficulty.webp",
            alt: "Drawing of a man's mouth surrounded by speech bubbles full of jumbled letters, showing slurred speech.",
          },
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        {
          text: "T, Time to call 911: If you see any of these signs, call 911, even if they go away.",
          image: {
            src: "images/time-call-911.webp",
            alt: "Drawing of a clock next to a telephone handset.",
          },
          log: "B.E. F.A.S.T. check finished",
          source: "American Stroke Association B.E. F.A.S.T. warning signs",
        },
        // While waiting for EMS (American Red Cross stroke page).
        {
          text: "Stay with the person. Tell them help is on the way.",
          log: "Staying with the person",
          source: "American Red Cross, Stroke",
        },
        {
          text: "Watch their breathing and whether they respond.",
          detail: "If they stop responding and aren't breathing normally, start CPR.",
          emergencyButton: { label: "They stopped responding and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Watching breathing and responsiveness",
          source: "American Red Cross, Stroke; 2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: the recovery-position wording (Red Cross stroke page).
          text: "If they're drowsy, drooling or having trouble swallowing, help them lie on their side.",
          log: "Helped onto their side",
          source: "American Red Cross, Stroke",
        },
        {
          text: "Keep them from getting too cold or too hot.",
          log: "Kept comfortable (not too cold or hot)",
          source: "American Red Cross, Stroke",
        },
        {
          // VERIFY: not on the Red Cross stroke page we checked. Commonly taught because
          // swallowing can be affected; confirm in a source or remove.
          text: "Don't give them anything to eat, drink or take by mouth.",
          log: "Nothing given by mouth",
          source: "VERIFY: not yet confirmed in our sources",
        },
      ],
    },

    heart: {
      label: "Possible heart attack",
      hint: "Chest pain or pressure; pain in arm, back, neck or jaw", // shown under the button; signs from the source below
      hintSource: "AHA, Warning Signs of a Heart Attack",
      timeBox: {
        kind: "chest",
        label: "Symptoms started at",
        hint: "Paramedics need this time. Enter your best guess.",
        log: "Heart attack symptoms started:",
        source: "AHA, Warning Signs of a Heart Attack",
      },
      logActions: [
        { id: "resting", label: "Resting, sitting down", log: "Person resting, sitting down" },
        { id: "unresponsive", label: "Stopped responding: start CPR", log: "Stopped responding",
          switchTo: "cardiac", source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          text: "Call 911 now, even if you're not sure it's a heart attack.",
          log: "Step done: 911 for possible heart attack",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          text: "Note when the symptoms started.",
          widget: "timeBox",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          finding: "Chest discomfort",
          text: "Do they have pressure, squeezing, fullness or pain in the center of the chest?",
          detail: "It can last more than a few minutes, or go away and come back.",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          finding: "Upper-body discomfort",
          text: "Do they have pain or discomfort in one or both arms, the back, neck, jaw or stomach?",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          finding: "Shortness of breath",
          text: "Are they short of breath?",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          finding: "Cold sweat, nausea or lightheadedness",
          text: "Do they have a cold sweat, feel sick to their stomach, or feel lightheaded?",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          // VERIFY: "sit and rest" wording.
          text: "Have them sit down and rest while you wait for EMS.",
          log: "Person resting, sitting down",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          // The AHA mentions aspirin, but whether to take it depends on the person (e.g. allergies),
          // so the app leaves that to the 911 dispatcher.
          text: "Don't give any medicine unless the 911 dispatcher tells you to.",
          log: "No medicine given unless the dispatcher says so",
          source: "AHA, Warning Signs of a Heart Attack",
        },
        {
          text: "Stay with them. If they stop responding and aren't breathing normally, start CPR.",
          emergencyButton: { label: "They stopped responding and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Stayed with the person",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
      ],
    },

    // ---------- Update 6 ----------
    // keyTime on a log button: "first" = show its first time on the handoff,
    // "count" = show how many times + the last time (e.g. two epinephrine doses).

    allergy: {
      label: "Severe allergic reaction",
      hint: "Swelling of face, lips or tongue; trouble breathing", // shown under the button; signs from the source below
      hintSource: "2024 AHA & American Red Cross First Aid Guidelines",
      timeBox: null,
      logActions: [
        { id: "epi", label: "Epinephrine given", log: "Epinephrine auto-injector given", keyTime: "count",
          source: "2024 AHA & American Red Cross First Aid Guidelines" },
        { id: "unresponsive", label: "Not breathing normally: start CPR", log: "Not breathing normally",
          switchTo: "cardiac", source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          text: "Call 911 now.",
          log: "Step done: 911 for severe allergic reaction",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          // VERIFY: wording. Use the person's own prescribed device.
          text: "Ask if they have an epinephrine auto-injector (like an EpiPen). Help them use it, following the instructions on it.",
          log: "Epinephrine auto-injector given",
          doneLabel: "Epinephrine given",
          source: "2024 AHA & American Red Cross First Aid Guidelines; American Red Cross, Allergic Reaction/Anaphylaxis",
        },
        {
          // VERIFY: the guideline says a second dose "may be considered" (a weak recommendation);
          // sources differ on 5 vs 5–10 minutes.
          text: "Not better after 5 to 10 minutes, and EMS isn't there yet? A second dose may help, if they have one.",
          log: "Epinephrine auto-injector given",
          doneLabel: "Second dose given",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Stay with them. Give the used auto-injector to EMS when they arrive.",
          emergencyButton: { label: "They don't respond and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Used auto-injector kept for EMS",
          source: "American Red Cross, Allergic Reaction/Anaphylaxis",
        },
      ],
    },

    seizure: {
      label: "Seizure",
      hint: "Shaking or jerking they can't control", // shown under the button; signs from the source below
      hintSource: "2024 AHA & American Red Cross First Aid Guidelines",
      timeBox: {
        kind: "seizure",
        label: "Seizure started at",
        hint: "Time it. If it lasts more than 5 minutes, call 911.",
        log: "Seizure started:",
        source: "2024 AHA & American Red Cross First Aid Guidelines",
      },
      logActions: [
        { id: "stopped", label: "Seizure stopped", log: "Seizure stopped", keyTime: "first" },
        { id: "side", label: "On their side", log: "Placed on their side",
          source: "2024 AHA & American Red Cross First Aid Guidelines; American Red Cross" },
        { id: "unresponsive", label: "Not breathing normally: start CPR", log: "Not breathing normally",
          switchTo: "cardiac", source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          text: "Note when the seizure started.",
          widget: "timeBox",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Help them to the ground if you can. Move hard or sharp things away from them.",
          log: "Helped to the ground, area cleared",
          source: "2024 AHA & American Red Cross First Aid Guidelines; American Red Cross",
        },
        {
          text: "Don't hold them down. Don't put anything in their mouth.",
          log: "Not restrained, nothing in mouth",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          // VERIFY: when to turn them (during vs. after the jerking).
          text: "Turn them onto their side if you can.",
          log: "Placed on their side",
          source: "2024 AHA & American Red Cross First Aid Guidelines; American Red Cross",
        },
        {
          text: "Call 911 if the seizure lasts more than 5 minutes, or if:",
          detail: "it's their first seizure · another one starts · they're hurt · they have trouble breathing · it happened in water · they're pregnant · they aren't back to normal 5 to 10 minutes after it stops.",
          log: "Checked when to call 911",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Stay with them until they're fully awake.",
          emergencyButton: { label: "They don't respond and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Seizure stopped",
          doneLabel: "The seizure stopped",
          source: "American Red Cross",
        },
      ],
    },

    opioid: {
      label: "Possible opioid overdose",
      // VERIFY: wording of the opioid signs.
      hint: "Very hard to wake up; slow or no breathing", // shown under the button; signs from the source below
      hintSource: "2025 AHA CPR & ECC Guidelines, Part 7",
      timeBox: null,
      logActions: [
        { id: "naloxone", label: "Naloxone given", log: "Naloxone (Narcan) given", keyTime: "count",
          source: "2025 AHA CPR & ECC Guidelines, Part 7; 2024 AHA & American Red Cross First Aid Guidelines" },
        { id: "unresponsive", label: "Not breathing normally: start CPR", log: "Not breathing normally",
          switchTo: "cardiac", source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          text: "Make sure 911 is called.",
          log: "Step done: 911 for possible opioid overdose",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Not breathing normally? Start CPR now. If you're trained, give breaths too.",
          emergencyButton: { label: "Start CPR", switchTo: "cardiac" },
          log: "Breathing checked",
          doneLabel: "They're breathing normally",
          source: "2025 AHA CPR & ECC Guidelines, Part 7",
        },
        {
          // VERIFY: wording; follow the package instructions (nasal spray or injection).
          text: "Give naloxone (Narcan) if you have it. Follow the instructions on the package.",
          log: "Naloxone (Narcan) given",
          doneLabel: "Naloxone given",
          source: "2025 AHA CPR & ECC Guidelines, Part 7; 2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          // VERIFY: "keep watching their breathing" wording.
          text: "Stay with them and keep watching their breathing until EMS arrives.",
          emergencyButton: { label: "They don't respond and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Stayed with the person",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
      ],
    },

    lowsugar: {
      label: "Low blood sugar (diabetes)",
      hint: "Has diabetes; shaky, sweaty or confused", // shown under the button; signs from the source below
      hintSource: "2024 AHA & American Red Cross First Aid Guidelines",
      timeBox: null,
      logActions: [
        { id: "sugar", label: "Sugar given", log: "Sugar given", keyTime: "count", source: "2024 AHA & American Red Cross First Aid Guidelines" },
        { id: "better", label: "Feeling better", log: "Feeling better", keyTime: "first" },
        { id: "unresponsive", label: "Not breathing normally: start CPR", log: "Not breathing normally",
          switchTo: "cardiac", source: "2025 AHA CPR & ECC Guidelines, Part 7" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          text: "Not awake, or can't swallow? Call 911. Don't give anything by mouth.",
          log: "Checked: awake and able to swallow",
          doneLabel: "They're awake and can swallow",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Give them sugar: glucose tablets if you have them, or another sugary food or drink. At least 20 grams of sugar.",
          log: "Sugar given",
          doneLabel: "Sugar given",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Call 911 if they don't feel better within 10 minutes, have a seizure, or can't swallow.",
          log: "Watching for 10 minutes",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
        {
          text: "Stay with them.",
          emergencyButton: { label: "They don't respond and aren't breathing normally: start CPR", switchTo: "cardiac" },
          log: "Feeling better",
          doneLabel: "They feel better",
          source: "2024 AHA & American Red Cross First Aid Guidelines",
        },
      ],
    },

    bleeding: {
      label: "Severe bleeding",
      hint: "Blood spurting, pooling, or won't stop", // shown under the button; signs from the source below
      hintSource: "STOP THE BLEED (American College of Surgeons)",
      urgent: true, // big button at the top of "What's happening?"
      logActions: [
        { id: "pressure", label: "Firm pressure applied", log: "Firm direct pressure applied",
          source: "2024 AHA & American Red Cross First Aid Guidelines; STOP THE BLEED" },
        { id: "tourniquet", label: "Tourniquet applied", log: "Tourniquet applied",
          source: "2024 AHA & American Red Cross First Aid Guidelines; STOP THE BLEED" },
        { id: "packing", label: "Wound packed", log: "Wound packed",
          source: "2024 AHA & American Red Cross First Aid Guidelines; STOP THE BLEED" },
        { id: "ems", label: "EMS arrived", log: "EMS arrived" },
      ],
      guidedSteps: [
        {
          text: "Make sure the area is safe for you. Make sure 911 is called.",
          log: "Area checked for safety",
          source: "STOP THE BLEED (American College of Surgeons)",
        },
        {
          text: "Press firmly on the wound with both hands. Keep pressing.",
          detail: "If you can, have the injured part on a firm, flat surface.",
          image: {
            src: "images/direct-pressure.webp",
            alt: "Drawing of a hand pressing a folded cloth firmly onto a person's lower leg, with arrows showing the pressure. No blood is shown.",
          },
          log: "Firm direct pressure applied", // same as the Dispatcher-mode button
          source: "American Red Cross, Bleeding (Life-Threatening External); STOP THE BLEED",
        },
        {
          // VERIFY: Red Cross says 2–3 inches; a Red Cross textbook excerpt says about 2 inches.
          text: "Arm or leg still bleeding? Put a tourniquet 2 to 3 inches above the wound, between the wound and the heart. Not on a joint.",
          // VERIFY: the picture shows a shin wound with the tourniquet above the knee (not on it).
          // Check that this placement matches the sources, since the text says "2 to 3 inches above".
          image: {
            src: "images/tourniquet.webp",
            alt: "Drawing of a leg with a cut on the shin and a tourniquet strapped around the thigh, above the knee, not on the knee.",
          },
          detail: "Tap Skip if there's no tourniquet or the wound isn't on an arm or leg.",
          log: "Tourniquet applied",
          source: "American Red Cross, How to Apply a Tourniquet; STOP THE BLEED",
        },
        {
          // VERIFY: wound-packing wording and the example locations.
          text: "Can't use a tourniquet? Pack the wound tightly with cloth, then keep pressing.",
          image: {
            src: "images/wound-packing.webp",
            alt: "Drawing of cloth packed into a wound on the lower leg, with a hand pressing a folded cloth down on top. Arrows show the pressure.",
          },
          detail: "Tap Skip if bleeding is under control.",
          log: "Wound packed",
          source: "STOP THE BLEED (American College of Surgeons)",
        },
        {
          text: "Keep pressure on until EMS takes over. Leave a tourniquet on.",
          log: "EMS arrived",
          source: "American Red Cross, How to Apply a Tourniquet",
        },
      ],
    },
  },
};
