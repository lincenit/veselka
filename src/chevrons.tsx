import { useId } from 'react'

// The zigzag ribbons from the brand materials, in viewBox units: one period is P tall,
// a ribbon swings A sideways and is B wide, G apart. Ribbons and the gold line always run
// in opposite phase somewhere ("<" against ">") - that crossing is what makes the motif.
const P = 600
const A = 100
const B = 96
const G = 14

type Pt = readonly [number, number]

/** `flip` puts the vertex on the left at mid-height ("<"); unflipped it points right (">"). */
const zig = (x: number, n: number, flip = false, amp = A): Pt[] =>
  Array.from({ length: 2 * n + 1 }, (_, i) => [x + ((i % 2 === 1) !== flip ? amp : 0), (i * P) / 2])

const pts = (p: Pt[]) => p.map(([x, y]) => `${x},${y}`).join(' ')
const band = (x: number, n: number, flip = false, amp = A, w = B) =>
  pts([...zig(x, n, flip, amp), ...zig(x + w, n, flip, amp).reverse()])

const WIDTH = { edge: 460, free: 310, 'on-blue': 310 }

type Props = {
  /** edge = photo/white turning into the blue panel (the key visual), free = standalone, on-blue = on a blue field */
  variant: keyof typeof WIDTH
  periods?: number
  stroke?: number
  className?: string
}

export function Chevrons({ variant, periods: n = 1, stroke, className = '' }: Props) {
  const id = useId()
  const w = WIDTH[variant]
  const edge = variant === 'edge'
  // key visual: the gold runs ">" across the panel's "<" edge; elsewhere "<" across ">" ribbons
  const gold = edge ? zig(110, n, false, 95) : zig(100, n, true, 70)

  return (
    <svg
      viewBox={`0 0 ${w} ${n * P}`}
      preserveAspectRatio="xMinYMid slice"
      style={{ aspectRatio: `${w} / ${n * P}` }}
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c9962f" />
          <stop offset="0.3" stopColor="#f2c45f" />
          <stop offset="0.55" stopColor="#b8862a" />
          <stop offset="0.8" stopColor="#f0c763" />
          <stop offset="1" stopColor="#c4912d" />
        </linearGradient>
      </defs>
      {edge && (
        <>
          <polygon points={band(0, n, false, 90)} className="fill-sky" opacity="0.5" />
          <polygon
            points={pts([...zig(40, n, true, 90), [w, n * P], [w, 0]])}
            className="fill-primary"
          />
          <polygon data-band points={band(130, n, true, 90)} fill="#fff" opacity="0.14" />
          <polygon data-band points={band(236, n, true, 90)} fill="#fff" opacity="0.07" />
        </>
      )}
      {variant === 'free' && (
        <>
          <polygon data-band points={band(0, n)} className="fill-steel" />
          <polygon data-band points={band(B + G, n)} className="fill-sky" />
        </>
      )}
      {variant === 'on-blue' && (
        <>
          <polygon data-band points={band(0, n)} fill="#fff" opacity="0.07" />
          <polygon data-band points={band(B - 20, n)} fill="#fff" opacity="0.09" />
        </>
      )}
      <polyline
        data-chevron-line
        points={pts(gold)}
        // a length of 1, so a page can draw it in with stroke-dashoffset
        pathLength={1}
        fill="none"
        // on a blue field the line is light blue: blue grounds keep to blue
        stroke={variant === 'on-blue' ? 'var(--color-blue-300)' : `url(#${id})`}
        strokeWidth={stroke ?? (edge ? 6 : 3.5)}
        strokeLinejoin="miter"
        strokeMiterlimit={10}
      />
    </svg>
  )
}
