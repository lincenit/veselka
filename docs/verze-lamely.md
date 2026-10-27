# Pôvodná verzia „lamely“ a ako ju obnoviť

Do 26. 10. 2026 bola hlavnou verziou stránky verzia postavená na **lamelách fasády**. Hlavnou verziou
sa potom stal **zlom** (lomená hrana „<“ so zlatou linkou z firemných materiálov) a 27. 10. 2026
bola verzia lamely zo stránky odstránená spolu s prepínačom **Varianty**.

## Kde ju nájsť

- naposledy celá v commite `c7ff004` (`/?styl=lamely`): `git switch --detach c7ff004`, `bun run dev`
- živá fasáda (`Facade` v `src/lamellas.tsx`) ostáva v kóde a je vidno na `/navrhy.html`

## Z čoho sa skladala

| Miesto | Verzia lamely | Kde v kóde (c7ff004) |
| --- | --- | --- |
| Modré plochy (hero + O projektu, Partneri, pätička) | živá fasáda: voľné zlaté/modré lamely na canvase, pri scrolle sa zoradia do „<“ a uhýbajú kurzoru | `Facade` v `src/lamellas.tsx`, cez `Ground` v `src/app.tsx` |
| Hero → O projektu | fotka sa pri scrolle stiahne do zaobleného rámu nad modrou fasádou | `motion.ts`, vetva `heroMode === 'frame'` |
| Prepínač štýlu | `variant('styl', …)` | `src/variants.tsx` |

## Ďalšie nápady

Všetky ostatné nápady (kosoštvorce, zlatá opona, zlato len na grafike, dve modré plochy,
skladané karty s fotkou…) sú simulované len na stránke `/navrhy.html` (`src/navrhy.tsx`).
