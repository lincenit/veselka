# Allrisk VESELKA

Pracovná kópia landing page Allrisk VESELKA na náhľad cez GitHub Pages. Výsledný kód sa
prenáša späť do `allrisk-sites` (`sites/allrisk-veselka`), kde stránka žije natrvalo.

- `bun install`, `bun run dev` (http://localhost:3040)
- `/` stránka (štýl zlom, `src/zigzag.tsx`), `/navrhy.html` všetky ostatné grafické nápady, simulované len na tejto stránke
- pôvodná verzia „lamely“ je z webu odstránená, pozri `docs/verze-lamely.md`
- push do `main` nasadí stránku (`.github/workflows/pages.yml`)

## Verze barevnosti (2026-11-11)

`preview/` drží dve hotové buildy stránky z `allrisk-sites` (`sites/allrisk-veselka`, vetva
`packages-webs`), workflow ich kopíruje do `dist`: `/veselka/` rozcestník, `/veselka/a/` sekcie
striedajú zlatú a modrú (Koncept modrý), `/veselka/b/` všetko zlaté. Prebuildovanie z
`sites/allrisk-veselka`:

    BASE=/veselka/a/ VITE_VESELKA_PALETTE=mixed vite build --config vite.pages.config.ts --outDir <veselka>/preview/a
    BASE=/veselka/b/ vite build --config vite.pages.config.ts --outDir <veselka>/preview/b

(`vite.pages.config.ts` = `vite.config.ts` + `base` + prefix `/img/` ciest, kópia v `docs/vite.pages.config.ts`.)
