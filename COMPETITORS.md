# Competitive Research — App Store & Google Play (Oct 21, 2026)

## Bottom line
Every individual feature already exists somewhere, but no free, offline, bystander-facing app was found that combines:
1. guided lay-rescuer steps for CPR, stroke (F.A.S.T.) and severe bleeding,
2. one-tap timestamped logging, and
3. a paramedic handoff timeline screen.

Clinician code-timer apps already log and export timelines. Public first-aid apps already give guidance. Neither side does both. Describe this as "not found after a reasonable search," not "doesn't exist."

## Closest competitors (know these for the judges)
| App | Who it's for | What it does | What it lacks vs. our app |
|---|---|---|---|
| PHEM Logger (iOS, 2026) | Paramedics / pre-hospital teams | Timestamps arrest, bystander CPR, bystander AED; built for handover | Clinical vocabulary, no lay guidance; documents bystander actions *after* EMS arrives |
| Code Blue CPR – ACLS Timer (iOS) | Healthcare providers | Metronome, timers, "First Responder Mode," PDF export | ACLS drug/rhythm tool; no stroke or bleeding flows; not for panicked laypeople |
| Code Blue: CPR Event Timer (iOS) | Clinicians | Timers, 100–120 metronome, PDF/CSV export, 2025 AHA epi alert | Same as above |
| CPR Timer / "CFR Timer" (iOS, free) | Community first responders | Big timer, one-tap event markers | No guidance, no stroke/bleeding, no EMS handoff screen |
| Red Cross Resuscitation Suite (iOS + Android, 2026) | Nurses, physicians, EMTs, paramedics | Code cards, prompts, timers, metronome, event reports | Professional BLS/ALS/PALS/NALS, not lay first aid |
| Red Cross First Aid, IFRC First Aid | Public | Step-by-step guides, practice metronome, 911 button | No timestamped log, no handoff |
| STB – Stop the Bleed (USUHS) | Public | Bleeding steps, tourniquet videos | No logging; content dated (© 2018) |
| Spot a Stroke F.A.S.T. (AHA/ASA) | Public | Warning signs, call 911 | No last-known-well timer, no log |
| PulsePoint Respond | CPR-trained citizens | Alerts to nearby arrests, AED map | Alert network, not a logger (complements us) |

Also review before Monday:
- **First Aid AI (firstaidai.tech)** markets "timestamped incident memory" for the first five minutes of care. Only marketing copy found; check it and be ready to explain the difference.
- **Heart Angel** (Catherine Wang, 2025 Congressional App Challenge winner, CA-49): CPR app that finds the nearest AED and alerts responders/volunteers. Our difference: timeline + handoff, not alerts or maps.

## Name check
No app named exactly "First Minutes" was found, but similar names exist in emergency care: LifeFlight's "First Minutes Matter" (Australian bystander training program), "1st Minute App" (translation app for first responders), "First 5 Minutes" (pediatric resuscitation reference). Renaming is still the right call.

## Our differentiators (use in pitch)
- A handoff screen written by the bystander — especially stroke "last known well" time, which EMS often has to reconstruct.
- Built to work alongside a 911 call. A 2021 controlled simulation (Metelmann et al., Scandinavian Journal of Trauma, Resuscitation and Emergency Medicine, vol. 29, article 76) found laypeople required to use a CPR app delayed the breathing check, call for help, and first compression — even though the app improved compression rate and depth. Our quiet "dispatcher mode" addresses this.
- One app and one log across three lay scenarios (CPR, stroke, bleeding).
- Free, offline, no account, works in any phone browser (most clinician loggers are iOS-only).
- Current 2025 AHA / 2024 AHA–Red Cross guidelines; original hand-drawn illustrations.

## Feature changes based on this research
**Add**
- One-tap "Tourniquet applied at [time]" in the bleeding flow (no bystander Stop the Bleed app records this).
- Auto-calculated "minutes since collapse" / "minutes since last known well" on the handoff screen.
- "Show to paramedic" full-screen mode: high contrast, works in landscape; plus copy/share export.
- Log auto-saves continuously so it survives the phone locking (a common complaint about CPR metronome apps).

**Keep**
- Hands-only CPR as the default; trained 30:2 as an option.
- 2-minute rescuer-switch timer.
- Zero extra taps to reach compressions after "Start Emergency."

**Drop or downplay**
- Compression counter as a headline feature (common elsewhere, adds little for hands-only). Keep it small or remove it.
- Anything clinical (heart rhythms, drugs) and any AI diagnosis ideas.
- Don't present the metronome itself as the innovation.

## Three ways to describe the gap to judges
1. "Apps for doctors and paramedics already log every second of a cardiac arrest — the Red Cross released one in 2026. Apps for the public tell you what to do but forget everything you did. My app gives the bystander the same clock the professionals use, then hands the timeline to EMS."
2. "Paramedics arrive and ask: When did they collapse? When did CPR start? When did the stroke symptoms begin? A scared bystander usually can't answer. My app answers in one screen."
3. "It's designed not to get in the way. Research found laypeople using a CPR app delayed their first compressions, so my app has a dispatcher mode with just big buttons and a metronome — the 911 operator stays in charge."

Keep the disclaimer in the app and demo: "Not a substitute for 911 or formal first-aid training."
