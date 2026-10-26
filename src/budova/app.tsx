import { useEffect, useMemo, useRef, useState, type FormEvent, type PointerEvent, type ReactNode } from 'react'
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingSkyscraper,
  IconCheck,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconLayoutBoard,
  IconSelector,
  IconTable,
  IconX,
} from '@tabler/icons-react'
import logoSvg from '../logo.svg?raw'
import {
  floorBy,
  floors,
  loadUnits,
  m2,
  offerLabel,
  priceText,
  rentText,
  statusLabel,
  typeLabel,
  typePlural,
  views,
  type Status,
  type Unit,
  type UnitType,
} from './data'
import { floorPlan, PLAN_H, PLAN_TOP, PLAN_W, toPath, type Pt } from './plan'

const wrap = 'mx-auto max-w-7xl px-4 sm:px-6'
const home = import.meta.env.BASE_URL

// The official file (Graphics/Skupina AR LOGA), recoloured by `color` and cropped to its ink.
const logo = logoSvg
  .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '')
  .replace(' id="Vrstva_1"', '')
  .replace(/#104798/g, 'currentColor')
  .replace(/font-family:[^;]*;/, 'font-family: Magistral;')
  .replace(/viewBox="[^"]*"/, 'viewBox="125 108 912 172"')

// ── Route ──────────────────────────────────────────────────────────────────────
// Every state is a link: #/budova, #/podlazi/2, #/tabulka, each with an optional
// /jednotka/2.05 that opens the unit over it.

type ViewId = 'budova' | 'podlazi' | 'tabulka'
type Route = { view: ViewId; floor: number; unit: string | null }

function parse(hash: string): Route {
  const s = hash.replace(/^#\/?/, '').split('/')
  const view: ViewId = s[0] === 'podlazi' || s[0] === 'tabulka' ? s[0] : 'budova'
  const floor = view === 'podlazi' && floors.some((f) => f.n === Number(s[1])) ? Number(s[1]) : 1
  const j = s.indexOf('jednotka')
  return { view, floor, unit: j >= 0 ? decodeURIComponent(s[j + 1] ?? '') || null : null }
}

const href = (r: Route) =>
  `#/${r.view}${r.view === 'podlazi' ? `/${r.floor}` : ''}${r.unit ? `/jednotka/${r.unit}` : ''}`

function useRoute() {
  const [route, set] = useState(() => parse(location.hash))
  useEffect(() => {
    const on = () => set(parse(location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = (r: Partial<Route>) => {
    location.hash = href({ ...route, unit: null, ...r })
  }
  return [route, go] as const
}

type Go = ReturnType<typeof useRoute>[1]

// ── Shared bits ────────────────────────────────────────────────────────────────

const statusTone: Record<Status, { fill: string; dot: string; badge: string }> = {
  volne: {
    fill: 'var(--p-green)',
    dot: 'bg-[var(--p-green)]',
    badge: 'bg-[color-mix(in_srgb,var(--p-green)_14%,white)] text-[#04674a]',
  },
  rezervace: {
    fill: 'var(--p-amber)',
    dot: 'bg-[var(--p-amber)]',
    badge: 'bg-[color-mix(in_srgb,var(--p-amber)_18%,white)] text-[#8a5300]',
  },
  obsazeno: { fill: 'var(--p-grey-400)', dot: 'bg-grey-300', badge: 'bg-grey-100 text-grey-600' },
}

function Badge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[status].badge}`}
    >
      <span className={`size-1.5 rounded-full ${statusTone[status].dot}`} />
      {statusLabel[status]}
    </span>
  )
}

const free = (us: Unit[]) => us.filter((u) => u.status === 'volne')

function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="text-[13px] font-bold tracking-[0.16em] text-gold uppercase">{children}</p>
}

/** A box that follows the pointer inside its positioned parent, flipping at the right edge. */
function Tip({ at, box, children }: { at: { x: number; y: number }; box: DOMRect | undefined; children: ReactNode }) {
  const flip = box && at.x > box.width - 310
  return (
    <div
      className="pointer-events-none absolute z-20 w-72 rounded-xl bg-white p-4 text-sm shadow-[0_24px_48px_-16px_rgb(13_31_91/0.45)]"
      style={{
        left: at.x,
        top: at.y,
        transform: `translate(${flip ? 'calc(-100% - 16px)' : '16px'}, -50%)`,
      }}
    >
      {children}
    </div>
  )
}

function usePointer() {
  const ref = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState({ x: 0, y: 0 })
  const onMove = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setAt({ x: e.clientX - r.left, y: e.clientY - r.top })
  }
  return { ref, at, onMove, box: ref.current?.getBoundingClientRect() }
}

// ── Page ───────────────────────────────────────────────────────────────────────

export function App() {
  const [route, go] = useRoute()
  const [units, setUnits] = useState<Unit[] | null>(null)
  useEffect(() => {
    loadUnits().then(setUnits)
  }, [])

  const unit = units?.find((u) => u.id === route.unit) ?? null
  const tabs: { id: ViewId; label: string; icon: typeof IconTable }[] = [
    { id: 'budova', label: 'Budova', icon: IconBuildingSkyscraper },
    { id: 'podlazi', label: 'Půdorysy', icon: IconLayoutBoard },
    { id: 'tabulka', label: 'Tabulka', icon: IconTable },
  ]

  return (
    <>
      <header className="bg-blue-gradient text-white">
        <div className={`flex h-20 items-center justify-between gap-6 ${wrap}`}>
          <a
            href={home}
            aria-label="Allrisk VESELKA"
            className="block h-10 [&>svg]:h-full [&>svg]:w-auto"
            dangerouslySetInnerHTML={{ __html: logo }}
          />
          <a href={home} className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gold-light">
            <IconArrowLeft size={18} /> <span className="hidden sm:inline">Zpět na web</span>
          </a>
        </div>
      </header>

      <main className="min-h-screen bg-page pb-24">
        <section className={`${wrap} pt-12 pb-8 lg:pt-16`}>
          <Eyebrow>Nabídka prostor</Eyebrow>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h1 className="font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-heading lg:text-[44px]">
              Vyberte si <strong className="text-gold">svůj prostor</strong>
            </h1>
            {units && <Summary units={units} />}
          </div>
        </section>

        <div className={wrap}>
          <nav className="mb-6 inline-flex rounded-xl border border-hairline bg-white p-1" aria-label="Zobrazení">
            {tabs.map((t) => (
              <a
                key={t.id}
                href={href({ view: t.id, floor: route.floor, unit: null })}
                aria-current={route.view === t.id ? 'page' : undefined}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:px-4 ${
                  route.view === t.id ? 'bg-primary text-white' : 'text-heading hover:bg-tint'
                }`}
              >
                <t.icon size={18} stroke={1.75} />
                {t.label}
              </a>
            ))}
          </nav>

          {!units ? (
            <div className="grid h-[60vh] place-items-center rounded-2xl border border-hairline bg-white text-subtle">
              Načítáme nabídku…
            </div>
          ) : route.view === 'budova' ? (
            <BuildingView units={units} go={go} />
          ) : route.view === 'podlazi' ? (
            <FloorView units={units} floor={route.floor} selected={route.unit} go={go} />
          ) : (
            <TableView units={units} go={go} />
          )}

          <p className="mt-10 text-sm text-subtle">
            Ukázková data. Ceny, plochy a dispozice jsou ilustrativní, vizualizace nejsou závazné.
          </p>
        </div>
      </main>

      {unit && units && (
        <UnitDrawer
          unit={unit}
          units={units}
          onPick={(id) => go({ ...route, unit: id })}
          onClose={() => go({ ...route, unit: null })}
        />
      )}
    </>
  )
}

function Summary({ units }: { units: Unit[] }) {
  const f = free(units)
  const areas = f.map((u) => u.area)
  const items = [
    { value: `${f.length} / ${units.length}`, label: 'volných jednotek' },
    { value: areas.length ? `${Math.floor(Math.min(...areas))}–${Math.ceil(Math.max(...areas))} m²` : '—', label: 'plochy volných' },
    { value: 'Pronájem i prodej', label: 'Shell & Core · Fit Out' },
  ]
  return (
    <dl className="flex flex-wrap gap-x-8 gap-y-3">
      {items.map((i) => (
        <div key={i.label}>
          <dt className="sr-only">{i.label}</dt>
          <dd className="font-display text-xl font-medium text-heading">{i.value}</dd>
          <dd className="text-sm text-subtle">{i.label}</dd>
        </div>
      ))}
    </dl>
  )
}

// ── Building ───────────────────────────────────────────────────────────────────

function FloorCounts({ units }: { units: Unit[] }) {
  const types = [...new Set(units.map((u) => u.type))]
  return (
    <span className="text-sm text-subtle">
      {types.map((t) => {
        const of = units.filter((u) => u.type === t)
        return (
          <span key={t} className="mr-3 inline-block">
            {typePlural[t]} <b className="font-semibold text-heading">{free(of).length}</b> / {of.length}
          </span>
        )
      })}
    </span>
  )
}

function BuildingView({ units, go }: { units: Unit[]; go: Go }) {
  const [vi, setVi] = useState(0)
  const [hover, setHover] = useState<number | null>(null)
  const p = usePointer()
  const v = views[vi]
  const [cx, cy, cw, ch] = v.crop
  const pts = (ps: Pt[]) => ps.map(([x, y]) => `${x},${y}`).join(' ')
  // the floor tags stand in a column right of the building, each at its floor's height,
  // pushed apart where floors are too thin for a tag each
  const right = Math.max(...floors.flatMap((f) => v.floors[f.n].map((p) => p[0])))
  const gap = ch * 0.06
  const tags = floors.reduce<{ n: number; y: number }[]>((acc, f) => {
    const ps = v.floors[f.n]
    const edge = Math.max(...ps.map((p) => p[0]))
    const near = ps.filter((p) => p[0] > edge - 40)
    const y = near.reduce((a, p) => a + p[1], 0) / near.length
    const prev = acc[acc.length - 1]
    return [...acc, { n: f.n, y: prev ? Math.max(y, prev.y + gap) : y }]
  }, [])
  const tagAt = (y: number) => ({ left: `${((right - cx) / cw) * 100}%`, top: `${((y - cy) / ch) * 100}%` })

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div
        ref={p.ref}
        onPointerMove={p.onMove}
        className="relative overflow-hidden rounded-2xl bg-deep"
        style={{ aspectRatio: `${cw} / ${ch}` }}
      >
        <svg
          viewBox={v.crop.join(' ')}
          className="absolute inset-0 size-full"
          role="img"
          aria-label={`Budova Allrisk VESELKA, pohled ${v.label.toLowerCase()}`}
        >
          <image href={v.image} width={v.width} height={v.height} />
          <defs>
            <mask id="floor-hole">
              <rect x={cx} y={cy} width={cw} height={ch} fill="white" />
              {hover && <polygon points={pts(v.floors[hover])} fill="black" />}
            </mask>
          </defs>
          <rect
            x={cx}
            y={cy}
            width={cw}
            height={ch}
            fill="#0d1f5b"
            mask="url(#floor-hole)"
            className={`pointer-events-none transition-opacity duration-300 ${hover ? 'opacity-45' : 'opacity-0'}`}
          />
          {floors.map((f) => (
            <polygon
              key={f.n}
              points={pts(v.floors[f.n])}
              role="link"
              tabIndex={0}
              aria-label={`${f.label}, ${f.name}`}
              onPointerEnter={() => setHover(f.n)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(f.n)}
              onBlur={() => setHover(null)}
              onClick={() => go({ view: 'podlazi', floor: f.n })}
              onKeyDown={(e) => e.key === 'Enter' && go({ view: 'podlazi', floor: f.n })}
              className="cursor-pointer outline-none transition-[fill-opacity,stroke-opacity] duration-200"
              fill="var(--color-gold-light)"
              fillOpacity={hover === f.n ? 0.4 : 0}
              stroke="var(--color-gold-light)"
              strokeOpacity={hover === f.n ? 1 : 0.35}
              strokeWidth={hover === f.n ? 3 : 1.5}
              strokeLinejoin="round"
            />
          ))}
        </svg>

        {tags.map(({ n, y }) => (
          <span
            key={n}
            className={`pointer-events-none absolute hidden translate-x-3 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold whitespace-nowrap transition-colors sm:block ${
              hover === n ? 'bg-gold text-white' : 'bg-white/90 text-heading'
            }`}
            style={tagAt(y)}
          >
            {floorBy(n).label}
          </span>
        ))}

        <div className="absolute top-3 left-3 flex gap-1 rounded-lg bg-black/35 p-1 backdrop-blur-sm">
          {views.map((w, i) => (
            <button
              key={w.id}
              onClick={() => setVi(i)}
              aria-pressed={vi === i}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                vi === i ? 'bg-white text-heading' : 'text-white hover:bg-white/15'
              }`}
            >
              {w.label}
            </button>
          ))}
        </div>

        {hover && (
          <Tip at={p.at} box={p.box}>
            <FloorTip n={hover} units={units} />
          </Tip>
        )}
      </div>

      <ul className="grid content-start gap-3">
        {floors.map((f) => {
          const of = units.filter((u) => u.floor === f.n)
          return (
            <li key={f.n}>
              <a
                href={href({ view: 'podlazi', floor: f.n, unit: null })}
                onPointerEnter={() => setHover(f.n)}
                onPointerLeave={() => setHover(null)}
                className={`group flex items-center gap-4 rounded-2xl border bg-white p-4 transition-colors ${
                  hover === f.n ? 'border-gold' : 'border-hairline'
                }`}
              >
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-xl font-display text-lg font-bold transition-colors ${
                    hover === f.n ? 'bg-gold text-white' : 'bg-gold-wash text-gold-deep'
                  }`}
                >
                  {f.n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-heading">
                    {f.label} · {f.name}
                  </span>
                  <FloorCounts units={of} />
                </span>
                <IconChevronRight size={20} className="shrink-0 text-gold transition-transform group-hover:translate-x-0.5" />
              </a>
            </li>
          )
        })}
        <li className="px-1 pt-1 text-sm text-subtle">
          Najeďte na podlaží v obrázku nebo v seznamu, kliknutím otevřete jeho půdorys.
        </li>
      </ul>
    </div>
  )
}

function FloorTip({ n, units }: { n: number; units: Unit[] }) {
  const f = floorBy(n)
  const of = units.filter((u) => u.floor === n)
  const fr = free(of)
  return (
    <>
      <p className="font-display text-lg font-medium text-heading">{f.label}</p>
      <p className="font-semibold text-heading">{f.name}</p>
      <p className="mt-1 text-subtle">{f.text}</p>
      <p className="mt-3">
        <b className="text-heading">{fr.length}</b> volných z {of.length}
        {fr.length > 0 && <> · od {m2(Math.min(...fr.map((u) => u.area)))}</>}
      </p>
      <p className="mt-2 inline-flex items-center gap-1 font-semibold text-primary">
        Zobrazit půdorys <IconArrowRight size={16} />
      </p>
    </>
  )
}

// ── Floor plan ─────────────────────────────────────────────────────────────────

function Plan({
  floor,
  units,
  hover,
  selected,
  shown = () => true,
  onHover,
  onPick,
}: {
  floor: number
  units: Unit[]
  hover?: string | null
  selected?: string | null
  shown?: (u: Unit) => boolean
  onHover?: (id: string | null) => void
  onPick?: (id: string) => void
}) {
  const plan = floorPlan(floor)
  const byId = new Map(units.map((u) => [u.id, u]))
  const live = !!onPick
  return (
    <svg viewBox={`0 ${PLAN_TOP} ${PLAN_W} ${PLAN_H - PLAN_TOP + 40}`} className="block h-auto w-full select-none">
      <defs>
        <pattern id="hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="10" height="10" fill="var(--color-gold-wash)" />
          <line x1="0" y1="0" x2="0" y2="10" stroke="var(--color-gold-line)" strokeWidth="4" />
        </pattern>
      </defs>
      {plan.terrace && <path d={toPath(plan.terrace)} fill="url(#hatch)" stroke="var(--color-gold)" strokeWidth="2" />}
      <path d={toPath(plan.outline)} fill={plan.terrace ? 'none' : 'white'} stroke="var(--p-blue-950)" strokeWidth="3" />
      <path d={toPath(plan.inner)} fill="var(--p-grey-100)" />
      {plan.terrace && (
        <text x={500} y={150} textAnchor="middle" className="fill-gold-deep text-[15px] font-semibold tracking-[0.2em] uppercase">
          Terasa
        </text>
      )}

      {plan.commons.map((c, i) => (
        <g key={i}>
          <path d={toPath(c.points)} fill="var(--p-grey-200)" stroke="white" strokeWidth="4" />
          <text x={c.center[0]} y={c.center[1] + 5} textAnchor="middle" className="fill-grey-500 text-[14px] font-medium">
            {c.label}
          </text>
        </g>
      ))}

      {plan.units.map((p) => {
        const u = byId.get(p.id)
        if (!u) return null
        const on = hover === u.id || selected === u.id
        const dim = !shown(u)
        return (
          <g
            key={p.id}
            role={live ? 'button' : undefined}
            tabIndex={live && !dim ? 0 : undefined}
            aria-label={live ? `Jednotka ${u.id}, ${m2(u.area)}, ${statusLabel[u.status]}` : undefined}
            onPointerEnter={() => onHover?.(u.id)}
            onPointerLeave={() => onHover?.(null)}
            onFocus={() => onHover?.(u.id)}
            onBlur={() => onHover?.(null)}
            onClick={() => onPick?.(u.id)}
            onKeyDown={(e) => e.key === 'Enter' && onPick?.(u.id)}
            className={`outline-none ${live ? 'cursor-pointer' : ''} transition-opacity duration-200 ${dim ? 'opacity-25' : ''}`}
          >
            <path
              d={toPath(p.points)}
              fill={on ? 'var(--p-blue-700)' : statusTone[u.status].fill}
              fillOpacity={on ? 1 : u.status === 'obsazeno' ? 0.35 : 0.28}
              stroke="white"
              strokeWidth="4"
              strokeLinejoin="round"
              className="transition-[fill,fill-opacity] duration-150"
            />
            <text
              x={p.center[0]}
              y={p.center[1] - 2}
              textAnchor="middle"
              className={`pointer-events-none text-[19px] font-bold ${on ? 'fill-white' : 'fill-heading'}`}
            >
              {u.id}
            </text>
            <text
              x={p.center[0]}
              y={p.center[1] + 18}
              textAnchor="middle"
              className={`pointer-events-none text-[14px] ${on ? 'fill-white' : 'fill-grey-600'}`}
            >
              {Math.round(u.area)} m²
            </text>
          </g>
        )
      })}

      <text x={500} y={PLAN_H + 26} textAnchor="middle" className="fill-grey-500 text-[14px] font-semibold tracking-[0.2em] uppercase">
        Parkoviště · hlavní vstup
      </text>
    </svg>
  )
}

function UnitTip({ u }: { u: Unit }) {
  return (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="font-display text-lg font-medium text-heading">Jednotka {u.id}</p>
        <Badge status={u.status} />
      </div>
      <p className="text-subtle">{typeLabel[u.type]}</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 [&_dd]:whitespace-nowrap">
        <dt className="text-subtle">Plocha</dt>
        <dd className="text-right font-semibold text-heading">{m2(u.area)}</dd>
        {u.terrace > 0 && (
          <>
            <dt className="text-subtle">Terasa</dt>
            <dd className="text-right font-semibold text-heading">{m2(u.terrace)}</dd>
          </>
        )}
        <dt className="text-subtle">Nájem</dt>
        <dd className="text-right font-semibold text-heading">{rentText(u)}</dd>
        {u.offer !== 'pronajem' && (
          <>
            <dt className="text-subtle">Cena</dt>
            <dd className="text-right font-semibold text-heading">{priceText(u)}</dd>
          </>
        )}
      </dl>
    </>
  )
}

const allStatuses: Status[] = ['volne', 'rezervace', 'obsazeno']

function FloorView({ units, floor, selected, go }: { units: Unit[]; floor: number; selected: string | null; go: Go }) {
  const [hover, setHover] = useState<string | null>(null)
  const [statuses, setStatuses] = useState<Status[]>(allStatuses)
  const [type, setType] = useState<UnitType | 'all'>('all')
  const p = usePointer()
  const f = floorBy(floor)
  const of = units.filter((u) => u.floor === floor)
  const types = [...new Set(of.map((u) => u.type))]
  const shown = (u: Unit) => statuses.includes(u.status) && (type === 'all' || u.type === type)
  const hovered = of.find((u) => u.id === hover)
  const pick = (id: string) => go({ view: 'podlazi', floor, unit: id })

  useEffect(() => setType('all'), [floor])

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="grid content-start gap-6">
        <div>
          <p className="mb-2 text-sm font-semibold text-heading">Podlaží</p>
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            {floors.map((x) => {
              const xs = units.filter((u) => u.floor === x.n)
              const on = x.n === floor
              return (
                <a
                  key={x.n}
                  href={href({ view: 'podlazi', floor: x.n, unit: null })}
                  aria-current={on ? 'page' : undefined}
                  className={`rounded-xl border px-3 py-2.5 transition-colors ${
                    on ? 'border-gold bg-gold text-white' : 'border-hairline bg-white hover:border-gold'
                  }`}
                >
                  <span className={`block font-semibold ${on ? '' : 'text-heading'}`}>{x.label}</span>
                  <span className={`block text-xs ${on ? 'text-white/85' : 'text-subtle'}`}>
                    {free(xs).length} volných z {xs.length}
                  </span>
                </a>
              )
            })}
          </div>
        </div>

        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-heading">Stav</legend>
          <div className="flex flex-wrap gap-2">
            {allStatuses.map((s) => {
              const on = statuses.includes(s)
              return (
                <button
                  key={s}
                  aria-pressed={on}
                  onClick={() => setStatuses(on ? statuses.filter((x) => x !== s) : [...statuses, s])}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    on ? 'border-heading/20 bg-white text-heading' : 'border-hairline bg-transparent text-subtle line-through'
                  }`}
                >
                  <span className={`size-2.5 rounded-full ${statusTone[s].dot}`} />
                  {statusLabel[s]}
                </button>
              )
            })}
          </div>
        </fieldset>

        {types.length > 1 && (
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-heading">Typ</legend>
            <div className="flex flex-wrap gap-2">
              {(['all', ...types] as const).map((t) => (
                <button
                  key={t}
                  aria-pressed={type === t}
                  onClick={() => setType(t)}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                    type === t ? 'border-primary bg-primary text-white' : 'border-hairline bg-white text-heading hover:bg-tint'
                  }`}
                >
                  {t === 'all' ? 'Vše' : typePlural[t]}
                </button>
              ))}
            </div>
          </fieldset>
        )}
      </aside>

      <section>
        <div className="rounded-2xl border border-hairline bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-medium text-heading">
              {f.label} <span className="text-gold">· {f.name}</span>
            </h2>
            <p className="text-sm text-subtle">Najeďte na jednotku pro detail, kliknutím ji otevřete.</p>
          </div>
          <div ref={p.ref} onPointerMove={p.onMove} className="relative">
            <Plan
              floor={floor}
              units={of}
              hover={hover}
              selected={selected}
              shown={shown}
              onHover={setHover}
              onPick={pick}
            />
            {hovered && (
              <Tip at={p.at} box={p.box}>
                <UnitTip u={hovered} />
              </Tip>
            )}
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {of.filter(shown).map((u) => (
            <li key={u.id}>
              <a
                href={href({ view: 'podlazi', floor, unit: u.id })}
                onPointerEnter={() => setHover(u.id)}
                onPointerLeave={() => setHover(null)}
                className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-colors ${
                  hover === u.id ? 'border-primary' : 'border-hairline'
                }`}
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <b className="text-heading">{u.id}</b>
                    <Badge status={u.status} />
                  </span>
                  <span className="mt-1 block text-sm text-subtle">
                    {typeLabel[u.type]} · {m2(u.area)}
                  </span>
                </span>
                <span className="text-right text-sm font-semibold text-heading">{rentText(u)}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

// ── Table ──────────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'floor' | 'type' | 'area' | 'rent' | 'price' | 'status'

const columns: { key: SortKey; label: string; right?: boolean }[] = [
  { key: 'id', label: 'Jednotka' },
  { key: 'floor', label: 'Podlaží' },
  { key: 'type', label: 'Typ' },
  { key: 'area', label: 'Plocha', right: true },
  { key: 'rent', label: 'Nájem', right: true },
  { key: 'price', label: 'Cena bez DPH', right: true },
  { key: 'status', label: 'Stav' },
]

const sortValue = (u: Unit, k: SortKey): number | string => {
  if (k === 'status') return allStatuses.indexOf(u.status)
  if (k === 'rent' || k === 'price') return u[k] ?? Infinity
  return u[k]
}

const field =
  'h-10 rounded-lg border border-hairline bg-white px-3 text-sm text-heading outline-none focus:border-primary'

function TableView({ units, go }: { units: Unit[]; go: Go }) {
  const [floor, setFloor] = useState('all')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [offer, setOffer] = useState('all')
  const [minArea, setMinArea] = useState('')
  const [maxArea, setMaxArea] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'id', dir: 1 })

  const rows = useMemo(() => {
    const lo = Number(minArea) || 0
    const hi = Number(maxArea) || Infinity
    return units
      .filter(
        (u) =>
          (floor === 'all' || u.floor === Number(floor)) &&
          (type === 'all' || u.type === type) &&
          (status === 'all' || u.status === status) &&
          (offer === 'all' || u.offer === offer || u.offer === 'oboji') &&
          u.area >= lo &&
          u.area <= hi,
      )
      .sort((a, b) => {
        const x = sortValue(a, sort.key)
        const y = sortValue(b, sort.key)
        return (x < y ? -1 : x > y ? 1 : 0) * sort.dir
      })
  }, [units, floor, type, status, offer, minArea, maxArea, sort])

  const open = (u: Unit) => go({ view: 'tabulka', unit: u.id })
  const reset = () => {
    setFloor('all')
    setType('all')
    setStatus('all')
    setOffer('all')
    setMinArea('')
    setMaxArea('')
  }

  return (
    <div>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-2xl border border-hairline bg-white p-4 sm:grid-cols-3 lg:flex lg:flex-wrap lg:items-end">
        <Select label="Podlaží" value={floor} onChange={setFloor} options={floors.map((f) => [String(f.n), f.label])} />
        <Select label="Typ" value={type} onChange={setType} options={Object.entries(typeLabel)} />
        <Select label="Stav" value={status} onChange={setStatus} options={Object.entries(statusLabel)} />
        <Select
          label="Nabídka"
          value={offer}
          onChange={setOffer}
          options={[
            ['pronajem', 'Pronájem'],
            ['prodej', 'Prodej'],
          ]}
        />
        <label className="grid gap-1 text-xs font-semibold text-subtle">
          Plocha od (m²)
          <input inputMode="numeric" value={minArea} onChange={(e) => setMinArea(e.target.value)} className={`${field} lg:w-28`} />
        </label>
        <label className="grid gap-1 text-xs font-semibold text-subtle">
          Plocha do (m²)
          <input inputMode="numeric" value={maxArea} onChange={(e) => setMaxArea(e.target.value)} className={`${field} lg:w-28`} />
        </label>
        <button onClick={reset} className="h-10 rounded-lg px-3 text-sm font-semibold text-primary hover:bg-tint lg:ml-auto">
          Zrušit filtry
        </button>
      </div>

      <p className="mb-3 text-sm text-subtle">
        {rows.length} {rows.length === 1 ? 'jednotka' : rows.length < 5 && rows.length > 0 ? 'jednotky' : 'jednotek'}
      </p>

      {/* desktop: the table */}
      <div className="hidden overflow-hidden rounded-2xl border border-hairline bg-white md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-hairline bg-grey-50 text-left text-heading">
            <tr>
              {columns.map((c) => {
                const on = sort.key === c.key
                const I = on ? (sort.dir === 1 ? IconChevronUp : IconChevronDown) : IconSelector
                return (
                  <th key={c.key} className={`px-4 py-3 font-semibold ${c.right ? 'text-right' : ''}`} aria-sort={on ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
                    <button
                      onClick={() => setSort({ key: c.key, dir: on ? (-sort.dir as 1 | -1) : 1 })}
                      className="inline-flex items-center gap-1 hover:text-primary"
                    >
                      {c.label}
                      <I size={14} className={on ? 'text-primary' : 'text-decor'} />
                    </button>
                  </th>
                )
              })}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr
                key={u.id}
                onClick={() => open(u)}
                className="cursor-pointer border-b border-hairline last:border-0 hover:bg-tint"
              >
                <td className="px-4 py-3 font-bold text-heading">
                  <a href={href({ view: 'tabulka', floor: 1, unit: u.id })} onClick={(e) => e.stopPropagation()}>
                    {u.id}
                  </a>
                </td>
                <td className="px-4 py-3">{floorBy(u.floor).label}</td>
                <td className="px-4 py-3">{typeLabel[u.type]}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {m2(u.area)}
                  {u.terrace > 0 && <span className="block text-xs text-subtle">+ terasa {m2(u.terrace)}</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{rentText(u)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{priceText(u)}</td>
                <td className="px-4 py-3">
                  <Badge status={u.status} />
                </td>
                <td className="px-2 text-primary">
                  <IconChevronRight size={18} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <Empty onReset={reset} />}
      </div>

      {/* phone: the same rows as cards */}
      <ul className="grid gap-3 md:hidden">
        {rows.map((u) => (
          <li key={u.id}>
            <a
              href={href({ view: 'tabulka', floor: 1, unit: u.id })}
              className="block rounded-xl border border-hairline bg-white p-4"
            >
              <span className="flex items-center justify-between gap-2">
                <b className="text-heading">
                  {u.id} <span className="font-normal text-subtle">· {floorBy(u.floor).label}</span>
                </b>
                <Badge status={u.status} />
              </span>
              <span className="mt-1 block text-sm text-subtle">
                {typeLabel[u.type]} · {m2(u.area)}
              </span>
              <span className="mt-2 flex justify-between text-sm font-semibold text-heading">
                <span>{rentText(u)}</span>
                <span>{priceText(u)}</span>
              </span>
            </a>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="rounded-xl border border-hairline bg-white">
            <Empty onReset={reset} />
          </li>
        )}
      </ul>
    </div>
  )
}

function Empty({ onReset }: { onReset: () => void }) {
  return (
    <div className="p-10 text-center">
      <p className="font-semibold text-heading">Tomuto výběru neodpovídá žádná jednotka.</p>
      <button onClick={onReset} className="mt-2 text-sm font-semibold text-primary hover:underline">
        Zrušit filtry
      </button>
    </div>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: [string, string][]
}) {
  return (
    <label className="grid gap-1 text-xs font-semibold text-subtle">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`${field} lg:min-w-36`}>
        <option value="all">Vše</option>
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </label>
  )
}

// ── Unit ───────────────────────────────────────────────────────────────────────

function UnitDrawer({
  unit: u,
  units,
  onPick,
  onClose,
}: {
  unit: Unit
  units: Unit[]
  onPick: (id: string) => void
  onClose: () => void
}) {
  const f = floorBy(u.floor)
  const siblings = units.filter((x) => x.floor === u.floor)
  const i = siblings.indexOf(u)
  const prev = siblings[(i - 1 + siblings.length) % siblings.length]
  const next = siblings[(i + 1) % siblings.length]

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPick(prev.id)
      if (e.key === 'ArrowRight') onPick(next.id)
    }
    window.addEventListener('keydown', on)
    document.documentElement.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', on)
      document.documentElement.style.overflow = ''
    }
  }, [onClose, onPick, prev, next])

  const facts: [string, string][] = [
    ['Podlaží', `${f.label} · ${f.name}`],
    ['Typ', typeLabel[u.type]],
    ['Plocha', m2(u.area)],
    ...(u.terrace > 0 ? ([['Terasa', m2(u.terrace)]] as [string, string][]) : []),
    ['Nabídka', offerLabel[u.offer]],
    ['Předání', u.handover],
    ['K dispozici od', u.available],
  ]

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={`Jednotka ${u.id}`}>
      <button aria-label="Zavřít" onClick={onClose} className="absolute inset-0 bg-deep/50 backdrop-blur-[2px] [animation:fade_.2s]" />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-[520px] flex-col bg-white shadow-2xl [animation:slide_.3s_cubic-bezier(.2,.8,.2,1)]">
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-5 py-4">
          <div className="flex items-center gap-1">
            <button onClick={() => onPick(prev.id)} aria-label="Předchozí jednotka" className="grid size-9 place-items-center rounded-lg text-heading hover:bg-tint">
              <IconChevronLeft size={20} />
            </button>
            <button onClick={() => onPick(next.id)} aria-label="Další jednotka" className="grid size-9 place-items-center rounded-lg text-heading hover:bg-tint">
              <IconChevronRight size={20} />
            </button>
            <span className="ml-2 text-sm text-subtle">
              {i + 1} / {siblings.length} na podlaží
            </span>
          </div>
          <button onClick={onClose} aria-label="Zavřít" className="grid size-9 place-items-center rounded-lg text-heading hover:bg-tint">
            <IconX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 pt-6 pb-10 sm:px-8">
          <Eyebrow>{f.label}</Eyebrow>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="font-display text-[32px] leading-none font-medium text-heading">Jednotka {u.id}</h2>
            <Badge status={u.status} />
          </div>
          <p className="mt-2 text-subtle">{typeLabel[u.type]}</p>

          <div className="mt-6 rounded-xl border border-hairline bg-page p-3">
            <Plan floor={u.floor} units={siblings} selected={u.id} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gold-wash p-4">
              <p className="text-xs font-semibold tracking-wide text-gold-deep uppercase">Nájem</p>
              <p className="mt-1 font-display text-xl font-medium text-heading">{rentText(u)}</p>
            </div>
            <div className="rounded-xl bg-gold-wash p-4">
              <p className="text-xs font-semibold tracking-wide text-gold-deep uppercase">Cena bez DPH</p>
              <p className="mt-1 font-display text-xl font-medium text-heading">
                {u.offer === 'pronajem' ? 'Jen pronájem' : priceText(u)}
              </p>
            </div>
          </div>

          <dl className="mt-6 divide-y divide-hairline border-y border-hairline text-sm">
            {facts.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-subtle">{k}</dt>
                <dd className="text-right font-semibold text-heading">{v}</dd>
              </div>
            ))}
          </dl>

          {u.status === 'obsazeno' ? (
            <p className="mt-8 rounded-xl bg-grey-100 p-4 text-sm">
              Tato jednotka je již obsazená. Podívejte se na <button onClick={() => onPick(next.id)} className="font-semibold text-primary hover:underline">další na podlaží</button>.
            </p>
          ) : (
            <Inquiry key={u.id} u={u} />
          )}
        </div>
      </div>
    </div>
  )
}

function Inquiry({ u }: { u: Unit }) {
  const [sent, setSent] = useState(false)
  const submit = (e: FormEvent) => {
    e.preventDefault()
    // later: the inquiry goes to Realman as a lead on `u.realmanId`
    setSent(true)
  }
  if (sent)
    return (
      <div className="mt-8 rounded-xl bg-tint p-5">
        <p className="flex items-center gap-2 font-semibold text-heading">
          <IconCheck size={20} className="text-primary" /> Děkujeme, poptávku jsme přijali
        </p>
        <p className="mt-1 text-sm">K jednotce {u.id} se vám ozveme do jednoho pracovního dne.</p>
      </div>
    )
  const input = `${field} w-full`
  return (
    <form onSubmit={submit} className="mt-8 grid gap-3">
      <h3 className="font-display text-xl font-medium text-heading">Mám zájem o tuto jednotku</h3>
      <input required placeholder="Jméno a příjmení" autoComplete="name" className={input} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input required type="email" placeholder="E-mail" autoComplete="email" className={input} />
        <input type="tel" placeholder="Telefon" autoComplete="tel" className={input} />
      </div>
      <textarea
        rows={3}
        defaultValue={`Dobrý den, mám zájem o jednotku ${u.id} (${floorBy(u.floor).label}, ${m2(u.area)}).`}
        className={`${input} h-auto py-2`}
      />
      <button className="mt-1 h-12 rounded-lg bg-primary font-semibold text-white transition-colors hover:bg-primary-hover">
        Odeslat poptávku
      </button>
    </form>
  )
}
