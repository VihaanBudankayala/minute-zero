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
> Important: make ONE picture per reply, never a grid or collage. Do not add any titles, captions, labels,
> speech bubbles, arrows or text of any kind. Picture only. No letters, numbers or logos anywhere; no brand names;
> no blood or injuries; adults only; realistic body positions; side or three-quarter view.
> I'll send one scene at a time.

(First try, Oct 25: Gemini put all 11 scenes in one grid with garbled text, and 4 scenes were medically
wrong: rescuer at the head instead of the chest, fist on the chest instead of above the belly button,
auto-injector on top of the thigh near the knee, back blows without chest support. Prompts 2, 4, 5 and 9
below were rewritten to fix that.)

## Scene prompts (send one at a time)

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

1. One adult kneels next to a person lying on the floor and points while calling out. A second adult
   hurries toward a white wall cabinet holding a green-and-white AED box (a heart with a lightning bolt
   symbol is fine, but no words). No speech bubble.
2. An adult lies face up, flat on a hard floor, arms at their sides. A rescuer kneels at the person's side,
   level with the middle of their chest (not at the head), with both hands placed on the center of the
   chest. Side view.
3. An adult holds both hands at their own throat, looking distressed, unable to speak. Another adult stands
   in front of them, looking concerned. No speech bubble.
4. A choking adult stands bent forward at the waist, so their chest is lower than their head. The rescuer
   stands slightly behind and to the side, with one hand supporting the front of the person's chest. The
   heel of the rescuer's other hand strikes between the shoulder blades. Side view.
5. A choking adult stands with both hands at their throat. The rescuer stands directly behind them, arms
   around their waist. The rescuer's fist is at the level of the belly button, clearly below the ribs and
   far below the chest, with the other hand wrapped around the fist. Side view, so it's obvious the hands
   are on the stomach, not the chest.
6. An adult lies on the floor having a seizure. A helper kneels nearby and moves a chair and a table with
   hard edges away. The helper does not hold the person down and puts nothing in their mouth.
7. An adult lies on their side on the floor: the top knee is bent and resting forward on the floor to keep
   them steady, the head rests on their lower arm, and the face points slightly down so fluid can drain
   from the mouth. A helper kneels beside them.
8. An adult who looks unwell sits in a chair with a hand on their chest. A helper kneels next to them
   holding a phone to their ear, staying with them.
9. An adult sits on the floor with legs out in front. A helper presses a plain white generic auto-injector pen
   (safety cap already removed, so nothing on the top end; no brand colors, no words) straight into the
   OUTER side of the thigh: the side of the leg facing the viewer, on the side seam of the pants, halfway
   between hip and knee. The pen is at a right angle to the side of the leg, held in a closed fist, with no
   thumb over either end. No arrows.
10. (Third version: the first two came out as a syringe. Avoid the word "plunger", it makes the model draw one.)
    Draw a naloxone nasal spray being given to a person who overdosed. The person lies on their back on the
    floor, eyes closed. A helper kneels beside their head, one hand under the back of the person's neck so
    the head tilts back. With the other hand the helper holds a small naloxone nasal spray: a short white
    plastic device about the size of a thumb, shaped like a nasal allergy spray bottle, with a rounded nozzle
    on top. The helper's index and middle fingers are on either side of the nozzle, the thumb pushes on the
    flat bottom, and the nozzle is gently inside one nostril. This is NOT a syringe: no needle, no long thin
    barrel, no liquid tube. No arrows, no text.
    If it still draws a syringe, first ask: "Draw only a naloxone nasal spray device on a white background,
    held in a hand, fingers on either side of the nozzle, thumb on the bottom." Then: "Now show that exact
    device being used in the scene above."
11. An adult with diabetes is awake and sitting up, holding a glass of orange juice and a small open
    container of glucose tablets. A helper sits beside them.

## Status (Oct 25)
- Used (caption band cropped off): 1 `aed-fetch.webp`, 2 `lay-on-back.webp`, 3 `choking-sign.webp`,
  4 `back-blows.webp` (an arrow pointing AWAY from the back was removed with OpenCV inpainting),
  5 `abdominal-thrusts.webp` (small "in" arrows kept), 6 `seizure-clear-area.webp`,
  7 `on-side.webp` (seizure step 4 + stroke step 10), 8 `sit-and-rest.webp`, 11 `give-sugar.webp`.
- 9 `auto-injector.webp`: first try rejected (top of the thigh, safety cap still on); second try used
  (cap off, outer front of the mid-thigh; marked VERIFY in content.js).
- 10 naloxone: rejected TWICE (drawn as a syringe both times); prompt rewritten a third time (Oct 25).

## What Claude checks before a picture goes in
- Matches the step text exactly (e.g. fist **above the belly button**, injector on the **outer thigh**,
  person on a **hard floor**, nothing in the mouth during a seizure).
- No text, logos, blood or anything scary; works at phone size.
- If a detail is wrong, it's redone or edited, never used as-is.
