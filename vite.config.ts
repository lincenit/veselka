import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// GitHub Pages serves the site under /<repo>/. Vite prefixes the base in HTML and CSS itself;
// the '/img/...' strings in the components it does not see, so they get it here - the source
// stays exactly as in allrisk-sites, where the site lives at the root.
function publicBase(base: string): Plugin {
  return {
    name: 'public-base',
    transform(code, id) {
      if (base === '/' || !/\/src\/.*\.tsx?$/.test(id)) return
      return code.replace(/(["'])\/(img|fonts)\//g, `$1${base}$2/`)
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = env.BASE || '/'
  return {
    base,
    plugins: [react(), tailwindcss(), publicBase(base)],
    // lamely.html: the facade-motif proposals, v2.html and v3.html: other takes on the page, all own pages until approved;
    // budova.html: the offer of spaces (building, floor plans, units)
    build: { rollupOptions: { input: ['index.html', 'lamely.html', 'v2.html', 'v3.html', 'budova.html'] } },
    server: { port: Number(env.PORT) || 3040, strictPort: true },
  }
})
