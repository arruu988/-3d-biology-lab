# 3D Biology Lab — NEET 2027

Static site, no build step. Plain HTML/CSS/JS + Three.js via CDN.
Open `index.html` directly, or serve with any static host / Vercel.

## Files
- `index.html` — all sections: Hero DNA, Test 04, Animal Cell, Plant Cell, Heart, Body Systems, DNA/Genetics, Test 04 chapters, Quiz, Notes
- `style.css` — dark modern theme, mobile-friendly
- `app.js` — all Three.js scenes + quiz + checklist logic (verified with `node --check`)

## Sections
1. Hero — rotating, draggable 3D DNA double helix
2. Test 04 — 22 Nov 2026 — prominent banner, 6 chapters, revision checklist (saved in localStorage), countdown
3. Animal Cell — clickable 3D organelles + info panel + NEET facts
4. Plant Cell — clickable 3D organelles
5. Human Heart — beating 3D heart, clickable chambers, blood flow
6. Body Systems — Digestive, Respiratory, Circulatory, Nervous, Excretory cards
7. DNA/Genetics — base pairing interactive, replication 5 steps
8. Test 04 chapters — Breathing, Body Fluids, Excretory, Plant Kingdom, Cell Cycle, Biomolecules/Cell
9. Quiz — 10 general NEET MCQs + 30 Test 04 MCQs (5 per chapter: Breathing, Body Fluids, Excretory, Plant Kingdom, Cell Cycle, Biomolecules/Cell), instant answer + explanation, score at end
10. Revision notes — organelles, plant vs animal cell, human body facts tables

## Deploy (do this manually — not done here)
```bash
cd biology-3d
git init && git add . && git commit -m "3D Biology Lab"
# create repo on GitHub, then:
git remote add origin <your-repo-url>
git push -u origin main
# Vercel: Import Project → select this repo → Deploy (no build command)
```
