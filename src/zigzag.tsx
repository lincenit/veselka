import { useEffect, useRef, useState } from 'react'
import { Chevrons } from './chevrons'

// Version 3's motif: the break. The key visual of the brand materials (chevrons.tsx, 'edge') is
// a photo turning into the blue field along one bent edge, a gold line running beside it - the
// bend of a single fin, blown up. Here it is the page's structure: the hero's panel, the blue
// fields' bands, the way one photo gives way to the next, the badges and the cut photos.

// every gold line on the page, the hero's edge included, is this many pixels wide
export const LINE = 4

const GOLD = ['#c9962f', '#f2c45f', '#b8862a', '#f0c763', '#c4912d']

function GoldGradient({ id, vertical = true }: { id: string; vertical?: boolean }) {
  return (
    <linearGradient id={id} x1="0" y1="0" x2={vertical ? 0 : 1} y2={vertical ? 1 : 0}>
      {GOLD.map((c, i) => (
        <stop key={i} offset={i / (GOLD.length - 1)} stopColor={c} />
      ))}
    </linearGradient>
  )
}

/** Version 1's intro ground: plain blue with the brief's ribbons over it. motion.ts pulls the
 *  intro in from the right over the hero, the edge below joined to its left side. */
export function IntroPanel() {
  return (
    // a few pixels out to the left, under the edge, so no hairline shows where they join
    <div aria-hidden className="bg-primary absolute inset-y-0 -left-1 right-0">
      <Zigzag bold />
    </div>
  )
}

/** The edge on the left of version 1's intro as it comes in over the hero, in the brief's key visual
 *  (chevrons.tsx, 'edge'): the photo turning into the blue field along "<" bands, a gold line
 *  crossing them as a ">". A screen high, out of sight on the left until motion.ts brings it
 *  in from the right; its right end is the intro's plain blue, so the two join without a
 *  seam. A phone gets two bends, so the edge is narrower. The entrance runs on the inner box:
 *  GSAP owns the outer one's position. */
export function IntroEdge() {
  // the edge is drawn in its own units (600 per bend); its line takes the page's width in
  // pixels at the edge's height, max(100svh, 640px)
  const [h, setH] = useState(() => Math.max(window.innerHeight, 640))
  useEffect(() => {
    const on = () => setH(Math.max(window.innerHeight, 640))
    window.addEventListener('resize', on)
    return () => window.removeEventListener('resize', on)
  }, [])
  return (
    <div
      data-intro-edge
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 z-[31] h-[max(100svh,640px)] -translate-x-full"
    >
      <div className="zz-sweep-in h-full">
        <Chevrons
          variant="edge"
          className="h-full lg:hidden"
          periods={2}
          stroke={(LINE * 1200) / h}
        />
        <Chevrons variant="edge" className="hidden h-full lg:block" stroke={(LINE * 600) / h} />
      </div>
    </div>
  )
}

/** A blue field's ground: wide translucent bands breaking down the right side in "<"s and the
 *  gold line among them, which draws itself as the field scrolls through and leans after the
 *  pointer: the brief's ribbons on a blue field - a light blue and a white one side by side, a
 *  wide faint one beyond, and the gold line crossing them in the opposite phase (">" over
 *  "<"). `bold` is the intro's, whose line motion.ts draws as the intro comes in. `left`
 *  mirrors it all to the left side. */
export function Zigzag({ bold = false, left = false }: { bold?: boolean; left?: boolean }) {
  const box = useRef<HTMLDivElement>(null)
  const line = useRef<SVGPolylineElement>(null)
  const bands = useRef<SVGGElement>(null)
  const [size, setSize] = useState({ w: 1000, h: 640 })

  useEffect(() => {
    const el = box.current
    if (!el) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const ro = new ResizeObserver(() =>
      setSize({ w: el.clientWidth || 1000, h: el.clientHeight || 640 }),
    )
    ro.observe(el)
    let raf = 0
    let lean = 0
    let target = 0
    const frame = () => {
      raf = 0
      const rc = el.getBoundingClientRect()
      const vh = window.innerHeight
      // the line is drawn from the field's entry until its foot leaves the screen's middle
      const p = Math.min(1, Math.max(0, (vh - rc.top) / (rc.height + vh * 0.5)))
      // the intro's line is drawn by motion.ts, with the intro coming in
      if (line.current && !bold) line.current.style.strokeDashoffset = String(still ? 0 : 1 - p)
      lean += (target - lean) * 0.08
      if (bands.current) bands.current.style.transform = `translateX(${lean}px)`
      if (Math.abs(target - lean) > 0.1) raf = requestAnimationFrame(frame)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame)
    }
    const move = (e: PointerEvent) => {
      if (still) return
      target = (e.clientX / window.innerWidth - 0.5) * -36
      kick()
    }
    kick()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('pointermove', move)
    return () => {
      ro.disconnect()
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', kick)
      window.removeEventListener('pointermove', move)
    }
  }, [bold])

  // in pixels, so the line keeps its width and draws evenly. Every field gets the same bend
  // and the same ribbons: the bend's depth follows the screen's width, not the box's, and one
  // "<" is always six bends tall - a low band (the partners) is cut from the middle of the
  // pattern rather than squeezed into its height. Positions and widths are fractions of the
  // box's width; a band is never thinner than about its own bend.
  const { w, h } = size
  const vw = typeof window === 'undefined' ? w : window.innerWidth
  const amp = Math.min(130, Math.max(56, vw * 0.09))
  const period = amp * 6
  const n = Math.ceil(h / period) + 1
  const top = (h - n * period) / 2
  // below a desktop the copy runs the whole width: the ribbons move out past the edge, only
  // the gold line's tips showing in the margin beside the copy
  const dx = vw < 1024 ? Math.max(0, (w - 14) / w - 0.71) : 0
  // `flip` puts the vertex the other way: the gold crosses the bands
  const zig = (x: number, flip = false) =>
    Array.from({ length: 2 * n + 1 }, (_, i) => [
      (x + dx) * w + ((i % 2 === 1) !== flip ? 0 : amp),
      top + (i * period) / 2,
    ])
  const strip = (x: number, bw: number) => {
    const a = zig(x)
    const b = zig(x + Math.max(bw, (amp * 0.8) / w)).reverse()
    return [...a, ...b].map(([px, py]) => `${px},${py}`).join(' ')
  }
  const gold = zig(0.71, true)
    .map(([px, py]) => `${px},${py}`)
    .join(' ')

  return (
    <div
      ref={box}
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${left ? '-scale-x-100' : ''}`}
    >
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="size-full">
        <defs>
          <GoldGradient id="zz-ground-gold" />
        </defs>
        <g ref={bands}>
          <polygon points={strip(0.64, 0.07)} className="fill-sky" fillOpacity="0.3" />
          <polygon points={strip(0.72, 0.07)} fill="#fff" fillOpacity="0.16" />
          <polygon points={strip(0.81, 0.3)} fill="#fff" fillOpacity="0.07" />
        </g>
        <polyline
          ref={line}
          data-zz-line
          points={gold}
          pathLength={1}
          fill="none"
          stroke="url(#zz-ground-gold)"
          strokeWidth={LINE}
          strokeDasharray="1 1"
          strokeDashoffset={bold ? 0 : 1}
        />
      </svg>
    </div>
  )
}
