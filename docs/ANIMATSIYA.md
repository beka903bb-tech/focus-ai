# Landing animatsiyasi (scroll bilan boshqariladigan)

Sahifa: `public/landing/index.html` → saytda `/landing/`.

## Hozirgi holat — kod bilan (videosiz)
Pastga aylantirganda: Luna kitobi ochiladi → ichidan telefon ko'tariladi → ekran 5 qatlamga
ajraladi (taymer, seriya, AI murabbiy, Luna kitoblari) → har biri navbat bilan yonadi →
qaytib yig'iladi → «Fokus. O'qish. O'sish.» 3 tilda (uz/ru/en).

## Video versiyasi (referensdagi burger kabi)
1. Google Flow (Veo) da 8–10 soniyalik video yarating — pastdagi promt bilan.
2. Videoni Claude'ga bering — u 240 kadrga bo'lib `public/landing/frames/` ga qo'yadi va
   `frames/manifest.json` yaratadi. Sahifa o'zi video rejimiga o'tadi (kod rejimi o'chadi).

### Promt (inglizcha, Flow uchun)
```
Static camera, centered product shot, soft warm cream studio background (#FBF5EC) with a gentle
orange glow behind the subject, shallow depth of field, premium commercial look, 24 fps.
A closed hardcover children's picture book with a cute watercolor red fox wearing a turquoise
scarf on the cover lies flat on a clean surface. The cover slowly opens. From inside the book a
modern smartphone rises straight up and floats above the open pages. The phone then smoothly
separates into thin floating transparent layers stacked in depth (exploded view): the screen
glass, a glowing orange circular timer ring, a small grid calendar of orange squares, a chat
bubble, and a tiny book card — all evenly spaced, aligned, gently rotating a few degrees.
Hold the exploded view for a moment, then the layers glide back together into the phone.
No text, no logos, no hands, no camera movement, no cuts, clean background.
```
