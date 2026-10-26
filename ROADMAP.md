# Minute Zero 2.0 — roadmap

Goal: move Minute Zero from a student app to a tool that 911 centers, EMS agencies and public
health officials trust and recommend. The rule from version 1 stays: **work alongside 911, never
instead of it, and never diagnose.**

## Phase 1 — Make it trustworthy (first 3 months)
- **Expert review.** Ask local EMS professionals, 911 dispatchers and certified CPR / first-aid
  instructors (American Heart Association, Red Cross) to review every step, starting with the
  items marked `// VERIFY` in `content.js`.
- **Practice-emergency testing.** Test with volunteers on CPR manikins: measure time to the first
  chest compression and how many handoffs include the collapse time, with and without the app.
  (Research has shown that apps can delay first compressions, so speed is the number to watch.)
- **Accessibility testing** with real screen-reader users and older adults, not only automated checks.
- **Privacy policy** written in plain language (today nothing leaves the phone; keep it that way
  unless the user chooses to share).

## Phase 2 — Reach more people (3–9 months)
- **Spanish first**, then other languages common in our district.
- **Children and infants** (different CPR and choking steps), from the same official sources.
- **Native app:** CPR beat on the lock screen, vibration with the beat, faster start.
- **Hands-free voice logging** ("AED arrived", "shock delivered") during compressions.
- **Nearest AED:** show public AED locations from open data or an AED registry, with permission.
- **QR-code handoff:** a paramedic scans a QR code on the screen to get the timeline. This works
  without a server or internet, so it fits Minute Zero's privacy-first design.

## Phase 3 — Work with 911 and EMS (9–18 months)
1. **Start local.** Show the app to our county's 911 center (the PSAP, Public Safety Answering Point)
   and the local EMS agency. Ask what they'd want to see, what slows them down, and what data
   format helps them. Their feedback shapes everything after this.
2. **Match dispatcher instructions.** Many 911 centers use telecommunicator CPR (T-CPR) protocols.
   Dispatcher mode could use the same words and order the dispatcher uses, so the app and the
   voice on the phone never disagree.
3. **Send data to 911 (with the user's consent).** Modern Next Generation 911 (NG911) systems can
   receive extra data with a call, for example through data clearinghouses such as RapidSOS that
   many 911 centers already use. With a partnership, Minute Zero could send the location and the key
   times (collapse, CPR start, stroke symptom onset) the moment 911 is called.
4. **Send the handoff to EMS.** EMS agencies keep electronic patient care records, and national EMS
   data standards (NEMSIS) describe how that data is organized. Exporting the handoff in a
   compatible format would let paramedics bring the bystander's timeline into their own record.
5. **Pilot program.** Run a pilot with one county 911 center and one EMS agency, ideally with a
   hospital or university research partner, and measure real results.

## Phase 4 — Work with government (18+ months)
- **Share results with our Representative's office** (the Congressional App Challenge office) and
  state legislators, especially those working on 911 modernization, CPR education in schools, and
  stroke systems of care.
- **Regulation:** before adding anything that interprets symptoms (like AI triage), review the FDA's
  guidance on software as a medical device and clinical decision support. Guiding and logging stay
  separate from diagnosing.
- **Privacy law:** once data leaves the phone (to 911 or EMS), follow health-privacy rules, collect
  the minimum, encrypt it, and always ask the user first.
- **Funding and partners:** 911 modernization is funded by state 911 boards and federal grant
  programs; partnering with a 911 center or health department could open those doors. Public-health
  groups and CPR-training programs could recommend the app.
- **Standards groups:** share what we learn with 911 professional associations (such as NENA and
  APCO) that set the standards 911 centers follow.

## How we'll know it works
- Time from START to first chest compression (should not increase).
- Share of handoffs that include the collapse time / symptom-onset time.
- Feedback from paramedics and dispatchers: was the handoff accurate and useful?
- Number of 911 centers, EMS agencies or schools that recommend Minute Zero.
