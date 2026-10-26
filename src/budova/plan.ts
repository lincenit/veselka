// Schematic floor plans, generated rather than drawn: the building's rounded footprint from
// above (straight front to the car park, curved back to the road), a ring of units along
// the facade, a row along the front and the core in the middle. Placeholder until the
// architects' plans arrive - then each unit becomes a polygon traced over the real plan,
// with the same `PlanUnit` shape, and nothing else changes.

export type Pt = [number, number]

export type PlanUnit = { id: string; points: Pt[]; center: Pt; area: number; terrace: number }
export type PlanCommon = { kind: 'core' | 'hall' | 'zazemi'; label: string; points: Pt[]; center: Pt }
export type FloorPlan = {
  outline: Pt[]
  inner: Pt[]
  terrace: Pt[] | null
  units: PlanUnit[]
  commons: PlanCommon[]
}

export const PLAN_W = 1000
export const PLAN_H = 640
/** the highest point of any footprint, less a margin: the plans are cropped to it */
export const PLAN_TOP = 105
const CX = 500
const BASE = 600
/** metres per plan unit: the footprint is about 70 m across */
const M = 0.08

type Ring = { rx: number; ry: number }
type Slot = number | PlanCommon['kind']

const layouts: Record<
  number,
  { outer: Ring; inner: Ring; ring: number[]; front: Slot[]; depth: number; terrace?: Ring }
> = {
  1: {
    outer: { rx: 440, ry: 480 },
    inner: { rx: 300, ry: 330 },
    ring: [1.3, 1, 1, 1.2, 1.2, 1, 1, 1.3],
    front: [1, 1, 'hall', 1, 1],
    depth: 120,
  },
  2: {
    outer: { rx: 440, ry: 480 },
    inner: { rx: 300, ry: 330 },
    ring: [1.2, 0.9, 0.9, 1, 0.8, 0.8, 0.8, 0.8, 1, 0.9, 0.9, 1.2],
    front: [1, 1, 'zazemi', 1, 1],
    depth: 120,
  },
  3: {
    terrace: { rx: 440, ry: 480 },
    outer: { rx: 370, ry: 400 },
    inner: { rx: 250, ry: 270 },
    ring: [1.2, 1, 1, 1, 1, 1, 1.2],
    front: [1, 1, 'zazemi', 1],
    depth: 100,
  },
}

const at = (r: Ring, t: number): Pt => [CX + r.rx * Math.cos(t), BASE - r.ry * Math.sin(t)]

function arc(r: Ring, t0: number, t1: number, steps = 16): Pt[] {
  return Array.from({ length: steps + 1 }, (_, i) => at(r, t0 + ((t1 - t0) * i) / steps))
}

/** where the ellipse crosses height `y`, on the left (-1) or right (+1) side */
const ellipseX = (r: Ring, y: number, side: -1 | 1) =>
  CX + side * r.rx * Math.sqrt(Math.max(0, 1 - ((BASE - y) / r.ry) ** 2))

function area(ps: Pt[]) {
  let a = 0
  ps.forEach(([x, y], i) => {
    const [x2, y2] = ps[(i + 1) % ps.length]
    a += x * y2 - x2 * y
  })
  return Math.abs(a / 2)
}

function centroid(ps: Pt[]): Pt {
  let a = 0
  let cx = 0
  let cy = 0
  ps.forEach(([x, y], i) => {
    const [x2, y2] = ps[(i + 1) % ps.length]
    const k = x * y2 - x2 * y
    a += k
    cx += (x + x2) * k
    cy += (y + y2) * k
  })
  return [cx / (3 * a), cy / (3 * a)]
}

const sqm = (ps: Pt[]) => Math.round(area(ps) * M * M * 10) / 10

const commonLabel: Record<PlanCommon['kind'], string> = {
  core: 'Schodiště, výtah',
  hall: 'Vstupní hala',
  zazemi: 'Zázemí',
}

const cache = new Map<number, FloorPlan>()

export function floorPlan(floor: number): FloorPlan {
  const hit = cache.get(floor)
  if (hit) return hit
  const L = layouts[floor]
  const units: PlanUnit[] = []
  const commons: PlanCommon[] = []
  const id = () => `${floor}.${String(units.length + 1).padStart(2, '0')}`

  // the ring along the facade, left to right
  const total = L.ring.reduce((a, b) => a + b, 0)
  let t = Math.PI
  for (const w of L.ring) {
    const t1 = t - (Math.PI * w) / total
    const points = [...arc(L.outer, t, t1), ...arc(L.inner, t1, t)]
    const terrace = L.terrace ? sqm([...arc(L.terrace, t, t1), ...arc(L.outer, t1, t)]) : 0
    units.push({ id: id(), points, center: centroid(points), area: sqm(points), terrace })
    t = t1
  }

  // the row along the front, its end walls following the corridor's curve
  const top = BASE - L.depth
  const left = ellipseX(L.inner, top, -1)
  const right = ellipseX(L.inner, top, 1)
  const slots = L.front.map((s) => (typeof s === 'number' ? s : 1))
  const sum = slots.reduce((a, b) => a + b, 0)
  let x = left
  L.front.forEach((s, i) => {
    const x1 = x + ((right - left) * slots[i]) / sum
    const ys = Array.from({ length: 7 }, (_, k) => BASE - (L.depth * k) / 6)
    const lEdge: Pt[] = i === 0 ? ys.map((y) => [ellipseX(L.inner, y, -1), y]) : [[x, BASE], [x, top]]
    const rEdge: Pt[] =
      i === L.front.length - 1
        ? ys.map((y) => [ellipseX(L.inner, y, 1), y] as Pt).reverse()
        : [[x1, top], [x1, BASE]]
    // up the left edge, down the right one
    const points: Pt[] = [...lEdge, ...rEdge]
    if (typeof s === 'number') {
      units.push({ id: id(), points, center: centroid(points), area: sqm(points), terrace: 0 })
    } else {
      commons.push({ kind: s, label: commonLabel[s], points, center: centroid(points) })
    }
    x = x1
  })

  // the core, in the middle of the corridor
  const core: Pt[] = [
    [CX - 60, top - 130],
    [CX + 60, top - 130],
    [CX + 60, top - 40],
    [CX - 60, top - 40],
  ]
  commons.push({ kind: 'core', label: commonLabel.core, points: core, center: centroid(core) })

  const plan: FloorPlan = {
    outline: arc(L.terrace ?? L.outer, Math.PI, 0, 48),
    inner: arc(L.inner, Math.PI, 0, 48),
    terrace: L.terrace ? arc(L.terrace, Math.PI, 0, 48) : null,
    units,
    commons,
  }
  cache.set(floor, plan)
  return plan
}

export const toPath = (ps: Pt[]) => `M${ps.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join('L')}Z`
