# Picture prompts (AI-generated step pictures)

The step pictures listed here were made with **Google Gemini's image model ("Nano Banana")** from the
prompts below. We list them openly so anyone can see how the pictures were made. Every picture was
checked against the step text in `content.js` (and its source) before it was added; pictures with
medical mistakes were redone or not used.

## How to use
1. Open a **new chat** at gemini.google.com.
2. Attach one of our existing pictures (for example `images/cpr-hand-placement.webp`) so the style matches.
3. Send the **style message** first. Then send the scene prompts **one at a time in the same chat**.
4. Download each picture and send it to Claude with its number. Claude checks it, crops it to 4:3,
   converts it to WebP and adds it to the right step.

## Style message (send first)
> I'm making simple first-aid pictures for a free student app. Make every picture in the style of the
> attached image: simple flat illustration, soft colors, plain white background, 4:3 landscape.
> Rules for every picture: no text, letters, numbers, labels or logos anywhere; no brand names; no blood
> or injuries shown; adults only; realistic body positions; show the whole scene clearly from a side
> or three-quarter view. I'll send one scene at a time.

## Scene prompts

| # | Step it goes with | File name |
|---|---|---|
| 1 | Unresponsive, step 2: send someone for an AED | `aed-fetch.webp` |
| 2 | Unresponsive, step 3: on their back on a firm, flat surface | `lay-on-back.webp` |
| 3 | Choking, step 1: "Are you choking?" | `choking-sign.webp` |
| 4 | Choking, step 3: 5 back blows | `back-blows.webp` |
| 5 | Choking, step 4: 5 abdominal thrusts | `abdominal-thrusts.webp` |
| 6 | Seizure, step 2: move hard things away | `seizure-clear-area.webp` |
| 7 | Seizure, step 4 **and** stroke, step 10: on their side | `on-side.webp` |
| 8 | Heart attack, step 7: sit down and rest | `sit-and-rest.webp` |
| 9 | Allergy, step 2: epinephrine auto-injector | `auto-injector.webp` |
| 10 | Opioid, step 3: naloxone nasal spray | `naloxone.webp` |
| 11 | Low blood sugar, step 2: give sugar | `give-sugar.webp` |

1. **AED.** One adult kneels next to a person lying on the floor and points while calling out. A second
   adult hurries toward a white wall cabinet holding a green-and-white AED box (a heart with a lightning bolt
   symbol is fine, but no words).
2. **Firm, flat surface.** An adult lies face up, flat on a hard floor (not a bed or sofa), arms at their
   sides. A rescuer kneels beside their chest, ready to start CPR. Side view.
3. **Choking sign.** An adult holds both hands at their own throat, looking distressed, unable to speak.
   Another adult stands in front of them, looking concerned, as if asking a question.
4. **Back blows.** A choking adult stands bent forward at the waist. The rescuer stands slightly behind and
   to the side, supports the person's chest with one hand, and strikes firmly between the shoulder blades
   with the heel of the other hand. Show the heel of the hand clearly. Side view.
5. **Abdominal thrusts.** The rescuer stands directly behind a standing choking adult, arms wrapped around
   the person's waist. One hand is a fist placed just above the belly button and well below the breastbone,
   thumb side against the stomach; the other hand grabs the fist. Side view so the fist position is clear.
6. **Seizure: clear the area.** An adult lies on the floor having a seizure. A helper kneels nearby and
   moves a chair and a table with hard edges away. The helper does not hold the person down and puts
   nothing in their mouth.
7. **On their side.** An adult lies on their side on the floor: the top knee is bent and resting forward on
   the floor to keep them steady, the head rests on their lower arm, and the face points slightly down so
   fluid can drain from the mouth. A helper kneels beside them.
8. **Sit and rest.** An adult who looks unwell sits in a chair with a hand on their chest. A helper kneels
   next to them holding a phone to their ear, staying with them.
9. **Auto-injector.** An adult sits on the floor. A generic epinephrine auto-injector pen (no brand, no
   words) is pressed firmly against the **outer side of the middle of the thigh**, through the pants. The
   hand holds the pen in a fist, with no thumb or fingers over either end.
10. **Naloxone nasal spray.** An adult lies on their back. A helper kneels beside them, supports the back of
    the person's neck so the head tilts back, and puts the tip of a small generic nasal spray (no brand, no
    words) into one nostril, thumb on the plunger.
11. **Give sugar.** An adult with diabetes is awake and sitting up, holding a glass of orange juice and a
    small open container of glucose tablets. A helper sits beside them.

## What Claude checks before a picture goes in
- Matches the step text exactly (e.g. fist **above the belly button**, injector on the **outer thigh**,
  person on a **hard floor**, nothing in the mouth during a seizure).
- No text, logos, blood or anything scary; works at phone size.
- If a detail is wrong, it's redone or edited, never used as-is.
