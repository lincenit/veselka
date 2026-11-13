# Allrisk VESELKA

Pracovná kópia landing page Allrisk VESELKA na náhľad cez GitHub Pages. Výsledný kód sa
prenáša späť do `allrisk-sites` (`sites/allrisk-veselka`), kde stránka žije natrvalo.

- `bun install`, `bun run dev` (http://localhost:3040)
- `/` hlavná stránka (build z `allrisk-sites`, pozri nižšie), `/navrhy.html` grafické nápady z pôvodnej pracovnej kópie (`src/`)
- pôvodná verzia „lamely“ je z webu odstránená, pozri `docs/verze-lamely.md`
- push do `main` nasadí stránku (`.github/workflows/pages.yml`)

## Hlavná verzia (2026-11-13: celá zlatá)

`preview/` drží hotový build stránky z `allrisk-sites` (`sites/allrisk-veselka`, vetva
`packages-webs`) a workflow ho kopíruje do koreňa `dist`, takže `/veselka/` je táto stránka.
Verzie farebnosti A/B (11-11) sú preč, ostáva celá zlatá; `/veselka/a/` a `/veselka/b/`
presmerujú na `/veselka/`. Prebuildovanie z `sites/allrisk-veselka`:

    BASE=/veselka/ vite build --config vite.pages.config.ts --outDir <veselka>/preview

Pred kopírovaním do `preview/` zachovaj `preview/a/` a `preview/b/` (presmerovania).

(`vite.pages.config.ts` = `vite.config.ts` + `base` + prefix `/img/` ciest, kópia v `docs/vite.pages.config.ts`.)
