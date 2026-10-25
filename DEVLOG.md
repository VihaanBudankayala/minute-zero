# Minute Zero — Development Log

A running record of technical problems and how we solved them.
(Source material for the Congressional App Challenge "technical challenge" question.)

---

## Milestone 1 — Structure and start screen

### Problem: an elapsed-time clock that stays accurate
**First idea:** add 1 to a counter every time `setInterval(fn, 1000)` fires.
**Why that fails:** `setInterval` is not guaranteed to fire on time. Each delay
adds up ("drift"), and phones pause or slow down timers when the screen dims or
the user switches to the dialer to call 911. A counter would fall behind real
time, which is bad when paramedics rely on the times.
**Solution:** save `startTime = Date.now()` once, and every update compute
`Date.now() - startTime`. The timer only decides *when to redraw*; the time
itself comes from the system clock, so it can never drift.

### Problem: logging the 911 call without blocking the call
**Situation:** the 911 button must open the phone dialer *and* record a timestamp.
**Solution:** use a real link (`<a href="tel:911">`) so the dialer works even if
JavaScript fails, and add a click listener that logs the event. The listener
does not call `preventDefault()`, so the browser still opens the dialer.
If 911 is tapped before START, the app starts the emergency automatically so
the call still gets a timestamp.

### Problem: keeping medical/safety wording out of the code
**Solution:** every piece of user-facing text lives in `content.js`. HTML
elements use `data-content="key"` and `fillContent()` copies `CONTENT[key]`
into them. The disclaimer is also written directly in the HTML as a fallback,
so it appears even if a script fails to load.

### Design: making motion mean something
**Goal:** an emergency look with pulsing buttons, without being distracting or decorative.
**Solution:** every pulse uses one CSS variable, `--beat: calc(60s / 110)`, so the
START button "compresses" and sends out a ring 110 times a minute, which is the CPR
compression pace from the 2025 AHA guidelines. The 911 button pulses only until 911
is called, then stops: motion means "this still needs doing."
**Accessibility:** people who turn on "Reduce motion" on their phone get no pulsing
(`@media (prefers-reduced-motion: reduce)`). The 911 status card changes its icon
and words (not just amber → green), so it never relies on color alone.

### Problem (prevented): pulse rings could make the page scroll sideways
**Cause:** an element scaled with `transform: scale(1.5)` still counts toward the
page's width, so the growing rings could stick out past the screen edge.
**Solution:** `overflow-x: clip` on `<main>` and `overflow: hidden` on the top bar.
We checked in a 375px-wide (iPhone-sized) browser that the page can't scroll sideways.

### Problem: vibration doesn't work on iPhone
**Cause:** Safari on iOS doesn't support `navigator.vibrate()`.
**Solution:** `buzz()` checks `"vibrate" in navigator` first, so Android phones get
a buzz and iPhones skip it without an error. This is called "feature detection."

---

## Milestone 2a — Scenario picker and Dispatcher mode

### Design decision: the timeline is the "single source of truth"
**Problem:** several parts of the screen depend on what has been logged: the 911 card,
the "✓ 2:14 PM" on each log button, the saved stroke onset time. If each kept its own
copy of the data, they could disagree (for example after Undo).
**Solution:** only `state.timeline` stores events. `refreshUI()` redraws everything by
reading the timeline (`lastEntryFor(...)`), and it runs after every change. Undo just
removes the last entry and calls `refreshUI()`, and every part of the screen updates itself.

### Design decision: what can be undone
**Problem:** stressed people mis-tap, but a medical log shouldn't let anyone erase
automatic records like "Emergency started" or "911 called".
**Solution:** entries created by tapping a log button, saving a time or writing a note
get `undoable: true`. Undo only removes the newest entry, and only if it has that flag.
The Undo button is disabled otherwise.

### Problem: a stroke timestamp can't be "now"
**Situation:** every other log entry uses the moment the button was tapped, but the stroke
symptom-onset time is usually *earlier* ("he was fine at 2:05").
**Solution:** an `<input type="time">` (the phone shows its own time picker) plus a
"Now" button. The entry is logged when it's saved, but it also carries
`kind: "onset"` and the entered time in `value`, so the handoff screen can find it and show it first.

### Problem (tested): typed notes could contain HTML
**Test:** we typed `<b>x</b>` into a note. Because the log uses `textContent` instead of
`innerHTML`, it showed up as plain text instead of becoming bold. That's the protection
against code injection (XSS) we planned in Milestone 1.

### Problem: "✓ Logged 11:50:11 PM" wrapped onto two lines on small buttons
**Solution:** buttons show a short time without seconds ("✓ 11:50 PM"). The full time
with seconds is still in the event log.

---

## Renaming: FirstMinutes → Minute Zero
**Problem:** before submitting, we found that a similar app name was already in use
(e.g. "The First 5 Minutes," a pediatric resuscitation app for clinicians).
**Solution:** renamed the app to **Minute Zero**: the moment the emergency starts and the
clock starts. Because all wording lives in `content.js`, the app's visible name changed by
editing one line (`appName`) plus the page `<title>`.

---

## Milestone 2b — Guided steps with pictures

### Design decision: steps are data, not code
Each scenario in `content.js` has a `guidedSteps` list. A step is an object with `text`,
optional `detail`, optional `image: { src, alt }`, optional `log`, and a `source`.
`renderGuidedStep()` shows whichever step `state.stepIndex` points to. Adding or fixing a
medical step means editing `content.js` only. The code never changes.

### Problem: one onset-time box, needed on two screens
**Situation:** the stroke "Symptoms started / last seen normal" box is needed in Dispatcher
mode AND on guided step 1. Two copies could show different times.
**Solution:** keep ONE box and move it. In the DOM, `append()`-ing an element that's
already on the page moves it instead of copying it, so the typed time and "Saved:" line
come along. `placeOnsetBox()` puts it in the right "slot" for the current screen.
The slots use `display: contents` so an empty slot doesn't add extra spacing.

### Problem: images must be swappable without changing code
**Solution:** placeholders are real 800×600 WebP files with the **final filenames**
(`images/cpr-hand-placement.webp`, etc.). To add a drawing, save it over the
placeholder. If an image is ever missing, an `error` listener hides the picture
so the step text still works (tested by loading a file that doesn't exist).

### Problem: the screen got too crowded for the step + Done button
**Solution:** the speakerphone tip on the 911 card only shows until a mode is chosen,
and images are limited to 32% of the screen height (`max-height: 32vh` with
`object-fit: contain`, which shrinks without stretching).

### Problem: duplicated hint text on stroke step 1
The step said "Paramedics need this time..." and so did the onset box right below it.
We removed the step's copy. We found it by checking screenshots at phone size.

---

## Milestone 3 — CPR mode, metronome, auto-save

### Problem: `setInterval` can't keep a steady CPR beat
**Why:** `setInterval(beep, 545)` asks JavaScript to run "about every 545 ms," but the
browser runs it late whenever it's busy, and phones slow timers down to save battery. A
wobbling beat would teach the wrong pace.
**Solution: a look-ahead scheduler** (the "Tale of Two Clocks" technique by Chris Wilson).
The Web Audio API has its own precise clock (`audioCtx.currentTime`). Every 25 ms, a
JavaScript timer wakes up and *books* every click due in the next 0.1 s at an exact
audio-clock time (`osc.start(time)`). If the timer wakes up late, the clicks were
already booked, so the beat stays even.
**Test:** we recorded the booked click times for 3 seconds. Every gap was 0.5455 s,
exactly 60 ÷ 110.

### Problem: the pulsing circle must match the sound
A CSS animation runs on its own timer, so it would slowly fall out of step with the audio.
**Solution:** each booked beat goes into a queue with its audio time. A
`requestAnimationFrame` loop (runs every screen frame) checks the audio clock and
pulses the circle at the moment each click is heard.

### Problem: browsers block sound until the user taps
**Solution:** the AudioContext is created inside the tap on "Unresponsive / not
breathing normally," so the beat can start with no extra button. Newer iPhones mute
web audio when the silent switch is on; we ask for `navigator.audioSession.type =
"playback"` where it's supported. (To test on a real iPhone.)

### Design decision: as few taps as possible before compressions
Research (Metelmann et al., 2021) found laypeople required to use a CPR app delayed their
first compression. So "Unresponsive" goes straight to the CPR screen (2 taps after
opening the app: START, Unresponsive). "Trained? Add breaths" is a toggle, not a question
that blocks the screen, and "CPR started" is logged automatically because the
rescuer's hands are on the chest.

### Design decision: a compression counter only for 30:2
Counting metronome beats isn't counting real compressions, so in hands-only mode there
is no counter. In 30:2 mode the count ("17 / 30") is needed to know when to give
breaths, so it shows there. The metronome books exactly 30 beats, then goes quiet.

### Problem: the log must survive a reload or the browser closing the tab
**Solution:** `refreshUI()` (which runs after every change) also saves `state` to
`localStorage` as JSON. On the home screen, a saved session shows an "Unfinished
emergency" card with **Resume**. Resume puts the data back, and because it's a tap it
can restart the CPR sound. Every storage call is in try/catch (private browsing can
block it). Deleting a saved log takes two taps, because `confirm()` pop-ups are blocked
in some places.
**Test:** reloaded mid-CPR, tapped Resume: back on the CPR screen, same log, 30:2 setting
kept, and "CPR started" was not logged twice.

### Problem: the screen turning off during CPR
**Solution:** the Screen Wake Lock API (`navigator.wakeLock.request("screen")`). The
phone drops the lock when you switch apps (e.g., to the dialer), so we ask again on
`visibilitychange`.

### Bug found by testing: a mode carried over between situations
Opening cardiac step-by-step help, then switching to stroke, skipped logging stroke's
mode. **Fix:** choosing a new situation resets the mode, so the app asks again.

---

## Update 3 + Milestone 4 — "Not sure" check, helpers, "happening to me", B.E. F.A.S.T.

### Design decision: a check that never delays CPR or diagnoses
The "I'm not sure what's happening" check is a small **decision tree** stored as data in
`content.js`: each question has `next: { yes, no, notSure }` pointing to another question or
to `"result:<id>"`. `answerSurvey()` just follows the pointers, like walking a linked structure.
- "Not sure" always goes to the safer path (e.g., not sure if breathing normally → CPR).
- At most 4 questions; "doesn't respond + not breathing normally" reaches the CPR beat in 2 answers.
- Every answer is logged ("Check: Responds to tap and shout: no"), so the handoff shows when
  responsiveness and breathing were checked.
- Results say "This doesn't match…" or open a situation; the app never says "The person has…".

### Design decision: "Who's here to help?" is stored in the timeline
Instead of a separate variable, choosing "Just me / 2 / 3 or more" logs an entry with
`kind: "helpers"`, and `helpersCount()` reads the newest one. So Undo works for free and the
handoff can show it. Alone: the 2-minute "switch rescuers" timer and alert are hidden
(there's nobody to switch with). 2 or more: tips to send someone for the AED and to meet EMS.

### Design decision: "It's happening to me" stays tiny
Someone having a stroke may struggle to use a phone, and you can't do CPR on yourself, so
this screen only has a giant Call 911 button, two tips, and a one-tap "It started at" time.
No self-treatment steps unless they're confirmed in our sources.

### Reuse: one time box, three kinds of time
The time box now gets its labels from `timeBoxConfig()`: "Person collapsed at" (cardiac),
"Symptoms started / last seen normal" (stroke) or "It started at" (self). The same moving-element
trick from Milestone 2b put it on a fourth screen with no new HTML.

### B.E. F.A.S.T. instead of F.A.S.T.
The American Stroke Association's current materials use B.E. F.A.S.T. (Balance Loss,
Eye (Vision) Changes, Face Drooping, Arm Weakness, Speech Difficulty, Time to Call 911).
Check steps have a `finding` field, which shows Yes / No / Not sure buttons instead of Done
and logs `kind: "finding"` entries (e.g., "Face drooping: yes") for the handoff.

### Bug (real): an edit script duplicated part of content.js
**What happened:** a Python script that edited `content.js` searched for the text
`    bleeding: {`. That text appeared twice: in the new survey questions AND in the bleeding
scenario. The script used the first match, which was the wrong one, and copied a big
chunk of the file twice. Node's syntax check caught it ("Missing initializer").
**Fix:** cut the duplicated section, searching for a longer, unique anchor
(`bleeding: {` followed by `label: "Severe bleeding"`).
**Lesson:** when searching code for a place to edit, make sure the search text is unique,
and run a syntax check (`node --check file.js`) after every edit.

---

## Update 4 — START CPR button

### Design change: a START CPR button instead of starting the beat automatically
**Before:** tapping "Unresponsive" started the beat and auto-logged "CPR started."
**Problem with that:** "CPR started" was really "the CPR screen opened". The rescuer
might still be moving the person or kneeling down, so the logged time could be wrong.
**Now:** the CPR screen first shows two optional boxes ("Who's here to help?" and
"Person collapsed at") and a big START CPR button. Tapping it logs "CPR started" at the moment
compressions really begin, and it's the tap browsers need before they allow sound.
**The tradeoff we designed around:** research (Metelmann et al., 2021) found apps can delay
the first compression. So both boxes are optional, compact (one row each, "(optional)" in the
label), and START CPR must fit on the first screen with no scrolling.
**Problem found by testing:** on a 360×640 phone, START CPR was cut off by 60 px, and the
time box was too narrow to show the time. **Fix:** short labels in the compact version
("2", "3+", "Save"), "(optional)" in the labels instead of a separate note line, and a
slightly shorter button. Tested: START CPR is fully visible on 375×667 and 360×640.
After START, the same two boxes move below the beat at full size (with tips), using the
"move one element between slots" trick from Milestone 2b.

---

## High-contrast redesign (measured, not guessed)

### Problem: some things were hard to see in a stressful moment
We measured every color pair with the **WCAG contrast formula** (the web's accessibility
standard; 4.5:1 is the minimum for normal text, 3:1 for button outlines, 7:1 is the stricter
"AAA" level). Three real failures:
| What | Before | Needed |
|---|---|---|
| Button outlines vs. background | **1.65 : 1** (almost invisible) | 3 : 1 |
| White text on red buttons | **4.23 : 1** | 4.5 : 1 |
| White text on the bright center of START | **3.06 : 1** | 4.5 : 1 |

**Solution:** a new palette in the CSS tokens: pure black background, light-gray 3px
outlines (7.8:1), a deeper red (white text on it = 5.9:1), amber situation labels
(14.5:1), and black text on amber/green cards (12–14.5:1). Every change is one token in
`:root`, which is why tokens were worth setting up in Milestone 1.
Also: the smallest text is now 16px (base 19px), and Yes / No / Not sure buttons have
symbols (✓ ✗ ?) so they're recognizable without reading.

### Tool: an automated accessibility checker
We ran **axe-core** (an open-source accessibility checker used by many companies) on
every screen in a phone-sized browser, including the strict AAA contrast rules.
Result after the fixes: **0 violations on all 8 screens tested.** It also found two
problems we couldn't see:
- After leaving the home screen there was no main heading (`<h1>`) for screen readers.
  Fix: an always-present (visually hidden) `<h1>` in the top bar.
- The CPR screen jumped from the main heading straight to "Event log." Fix: the situation
  label there is now a real `<h2>`.

### Problem: bigger text pushed START CPR off small screens
With the larger font, START CPR was cut off by 8px on a 360×640 phone. Fix: slightly
tighter spacing between sections. Re-tested: fully visible on 375×667 and 360×640.

### Follow-up: "too contrasted"
Pure white on pure black (21:1) turned out to be *too* harsh: bright text can seem to glow
or blur on black, especially for people with astigmatism. We softened it to off-white on
very dark gray (15.3:1) with thinner 2px outlines (4.2:1, minimum 3:1). axe-core still
reports 0 violations, including the strict AAA text rule. More contrast isn't always
better; there's a comfortable range.

---

## Milestone 5 — Paramedic handoff

### Design decision: one function builds the facts, two things display them
`buildHandoff()` reads the timeline and returns a plain object (situation, key times,
B.E. F.A.S.T. findings, check answers, details, full timeline). `renderHandoff()` turns
it into the screen, and `handoffText()` turns the SAME object into text for Copy/Share.
So the screen and the copied text can never disagree. (In Java terms: one model, two views.)

### Problem: "last seen normal at 11:30 PM" entered at 12:30 AM
The time box only gives hours and minutes ("23:30"). Putting that on today's date would
make it 23 hours in the FUTURE. **Solution:** `timeFromHHMM()` uses the day the time was
saved, and if that lands more than a minute in the future, moves it back one day and
marks it "(yesterday)". **Test:** saved at 12:30 AM, "23:30" → Oct 22 11:30 PM (yesterday);
"00:10" → same day.

### Problem: live "25 min ago" without the screen jumping
Re-drawing the whole handoff 4 times a second would make the page jump while a paramedic
is reading or selecting text. **Solution:** each "ago" label stores its timestamp in a
`data-time` attribute; every tick only those labels are updated.

### Problem: copying text doesn't work everywhere
`navigator.clipboard.writeText()` can be refused (older phones, some app views).
**Solution:** try/catch. If copying fails, the summary appears in a text box, already
selected, so the user can copy it by hand. Share uses `navigator.share()` (the phone's own
share menu) and its button only appears if the phone supports it (feature detection).

### Problem: real full screen isn't allowed on iPhone
The Fullscreen API works on Android, but iPhones don't allow web pages to go full screen.
**Solution:** "Show full screen to paramedic" adds a CSS class that hides everything except
the handoff (works everywhere) and *also* asks for real full screen where it's allowed.
Turned sideways, the handoff switches to two columns (key facts | timeline) with a CSS
media query.

### Tested
Full cardiac run (collapse time, helpers, CPR, AED, 2 shocks, EMS): banner appears only
after "EMS arrived," key times in the right order with "ago," copied text matches the
screen, axe-core: 0 violations on the handoff, full screen hides the top bar, landscape
shows two columns, Back returns to CPR with the beat still running. Stroke findings show
✓/✗/? answers; the tourniquet row is highlighted.

---

## Milestone 6 — About & Sources

### Design decision: sources are data too
Every source, page and research paper is an object `{ name, url, detail }` in
`content.js`. `renderLinkList()` builds the links, so updating a source never means
touching HTML. Links open in a new tab (`target="_blank"`) with `rel="noopener"`, a
security habit that stops the opened page from controlling ours.

### Transparency: the source is shown under every guided step
Each guided step already had a `source` field in `content.js`. It's now shown in small
italic text under the step ("Source: STOP THE BLEED"), so a judge or user can see where
every instruction comes from.

### Privacy, stated honestly
The app never sends data anywhere: there's no server, and the log is kept only in this
browser's `localStorage`. The About screen says so, and "Delete everything saved on this
phone" (two taps) removes it.

### Problem: tests clicked the wrong "Severe bleeding"
After adding the About screen, three test scripts failed: they clicked the first element
with the text "Severe bleeding," which was now hidden text on the About screen. The app
was fine. **Fix:** the tests now only click inside the scenario list
(`#scenario-list >> text=...`). **Lesson:** tests should find elements the way a user
would (in the place they're visible), not just by matching text anywhere on the page.

### Not used: MedlinePlus
The plan allowed MedlinePlus for "Learn more" links. We never used it, so it isn't listed.
Listing a source we didn't use would be misleading.

---

## Pictures for the steps

### From gray placeholders to real diagrams
The student asked for real pictures instead of the gray placeholders. We kept the rule
"never copy images from the Red Cross, AHA or the web" by **drawing original diagrams in
code**: each one is an SVG file (a vector drawing made of shapes like `<circle>`, `<rect>`
and `<line>`), kept in `images/source-svg/`. A script renders each SVG and saves it as an
800×600 WebP with the **same filename as the placeholder**, so no code changed at all.
That's the payoff of choosing final filenames back in Milestone 2b.

### Checking our own drawings
We rendered all 8 into one contact sheet and looked for problems before using them. We found
and fixed three: arms had no outline (they looked flat next to everything else), the hair
shape left a white gap, and the "Blurry or double?" label overlapped the face. Two alt texts
were updated to describe exactly what the final drawings show.

### Size
Each image is 10–16 KB (budget: 60 KB). All 8 together are about 100 KB, which matters for
offline use: the service worker will store all of them on the phone.

### Reviewing supplied pictures for medical accuracy
The student supplied 5 pictures with captions. Before using them, each was checked against
the steps in `content.js` and the sources. **2 were used, 3 were held back:**
- **Used:** CPR (rescuer kneeling, straight arms, hands on center of chest) and direct
  pressure (hand pressing a cloth on a leg, no blood). The caption band was **cropped
  off**, because medical text must live in `content.js` (where it has a source), and
  text inside an image can't be read by screen readers or translated.
- **Held back:** the tourniquet picture shows a tourniquet on the knee (on a joint, the
  opposite of the instruction) and shows blood; the "pack wound" picture actually shows
  pressing on top, and packing a lower-leg wound contradicts our steps; one CPR picture
  has a pad drawn under the hands; the AED picture puts the second pad near the middle of
  the chest instead of the left side below the armpit.
**Lesson:** a picture is medical content too. A clear, professional-looking image can still
teach the wrong thing, so pictures get the same check as text.
**Also learned:** the new CPR picture is wider (800×480). Because the `<img>` has
`height: auto`, the browser uses the real image's shape, so nothing stretched. Tested.

### Fixing a picture instead of throwing it away (AED pads)
The student's AED picture had the second pad near the middle of the chest. Instead of
dropping it, we edited it with a Python script (Pillow library):
1. Built a **mask** of only the pad's own pixels (red border + white inside), so the
   other pad's wire and the body outline weren't touched. (Our first try erased a
   whole rectangle, which left visible patches and cut the other wire. We could see it
   was wrong in the result and redid it.)
2. Painted those pixels with the torso color (the median color of a plain torso area).
3. Pasted the pad, slightly rotated, on the person's left side below the armpit.
4. Redrew its wire to the AED.
The other new pictures (face, arm, speech, eyes, and a new clock + phone picture for the
"T, Time to call 911" step) were accurate; their title text was cropped off.
Two pictures are still not used because they would teach the wrong thing.

### Repairing the tourniquet picture with "inpainting"
The student wanted the tourniquet picture included. Its leg half showed an acceptable
placement (tourniquet on the thigh, above the knee, not on it), but it was cluttered with
confusing "2-3 inches" labels and arrows, a crossed-out knee icon, and blood drops. The arm
half had a "NOT ON JOINT" sign drawn *over* its tourniquet, which can't be fixed, so it
was cropped away.
**Tool:** OpenCV's `cv2.inpaint()`, which fills masked pixels using the colors around them.
**How:** build a mask of only the unwanted pixels (anything that isn't background pink,
skin, or the dark outline, inside small boxes around each label/arrow), inpaint, then
check the result.
**Problems we hit (each found by looking at the output):**
1. The curved arrow crossed the leg's outline, so removing it broke the outline. Fix:
   redraw that part of the outline as a smooth curve (a quadratic Bézier) between the
   points where the original outline was still intact.
2. The cleanup area overlapped the wound mark and blurred it. Fix: protect the wound's
   rectangle in the mask and rerun the whole process from the original image.
**Result:** a clean leg picture, 11 KB. The wound-packing and balance pictures only needed
their captions cropped.

---

## Bug report from testing: "Call 911 doesn't actually work"

### Why it didn't dial
The 911 button is a normal link, `<a href="tel:911">`. On a real phone it opens the dialer.
But in Claude's preview panel, phone links are blocked (the preview runs the page in a
locked-down frame for security), and a computer has no phone to dial with. We checked
the code: both 911 buttons point to `tel:911`, and our click handler does NOT block the
link (`event.defaultPrevented` is false). The real test has to happen on a phone.

### The real bug it revealed: the log claimed something it couldn't know
Even when the tap did nothing, the app logged "911 called" and turned the card green.
In a medical log, that could mislead paramedics. A web page can't find out whether the
phone actually placed a call, so the app now records only what it knows: **"Call 911
tapped,"** and the card adds **"Dialer didn't open? Dial 9-1-1 yourself."**
**Lesson:** log facts the app can actually observe, not what we hope happened.

### A second bug found while testing the fix
With the taller card, START CPR was pushed off small screens, by much more than one line.
The cause was an older bug: the long speakerphone tip is supposed to hide once a mode is
chosen, but the card was only refreshed when something was logged, and opening the CPR
screen doesn't log anything. Our earlier screen-fit test never tapped 911 first, so it
missed this. **Fix:** refresh the card whenever the mode changes; also show the time
without seconds so it fits on one line. A new test (`fit911`) taps 911 first: START CPR
now fits on 375×667 and 360×640 either way.

---

## Update 5 — More situations, stroke "while you wait", 911 help

### Choking: following the 2025 change
The 2025 AHA guidelines changed adult choking care: **5 back blows, then 5 abdominal
thrusts, repeated** (back blows first), instead of abdominal thrusts alone. Many older apps
still teach the old way. Unconfirmed details (chest thrusts for pregnant people) were left
out and marked `// VERIFY`, following our rule not to invent medical steps.

### Possible heart attack: checks, not a diagnosis
Warning signs from the AHA's "Warning Signs of a Heart Attack" page are Yes / No / Not sure
checks, reusing the B.E. F.A.S.T. code (steps with a `finding`). The handoff now lists findings
from *every* situation (`flatMap` over all scenarios), not just stroke. On medicine, the AHA
mentions aspirin, but the right answer depends on the person, so the app says: "Don't give any
medicine unless the 911 dispatcher tells you to."

### Reusable "situation switch"
Choking, stroke and heart attack can all turn into cardiac arrest. Steps and buttons can now
carry `switchTo: "cardiac"`: one tap logs "Stopped responding" and opens the CPR screen. It's
data in `content.js`, so the code didn't need a special case for each situation.

### "Compatible with 911": what a web app can and can't do
A web app can't connect to 911 dispatch systems. What it can do:
- **Text-to-911** with an `sms:911?&body=...` link: the message (situation, start time,
  GPS location) is written for the user. `encodeURIComponent()` makes spaces and symbols safe
  inside a link. The FCC says Text-to-911 only works in some areas (you get a "bounce-back"
  text if not), so the app says so and recommends calling when possible.
- **GPS location** with `navigator.geolocation.getCurrentPosition()`: the phone asks permission
  first, and there's an error path (denied, no signal) that tells the user to give their address.
- Logs say "Text to 911 opened," never "texted 911", for the same reason as "Call 911 tapped."

### Problem: every new line pushed START CPR off small screens
The new "Text 911" link made the 911 card taller, which pushed START CPR (and the new AED row
under the beat) off a 360×640 screen. Fixes: the "dialer didn't open" line and the link became
one sentence, the amber text got shorter ("911 not called yet."), and spacing tightened.
"9-1-1" uses non-breaking hyphens (`‑`) so it never splits across lines. The screen-fit
tests now check START CPR and the AED row, with and without 911 tapped.

---

## Update 6 — Four more situations and a longer "Not sure" check

### New situations (all from the 2024 AHA/Red Cross First Aid Guidelines or 2025 AHA Part 7)
- **Severe allergic reaction:** call 911, help use their own epinephrine auto-injector, a
  second dose *may* help after 5–10 minutes if EMS isn't there (a weak "may be considered"
  recommendation, and sources differ on the timing, so it's marked VERIFY).
- **Seizure:** to the ground, clear the area, don't restrain, nothing in the mouth, on their
  side, the guideline's list of when to call 911 (over 5 minutes, first seizure, ...).
- **Possible opioid overdose:** not breathing normally → CPR (with breaths if trained); naloxone.
- **Low blood sugar:** only if awake and able to swallow, at least 20 g of sugar (tablets
  preferred); call 911 if no better in 10 minutes. (The 2024 guideline says ≥20 g, not the
  older 15–20 g, a detail we caught by reading the source instead of relying on memory.)

### Making the handoff data-driven
New one-tap buttons have `keyTime: "first"` or `keyTime: "count"` in `content.js`.
`buildHandoff()` loops over every situation's buttons and adds them to "Key times"
(e.g. "Epinephrine given: 2, last at 2:14 PM"). A JavaScript `Set` remembers which log texts
were already added, because several situations share the same button (like "EMS arrived").
So new situations get handoff support without new code.

### The check got longer, but CPR didn't get slower
Five new questions (seizure, opioids, allergy, diabetes, plus chest pain from Update 5). They
only go on paths where the person is breathing; "doesn't respond + not breathing normally"
still reaches the CPR beat in **2 answers**. We wrote a small script that follows every
`next` pointer to make sure no question points to something that doesn't exist (0 broken
links), and a test that walks every route.

### Tests that broke for good reasons
Two old tests failed after this change: one answered the check in the old order, and one
clicked a link that's now hidden at that moment. The app was right; the tests were updated.

---

## Emergency-friendly UI pass

### Choose by what you see, not by a medical word
A panicked bystander may not know what "anaphylaxis" or "opioid overdose" looks like. Every
situation button now shows the **signs** under its name (e.g. *Choking: "Can't breathe, cough
or talk"*), taken from the same sources as the check questions. They're `hint` fields in
`content.js` with a `hintSource`.

### Order by urgency, and make "Not sure" easy to find
The 3 most time-critical situations (`urgent: true`) are big with a red outline. "Not sure?
Answer a few questions" moved from the bottom of a 10-item list to right under them, so the
people who most need it don't have to scroll. The other 6 are listed smaller under "Other
situations."
**Problem:** "Not sure" still landed below the bottom of the screen. We measured its position
in a test browser and fixed it step by step: a shorter 911-card link, a one-line instruction,
a compact one-line "Not sure" button, and on short screens (`@media (max-height: 700px)`) the
instruction is hidden. Result: fully visible on 740-px and 667-px-tall phones, and its first
line shows on a 640-px phone.

### Less to scroll past
The event log now folds away with `<details>` ("Show event log (12)"). "Handoff for
paramedics," "Add note" and "Undo last" stay visible. Long step details with " · " between items
become bullet lists (e.g. the seizure "call 911 if…" list).

### Read steps aloud (off by default)
The Web Speech API (`speechSynthesis`) reads each step out loud, so the rescuer can keep their
eyes and hands on the person. It works without internet on most phones. It's **off by
default** so it doesn't talk over the 911 dispatcher on speakerphone, and the button only
appears if the phone supports speech (feature detection).

---

## Milestone 7 — Offline support and "Add to Home Screen"

### Service worker: cache first, update in the background
`sw.js` saves all 19 files the app needs when it's first opened. Every later request is
answered from that saved copy **immediately** (no waiting for a weak signal in an emergency),
while a fresh copy is fetched quietly for next time. Changing `CACHE_VERSION` (v1 → v2) makes
phones replace the old files. If any file is missing during install, the install fails on
purpose, so a phone never keeps a half-saved app.
**Test:** we ran a local web server, opened the app once, then switched the browser **offline**
and reloaded. The app opened, START worked, and the step pictures loaded from the saved copy.
**Gotcha:** service workers only run on real web addresses (https or localhost), not when you
double-click `index.html`, and Claude's preview blocks them. `registerOffline()` checks first and
ignores failures, so the app works the same everywhere, just without offline mode there.

### Web app manifest
`manifest.webmanifest` gives the app a name, an icon (drawn with Python: red circle, white
heartbeat line) and colors, so "Add to Home Screen" makes it look like a real app.

---

## Reset button, step help at the top, and "Call 911" on a laptop

### "Call 911 on my laptop just opens an app and does nothing"
A computer has no phone line, so a `tel:` link can only open a calling app (FaceTime, Phone
Link, Skype). No website can make a computer call 911. The app now detects a computer with
`window.matchMedia("(hover: hover) and (pointer: fine)")` (a mouse/trackpad, not a touch screen,
asked the same way a CSS media query would) and, after the tap, says **"Computers usually can't
call 911. Use a phone, or text 911"** instead of the phone message.
**Testing lesson:** our phone-size tests were running as a "desktop" browser shrunk to phone
width, so they saw the computer message and reported the screen as too full. Real phones have
touch screens; the tests now emulate touch phones (`hasTouch`, `isMobile`).

### Reset (top bar)
Only shown during an emergency. It never resets on one tap: a panel on the page asks "Erase this
emergency's log and start over?" with the safe choice (Cancel) focused, and reminds the user to
show or copy the handoff first. "Yes" deletes the saved log and reloads the page, the simplest
way to guarantee everything (clock, CPR beat, screens) starts fresh.
**Problem:** adding Reset to the top bar squeezed "Call 911" onto two lines on a 360-px phone,
which made the bar taller and pushed START CPR off the screen. Fix: `white-space: nowrap` and
`flex: none` on the Call 911 button.

### Step-by-step help moved to the top of the CPR screen
It's now a compact button above the beat; the "follow the dispatcher" line moved under the
instruction, so the AED row still fits without scrolling.

### Remember: new cache version
`sw.js` CACHE_VERSION v1 → v2, so phones that saved the old version get the new files.

---

## Text 911 next to Call 911 (two-row top bar)

The top bar was already full on a 360-px phone (clock, Reset, Call 911), so a fourth button
couldn't fit in one row. It's now two rows: **[clock · Reset]** and **[Call 911 | Text 911]**,
each 911 button half the width (easier to hit than before). Text 911 opens the text app with the
message already written. One function, `updateTextLinks()`, keeps every Text 911 link's message
current (situation, start time, location) after every change, and the tap logs "Text to 911
opened" (never "texted 911").

**Making room (measured again on 375×667 and 360×640 touch phones):** the taller bar pushed
START CPR and "Not sure?" down. Fixes: the 911 card's extra lines only show while choosing what's
happening (on the CPR and step screens it's one line); "Not sure?" moved above the urgent buttons
as one slim line, so it's on the first screen of every phone. **A gap we found:** hiding the
card's location link meant there was no way to reach "Find my location" mid-emergency, so it
became a button in the event-log area, available on every screen.
Cache version: v3.
