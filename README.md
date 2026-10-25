# Minute Zero

**When someone collapses, most bystanders forget what to do and when they did it. Minute Zero works alongside your 911 call: it logs every step with the time, guides you if no one else can, and hands paramedics a clear summary.**

- **Try it:** https://vihaanbudankayala.github.io/minute-zero/ (works on any phone browser; open it once and it also works offline)
- Made for the 2026 Congressional App Challenge by [@VihaanBudankayala](https://github.com/VihaanBudankayala)

> This app does not replace calling 911 or formal first-aid training.

## The problem
- 911 dispatchers can coach CPR over the phone, but that help has **historically been inconsistent**: in a 2010 national survey, 46% of responding 911 centers gave no instructions for medical emergencies ([Sutter et al., 2015](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4644043/)).
- When paramedics arrive, they ask: *When did they collapse? When did CPR start? When did the stroke symptoms begin?* A scared bystander usually can't answer, and those times decide treatment.
- Apps for clinicians already log every second; apps for the public give instructions but don't record what you did. We didn't find a free, offline, bystander app that does both (see `COMPETITORS.md`).

## What it does
- **One tap to start.** A big START button begins a clock and a timestamped event log. **Call 911** is on every screen.
- **9 situations, chosen by what you see:** unresponsive, choking, severe bleeding, possible stroke, possible heart attack, severe allergic reaction, seizure, possible opioid overdose, low blood sugar. Each button lists the signs to look for.
- **"Not sure?"** A short yes/no check (11 questions from the official warning signs). Someone who doesn't respond and isn't breathing normally reaches CPR in 2 answers.
- **Works alongside the dispatcher.** *Dispatcher mode* is quiet: big one-tap log buttons, no instructions competing with the 911 call. If no one is giving instructions or the call drops, **guided steps** with pictures take over.
- **CPR mode:** a 110-per-minute beat (sound + a pulsing circle synced to it), hands-only by default with an optional 30:2 mode, a 2-minute "switch rescuers / check the AED" timer, and AED / shock / EMS buttons right under the beat.
- **Stroke check:** B.E. F.A.S.T. (Balance, Eyes, Face, Arm, Speech, Time) with Yes / No / Not sure, plus "symptoms started / last seen normal" time.
- **Paramedic handoff:** key times with live "how long ago" (collapse, symptom onset, CPR start, tourniquet, AED shocks, doses), warning signs checked, and the full timeline. Full-screen mode for showing paramedics, copy and share.
- **More ways to reach 911:** Text-to-911 with the message written for you (where available) and your GPS location to read to the dispatcher.
- **My people:** save conditions you or your family have been diagnosed with (epilepsy, diabetes, severe allergy, heart disease, past stroke, opioid pain medicine) plus notes. Their situations move to the top ("Seizure for Dad"), and choosing one shows their info on the paramedic handoff. Saved only on the phone; it's what you entered, never a diagnosis by the app.
- **Settings and presets:** text size, Calm (no pulsing), CPR sound and read-aloud defaults; presets Standard, Large text, Calm and Hands-free.
- **Tutorial:** a 30-second, 5-card "how it works" from the ☰ menu, each card with a screenshot and arrows pointing at the button to tap. It never opens by itself, so it can't delay someone in a real emergency.
- **Built for stress:** large buttons, high-contrast colors checked with the WCAG formula, optional "read steps aloud," the screen stays on, and the log survives a reload.

## Run it
- **Online:** open the link above. On a phone, "Add to Home Screen" installs it like an app.
- **On your computer:** download this folder and run `python -m http.server 8000` inside it, then open http://localhost:8000. (Opening `index.html` directly works too, but offline support needs a web address.)
- **On your phone over Wi-Fi:** run the command above, then open `http://<your computer's IP>:8000` on the phone.

## How it's built
- **Plain HTML, CSS and JavaScript.** No frameworks, no build step, no server, no accounts. Hosted free on GitHub Pages.
- `content.js`: **all medical text**, as data. Every step has a `source` field; anything not yet confirmed word-for-word is marked `// VERIFY`.
- `app.js`: the logic. The **timeline is the single source of truth**: the screen, the handoff and the copied text are all built from it.
- `styles.css`: mobile-first design with color tokens.
- `tools/make-tutorial-pictures.mjs`: an optional helper (not part of the app) that takes the tutorial screenshots and draws the arrows.
- `sw.js`: the **service worker** that saves every file on the phone for offline use.
- Technical highlights (details in `DEVLOG.md`):
  - **Web Audio look-ahead scheduler** for a CPR beat that doesn't drift (measured: 0.5455 s between every beat, exactly 60 ÷ 110).
  - Timestamps from `Date.now()` differences, so the clock stays right even when the phone pauses timers.
  - Auto-save with `localStorage` and a "Resume" card; Screen Wake Lock; Web Speech API; Geolocation; Clipboard and Web Share APIs.
  - Tested with automated browser tests (Playwright) at phone sizes and the **axe-core** accessibility checker (0 violations, including the strict AAA contrast rules).

## Sources
Medical content comes only from these sources. The full list with links is on the app's **About & Sources** screen.
- 2025 American Heart Association Guidelines for CPR and Emergency Cardiovascular Care (especially Part 7: Adult Basic Life Support)
- 2024 American Heart Association and American Red Cross Guidelines for First Aid
- American Red Cross guidelines and first-aid pages
- American Stroke Association: B.E. F.A.S.T. warning signs
- American College of Surgeons: STOP THE BLEED
- FCC: Text to 911 (not medical; for the Text-to-911 feature)

Minute Zero is a student project and is not affiliated with or endorsed by these organizations.

## Privacy
Everything stays on the phone. No accounts, no server, nothing is sent anywhere unless you copy or share the handoff yourself.

## Future ideas
- Have EMS professionals and first-aid instructors review every step (all `// VERIFY` items).
- More languages, and a version for children and infants.
- A native app (for example, a lock-screen CPR beat).
- **AI triage only after clinical testing.** An app that tells a bystander "this is a stroke" makes a diagnosis; that needs real-world validation and, in the U.S., is the kind of software the FDA treats as a medical device. For now, Minute Zero uses rule-based questions taken directly from official warning signs.

## Credits
- Illustrations: [source to be added by the author]
- Step pictures for low blood sugar, possible heart attack, seizure and stroke (lying on their side): made with Google Gemini (AI) from the prompts in `PICTURE-PROMPTS.md`, then checked against the step text and cropped to remove generated captions.
- Built with help from Claude (Anthropic) as a pair-programming partner. See `DEVLOG.md` for the technical problems and how they were solved.
