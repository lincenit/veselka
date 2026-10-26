import { useEffect, useRef } from 'react'

// Version 2's motif: the lozenge. Where the facade's bent fins cross they leave tall diamond
// openings; drawn as a net they make the lattice below, and one of them on its own is the mark
// used across the page (the badges, the cut corner of the photos, the eyebrow, motif.css).
// A cell is W wide and H tall - the slant of the fins, about 23 degrees off the vertical.

export const W = 56
export const H = 130

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/** The lattice on a blue field: faint lines, the diamonds round the pointer lit in gold and a
 *  slow band of light passing over now and then. */
export function Lattice({ opacity = 1 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let w = 0
    let h = 0
    let raf = 0
    let visible = false
    const mouse = { x: -1e4, y: -1e4 }
    // lit amount per diamond, eased toward its target every frame
    const lit = new Map<string, number>()

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const diamond = (cx: number, cy: number) => {
      ctx.beginPath()
      ctx.moveTo(cx, cy - H / 2)
      ctx.lineTo(cx + W / 2, cy)
      ctx.lineTo(cx, cy + H / 2)
      ctx.lineTo(cx - W / 2, cy)
      ctx.closePath()
    }

    const draw = (t: number) => {
      raf = 0
      ctx.clearRect(0, 0, w, h)
      const rc = canvas.getBoundingClientRect()
      const mx = mouse.x - rc.left
      const my = mouse.y - rc.top

      // the net: two families of slanted lines
      ctx.strokeStyle = `rgba(255,255,255,${0.07 * opacity})`
      ctx.lineWidth = 1
      ctx.beginPath()
      const run = (h / H) * W
      for (let x = -run; x < w + run; x += W) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x + run, h)
        ctx.moveTo(x + run, 0)
        ctx.lineTo(x, h)
      }
      ctx.stroke()

      // the diamonds' centres sit between the crossings: (n * W/2, m * H/2) with n + m odd;
      // only the ones on screen are worth working on
      let moving = false
      const top = Math.max(0, -rc.top) - H
      const bottom = Math.min(h, window.innerHeight - rc.top) + H
      const sweep = still ? -1 : ((t / 1000) * 0.12) % 1.6
      for (let m = Math.floor(top / (H / 2)); m * (H / 2) < bottom; m++) {
        for (let n = -1; n * (W / 2) < w + W; n++) {
          if ((n + m) % 2 === 0) continue
          const cx = (n * W) / 2
          const cy = (m * H) / 2
          const dx = cx - mx
          const dy = (cy - my) * 0.6
          let target = Math.exp(-(dx * dx + dy * dy) / (2 * 110 * 110))
          // the band of light, running up the diagonal of the screen
          const along = (cx / Math.max(w, 1) + (cy + rc.top) / window.innerHeight) / 2
          const band = 1 - Math.abs(along - sweep + 0.3) * 7
          target = Math.max(target, clamp(band) * 0.35)
          const key = `${n},${m}`
          const cur = lit.get(key) ?? 0
          const next = still ? target : cur + (target - cur) * 0.1
          if (Math.abs(target - next) > 0.002) moving = true
          if (next < 0.01) {
            lit.delete(key)
            continue
          }
          lit.set(key, next)
          diamond(cx, cy)
          ctx.fillStyle = `rgba(227,197,124,${0.22 * next * opacity})`
          ctx.fill()
          ctx.strokeStyle = `rgba(246,212,122,${0.75 * next * opacity})`
          ctx.stroke()
        }
      }
      if (visible && (moving || !still)) raf = requestAnimationFrame(draw)
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(draw)
    }

    build()
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting
      kick()
    })
    io.observe(canvas)
    const ro = new ResizeObserver(() => {
      build()
      kick()
    })
    ro.observe(canvas)
    const move = (ev: PointerEvent) => {
      mouse.x = ev.clientX
      mouse.y = ev.clientY
      kick()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('scroll', kick, { passive: true })
    return () => {
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', move)
      window.removeEventListener('scroll', kick)
      cancelAnimationFrame(raf)
    }
  }, [opacity])

  return <canvas ref={ref} aria-hidden className="block size-full" />
}
