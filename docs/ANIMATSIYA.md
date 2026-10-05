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

## 1-video (5-okt) — joylandi
`Smartphone_rising_from_open_book` (10 s) → birinchi 7 soniya, 168 kadr (`public/landing/frames/`).
Oxirgi 3 s olinmadi: telefon orqasi bilan o'girilib qoladi. Focus AI urg'usi sahifaning o'zida beriladi:
hero'da katta «Focus AI» logotipi, telefon old tomoni ko'ringanda «Focus AI» belgisi, qatlamlar
ajralganda 4 ta imkoniyat izohi, oxirida «Fokus. O'qish. O'sish.».

### 2-variant promt (Focus AI ko'proq urg'u bilan)
```
Static camera, centered, soft warm cream studio background (#FBF5EC) with a soft orange glow, premium tech product commercial, 24 fps.
A modern smartphone floats in the center, screen facing the camera, showing a minimal cream app screen with a large glowing orange circular focus-timer ring counting down. A small closed watercolor children's book with a red fox wearing a turquoise scarf lies under the phone, much smaller, as a secondary detail.
The phone slowly rises and separates into thin floating translucent layers stacked in depth (exploded view), screen layers facing the camera: the glass, the glowing orange timer ring, a grid calendar of orange squares, a chat bubble with a small fox avatar, a tiny illustrated book card. Layers evenly spaced and aligned, gentle parallax.
Then the layers glide back together and the phone ends facing the camera with the orange timer ring glowing brightly.
The phone screen always faces the camera, never show the back of the phone. No text, no logos, no hands, no camera movement, no cuts.
```
