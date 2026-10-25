# Minute Zero — project guide for Claude

## About the project
- App name: **Minute Zero** (renamed from the working title "FirstMinutes" to avoid confusion with "The First 5 Minutes" app).
- Congressional App Challenge entry by a 9th grader. **Deadline: Mon Oct 26, 2026, 12:00 PM ET** (aim to submit by 10 AM).
- The student knows HTML, Python, Java and C++ and is newer to JavaScript. They must be able to explain every line to judges.
- **Positioning:** "Minute Zero works alongside your 911 call, not instead of it."
  Its unique value: a **timestamped event log + paramedic handoff** (especially the stroke
  symptom-onset / last-known-well time), plus a CPR metronome and an offline backup
  if the dispatcher gives no instructions or the call drops.
- Pitch: when someone collapses, lay rescuers forget what to do and when they did it.
  Minute Zero helps them log it (and guides them if needed) and builds a handoff summary for paramedics.

## How we work (pair programming)
- Build in small milestones. **Stop after each one** so the student can test, ask questions and make changes.
- Before coding a milestone: short plan. After it: how to test on a phone, explanation of the key code, and one small change the student can try.
- When the student asks for plan changes: update this file first and **don't write code until they confirm**.
- Keep `DEVLOG.md` updated with technical problems + solutions (for the "technical challenge" question). Only log things that really happened; label prevented problems as "prevented."
- Explain JavaScript by comparing it to Python/Java where helpful.

## Tech constraints
- Plain HTML, CSS and vanilla JavaScript. No frameworks, no build step, no backend, no accounts.
- Must work in a phone browser and be hostable free on GitHub Pages.
- Files: `index.html`, `styles.css`, `app.js`, `content.js` (ALL medical text), `images/`, `DEVLOG.md`, `NOTES.md`, `README.md` (at the end).
- Mobile-first: buttons at least 56px tall, high contrast, readable under stress, usable one-handed.
- Never use `alert()` / `confirm()` / `prompt()`; build confirmations into the page (they're also blocked in the Claude preview).
- Use `textContent`, not `innerHTML`, for anything the user types.
- Wrap all `localStorage` use in try/catch.

## Live preview in Claude
- Preview: https://claude.ai/artifact/2skGrrHggDdDKRGZJ3xPaJ (republish to the same file path to keep the link).
- `make-preview.sh` (in the scratchpad) strips `<!DOCTYPE>/<html>/<head>/<body>` from `index.html` into `FirstMinutes.html` (old filename kept on purpose so the preview link stays the same); publish it with `styles.css`, `content.js`, `app.js` (and `images/*`) as supporting files.
- `tel:` links may not dial inside the preview; real dialing is tested on a phone.

## Design system (already built)
- CLEAR BUT NOT HARSH (measured; student said pure black/white was "too contrasted"): very dark gray
  #161616 background, off-white #ececec text (15.3:1), gray 2px button outlines (4.2:1), red `--signal`
  #c8102e (white text 5.9:1), amber = still to do / situation labels, green = done, dark text on amber/green. Smallest text 16px (base 19px). Yes/No/Not sure use ✓ ✗ ? symbols.
- Check every new screen with axe-core (scratchpad `axe.mjs`): currently 0 violations incl. AAA contrast.
- START CPR must stay fully visible on 375×667 and 360×640, with AND without 911 tapped
  (scratchpad `test7.mjs`, `fit911.mjs`).
- The 911 button logs "Call 911 tapped" (not "911 called"): a web page can't know if the call was placed.
  `tel:` links don't work in Claude's preview or on computers; test real dialing on a phone.
- All pulses use `--beat: calc(60s / 110)` (the CPR pace). Motion means "this still needs doing" (the 911 button stops pulsing once 911 is called).
- Respect `prefers-reduced-motion`. Never use color as the only signal (icons + words too).
- System fonts only (nothing to download, works offline).

## Medical content rules
- Use ONLY these sources:
  1. 2025 AHA Guidelines for CPR and ECC (esp. Part 7: Adult Basic Life Support), Circulation 2025;152(suppl 2)
  2. 2024 AHA and American Red Cross Guidelines for First Aid (bleeding control)
  3. American Red Cross Healthcare Guidelines Database (Scientific Advisory Council)
  4. American Stroke Association F.A.S.T. warning signs
  5. American College of Surgeons STOP THE BLEED
  6. Optional: MedlinePlus (NIH) for "Learn more" links only; credit MedlinePlus.gov, don't imply endorsement.
- All medical text lives in `content.js` as data. Every step has a `source` field.
- Short, imperative, plain language. Use the term "lay rescuer."
- If a step can't be confirmed against the sources, mark it `// VERIFY`. Never invent medical steps. Never present the app as diagnosing anything.
- Guided steps were checked against search summaries of the official pages (the workspace can't reach
  heart.org, stroke.org, redcross.org or stopthebleed.org directly). Steps marked `// VERIFY` need the student's check.
- The app always tells the user to **follow the 911 dispatcher's instructions** when they're given.

## Update 8 — AI step pictures (student asked for prompts: treated as the go-ahead)
- The student may make step pictures with Google Gemini ("Nano Banana"); prompts in PICTURE-PROMPTS.md
  (11 pictures, file names listed there). This REPLACES "the student draws every illustration" for those pictures.
- Claude checks each picture against the step text/source before adding it; wrong details get redone or edited.
- When the first AI picture goes in: update CONTENT.about.illustrations + README Credits to say which pictures
  were made with Google Gemini (AI). The student checks the Congressional App Challenge rules on AI-made content.
- Lower priority than the demo video and the VERIFY items.
- IN USE (?v=10, CACHE v10): give-sugar, sit-and-rest, on-side (seizure 4 + stroke 10); captions cropped; credit added.
  Rejected: naloxone (syringe), auto-injector (top of thigh, cap on). Guided-step Done button is below the fold on
  small phones when a step has a picture (pre-existing, not yet fixed).

## Images (Update 2)
- The student draws every illustration themselves. **Never use images from the Red Cross, AHA or the web.**
- One illustration per key step, shown above the step text. Bleeding images must be non-graphic.
- Placeholders live in `images/` with the **final filenames and format**, so a drawing can replace a placeholder file without any code change.
- Each step in `content.js` has `image: { src, alt }` with descriptive alt text.
- Format: WebP, 800×600 px (4:3), under ~60 KB each. Displayed on a light card so drawings on white paper look intentional.
- Placeholders 7 and 8 added: balance-loss.webp, vision-changes.webp.
- UPDATE (student asked for "actual pictures"): the placeholders are now simple original diagrams drawn in
  code (SVG sources in images/source-svg/, rendered to WebP, 10–16 KB each), not copied from anywhere.
  Same filenames, so the student's drawings can still replace them with no code change. Credit in
  CONTENT.about.illustrations says what they are; update it if the student's drawings go in.
- UPDATE: the student supplied 5 pictures (pink style with captions). Source NOT yet confirmed (ask: made by the
  student / an AI image tool / found online?). Used 2, with the caption band cropped off (medical text must stay
  in content.js, and text inside images can't be read by screen readers):
  - cpr-hand-placement.webp (800x480): rescuer kneeling, straight arms, hands on center of chest. Good.
  - direct-pressure.webp (800x600): one hand pressing cloth on lower leg; step text says "both hands" (mismatch noted).
  NOT used (medically wrong or confusing; explained to the student):
  - Tourniquet picture: tourniquet drawn at the knee (on a joint) and a "not on joint" sign over the arm one;
    also shows blood (the plan says non-graphic).
  - "Pack wound" caption: the picture shows pressing a cloth on top, not packing; packing a lower-leg wound
    contradicts our steps (limb → tourniquet; packing is for wounds a tourniquet can't reach).
  - "CPR press hard" picture: a white pad/paper drawn under the hands (confusing).
  - AED picture: second pad drawn near the middle of the lower chest, not on the left side below the armpit;
    caption "D - Defibrillator" comes from a non-AHA acronym.
- UPDATE 2: student sent 5 more (T-Time, S-Speech, A-Arms, F-Face, E-Eyes) and asked to use every picture and
  replace Claude's diagrams. Now in use (captions/titles cropped): face-drooping, arm-weakness, speech-difficulty,
  vision-changes, NEW time-call-911 (added to the T step), cpr-hand-placement, direct-pressure, and
  aed-pad-placement = the student's AED picture EDITED (second pad moved to the left side below the armpit,
  wire redrawn). balance-loss is still Claude's SVG diagram (no picture supplied).
  Still NOT used (would teach the wrong thing): tourniquet-on-the-knee picture, CPR picture with a pad under the hands.
  Picture source still unconfirmed; About credit says "[source to be added]".
  images/source-svg/ keeps Claude's diagrams as backups; none are in use now.
- UPDATE 3: student sent B-Balance and a new "pack wound" picture (cloth packed INTO the wound), and asked again
  to include the tourniquet picture. Done:
  - balance-loss.webp = student's picture (Claude's diagram retired).
  - wound-packing.webp = NEW, added to bleeding step 4 (thin red edge, mild).
  - tourniquet.webp = NEW, added to bleeding step 3: ONLY the leg half of the student's picture, edited with
    OpenCV inpainting to remove the "2-3 inches" labels/arrows, the crossed-out knee icon and the blood drops;
    the leg outline was redrawn where an arrow crossed it. The arm half was NOT used (a "NOT ON JOINT" sign is
    drawn over its tourniquet). // VERIFY the above-the-knee placement against the sources.
  - Still not used: the CPR picture with a pad under the hands.
- Priority: (1) CPR hand placement, (2) AED pad placement, (3) face drooping, (4) arm weakness, (5) speech difficulty, (6) direct pressure on a wound.

## Milestones
1. ✅ **Structure and start screen:** START (clock + event log), always-visible Call 911 (`tel:911`, logs "911 called"), disclaimer, beating emergency design.
   - Update 1 addition: after 911 is called, show "Put the call on speaker. If the dispatcher is giving instructions, follow them. Tap below to log what you do."
2. ✅ **Scenario picker + two modes** (split into M2a ✅ picker + Dispatcher mode, and M2b ✅ guided steps + images):
   - Decisions made: Dispatcher-mode buttons depend on the scenario (cardiac: CPR started, AED arrived,
     shock delivered, EMS arrived; stroke: onset time + EMS arrived; bleeding: pressure, tourniquet,
     wound packed, EMS arrived). The app always asks which mode, with the dispatcher option first.
     Undo removes only the newest user-created entry. The timeline is the single source of truth.
   - Three scenarios: unresponsive / not breathing normally; possible stroke; severe bleeding.
   - **Dispatcher mode** (default when the dispatcher is giving instructions): a quiet screen with only big one-tap log buttons (CPR started, AED arrived, shock delivered, EMS arrived, Add note) and an optional metronome. No step text competing with the dispatcher's voice.
   - **Guided steps** (backup if no instructions are given or the call drops): one step at a time with an image, "Done" logs `{time, action}`. One tap switches between the two modes, and the switch is logged.
   - "Add note" for free text.
   - Image placeholders in `images/`.
3. ✅ **CPR mode** (with the cardiac shortcut):
   - "Unresponsive / not breathing normally" goes STRAIGHT to the CPR screen (no mode question):
     (Changed in Update 4: optional compact "Who's here?" + "Collapsed at", then START CPR, which logs "CPR started".)
   - Hands-only by default; "Trained? Add breaths (30:2)" is a toggle, not a blocking question.
   - Web Audio metronome at 110/min with a look-ahead scheduler (not `setInterval`), visual beat synced to it.
   - Compression counter ONLY in 30:2 mode ("17 / 30", needed to know when to give breaths).
   - 2-minute "switch rescuers / check AED" timer with an alert.
   - Log buttons: AED arrived, shock delivered, EMS arrived. "Collapsed at ___" time box.
   - The guided steps for cardiac become optional "step-by-step help" reached from the CPR screen.
   - Continuous auto-save to localStorage + "Resume" card after a reload. Wake Lock keeps the screen on.
4. ✅ **Stroke check:** DECIDED: B.E. F.A.S.T. (Balance Loss, Eye (Vision) Changes + F.A.S.T.), Yes / No / Not sure per sign. F.A.S.T. checklist in American Stroke Association wording, with images; each finding is logged. Prominent "Symptoms started / last seen normal at ___" entry.
5. ✅ **Paramedic handoff:** live "minutes since collapse / last known well", tourniquet time at the top,
   "Show to paramedic" full-screen mode (landscape OK), copy + share. Built: buildHandoff() feeds both
   renderHandoff() and handoffText(); EMS banner after "EMS arrived"; "(yesterday)" logic for HH:MM times. Large-text summary: scenario, symptom-onset / last-known-well time, total elapsed time, whether dispatcher instructions were followed, the full timeline in order. Copy as text (auto-save replaces a Save button).
6. ✅ **About & Sources:** (built; sources/pages/research are data in CONTENT.about; "Source:" shown under each guided step; privacy note + two-tap delete; student must fill in their name for the illustration credit) every source with links, the disclaimer, a "Works alongside 911" explanation, and an illustration credit for the student.
7. ✅ **Offline:** sw.js (cache first, update in background; bump CACHE_VERSION on every change!) + manifest + icons. Tested offline on localhost.
   **Polish (if time allows):** GPS coordinates for the dispatcher, accessibility pass.
8. README.md ✅. Repo: https://github.com/VihaanBudankayala/minute-zero (branch main). GitHub Pages URL: https://vihaanbudankayala.github.io/minute-zero/ . Working copy for this session: /home/user/minute-zero.

## Sun Oct 25 (newest): tutorial cards have pictures = real app screenshots with arrows (images/tutorial-*.webp,
## made by tools/make-tutorial-pictures.mjs; NOT medical images). Next must stay visible at 360×640. ?v=9, CACHE v9.
## Sun Oct 25: ☰ button (#btn-menu) at the top right of top-bar row 1, BEFORE START only (during an
## emergency Reset time / Start over sit there). Opens <dialog id="side-menu"> sliding in from the right:
## How to use / My people / Settings / About. Closes on ✕, Esc, a tap beside it, or choosing an item. ?v=8, CACHE v8.

## Update 7 — ✅ BUILT (student chose ALL FOUR). ?v=6 and CACHE_VERSION v6. Keys: minutezero.settings / .people / .tutorialSeen.
Student asked for: (1) highlight priority buttons, (2) a tutorial screen when the app opens, (3) features for
conditions the user or their family is diagnosed with, (4) a settings page with layout choices and presets.
Claude's recommendations (time estimates include testing):
1. Priority highlight (~30 min): one consistent "do this first" style (Call 911, START, START CPR, the urgent
   situations, Done); everything else calmer. YES.
2. Tutorial (~45 min): NEVER block START on first open (someone may open the app for the first time DURING an
   emergency). Instead: a one-time "New here? See how it works (30 sec)" link on the home screen + a short
   3-card tutorial, skippable, reachable later from About. YES, in that safe form.
3. "My people" medical info (~2 h): user ticks known conditions for themselves/family (e.g. diabetes, epilepsy,
   severe allergy + their auto-injector, heart disease) → those situations are pinned to the top of
   "What's happening?" and listed on the paramedic handoff. Stored only on the phone. User-entered facts, never
   a diagnosis by the app. Only if time allows after the video.
4. Settings + presets (~1.5 h): text size, "Calm" (no pulsing), sound on/off by default, read-aloud by default;
   presets "Standard", "Large text", "Calm". Only if time allows after the video.
Recommended order: 1 + 2 now → record the video → 3/4 only if time remains (else README "future ideas").

## Sun Oct 25 (newest): top bar row 1 = clock · [Reset time] [Start over]. Reset time logs kind "timerReset"
## (clockZero()); Start over = <dialog> popup → erase + reload to START. Files load as ?v=5: BUMP ?v= in index.html
## AND CACHE_VERSION in sw.js (now v5) on EVERY change. sw.js: network first (no-cache, 3 s), keys without ?query.
## Sun Oct 25 (latest): two-row top bar [clock · Reset] / [Call 911 | Text 911]; updateTextLinks() keeps sms bodies
## current; 911 card extras only before a mode is chosen; "Not sure?" is the first picker button; "Find my location
## for 911" lives in the log panel. sw.js CACHE_VERSION = v3.
## Sun Oct 25 (later): Reset in the top bar (on-page confirm, then reload), step-by-step help at the top of the
## CPR screen, computer-specific 911 message (isComputer via matchMedia). sw.js CACHE_VERSION = v2.
## Phone-size tests must emulate touch phones (hasTouch, isMobile).

## UI pass (Sun Oct 25) — ✅ symptom hints on situation buttons, urgent-first picker with compact "Not sure?"
## right under them, folded event log, bullet-list details, optional "Read steps aloud" (off by default).

## Update 6 — ✅ BUILT (all four: seizure, severe allergic reaction, opioid overdose, low blood sugar; 11 check
## questions). Student chose: PUBLISH NEXT, no more features. Still not done: offline, GitHub Pages, README, video.
Student asked for more conditions and more questions in the "Not sure" check.
- Candidates our sources cover (2025 AHA Part 7; 2024 AHA/Red Cross First Aid; Red Cross pages):
  seizure, severe allergic reaction (anaphylaxis, epinephrine auto-injector), opioid overdose (naloxone),
  low blood sugar in a person with diabetes. Each needs sourced steps + VERIFY + check questions.
- The check is already data-driven (CONTENT.survey.questions with `next` pointers), so new questions are
  content.js edits only. Keep it short: questions only on the "responds" branch, never before CPR
  (unresponsive + not breathing normally must still reach CPR in 2 answers).
- Recommend at most 2 new conditions so the required work still fits before Monday.

## Update 5 — ✅ BUILT (decisions: choking + possible heart attack; call + Text-to-911 + location;
## AED/Shock/EMS row right under the beat; stroke "while you wait" steps; AI scanner: DISCUSS LATER, not built)
Student asked for: (1) more conditions, (2) more stroke steps, (3) AED arrived button at the top of the CPR
screen, (4) "make the app compatible with 911", (5) an AI scanner that tells you what the condition is.
Claude's recommendations:
1. More conditions: at most 1–2, and only ones our sources cover. Candidates: choking (2025 AHA Part 7 covers
   foreign-body airway obstruction), possible heart attack warning signs (AHA). Each needs sourced steps + VERIFY.
2. Stroke "while you wait" steps: only what the sources support (call 911 even if signs go away, note the time,
   stay with the person, start CPR if they stop responding and aren't breathing normally). No medicines.
3. CPR screen: a compact row of log buttons (AED arrived, Shock delivered, EMS arrived) right under the beat
   circle's instruction or above it. Easy.
4. "Compatible with 911": a web app CANNOT connect to 911 dispatch systems (that needs NG911/RapidSOS
   partnerships), and phones already send location with 911 calls. Realistic options: (a) Text-to-911 button
   (sms:911 with a prefilled message: situation + location), for when speaking isn't possible ("call if you can,
   text if you can't"; not available everywhere); (b) "Your location" (GPS coordinates) to read to the dispatcher.
5. AI scanner: recommend NOT building. It would diagnose (breaks "never diagnose"), can't be made reliable or
   tested for real emergencies, would need internet + a server/API key (breaks "no backend" and "works offline"),
   needs a camera, and would delay 911/compressions (Metelmann 2021). A tool that tells a bystander "this is a
   stroke" is the kind of software regulators treat as a medical device. Safer: keep the sourced "Not sure" check
   (rule-based, every question from AHA/ASA/Stop the Bleed); list "validated AI triage" as a future idea in README.
Still required before Monday: offline service worker, GitHub Pages, README, demo video.

## Update 4 — CPR "Start" button (✅ BUILT: compact + optional layout chosen)
- Student's request: the CPR screen should NOT start the beat immediately. Show "Who's here to help?"
  and "Person collapsed at" first, then a START CPR button.
- Benefit: "CPR started" is logged when compressions really begin (more accurate than auto-logging),
  and the tap is the browser's required gesture for sound.
- Risk: Metelmann et al. 2021 found apps delayed first compressions; questions above the button
  could add delay. Mitigation: both are optional (never required), shown compactly, and START CPR must
  be visible without scrolling on a small phone (375×667). After START, they move below the beat circle.
- This replaces "beat + sound start immediately" and "CPR started is logged automatically" in M3.

## Update 3 — "Not sure what's happening", "It's happening to me", "Who's here to help?" (✅ BUILT, with M4 B.E. F.A.S.T.)
Safety rules for all three: never diagnose ("This sounds like…", never "You have…"); never delay
911 or compressions; every question is one tap with big Yes / No / Not sure buttons; every answer is
logged (the answers become useful handoff info, e.g. when responsiveness was checked).
1. **"I'm not sure what's happening"** = a 4th option in the picker → a short check, one question per
   screen, at most 4 questions, following the recognition steps in our sources:
   - Does the person respond when you tap them and shout? (AHA Part 7)
   - If no: Are they breathing normally? Gasping is not normal breathing. No / Not sure → CPR screen. (AHA Part 7)
     If yes (breathing): "Call 911 and follow the dispatcher" (outside our three scenarios). // VERIFY
   - If they respond: Is there bleeding that won't stop, or blood spurting / pooling? → bleeding. (Stop the Bleed)
   - Any face drooping, arm weakness or speech difficulty? → stroke. (ASA F.A.S.T.)
   - None: "Call 911 if you're worried. Follow the dispatcher. Use Add note to log what you see."
   - "Not sure" always goes to the safer path. Ends by logging "Check: …" entries and opening the matching screen.
2. **"It's happening to me"** = a small button under START on the home screen (not an extra question
   for everyone). A deliberately simple screen: giant Call 911 button, "Tell them where you are,"
   one-tap "It started at: Now" time, follow the dispatcher. No self-treatment steps unless verified
   in the sources (self-applied pressure for bleeding is // VERIFY). Logged as "Patient is using the app themselves."
3. **"Who's here to help?"** = non-blocking chips [Just me] [2] [3 or more] on the CPR, bleeding and
   stroke screens (NOT a question before compressions). Logged. Changes:
   - Just me: hide "switch rescuers" (show "Keep going; check the AED if it's in reach"), show
     "Put the phone on speaker next to you." // VERIFY lone-rescuer wording (AHA Part 7)
   - 2+: show "Send someone for the AED", "Ask someone to meet EMS at the door", switch reminders. // VERIFY
- Schedule proposal: survey + helpers Fri (with M4); "happening to me" Sat (with M5). If short on time,
  the "happening to me" screen is the one to cut, since it's mostly "call 911."

## Competitive research (see COMPETITORS.md)
- Gap: no free, offline, bystander-facing app was found that combines guided lay steps (CPR, stroke,
  bleeding) + one-tap timestamped logging + a paramedic handoff screen. Say "not found after a
  reasonable search," never "doesn't exist."
- Clinician loggers (PHEM Logger, Code Blue, Red Cross Resuscitation Suite) log but don't guide the
  public; public apps (Red Cross First Aid, STB, Spot a Stroke) guide but don't log.
- Metelmann et al. 2021 (Scand J Trauma Resusc Emerg Med 29:76, simulation with 200 trained pupils):
  required app use delayed the breathing check, call for help and first compression, though compression
  rate/depth improved. This supports the quiet Dispatcher mode and the "few taps" rule.
- **Add**
  - "Tourniquet applied at [time]": already logged in both modes; make it prominent on the handoff.
  - Auto-calculated "minutes since collapse" / "minutes since last known well" on the handoff.
    Needs a "Collapsed at ___" time for cardiac (START time ≠ collapse time).
  - "Show to paramedic" full-screen mode: high contrast, works in landscape; plus copy/share export.
  - Continuous auto-save: save the log to localStorage after every entry and restore it after a
    reload or the browser closing the tab.
  - (Implied by the "free, offline" claim) offline support is now required, not optional.
- **Keep**
  - Hands-only CPR as the default; trained 30:2 as an option (not a blocking question).
  - 2-minute rescuer-switch timer.
  - As few taps as possible from START to compressions (target: START → "Unresponsive" → compressions).
- **Drop / downplay**
  - Compression counter as a headline feature (keep it small or remove it).
  - Anything clinical (heart rhythms, drugs) and any AI diagnosis.
  - Don't present the metronome as the innovation; the innovation is the bystander timeline + handoff.
- Student to review before Monday: First Aid AI (firstaidai.tech) and Heart Angel (2025 CAC winner, CA-49).

## Research notes (for the write-up, see NOTES.md)
- Frame as **historically inconsistent**: the survey was conducted in 2010 and published in 2015.
- 2015 national survey, Western Journal of Emergency Medicine: 46% of responding 911 centers gave no instructions for medical emergencies.
- Smaller University of Washington study: only 1 of 13 call centers gave the best-practice compression rate.
- Dispatchers don't keep a timestamped record for the rescuer, and calls can drop.
- Checked: Sutter et al., West J Emerg Med 2015;16(5); survey data from 2010. UW finding is a 2018
  master's thesis (Torres) using simulated calls. Details and links in NOTES.md; the student still confirms them.
