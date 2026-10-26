# Allrisk VESELKA

Pracovná kópia landing page Allrisk VESELKA na náhľad cez GitHub Pages. Výsledný kód sa
prenáša späť do `allrisk-sites` (`sites/allrisk-veselka`), kde stránka žije natrvalo.

- `bun install`, `bun run dev` (http://localhost:3040)
- `/` hlavná verzia, `/v2.html`, `/v3.html`, `/lamely.html`
- prepínač **Varianty** vľavo dole: celkový štýl (predvolený zlom, `src/zigzag.tsx`; `?styl=lamely` = pôvodná verzia, pozri `docs/verze-lamely.md`)
  a varianty sekcií (`src/variants.tsx`); voľba je v URL (`?hero=wipe`),
  takže odkaz nesie presnú kombináciu. Nová sekcia s variantmi = `variant('kľúč', 'Názov', [...])`;
  `hidden: true` nechá variant v kóde len cez URL (zlatá opona: `?hero=curtain`)
- push do `main` nasadí stránku (`.github/workflows/pages.yml`)
