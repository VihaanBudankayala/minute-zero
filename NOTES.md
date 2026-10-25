# Minute Zero — Research notes for the write-up

## Why an app if 911 dispatchers already give instructions?
**Positioning:** Minute Zero works *alongside* your 911 call, not instead of it.
Phone-guided ("telecommunicator") CPR from dispatchers is very effective, and the app
tells rescuers to follow the dispatcher whenever they are giving instructions.

But dispatcher help has **historically been inconsistent**:

1. **Nearly half of responding 911 centers gave no instructions for medical emergencies (2010 survey, published 2015).**
   - Citation: Sutter J, Panczyk M, Spaite DW, et al. "Telephone CPR Instructions in Emergency
     Dispatch Systems: Qualitative Survey of 911 Call Centers." *Western Journal of Emergency
     Medicine.* 2015;16(5). https://westjem.com/original-research/telephone-cpr-instructions-in-emergency-dispatch-systems-qualitative-survey-of-911-call-centers.html
     (free full text: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4644043/)
   - Numbers: 1,924 of 3,555 U.S. 911 centers responded (54%). 878 of them (46%) said they gave
     no instructions for medical emergencies. 975 (51%) gave pre-arrival instructions for cardiac arrest.
   - ⚠️ The survey was **conducted in 2010** and published in 2015. Many centers have improved
     since, which is why we say "historically."
   - ✏️ TODO (student): open the article and confirm the author list and numbers yourself.

2. **Only 1 of 13 call centers gave the best-practice compression rate (simulated calls).**
   - Source: Torres B. University of Washington **master's thesis**, 2018. ResearchWorks archive:
     https://digital.lib.washington.edu/researchworks/items/be682ca3-a6e5-42e9-af51-bd80b8d223fc
   - What it studied: 128 telecommunicators at 13 call centers, 256 **simulated** calls.
     Depth and hand-position instructions were close to best practice; compression **rate**
     was where centers fell short.
   - ⚠️ Describe it accurately: a small study of simulated calls (a thesis, not a large
     peer-reviewed survey of real calls).
   - ✏️ TODO (student): open the thesis and confirm the title and the "1 of 13" wording.

3. **Things a dispatcher can't do for the rescuer:**
   - Keep a timestamped record the rescuer can hand to paramedics.
   - Keep helping if the call drops or there's no signal (Minute Zero works offline after Milestone 7).
   - Keep the beat: the app's metronome stays at 110/min even while the dispatcher is busy.

## How to say it to judges (draft)
> "911 dispatchers can coach CPR over the phone, and that saves lives, so Minute Zero tells you to
> follow them. But dispatcher instructions have historically been inconsistent: in a 2010 national
> survey, 46% of responding 911 centers gave no medical instructions. And no dispatcher gives you a
> timestamped record. Minute Zero logs every step with the time, especially when stroke symptoms
> started, and hands paramedics a clear summary. If the call drops, it guides you step by step."

## Still to check
- The 2025 AHA Guidelines also cover dispatcher-guided CPR. When the official Part 7 text is
  available, quote what they recommend about telecommunicator CPR here. // VERIFY
