import { mergeConfig, type Plugin } from 'vite'
import site from './vite.config'

const base = process.env.BASE ?? '/'
function publicBase(): Plugin {
  return {
    name: 'public-base',
    transform(code, id) {
      if (base === '/' || !/\/src\/.*\.tsx?$/.test(id)) return
      return code.replace(/(["'])\/(img|fonts)\//g, `$1${base}$2/`)
    },
  }
}
export default mergeConfig(site({ mode: 'production', command: 'build' }), {
  base,
  plugins: [publicBase()],
})
