# The science behind Focus AI

Each core feature maps to a peer-reviewed finding. The studies explain **why** a design choice was made; they do not prove that Focus AI itself improves anyone's focus (we have not run a trial).

| # | Finding | Source | Feature it motivates |
|---|---------|--------|----------------------|
| 1 | People's minds wander during **46.9 %** of waking moments (experience sampling, ~2,250 adults), and mind-wandering predicted lower happiness. | Killingsworth, M. A. & Gilbert, D. T. (2010). A wandering mind is an unhappy mind. *Science*, 330(6006), 932. [doi:10.1126/science.1192439](https://doi.org/10.1126/science.1192439) | Habits are completed by **real, measured focus minutes** (`utils/timer.ts`), not a "done" checkbox. |
| 2 | The **mere presence** of one's own smartphone reduces available working-memory capacity and fluid intelligence — even when silenced and face down. Phone in another room performed best. | Ward, A. F., Duke, K., Gneezy, A. & Bos, M. W. (2017). Brain drain. *J. Assoc. Consumer Research*, 2(2), 140–154. [doi:10.1086/691462](https://doi.org/10.1086/691462) | **Phone-free focus** bonus (`hooks/useFaceDownDetector.ts`). Caveat: face-down on the desk is better than in hand, but the study shows another room is better still — the app says so. |
| 3 | Interrupted work is finished **faster but with more stress, frustration and time pressure**. | Mark, G., Gudith, D. & Klocke, U. (2008). The cost of interrupted work: more speed and stress. *Proc. CHI '08*, 107–110. [doi:10.1145/1357054.1357072](https://doi.org/10.1145/1357054.1357072) | One continuous **timer block** with ambient sound; the **distraction notepad** lets a thought be parked without leaving the session. |
| 4 | Making a **specific plan** for an unfinished goal eliminates its intrusive thoughts and frees attention for the current task. | Masicampo, E. J. & Baumeister, R. F. (2011). Consider it done! *JPSP*, 101(4), 667–683. [doi:10.1037/a0024192](https://doi.org/10.1037/a0024192) | **Thought notepad** during a session (park it → deal with it later) and the **"Did you reach your goal?"** outcome question after it. |

## Honest limits

- Correlational / lab findings; effect sizes in daily life may be smaller. Ward et al. (2017) has had partial replication failures in later work — we treat it as a reason to *encourage* phone distance, not as a guarantee.
- The face-down detector uses the accelerometer; it cannot know whether the phone is in another room.
- Outcome ("Yes / Partly / No") is self-reported.

## O'zbekcha qisqacha

Ilovadagi har bir asosiy funksiya ilmiy tadqiqotga tayanadi: fikr 46,9 % vaqt chalg'iydi → real daqiqalar o'lchanadi; telefon yonida turishi ham xotirani pasaytiradi → telefonsiz fokus bonusi; uzilishlar stress beradi → uzluksiz taymer; fikrni yozib qo'yish xayolni bo'shatadi → fikr daftari. Bu tadqiqotlar ilova natijasini kafolatlamaydi.
