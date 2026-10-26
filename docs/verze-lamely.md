# Pôvodná verzia „lamely“ a ako ju obnoviť

Do 26. 10. 2026 bola hlavnou verziou stránky verzia postavená na **lamelách fasády**. Hlavnou verziou
sa potom stal **zlom** (lomená hrana „<“ so zlatou linkou z firemných materiálov). Pôvodná verzia
ostala v kóde celá a dá sa kedykoľvek zobraziť alebo vrátiť.

## Ako ju zobraziť

- v prepínači **Varianty** (vľavo dole): *Celkový styl → Verze 2 · lamely*
- alebo priamo cez URL: `/?styl=lamely`

## Z čoho sa skladá

| Miesto | Verzia lamely | Kde v kóde |
| --- | --- | --- |
| Modré plochy (hero + O projektu, Partneri, pätička) | živá fasáda: voľné zlaté/modré lamely na canvase, pri scrolle sa zoradia do „<“ a uhýbajú kurzoru | `Facade` v `src/lamellas.tsx`, cez `Ground` v `src/app.tsx` |
| Hero → O projektu | fotka sa pri scrolle stiahne do zaobleného rámu nad modrou fasádou | `motion.ts`, vetva `heroMode === 'frame'` |
| Pět/Šest důvodů, prechod fotiek | zlaté lamely sa zatvoria cez fotku a rozostúpia sa na ďalšej | `Fins` v `src/app.tsx`, `motion.ts` blok 2b (vetva `else`) |
| Malý nadpis (eyebrow) | bez značky | – |
| Hero, prechod fotiek | pôvodne *Prolínání* (fotky sa prelínali a pomaly približovali); dnes majú obe verzie *Zlom*, prolínání sa dá vrátiť ako ďalší stav v `slideLook` (`opacity` namiesto `clip-path`) | `slideLook` v `src/app.tsx` |

Spoločné pre obe verzie: karty benefitov s čiarou priebehu, sticky pozadie sekcií, galéria a
lightbox, texty.

## Ako ju vrátiť ako hlavnú

V `src/app.tsx` je prvá voľba v zozname predvolená:

vo `variant('styl', …)` presuň `{ value: 'lamely', … }` na prvé miesto (popis si uprav na
„Verze 1 · lamely“).

Nič iné netreba meniť, každý prvok si podľa `look` vyberá sám.

## Ďalšie odložené návrhy

- **Kosočtverce** (`/?styl=kosoctverce`): mriežka kosoštvorcov, ktoré sa rozsvietia okolo kurzora
  (`src/lattice.tsx`), kosoštvorcové odznaky ikon a fotka v Pět důvodů otvorená z kosoštvorca.
  Štýly sú v `src/motif.css`. V prepínači nie je.
- **Zlatá opona** (`/?hero=curtain`): pôvodný prechod z hera, zlaté lamely sa zatvoria a otvoria
  na sekcii O projektu.
- **Celé staršie stránky**: `/v2.html`, `/v3.html` a návrhy lamiel `/lamely.html`.
