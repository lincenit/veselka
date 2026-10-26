// The offer of spaces: floors, units and the overlays that tie them to the renders.
// Everything below is MOCK data. The shape of `Unit` is what the page needs from Realman;
// once the feed is known, `loadUnits()` is the one place that changes - it maps the
// Realman records onto `Unit` and the views stay as they are.

import { floorPlan, type Pt } from './plan'

export type UnitType = 'komerce' | 'sluzby' | 'kancelar'
export type Status = 'volne' | 'rezervace' | 'obsazeno'
export type Offer = 'pronajem' | 'prodej' | 'oboji'

export type Unit = {
  /** the label on the plan and in the URL, "2.05" */
  id: string
  /** the record's id in Realman, for the inquiry; empty in the mock */
  realmanId: string
  floor: number
  type: UnitType
  status: Status
  offer: Offer
  /** m², interior */
  area: number
  /** m², 0 when the unit has none */
  terrace: number
  /** Kč / m² / month without VAT; null = on request */
  rent: number | null
  /** Kč without VAT; null = on request */
  price: number | null
  handover: 'Shell & Core' | 'Shell & Core / Fit Out'
  available: string
  /** the unit's own plan as an image (from Realman); null shows the schematic */
  plan: string | null
}

export const typeLabel: Record<UnitType, string> = {
  komerce: 'Komerční jednotka',
  sluzby: 'Prostor pro služby',
  kancelar: 'Kancelář',
}
export const typePlural: Record<UnitType, string> = {
  komerce: 'Komerce',
  sluzby: 'Služby',
  kancelar: 'Kanceláře',
}
export const statusLabel: Record<Status, string> = {
  volne: 'Volné',
  rezervace: 'Rezervované',
  obsazeno: 'Obsazené',
}
export const offerLabel: Record<Offer, string> = {
  pronajem: 'Pronájem',
  prodej: 'Prodej',
  oboji: 'Pronájem i prodej',
}

export type Floor = {
  n: number
  label: string
  name: string
  text: string
}

export const floors: Floor[] = [
  {
    n: 3,
    label: '3. NP',
    name: 'Ustoupené podlaží s terasou',
    text: 'Kanceláře s výhledem a vlastní terasou po obvodu.',
  },
  {
    n: 2,
    label: '2. NP',
    name: 'Služby a kanceláře',
    text: 'Ordinace, studia a kanceláře za zlatou fasádou.',
  },
  {
    n: 1,
    label: '1. NP',
    name: 'Parter',
    text: 'Prosklené komerční jednotky s parkováním před vstupem.',
  },
]

export const floorBy = (n: number) => floors.find((f) => f.n === n)!

/** A render with the floors traced over it, in the image's own pixels. */
export type View = {
  id: string
  label: string
  image: string
  width: number
  height: number
  /** the part of the render shown, [x, y, w, h], so the building fills the frame */
  crop: [number, number, number, number]
  floors: Record<number, Pt[]>
}

// Traced by eye over the current renders - redraw once the final visuals arrive.
export const views: View[] = [
  {
    id: 'dalnice',
    label: 'Od dálnice',
    image: '/img/ext-4.webp',
    width: 1667,
    height: 938,
    crop: [250, 110, 1180, 664],
    // traced on 4x crops of the render: roof with the setback floor, the gold band with the
    // terrace in front of it, the glazed ground floor down to the pavement
    floors: {
      3: [
        [572, 276], [670, 256], [1000, 238], [1197, 262], [1195, 297], [1100, 305], [900, 335],
        [800, 350], [720, 362], [662, 369], [577, 302],
      ],
      2: [
        [432, 392], [470, 364], [500, 342], [540, 322], [572, 290], [577, 302], [662, 369],
        [720, 362], [800, 350], [900, 335], [1100, 305], [1195, 297], [1240, 300], [1238, 348],
        [1220, 350], [1100, 370], [900, 401], [800, 416], [700, 431], [560, 451], [500, 459],
        [440, 464], [434, 430],
      ],
      1: [
        [440, 464], [500, 459], [560, 451], [700, 431], [800, 416], [900, 401], [1100, 370],
        [1220, 350], [1216, 381], [1100, 390], [900, 435], [700, 480], [590, 505], [535, 512],
        [470, 506], [448, 492],
      ],
    },
  },
  {
    id: 'troubsko',
    label: 'Od Troubska',
    image: '/img/ext-5.webp',
    width: 1667,
    height: 938,
    crop: [200, 90, 1340, 754],
    floors: {
      3: [
        [378, 212], [470, 212], [470, 225], [760, 232], [1150, 278], [1146, 340], [1000, 360],
        [760, 375], [660, 370], [385, 330],
      ],
      2: [
        [288, 292], [385, 330], [660, 370], [760, 375], [1000, 360], [1146, 340], [1440, 340],
        [1446, 360], [1420, 420], [1300, 440], [1000, 460], [760, 470], [650, 470], [590, 440],
        [470, 400], [300, 352],
      ],
      1: [
        [650, 470], [760, 470], [1000, 460], [1300, 440], [1420, 420], [1410, 470], [1300, 500],
        [1000, 525], [800, 540], [700, 530], [650, 500],
      ],
    },
  },
]

// ── Mock ───────────────────────────────────────────────────────────────────────

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

const round = (v: number, step: number) => Math.round(v / step) * step

function mockUnits(): Unit[] {
  const r = rng(7)
  const out: Unit[] = []
  for (const f of floors) {
    const plan = floorPlan(f.n)
    plan.units.forEach((p, i) => {
      const type: UnitType =
        f.n === 1 ? 'komerce' : f.n === 3 ? 'kancelar' : i % 3 === 0 ? 'kancelar' : 'sluzby'
      const roll = r()
      const status: Status = roll < 0.55 ? 'volne' : roll < 0.75 ? 'rezervace' : 'obsazeno'
      const offer: Offer = r() < 0.6 ? 'oboji' : 'pronajem'
      const rentBase = f.n === 1 ? 340 : f.n === 2 ? 270 : 295
      const saleBase = f.n === 1 ? 66000 : f.n === 2 ? 54000 : 58000
      const onRequest = r() < 0.12
      out.push({
        id: p.id,
        realmanId: '',
        floor: f.n,
        type,
        status,
        offer,
        area: p.area,
        terrace: p.terrace,
        rent: onRequest ? null : round(rentBase * (0.92 + r() * 0.16), 5),
        price:
          offer === 'pronajem' || onRequest ? null : round(p.area * saleBase * (0.94 + r() * 0.12), 10000),
        handover: r() < 0.5 ? 'Shell & Core' : 'Shell & Core / Fit Out',
        available: ['Q2 2027', 'Q3 2027', 'Q4 2027'][Math.floor(r() * 3)],
        plan: null,
      })
    })
  }
  return out
}

/** The units for sale or rent. Today the mock, later the Realman feed mapped onto `Unit`. */
export async function loadUnits(): Promise<Unit[]> {
  await new Promise((ok) => setTimeout(ok, 250))
  return mockUnits()
}

// ── Formatting ─────────────────────────────────────────────────────────────────

const nf = new Intl.NumberFormat('cs-CZ')
export const m2 = (v: number) => `${nf.format(v)} m²`
export const czk = (v: number) => `${nf.format(v)} Kč`
export const rentText = (u: Unit) => (u.rent ? `${nf.format(u.rent)} Kč/m²/měs.` : 'Na dotaz')
export const priceText = (u: Unit) =>
  u.offer === 'pronajem' ? '—' : u.price ? czk(u.price) : 'Na dotaz'
