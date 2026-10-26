# Congressional App Challenge 2026 — submission answers (Minute Zero)

Each answer is under the 400-word limit. Text in [brackets] is for Vihaan to fill in or confirm.

## Please briefly describe what your app does?

Minute Zero is a free web app that helps bystanders act in the first minutes of a medical emergency and records every step, with the time, for paramedics. It works alongside a 911 call, not instead of it.

One tap on START begins a clock and a timestamped log. The user then picks what they see: unresponsive or not breathing normally, choking, severe bleeding, possible stroke, possible heart attack, severe allergic reaction, seizure, possible opioid overdose, or low blood sugar. Each button lists the signs to look for, so people choose by what they see, not by a medical word. If they aren't sure, a few yes-or-no questions based on official warning signs point them to the right steps. Someone who isn't responding or breathing normally reaches CPR in two answers.

Minute Zero has two ways to help. If the 911 dispatcher is giving instructions, a quiet Dispatcher mode lets the user log each action with one big tap, so the app never talks over the dispatcher. If no one is giving instructions or the call drops, guided steps with pictures take over. CPR mode has a beat at 110 compressions per minute, a two-minute timer to switch rescuers and check the AED, and buttons to log when the AED arrives and when a shock is given. The stroke check walks through the B.E. F.A.S.T. warning signs and records when the symptoms started.

When paramedics arrive, a handoff screen shows the key times (collapse, CPR start, stroke symptom onset, tourniquet, AED shocks), how long ago each one happened, and the full timeline. It can be shown full screen, copied or shared.

Minute Zero can also find the phone's location to read to the dispatcher, write a Text-to-911 message for someone who can't talk, and save family members' known conditions, like epilepsy or a severe allergy, so their situation appears first and their information goes to paramedics. It works offline, keeps the screen on, saves the log if the page reloads, and has large-text, calm and read-aloud options. Every medical step comes from the American Heart Association, the American Red Cross, the American Stroke Association or Stop the Bleed, with the source shown under each step. The app never diagnoses; it only guides and records.

## What inspired you to create this app?

"When did he collapse?" That's one of the first questions paramedics ask, and in a panic, almost nobody knows the answer.

[Optional, only if true: one sentence about a moment that made this personal, such as a CPR class, a family emergency, or something you saw.]

I started by researching what happens before paramedics arrive. According to the American Heart Association, more than 350,000 cardiac arrests happen outside of hospitals in the U.S. each year, and immediate CPR can double or triple a person's chance of survival. That means the most important help often comes from a bystander: a family member, a classmate, a stranger. But bystanders are scared, and two things make it harder.

First, 911 dispatchers can coach CPR over the phone, but that help has been inconsistent: in a national survey of 911 centers, 46% of the centers that responded gave no instructions for medical emergencies. Calls can also drop.

Second, the times matter. Paramedics and doctors need to know when the person collapsed, when CPR started, when a tourniquet went on, and especially when stroke symptoms began, because that time helps doctors decide which treatments are still possible. In the middle of an emergency, nobody is watching the clock.

When I looked at existing apps, I found a gap. First-aid apps for the public give instructions, but they don't record what you did. Apps that log every second exist, but they're built for doctors and nurses. I didn't find a free, offline app for ordinary people that does both.

That's what I set out to build: an app a frightened person can use with one hand, that helps them do the right thing, works with the 911 call instead of competing with it, and remembers the times for them. The name comes from the idea that every emergency has a "minute zero": the moment someone collapses, when a bystander is the only help there is. I wanted that bystander to have a partner in their pocket.

## What technical difficulties did you face programming your app?

Keeping the CPR beat accurate. CPR should be done at 100 to 120 compressions per minute, so the beat has to be steady. A simple repeating timer drifts when the phone is busy. The fix was the Web Audio API with a "look-ahead" scheduler that books each beep slightly ahead of time. Tests measured exactly 0.5455 seconds between beats (60 ÷ 110), and the pulsing circle on screen is synced to the sound.

Updates that didn't show up. The app works offline through a service worker, which saves the app's files on the phone. At first it always served the saved copy, so my phone showed new buttons with old styles. The fix was to check the network first, with a three-second limit before falling back to the saved copy, and to add version numbers to every file so phones always load the newest one.

Fitting the important buttons on small phones. The START CPR button and the Done button kept getting pushed below the bottom of the screen, which is dangerous in an emergency. Automated browser tests (Playwright) at several phone sizes measured exactly where each button ended up. The fixes were compact layouts and a "sticky" Done button that always stays on screen.

What a web page can and can't do with 911. A web page can open the phone's dialer, but it can't know if the call actually went through, and on a laptop it can't call at all. So the app logs "Call 911 tapped," not "911 called," and shows a different message on computers. For location, the phone's permission popup could appear in the middle of CPR, so the app asks once in Settings, then checks the permission silently during an emergency. The tests also caught a race condition where two parts of the app asked for the location at the same time; a flag and a second check fixed it.

Medical accuracy. Every step had to come from official sources, and steps not yet confirmed word for word are marked for review. AI-generated pictures were the hardest: several showed the wrong thing, like a syringe instead of a naloxone nasal spray, or a fist on the chest instead of above the belly button. Each picture was checked against the step and rejected or edited if it was wrong.

## What improvements would you make if you were to create a 2.0 version of your app?

1. Expert review and real-world testing. I would have EMS professionals and first-aid instructors review every step, and test the app with volunteers in practice emergencies using CPR manikins. Research has shown that using an app can delay the first chest compression, so I would measure how quickly people start CPR with and without Minute Zero, and remove anything that slows them down.

2. Reaching more people. I would add more languages, starting with Spanish, and steps for children and infants, whose CPR and choking care are different from adults'. I would also add a hands-free voice mode, so a rescuer could say "AED arrived" while doing compressions instead of tapping the screen.

3. A native app. A phone app could keep the CPR beat running on the lock screen, vibrate with the beat so it works in a noisy place, and open even faster from the home screen.

4. Sending the handoff to EMS. Right now the summary stays on the phone until the user shows or shares it. With partnerships and strong privacy protections, the location and timeline could go straight to the 911 center or the ambulance, so paramedics know the key times before they arrive.

5. Finding help nearby. With public data, the app could show the nearest AED, which matters because every minute without a shock lowers the chance of survival.

6. Smarter help, only when it's proven. I chose not to use AI to diagnose, because an app that tells a bystander "this is a stroke" needs clinical testing first. In a future version, any AI triage would come only after that testing, and the app would still always say to call 911.

## Did you use AI? (how, and what you contributed directly)

Yes. I used two AI tools:
- Claude (Anthropic), through Claude Code, as a pair-programming partner.
- Google Gemini's image model ("Nano Banana") for 11 of the step pictures. [Add the tool used for the earlier pictures, if they were AI-made.]

What I did: I led the project from start to finish. I came up with the idea, the name and the goal: an app that works alongside the 911 call and remembers the times for paramedics. I researched the problem and other apps. I decided every feature and every change, including:
- a START button before CPR begins
- a "Not sure?" question check
- the stroke check
- Text 911 next to Call 911
- a "Start over" button with an "Are you sure?" popup
- a tutorial
- saving family members' conditions
- settings and presets
- the menu
- automatic location
- less scrolling

When there were trade-offs, I made the call, such as when the app should ask for location permission so it never interrupts CPR. I tested the app on my own phone and laptop throughout, and found and reported problems, such as:
- the 911 button doing nothing on a laptop
- old versions still showing after updates
- colors that were too harsh
- too much scrolling

I made the step pictures in Gemini and had the wrong ones remade until they matched the official steps. I designed the demo video, filmed the intro and recorded the voice-over, set up the GitHub repository and the website, and am reviewing the medical steps against the sources. [If you changed any code yourself, add one example here.]

How Claude helped: from my instructions, Claude wrote most of the HTML, CSS and JavaScript, and explained the code by comparing JavaScript to Python and Java, which I already know, so I understand how each part works. It wrote automated tests (Playwright browser tests and the axe-core accessibility checker), helped search for and summarize the medical guidelines and research, drafted the picture prompts, and helped produce the tutorial screenshots and edit the demo video.

How Gemini helped: it drew step pictures from prompts, such as back blows, abdominal thrusts and the recovery position. Every picture was checked before use.

## What did you learn or take away from participating in the Congressional App Challenge?

I learned that designing for an emergency is very different from designing for everyday use. Every extra tap or question can delay CPR, so the best feature is often the one you leave out. I kept asking myself one question: can a scared person do this with one hand, in a few seconds? That question changed the app many times: the START CPR button had to fit on the smallest phones, the Done button had to stay on screen, and the location permission had to be asked before an emergency, not during one.

I learned a lot about JavaScript and how the web works: how a page can be built from data, how a service worker makes a website work offline, why browser timers aren't accurate enough for a CPR beat, and how async code and race conditions work. I also learned to test on real phones and with automated tests, because something that looks fine on a laptop can break on a small screen.

I learned that medical information has to be exact. Every step needed an official source, and I learned to mark something "to verify" instead of guessing. I also learned the difference between guiding and diagnosing, and why an app for the public should stay on the guiding side.

I learned how to work with AI responsibly. It made me much faster, but it also made mistakes that looked convincing, like pictures that showed the wrong device or the wrong hand position. I learned that I'm responsible for checking everything, making the decisions, and being honest about how the app was built.

Finally, I learned how to take an idea all the way to something real: researching a problem, studying what already exists, building, testing, getting feedback, and explaining it to other people in a video and in writing.

Most of all, I learned how many people could help in an emergency if someone just guided them and helped them remember. [Optional: one personal sentence about what this project meant to you.]
