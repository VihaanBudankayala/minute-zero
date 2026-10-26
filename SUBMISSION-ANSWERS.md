# Congressional App Challenge 2026 — submission answers (Minute Zero)

Each answer is under the 400-word limit. Text in [brackets] is for Vihaan to fill in or confirm.

## Please briefly describe what your app does?

Minute Zero is a free web app that helps bystanders in the first minutes of a medical emergency. It works alongside a 911 call, not instead of it.

One tap on START begins a clock and a timestamped log. The user picks what they see: unresponsive, choking, severe bleeding, possible stroke, possible heart attack, severe allergic reaction, seizure, possible opioid overdose, or low blood sugar. If they aren't sure, a few yes-or-no questions based on official warning signs point them to the right steps. Someone who isn't responding or breathing normally reaches CPR in two answers.

If the 911 dispatcher is giving instructions, a quiet Dispatcher mode lets the user log each action with one tap, so the app never talks over the dispatcher. If no one is giving instructions or the call drops, guided steps with pictures take over. CPR mode has a 110-per-minute beat, a two-minute timer to switch rescuers, and buttons to log when the AED arrives and when a shock is given.

When paramedics arrive, a handoff screen shows the key times (collapse, CPR start, stroke symptom onset, tourniquet), how long ago each one happened, and the full timeline. It can be shown full screen, copied or shared.

Minute Zero can also find the phone's location to read to the dispatcher, write a Text-to-911 message, and save family members' known conditions so their situation appears first. It works offline, has large-text and calm modes, and was checked with an accessibility tester. Every medical step comes from the American Heart Association, the American Red Cross, the American Stroke Association or Stop the Bleed, with the source shown under each step. The app never diagnoses; it only guides and records.

## What inspired you to create this app?

[Optional first sentence, only if it's true: a moment that made you care about this, such as a CPR class, a family emergency, or something you saw.]

When I started researching what happens before paramedics arrive, two things surprised me. First, 911 dispatchers can coach CPR over the phone, but that help has been inconsistent: in a national survey of 911 centers, 46% of the centers that responded gave no instructions for medical emergencies. And calls can drop.

Second, when paramedics arrive, they ask questions a scared bystander usually can't answer. When did the person collapse? When did CPR start? When did the stroke symptoms begin? Those times matter for treatment, especially for a stroke, but in a panic almost nobody remembers them.

I looked at existing apps. The first-aid apps for the public give instructions but don't record what you did. The apps that log every second are built for doctors and nurses. I didn't find a free, offline app for ordinary people that does both.

So I wanted to build something a frightened person could use with one hand: it helps them do the right thing, works with the 911 call instead of competing with it, and remembers the times for them so they can hand paramedics a clear summary. That's where the name comes from: Minute Zero is the moment someone collapses, when a bystander is the only help there is.

## What technical difficulties did you face programming your app?

Keeping the CPR beat accurate. A simple repeating timer drifts when the phone is busy. The fix was the Web Audio API with a "look-ahead" scheduler that books each beep slightly ahead of time; tests measured exactly 0.5455 seconds between beats (60 ÷ 110). The pulsing circle is synced to the sound.

Updates that didn't show up. The app works offline through a service worker, which saves the app on the phone. At first it always served the saved copy, so my phone showed new buttons with old styles. The fix was to check the network first (with a three-second limit, then fall back to the saved copy) and to add version numbers to every file.

Fitting the important buttons on small phones. The START CPR button and the Done button kept getting pushed below the screen. Automated browser tests (Playwright) at several phone sizes measured exactly where each button ended up; the fix was compact layouts and a "sticky" Done button that always stays on screen.

What a web page can and can't do with 911. A web page can open the phone's dialer, but it can't know if the call actually went through, and on a laptop it can't call at all. So the app logs "Call 911 tapped," not "911 called," and shows a different message on computers. For location, the permission popup could appear in the middle of CPR, so the app asks once in Settings, then checks permission silently. The tests also caught a race condition where two parts of the app asked for the location at the same time; a flag and a second check fixed it.

Medical accuracy. Every step had to come from official sources, and steps not yet confirmed word-for-word are marked for review. AI-generated pictures were the hardest: several showed the wrong thing, like a syringe instead of a naloxone nasal spray, or a fist on the chest instead of above the belly button. Each picture was checked against the step and rejected or edited if it was wrong.

## What improvements would you make if you were to create a 2.0 version of your app?

1. Expert review and real-world testing. I'd have EMS professionals and first-aid instructors review every step, and test the app with volunteers in practice emergencies. Research has shown that using an app can delay the first chest compression, so I'd measure how fast people start CPR with and without Minute Zero, and simplify anything that slows them down.

2. More people. I'd add more languages (starting with Spanish), steps for children and infants, and a voice mode so a rescuer can log things hands-free ("AED arrived") while doing compressions.

3. A native app. A phone app could keep the CPR beat running on the lock screen, vibrate with the beat, and start faster.

4. Sending the handoff to EMS. Right now the summary stays on the phone until the user shows or shares it. With the right partnerships and privacy protections, the location and timeline could be sent to the 911 center or the ambulance automatically.

5. Smarter help, only when it's proven. I chose not to use AI to diagnose, because an app that tells a bystander "this is a stroke" needs clinical testing. In a future version, any AI triage would come only after that testing.

## Did you use AI? (how, and what you contributed directly)

Yes. AI tools I used:
- Claude (Anthropic), through Claude Code, as a pair-programming partner.
- Google Gemini's image model ("Nano Banana") for 11 of the step pictures. [Add the tool used for the earlier pictures, if they were AI-made.]

How Claude helped: I described what I wanted, and Claude wrote most of the HTML, CSS and JavaScript, explained the code by comparing JavaScript to Python and Java, which I already know, and wrote automated tests (Playwright browser tests and the axe-core accessibility checker). It also helped search for and summarize the medical guidelines and research, drafted the picture prompts, and helped make the tutorial screenshots and the demo video recording.

How Gemini helped: it drew step pictures from the prompts, such as back blows, abdominal thrusts and the recovery position.

What I did myself:
- I came up with the idea, the name and the goal: an app that works alongside the 911 call and remembers the times for paramedics.
- I decided every feature and change. Examples: a START button before CPR begins, a "Not sure?" question check, Text 911 next to Call 911, a reset with an "Are you sure?" popup, a tutorial, saving family members' conditions, settings and presets, a menu, automatic location, and less scrolling.
- When there were trade-offs, I made the call, for example when the app should ask for location permission.
- I tested on my own phone and laptop and reported problems: the 911 button doing nothing on a laptop, old versions still showing, colors that were too harsh, and the app needing too much scrolling.
- I made the step pictures in Gemini and sent them back for checking. The ones that were wrong, like the syringe, were remade until they matched the official steps.
- I'm reviewing the medical steps against the sources, recorded the demo voice-over, and set up the GitHub repository and website.
- [If you changed any code yourself, add one example here.]

I can explain how each part of the app works, and every medical step lists its official source.

## What did you learn or take away from participating in the Congressional App Challenge?

I learned that designing for an emergency is different from designing for everyday use. Every extra tap or question can delay CPR, so the best feature is often the one you leave out. I kept asking: can a scared person do this with one hand, in a few seconds?

I learned a lot of JavaScript and how the web works: how the page is built from data, how a service worker makes a website work offline, why browser timers aren't accurate enough for a CPR beat, and how async code and race conditions work. I also learned to test on real phones and with automated tests, because things that look fine on a laptop can break on a small screen.

I learned that medical information has to be exact. Every step needed an official source, and I learned to say "I'm not sure" (marking steps to verify) instead of guessing.

I learned how to work with AI responsibly. It made me much faster, but it also made mistakes that looked convincing, like pictures that showed the wrong device or the wrong hand position. I learned that I'm responsible for checking everything and making the decisions.

Most of all, I learned how many people could help in an emergency if someone just guided them and helped them remember. [Optional: one personal sentence about what this project meant to you.]
