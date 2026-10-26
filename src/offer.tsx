import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode, type TouchEvent } from 'react'
import { createPortal } from 'react-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import {
  IconArrowLeft,
  IconArrowRight,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconLayoutBoard,
  IconMaximize,
  IconTable,
  IconX,
} from '@tabler/icons-react'
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
  views,
  type Status,
  type Unit,
} from './budova/data'
import { floorPlan, PLAN_H, PLAN_TOP, PLAN_W, toPath, type Pt } from './budova/plan'

// The offer of spaces on the light page: the render with its floors, then a floor's plan and
// its units as cards - or all units as one table. A unit opens as a detail, set like a
// listing on the reality site. Controls are @allrisk/ui's (Button, Card, Tabs, Checkbox, Tag)
// rebuilt from their classes. The section is blue: the floors, the plans and the free units.

const view = views[0]
// closer in than budova.html: the building fills the frame
const crop = [336, 100, 1000, 563] as const
const [cx, cy, cw, ch] = crop
const pts = (ps: Pt[]) => ps.map(([x, y]) => `${x},${y}`).join(' ')
const freeOf = (us: Unit[]) => us.filter((u) => u.status === 'volne')
// the dimming around a pointed floor
const dim = '#0d1f5b'

// @allrisk/ui Card: one hairline always; `interactive` answers hover with the brand edge
// and the lift shadow, never a rise.
const card = 'rounded-2xl border border-hairline bg-white'
const cardLink = `${card} transition duration-300 hover:border-primary hover:shadow-[0_10px_15px_-3px_rgb(13_31_91/0.1),0_4px_6px_-2px_rgb(13_31_91/0.05)]`

// @allrisk/ui Button, `default` size (48px)
const btn =
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-3 rounded-lg border font-semibold whitespace-nowrap transition-colors duration-200 active:duration-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400 h-12 text-base'
const btnPrimary = `${btn} group px-6 border-transparent bg-primary text-white hover:bg-primary-hover active:bg-blue-900`
const btnOutline = `${btn} px-6 border-primary text-primary hover:bg-tint active:bg-blue-100`
// Button `outline` with `iconOnly`: a square, width equal to height
const btnIcon = `${btn} w-12 px-0 border-primary text-primary hover:bg-tint active:bg-blue-100`

/** @allrisk/ui Tabs, `seg`: one tinted box, the picked tab solid AllBlue. */
function Seg<K extends string | number>({
  items,
  value,
  onChange,
  label,
  size = 'sm',
}: {
  items: { key: K; label: string; icon?: typeof IconTable }[]
  value: K
  onChange: (k: K) => void
  label: string
  size?: 'sm' | 'md'
}) {
  return (
    <div className="flex w-fit max-w-full shrink-0 gap-1 overflow-x-auto rounded-xl border border-tint-strong bg-tint p-1" role="tablist" aria-label={label}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          role="tab"
          aria-selected={value === it.key}
          onClick={() => onChange(it.key)}
          className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold whitespace-nowrap transition-colors ${
            size === 'md' ? 'text-base' : 'text-sm'
          } ${value === it.key ? 'bg-primary text-white' : 'text-text hover:bg-white/75 hover:text-primary'}`}
        >
          {it.icon && <it.icon size={size === 'md' ? 20 : 18} stroke={1.8} />}
          {it.label}
        </button>
      ))}
    </div>
  )
}

/** @allrisk/ui Tag, `sm`: a square-ish label, the tone says what it is. */
const tagTone: Record<Status, string> = {
  volne: 'bg-tint text-primary',
  rezervace: 'bg-grey-100 text-grey-600',
  obsazeno: 'bg-grey-100 text-subtle',
}

function Tag({ status }: { status: Status }) {
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${tagTone[status]}`}>
      {statusLabel[status]}
    </span>
  )
}

/** @allrisk/ui Checkbox, `option`: the drawn box, the words turn blue with it. */
function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`flex cursor-pointer items-center gap-2 text-base font-medium transition-colors ${checked ? 'text-primary' : 'text-text'}`}
    >
      <span className="flex size-6 items-center justify-center">
        <span className={`flex size-5 items-center justify-center rounded-md transition-colors ${checked ? 'bg-primary' : 'border border-grey-200 bg-white'}`}>
          {checked && (
            <svg className="size-4 text-white" viewBox="0 0 16 16" fill="none" aria-hidden>
              <path d="M3.5 8L6.5 11L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </span>
      {label}
    </button>
  )
}

/** `head` is the section's heading: the view switch stands to its right, as on allrisk.cz. */
export function OfferStage({ head }: { head?: ReactNode }) {
  const [units, setUnits] = useState<Unit[]>([])
  const [mode, setMode] = useState<'mapa' | 'tabulka'>('mapa')
  const [floor, setFloor] = useState<number | null>(null)
  const [unit, setUnit] = useState<string | null>(null)

  useEffect(() => {
    loadUnits().then(setUnits)
  }, [])
  // the section changes height; the reveals below must re-measure
  useEffect(() => ScrollTrigger.refresh(), [floor, mode])
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (unit) setUnit(null)
      else setFloor(null)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [unit])

  const open = (n: number | null) => {
    setFloor(n)
    setUnit(null)
  }

  const current = units.find((u) => u.id === unit) ?? null

  return (
    <>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6 lg:mb-12">
        {head}
        {/* as over allrisk.cz's offices map: Tabs `seg` at its `md` scale */}
        <Seg
          label="Zobrazení"
          size="md"
          value={mode}
          onChange={setMode}
          items={[
            { key: 'mapa', label: 'Mapa', icon: IconLayoutBoard },
            { key: 'tabulka', label: 'Tabulka', icon: IconTable },
          ]}
        />
      </div>

      {mode === 'tabulka' ? (
        <UnitTable units={units} onPick={(u) => setUnit(u.id)} />
      ) : floor === null ? (
        <Building units={units} onOpen={open} />
      ) : (
        <FloorStage units={units} floor={floor} unit={current} onFloor={open} onUnit={setUnit} />
      )}

      {current && <UnitDetail u={current} units={units} onPick={setUnit} onClose={() => setUnit(null)} />}
    </>
  )
}

/** A card that follows the pointer inside its positioned parent, flipping at the right edge. */
function usePointer() {
  const ref = useRef<HTMLDivElement>(null)
  const [at, setAt] = useState({ x: 0, y: 0, flip: false })
  // a hover set from elsewhere (the unit cards) shows no card here
  const [inside, setInside] = useState(false)
  const onPointerMove = (e: PointerEvent) => {
    const r = ref.current?.getBoundingClientRect()
    if (r) setAt({ x: e.clientX - r.left, y: e.clientY - r.top, flip: e.clientX - r.left > r.width - 300 })
  }
  const box = {
    ref,
    onPointerMove,
    onPointerEnter: () => setInside(true),
    onPointerLeave: () => setInside(false),
  }
  return { box, at, inside }
}

function Tip({ at, children }: { at: { x: number; y: number; flip: boolean }; children: ReactNode }) {
  return (
    <div
      className={`${card} pointer-events-none absolute z-10 animate-[fade_.2s_ease] p-5 shadow-[0_10px_15px_-3px_rgb(13_31_91/0.1),0_4px_6px_-2px_rgb(13_31_91/0.05)]`}
      style={{
        left: at.x,
        top: at.y,
        transform: `translate(${at.flip ? 'calc(-100% - 20px)' : '20px'}, -50%)`,
      }}
    >
      {children}
    </div>
  )
}

function Building({ units, onOpen }: { units: Unit[]; onOpen: (n: number) => void }) {
  const [hover, setHover] = useState<number | null>(null)
  const p = usePointer()
  const counts = (n: number) => {
    const of = units.filter((u) => u.floor === n)
    return { free: freeOf(of).length, all: of.length }
  }

  return (
    <div className="animate-[fade_.6s_ease]">
      <div
        {...p.box}
        className="relative overflow-hidden rounded-2xl bg-tint"
        style={{ aspectRatio: `${cw} / ${ch}` }}
      >
        <svg viewBox={crop.join(' ')} className="absolute inset-0 size-full" role="img" aria-label="Budova Allrisk VESELKA">
          <defs>
            <mask id="offer-hole">
              <rect x={cx} y={cy} width={cw} height={ch} fill="white" />
              {hover && <polygon points={pts(view.floors[hover])} fill="black" />}
            </mask>
          </defs>
          <image href={view.image} width={view.width} height={view.height} />
          <rect
            x={cx}
            y={cy}
            width={cw}
            height={ch}
            fill={dim}
            mask="url(#offer-hole)"
            className={`pointer-events-none transition-opacity duration-500 ${hover ? 'opacity-50' : 'opacity-0'}`}
          />
          {floors.map((f) => (
            <polygon
              key={f.n}
              points={pts(view.floors[f.n])}
              role="button"
              tabIndex={0}
              aria-label={`${f.label}, ${counts(f.n).free} volných`}
              onPointerEnter={() => setHover(f.n)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(f.n)}
              onBlur={() => setHover(null)}
              onClick={() => onOpen(f.n)}
              onKeyDown={(e) => e.key === 'Enter' && onOpen(f.n)}
              className="cursor-pointer outline-none transition-[fill-opacity,stroke-opacity] duration-300"
              fill="var(--p-blue-600)"
              fillOpacity={hover === f.n ? 0.6 : 0}
              stroke="var(--p-blue-200)"
              strokeOpacity={hover === f.n ? 1 : 0}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          ))}
        </svg>

        {hover && (
          <Tip at={p.at}>
            <p className="text-xl leading-7 font-semibold text-heading">{floorBy(hover).label}</p>
            <p className="text-sm text-subtle">{floorBy(hover).name}</p>
            <p className="mt-4 flex items-center justify-between gap-8 border-t border-hairline pt-3 text-sm font-medium text-text">
              <span>
                <b className="font-semibold text-heading">{counts(hover).free}</b> volných z {counts(hover).all}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-primary">
                Půdorys <IconArrowRight size={16} />
              </span>
            </p>
          </Tip>
        )}
      </div>

      {/* a phone has no hover: the floors as cards under the render */}
      <div className="mt-4 grid gap-3 lg:hidden">
        {floors.map((f) => (
          <button key={f.n} onClick={() => onOpen(f.n)} className={`${cardLink} group flex items-center gap-4 p-4 text-left`}>
            <span className="min-w-0 flex-1">
              <b className="block text-lg font-semibold text-heading transition-colors group-hover:text-primary">{f.label}</b>
              <span className="text-sm text-subtle">
                {f.name} · {counts(f.n).free} volných z {counts(f.n).all}
              </span>
            </span>
            <IconChevronRight size={20} className="text-primary" />
          </button>
        ))}
      </div>
    </div>
  )
}

function FloorStage({
  units,
  floor,
  unit,
  onFloor,
  onUnit,
}: {
  units: Unit[]
  floor: number
  unit: Unit | null
  onFloor: (n: number | null) => void
  onUnit: (id: string | null) => void
}) {
  const of = units.filter((u) => u.floor === floor)
  const free = freeOf(of)
  const [hover, setHover] = useState<string | null>(null)
  const p = usePointer()
  const hovered = p.inside && !unit ? of.find((u) => u.id === hover) : undefined
  // the detail opens over the pointer, which then never reports leaving
  useEffect(() => setHover(null), [unit?.id])

  return (
    <div className="animate-[rise_.7s_cubic-bezier(.2,.8,.2,1)]">
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* the plan stays in view while the list of free units runs past it */}
        <div className={`${card} flex flex-col gap-4 p-4 sm:p-6 lg:sticky lg:top-24 lg:self-start`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button onClick={() => onFloor(null)} className={btnOutline}>
              <IconArrowLeft size={20} /> Budova
            </button>
            <Seg
              label="Podlaží"
              value={floor}
              onChange={onFloor}
              items={[...floors].reverse().map((x) => ({ key: x.n, label: x.label }))}
            />
          </div>
          <div {...p.box} className="relative py-4">
            <Plan
              key={floor}
              floor={floor}
              units={of}
              hover={hover}
              selected={unit?.id ?? null}
              onHover={setHover}
              onPick={onUnit}
            />
            {hovered && (
              <div
                className={`${card} pointer-events-none absolute z-10 px-4 py-2.5 text-sm whitespace-nowrap shadow-[0_10px_15px_-3px_rgb(13_31_91/0.1)]`}
                style={{ left: p.at.x, top: p.at.y, transform: 'translate(-50%, calc(-100% - 14px))' }}
              >
                <b className="font-semibold text-heading">Jednotka {hovered.id}</b>
                <span className="text-subtle">
                  {' '}
                  · {hovered.status === 'volne' ? m2(hovered.area) : statusLabel[hovered.status]}
                </span>
              </div>
            )}
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-subtle">
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-tint-strong" /> Volné
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-grey-300" /> Rezervované
            </li>
            <li className="flex items-center gap-2">
              <span className="size-3 rounded-sm bg-grey-100 ring-1 ring-grey-200" /> Obsazené
            </li>
          </ul>
        </div>

        <div key={floor} className="flex animate-[fade_.4s_ease] flex-col gap-3">
          {free.map((u) => (
            <button
              key={u.id}
              onClick={() => onUnit(u.id)}
              onPointerEnter={() => setHover(u.id)}
              onPointerLeave={() => setHover(null)}
              className={`${cardLink} group flex items-center gap-4 px-5 py-4 text-left ${hover === u.id ? 'border-primary' : ''}`}
            >
              <span className="min-w-0 flex-1">
                <b className="block font-semibold text-heading transition-colors group-hover:text-primary">
                  Jednotka {u.id}
                </b>
                <span className="text-sm text-subtle">
                  {m2(u.area)} · {rentText(u)}
                </span>
              </span>
              <IconChevronRight size={20} className="text-primary" />
            </button>
          ))}
          {free.length === 0 && <p className={`${card} p-6 text-center text-subtle`}>Na tomto podlaží není volná jednotka.</p>}
        </div>
      </div>
    </div>
  )
}

function Plan({
  floor,
  units,
  hover,
  selected,
  onHover,
  onPick,
}: {
  floor: number
  units: Unit[]
  hover: string | null
  selected: string | null
  onHover: (id: string | null) => void
  onPick: (id: string) => void
}) {
  const plan = floorPlan(floor)
  const byId = new Map(units.map((u) => [u.id, u]))
  const hall = plan.commons.find((c) => c.kind === 'hall')
  return (
    <svg viewBox={`0 ${PLAN_TOP} ${PLAN_W} ${PLAN_H - PLAN_TOP + 10}`} className="mx-auto block h-auto w-full max-w-[820px] select-none">
      <defs>
        <pattern id="offer-hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="var(--p-blue-100)" strokeWidth="3" />
        </pattern>
      </defs>
      {plan.terrace && <path d={toPath(plan.terrace)} fill="url(#offer-hatch)" stroke="var(--p-blue-100)" strokeWidth="2" />}
      <path d={toPath(plan.inner)} fill="var(--p-grey-50)" />
      {plan.commons.map((c, i) => (
        <path key={i} d={toPath(c.points)} fill="var(--p-grey-200)" stroke="white" strokeWidth="5" />
      ))}
      {hall && (
        <text x={hall.center[0]} y={hall.center[1] + 5} textAnchor="middle" className="fill-grey-500 text-[14px] font-semibold tracking-[0.2em] uppercase">
          Vstup
        </text>
      )}

      {plan.units.map((p) => {
        const u = byId.get(p.id)
        if (!u) return null
        const on = hover === u.id || selected === u.id
        // free units are the blue ones; picked or pointed at, a unit turns AllBlue
        const fill = on
          ? 'var(--p-blue-700)'
          : u.status === 'volne'
            ? 'var(--p-blue-100)'
            : u.status === 'rezervace'
              ? 'var(--p-grey-300)'
              : 'var(--p-grey-100)'
        const ink = on ? 'fill-white' : u.status === 'volne' ? 'fill-primary' : u.status === 'rezervace' ? 'fill-grey-600' : 'fill-grey-500'
        return (
          <g
            key={p.id}
            role="button"
            tabIndex={0}
            aria-label={`Jednotka ${u.id}, ${m2(u.area)}, ${statusLabel[u.status]}`}
            aria-pressed={selected === u.id}
            onPointerEnter={() => onHover(u.id)}
            onPointerLeave={() => onHover(null)}
            onFocus={() => onHover(u.id)}
            onBlur={() => onHover(null)}
            onClick={() => onPick(u.id)}
            onKeyDown={(e) => e.key === 'Enter' && onPick(u.id)}
            className="cursor-pointer outline-none"
          >
            <path
              d={toPath(p.points)}
              fill={fill}
              stroke="white"
              strokeWidth="5"
              strokeLinejoin="round"
              className="transition-[fill] duration-200"
            />
            <text
              x={p.center[0]}
              y={p.center[1] + 8}
              textAnchor="middle"
              className={`pointer-events-none text-[21px] font-semibold ${ink}`}
            >
              {u.id}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** The unit's own plan: its outline close up, the units around it faint for orientation. */
function UnitShape({ u }: { u: Unit }) {
  const plan = floorPlan(u.floor)
  const me = plan.units.find((p) => p.id === u.id)
  if (!me) return null
  const xs = me.points.map((p) => p[0])
  const ys = me.points.map((p) => p[1])
  const pad = 40
  const box = [Math.min(...xs) - pad, Math.min(...ys) - pad, Math.max(...xs) - Math.min(...xs) + pad * 2, Math.max(...ys) - Math.min(...ys) + pad * 2]
  return (
    <svg viewBox={box.join(' ')} className="size-full" role="img" aria-label={`Půdorys jednotky ${u.id}`}>
      {[...plan.units.filter((p) => p !== me), ...plan.commons].map((p, i) => (
        <path key={i} d={toPath(p.points)} fill="var(--p-grey-100)" stroke="white" strokeWidth="3" />
      ))}
      <path d={toPath(me.points)} fill="var(--p-blue-50)" stroke="var(--p-blue-700)" strokeWidth="2.5" strokeLinejoin="round" />
      <text x={me.center[0]} y={me.center[1] + 6} textAnchor="middle" className="fill-primary text-[17px] font-semibold">
        {m2(u.area)}
      </text>
    </svg>
  )
}

/** Where the unit sits on its floor. */
function Locator({ u }: { u: Unit }) {
  const plan = floorPlan(u.floor)
  return (
    <svg viewBox={`0 ${PLAN_TOP} ${PLAN_W} ${PLAN_H - PLAN_TOP}`} className="w-full" aria-hidden>
      {plan.terrace && <path d={toPath(plan.terrace)} fill="var(--p-blue-50)" />}
      <path d={toPath(plan.inner)} fill="var(--p-grey-50)" />
      {[...plan.units, ...plan.commons].map((p, i) => (
        <path
          key={i}
          d={toPath(p.points)}
          fill={'id' in p && p.id === u.id ? 'var(--p-blue-700)' : 'var(--p-grey-200)'}
          stroke="white"
          strokeWidth="6"
        />
      ))}
    </svg>
  )
}

function UnitDetail({
  u,
  units,
  onPick,
  onClose,
}: {
  u: Unit
  units: Unit[]
  onPick: (id: string) => void
  onClose: () => void
}) {
  const f = floorBy(u.floor)
  const siblings = units.filter((x) => x.floor === u.floor)
  const i = siblings.indexOf(u)
  const prev = siblings[(i - 1 + siblings.length) % siblings.length]
  const next = siblings[(i + 1) % siblings.length]

  // the page under the sheet stays put
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])

  // on a phone the sheet goes away with a pull down from its head
  const pull = useRef<number | null>(null)
  const [drag, setDrag] = useState(0)
  const grab = {
    onTouchStart: (e: TouchEvent) => (pull.current = e.touches[0].clientY),
    onTouchMove: (e: TouchEvent) => pull.current !== null && setDrag(Math.max(0, e.touches[0].clientY - pull.current)),
    onTouchEnd: () => {
      if (drag > 90) onClose()
      pull.current = null
      setDrag(0)
    },
  }

  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onPick(prev.id)
      if (e.key === 'ArrowRight') onPick(next.id)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  }, [onPick, prev, next])

  // the reality site's parameter rows: the label grey in a fixed column, the value in ink
  const params: [string, ReactNode][] = [
    ['Typ', typeLabel[u.type]],
    ['Podlaží', `${f.label}, ${f.name.toLowerCase()}`],
    ['Plocha', m2(u.area)],
    ...(u.terrace > 0 ? ([['Terasa', m2(u.terrace)]] as [string, string][]) : []),
    ['Nájem', rentText(u)],
    ...(u.offer !== 'pronajem' ? ([['Cena bez DPH', priceText(u)]] as [string, string][]) : []),
    ['Nabídka', offerLabel[u.offer]],
    ['Předání', u.handover],
    ['K dispozici', u.available],
  ]
  // the page's own contact form takes the inquiry, with the unit already written in
  const inquire = () => {
    const msg = document.querySelector<HTMLTextAreaElement>('#kontakt textarea[name="message"]')
    if (msg) msg.value = `Dobrý den, mám zájem o jednotku ${u.id} (${f.label}, ${m2(u.area)}).`
    onClose()
  }
  // as on the reality detail: what and how big in one line, the price under it in brand
  // blue - the offer state reads as part of the price, not as a badge beside it
  // on <body>: the section's reveal leaves a transform that would trap a fixed box inside it
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Jednotka ${u.id}`}>
      <button aria-label="Zavřít" onClick={onClose} className="absolute inset-0 animate-[fade_.2s_ease] bg-footer/60 backdrop-blur-sm" />
      <div
        data-lenis-prevent
        className={`relative flex max-h-[92dvh] w-full animate-[sheet_.4s_cubic-bezier(.2,.8,.2,1)] flex-col overflow-y-auto overscroll-contain rounded-t-2xl bg-page sm:max-h-[90vh] sm:max-w-6xl sm:animate-[rise_.4s_cubic-bezier(.2,.8,.2,1)] sm:rounded-2xl ${drag ? '' : 'transition-transform duration-200'}`}
        style={drag ? { transform: `translateY(${drag}px)` } : undefined}
      >
        {/* as on the reality detail: what and how big, the price under it in brand blue (the
            offer state reads as part of the price), the actions as a row of outline buttons */}
        <div {...grab} className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-page px-4 pt-6 pb-4 sm:px-6">
          {/* the sheet's grip */}
          <span aria-hidden className="absolute top-2 left-1/2 h-1 w-10 -translate-x-1/2 rounded-sm bg-grey-300 sm:hidden" />
          <div key={u.id} className="flex min-w-0 animate-[fade_.3s_ease] flex-col gap-2">
            <h3 className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xl font-semibold text-heading lg:text-[28px]">
              <span>Jednotka {u.id}</span>
              <span className="inline-flex items-center gap-1.5">
                <IconMaximize className="size-6 shrink-0 lg:size-7" stroke={1.75} />
                {m2(u.area)}
              </span>
            </h3>
            <p className="text-2xl font-semibold text-primary lg:text-[28px]">
              {rentText(u)}
              {u.status !== 'volne' && <span className="text-subtle"> - {statusLabel[u.status].toLowerCase()}</span>}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button onClick={() => onPick(prev.id)} aria-label="Předchozí jednotka" className={`${btnIcon} max-sm:hidden`}>
              <IconChevronLeft size={20} />
            </button>
            <button onClick={() => onPick(next.id)} aria-label="Další jednotka" className={`${btnIcon} max-sm:hidden`}>
              <IconChevronRight size={20} />
            </button>
            <button onClick={onClose} aria-label="Zavřít" className={btnIcon}>
              <IconX size={20} />
            </button>
          </div>
        </div>

        <div key={u.id} className="grid animate-[fade_.3s_ease] gap-6 px-4 pb-6 sm:px-6 lg:grid-cols-[1fr_400px]">
          <div className={`${card} relative aspect-[4/3] p-6`}>
            {u.plan ? (
              <img src={u.plan} alt={`Půdorys jednotky ${u.id}`} className="size-full object-contain" />
            ) : (
              <UnitShape u={u} />
            )}
            <div className="absolute top-4 left-4 w-24 rounded-lg border border-hairline bg-white p-2 sm:w-32">
              <Locator u={u} />
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <dl className={`${card} px-6`}>
              {params.map(([k, v]) => (
                <div key={k} className="flex items-start gap-4 border-b border-hairline py-3.5 last:border-0">
                  <dt className="w-[120px] shrink-0 text-base text-subtle">{k}</dt>
                  <dd className="text-base font-medium text-heading">{v}</dd>
                </div>
              ))}
            </dl>
            {u.status !== 'obsazeno' && (
              <a href="#kontakt" onClick={inquire} className={`${btnPrimary} w-full`}>
                Mám zájem o jednotku
                <IconArrowRight size={20} className="transition group-hover:translate-x-1" />
              </a>
            )}
            {/* a phone steps through the floor under the details, the head keeps only the close */}
            <div className="flex items-center justify-between gap-3 sm:hidden">
              <button onClick={() => onPick(prev.id)} className={btnOutline}>
                <IconChevronLeft size={20} /> Předchozí
              </button>
              <span className="text-sm font-medium text-subtle">
                {i + 1} z {siblings.length}
              </span>
              <button onClick={() => onPick(next.id)} className={btnOutline}>
                Další <IconChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Table ──────────────────────────────────────────────────────────────────────

type SortKey = 'id' | 'area' | 'rent' | 'price'
const statusOrder: Status[] = ['volne', 'rezervace', 'obsazeno']

function UnitTable({ units, onPick }: { units: Unit[]; onPick: (u: Unit) => void }) {
  const [floor, setFloor] = useState<number | 0>(0)
  const [onlyFree, setOnlyFree] = useState(true)
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: 'id', dir: 1 })

  const rows = useMemo(() => {
    const value = (u: Unit) => (sort.key === 'id' ? u.id : (u[sort.key] ?? Infinity))
    return units
      .filter((u) => (!floor || u.floor === floor) && (!onlyFree || u.status === 'volne'))
      .sort((a, b) => {
        const x = value(a)
        const y = value(b)
        return (x < y ? -1 : x > y ? 1 : statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)) * sort.dir
      })
  }, [units, floor, onlyFree, sort])

  const head = (key: SortKey, label: string, right = false) => {
    const on = sort.key === key
    const I = sort.dir === 1 ? IconChevronUp : IconChevronDown
    return (
      <th className={`px-5 py-3.5 font-semibold ${right ? 'text-right' : ''}`} aria-sort={on ? (sort.dir === 1 ? 'ascending' : 'descending') : undefined}>
        <button
          onClick={() => setSort({ key, dir: on ? (sort.dir === 1 ? -1 : 1) : 1 })}
          className={`inline-flex items-center gap-1 transition-colors hover:text-primary ${on ? 'text-heading' : ''}`}
        >
          {label}
          <I size={14} className={on ? 'text-primary' : 'opacity-0'} />
        </button>
      </th>
    )
  }

  return (
    <div className="animate-[fade_.4s_ease]">
      <div className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <Seg
          label="Podlaží"
          value={floor}
          onChange={setFloor}
          items={[{ key: 0, label: 'Vše' }, ...[...floors].reverse().map((f) => ({ key: f.n, label: f.label }))]}
        />
        <Checkbox label="Jen volné" checked={onlyFree} onChange={setOnlyFree} />
        <span className="text-sm text-subtle sm:ml-auto">{rows.length} jednotek</span>
      </div>

      {/* desktop: the table */}
      <div className={`${card} hidden overflow-hidden md:block`}>
        <table className="w-full text-base">
          <thead className="border-b border-hairline text-left text-sm text-subtle">
            <tr>
              {head('id', 'Jednotka')}
              <th className="px-5 py-3.5 font-semibold">Podlaží</th>
              <th className="px-5 py-3.5 font-semibold">Typ</th>
              {head('area', 'Plocha', true)}
              {head('rent', 'Nájem', true)}
              {head('price', 'Cena bez DPH', true)}
              <th className="px-5 py-3.5 font-semibold">Stav</th>
              <th className="w-12" />
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr
                key={u.id}
                tabIndex={0}
                onClick={() => onPick(u)}
                onKeyDown={(e) => e.key === 'Enter' && onPick(u)}
                className="group cursor-pointer border-b border-hairline outline-none last:border-0 hover:bg-page focus-visible:bg-page"
              >
                <td className="px-5 py-4 font-semibold text-heading transition-colors group-hover:text-primary">{u.id}</td>
                <td className="px-5 py-4">{floorBy(u.floor).label}</td>
                <td className="px-5 py-4">{typeLabel[u.type]}</td>
                <td className="px-5 py-4 text-right font-medium text-heading tabular-nums">{m2(u.area)}</td>
                <td className="px-5 py-4 text-right tabular-nums">{rentText(u)}</td>
                <td className="px-5 py-4 text-right tabular-nums">{priceText(u)}</td>
                <td className="px-5 py-4">
                  <Tag status={u.status} />
                </td>
                <td className="pr-5 text-primary">
                  <IconChevronRight size={20} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-subtle">Žádná jednotka neodpovídá výběru.</p>}
      </div>

      {/* phone: the same rows as cards */}
      <div className="grid gap-3 md:hidden">
        {rows.map((u) => (
          <button key={u.id} onClick={() => onPick(u)} className={`${cardLink} group flex items-center gap-4 p-4 text-left`}>
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2">
                <b className="font-semibold text-heading transition-colors group-hover:text-primary">Jednotka {u.id}</b>
                <Tag status={u.status} />
              </span>
              <span className="mt-1 block text-sm text-subtle">
                {floorBy(u.floor).label} · {m2(u.area)} · {rentText(u)}
              </span>
            </span>
            <IconChevronRight size={20} className="text-primary" />
          </button>
        ))}
        {rows.length === 0 && <p className={`${card} p-8 text-center text-subtle`}>Žádná jednotka neodpovídá výběru.</p>}
      </div>
    </div>
  )
}
