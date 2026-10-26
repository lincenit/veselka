import { useEffect, useRef } from 'react'

// The facade of the building: hundreds of flat gold fins, each bent once at a slightly
// different height and angle. Everything here draws that, from loose (as built) to aligned
// (the brand's "<" chevron), so the motif reads as coming out of the architecture.

const rand = (seed: number) => () => {
  seed |= 0
  seed = (seed + 0x6d2b79f5) | 0
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const mix = (a: number, b: number, t: number) => a + (b - a) * t

// dark gold → light gold, the two ends of the fins' lit and shaded faces
const TONES = {
  gold: [
    [110, 84, 24],
    [246, 212, 122],
  ],
  // on a blue ground: deep AllBlue to blue-200
  blue: [
    [0, 57, 163],
    [180, 212, 251],
  ],
} as const
type Tone = keyof typeof TONES
const shade = (tone: Tone, t: number, alpha = 1) => {
  const [dark, light] = TONES[tone]
  return `rgba(${dark.map((d, i) => Math.round(mix(d, light[i], clamp(t)))).join(',')},${alpha})`
}
const gold = (t: number, alpha = 1) => shade('gold', t, alpha)

type Fin = {
  x: number
  w: number
  tone: number
  // loose state (fractions of the canvas)
  top: number
  bottom: number
  ky: number
  kx: number
  tilt: number
  // drawn state, eased toward the target every frame
  cur: { top: number; bottom: number; ky: number; kx: number; tilt: number; push: number }
}

type FacadeProps = {
  className?: string
  /** fin spacing in px */
  gap?: number
  /** how far the bend swings, as a fraction of the height */
  amp?: number
  /** fixed state 0 (loose) .. 1 (aligned); omitted = driven by scroll */
  order?: number
  /** fins lean away from the pointer */
  wind?: boolean
  opacity?: number
  tone?: Tone
}

/** The living facade: loose fins that align into the chevron as the block scrolls to the middle. */
export function Facade({
  className = '',
  gap = 22,
  amp = 0.14,
  order,
  wind = true,
  opacity = 1,
  tone = 'gold',
}: FacadeProps) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let fins: Fin[] = []
    let W = 0
    let H = 0
    let raf = 0
    let visible = false
    const mouse = { x: -1e4, y: -1e4 }

    const build = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const r = rand(7)
      fins = []
      const phase = r() * 6
      for (let x = -40; x < W + 40; x += gap * mix(0.6, 1.4, r())) {
        // on the building the bends run in patches: a stretch leaning one way, then the other
        const patch = Math.sin(x / 140 + phase) + 0.5 * Math.sin(x / 53 + phase * 2)
        const f = {
          x,
          w: mix(7, 16, r()),
          tone: r(),
          // the fins run past both edges, the block crops them like a window on the facade
          top: mix(-0.3, -0.12, r()),
          bottom: mix(1.12, 1.3, r()),
          ky: mix(0.4, 0.6, r()) + patch * 0.05,
          kx: patch * 0.45 + mix(-0.15, 0.15, r()),
          tilt: mix(-0.12, 0.12, r()),
        }
        fins.push({ ...f, cur: { ...f, push: 0 } })
      }
    }

    const progress = () => {
      if (order !== undefined) return order
      // a parent can drive it (the hero's timeline sets data-order while the curtain opens)
      const driven = canvas.parentElement?.dataset.order
      if (driven !== undefined) return Number(driven)
      if (still) return 1
      const rc = canvas.getBoundingClientRect()
      const off = rc.top + rc.height / 2 - window.innerHeight / 2
      return clamp(1 - Math.max(0, off) / (window.innerHeight * 0.55))
    }

    const draw = () => {
      raf = 0
      const p = progress()
      const e = p * p * (3 - 2 * p)
      const A = H * amp
      const rc = canvas.getBoundingClientRect()
      const mx = mouse.x - rc.left
      const my = mouse.y - rc.top
      ctx.clearRect(0, 0, W, H)
      let moving = false
      for (const f of fins) {
        const t = {
          top: mix(f.top, -0.2, e),
          bottom: mix(f.bottom, 1.2, e),
          ky: mix(f.ky, 0.5, e),
          kx: mix(f.kx, -1, e),
          tilt: mix(f.tilt, 0, e),
          push: 0,
        }
        // the fins near the pointer bend where it is, not at their own knee: on a tall block
        // (the hero and the intro under one facade) the knee is often off screen
        if (wind && my > 0 && my < H) {
          const dx = f.x - mx
          const fall = Math.exp(-(dx * dx) / (2 * 100 * 100))
          t.push = Math.sign(dx || 1) * 56 * fall
          t.ky = mix(t.ky, my / H, fall)
        }
        const c = f.cur
        for (const k of ['top', 'bottom', 'ky', 'kx', 'tilt', 'push'] as const) {
          const d = t[k] - c[k]
          if (Math.abs(d) > 0.0005) moving = true
          c[k] += d * (still ? 1 : 0.09)
        }
        const top = { x: f.x - c.tilt * A, y: c.top * H }
        const knee = { x: f.x + c.kx * A + c.push, y: c.ky * H }
        const foot = { x: f.x + c.tilt * A, y: c.bottom * H }
        for (const [a, b] of [
          [top, knee],
          [knee, foot],
        ]) {
          // the face turned to the light is the bright one: shade by the segment's lean
          const lean = (b.x - a.x) / Math.max(1, b.y - a.y)
          ctx.fillStyle = shade(tone, 0.35 + f.tone * 0.35 + lean * 0.9, opacity)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(a.x + f.w, a.y)
          ctx.lineTo(b.x + f.w, b.y)
          ctx.lineTo(b.x, b.y)
          ctx.closePath()
          ctx.fill()
        }
      }
      if (visible && (moving || order === undefined)) raf = requestAnimationFrame(draw)
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
    if (wind) window.addEventListener('pointermove', move)
    return () => {
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', move)
      cancelAnimationFrame(raf)
    }
  }, [gap, amp, order, wind, opacity, tone])

  return <canvas ref={ref} aria-hidden className={`block size-full ${className}`} />
}

/** Gold fins laid over a photo; motion.ts turns them away on scroll (`data-slat`). */
export function SlatCover({
  n = 16,
  seed = 1,
  tone = 'gold',
}: {
  n?: number
  seed?: number
  tone?: Tone
}) {
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 flex">
      {slats(n, seed, tone).map((s) => (
        <span
          key={s.i}
          data-slat-strip
          className="-mx-px h-full flex-1"
          style={{
            background: `linear-gradient(180deg, ${s.color}, ${s.deep})`,
            transform: `skewX(${s.skew}deg) scaleY(1.2)`,
          }}
        />
      ))}
    </span>
  )
}

/** Strips for the slat reveal and the hero curtain: random but stable widths and leans. */
export function slats(n: number, seed = 3, tone: Tone = 'gold') {
  const r = rand(seed)
  return Array.from({ length: n }, (_, i) => ({
    i,
    skew: mix(-9, 9, r()),
    tone: r(),
    color: shade(tone, 0.3 + r() * 0.6),
    light: shade(tone, 1),
    deep: shade(tone, 0),
  }))
}

// The chevron of lines: the same zigzag as chevrons.tsx, drawn as bundles of thin fins.
const P = 600
const zig = (x: number, amp: number, n: number, flip: boolean) =>
  Array.from({ length: 2 * n + 1 }, (_, i) => [x + ((i % 2 === 1) !== flip ? amp : 0), (i * P) / 2])
    .map(([x, y]) => `${x},${y}`)
    .join(' ')

export function LinedChevrons({
  tone = 'on-blue',
  periods: n = 1,
  className = '',
}: {
  tone?: 'on-blue' | 'on-white'
  periods?: number
  className?: string
}) {
  const r = rand(11)
  const w = 340
  const band = (x0: number, count: number, color: string, flip: boolean) =>
    Array.from({ length: count }, (_, i) => (
      <polyline
        key={`${x0}-${i}`}
        points={zig(x0 + i * mix(5, 9, r()), mix(84, 104, r()), n, flip)}
        fill="none"
        stroke={color}
        strokeOpacity={mix(0.35, 1, r())}
        strokeWidth={mix(1.2, 3.4, r())}
        strokeLinejoin="miter"
        strokeMiterlimit={10}
      />
    ))
  const muted = tone === 'on-blue' ? '#ffffff' : '#7fa3e0'
  return (
    <svg
      viewBox={`0 0 ${w} ${n * P}`}
      preserveAspectRatio="xMinYMid slice"
      style={{ aspectRatio: `${w} / ${n * P}` }}
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <g opacity={tone === 'on-blue' ? 0.22 : 0.6}>{band(0, 9, muted, false)}</g>
      <g opacity={tone === 'on-blue' ? 0.12 : 0.35}>{band(150, 8, muted, false)}</g>
      <g>
        {Array.from({ length: 6 }, (_, i) => (
          <polyline
            key={i}
            points={zig(96 + i * 4 + mix(-2, 2, r()), mix(60, 78, r()), n, true)}
            fill="none"
            stroke={gold(0.35 + r() * 0.65)}
            strokeWidth={mix(1.5, 3, r())}
            strokeLinejoin="miter"
            strokeMiterlimit={10}
          />
        ))}
      </g>
    </svg>
  )
}
