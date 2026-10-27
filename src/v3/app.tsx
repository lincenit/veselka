import { useEffect, useLayoutEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  IconArrowDown,
  IconArrowsMaximize,
  IconChevronLeft,
  IconChevronRight,
  IconMassage,
  IconCoffee,
  IconShoppingBag,
  IconBarbell,
  IconSofa,
  IconStethoscope,
  IconArrowRight,
  IconArrowUpRight,
  IconBrandFacebook,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconBrandYoutube,
  IconBuildingSkyscraper,
  IconCheck,
  IconDiamond,
  IconMail,
  IconMapPin,
  IconMenu2,
  IconNavigation,
  IconParking,
  IconPhone,
  IconPuzzle,
  IconRoad,
  IconX,
} from '@tabler/icons-react'
import { Facade, slats } from '../lamellas'
import { LocationMap } from '../map'
import { initMotion } from '../motion'
import logoSvg from '../logo.svg?raw'
import * as c from '../content'

// Version 3: version 1 with the intro and Partneři on blue (the hero is unchanged), every
// other section on the grey page, the renders behind them turned gold. The fins on blue stay
// blue. Each section gets exactly one gold element: Intro - the title's emphasis;
// Benefits - the Fit Out card; Pro koho - the icons; Vizualizace - the title's emphasis;
// Lokalita - the pin and its button; Sociální sítě - the handle; Kontakt - the send button.

const icons = {
  clinic: IconStethoscope,
  wellbeing: IconMassage,
  cafe: IconCoffee,
  shop: IconShoppingBag,
  fitness: IconBarbell,
  showroom: IconSofa,
  building: IconBuildingSkyscraper,
  road: IconRoad,
  diamond: IconDiamond,
  puzzle: IconPuzzle,
  parking: IconParking,
  linkedin: IconBrandLinkedin,
  instagram: IconBrandInstagram,
  facebook: IconBrandFacebook,
  youtube: IconBrandYoutube,
}

export function Icon({ name, size = 24 }: { name: string; size?: number }) {
  const I = icons[name as keyof typeof icons]
  return I ? <I size={size} stroke={1.5} /> : null
}

// The official file (Graphics/Skupina AR LOGA), recoloured by `color` and cropped to its ink.
const logo = logoSvg
  .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '')
  .replace(' id="Vrstva_1"', '')
  .replace(/#104798/g, 'currentColor')
  .replace(/font-family:[^;]*;/, 'font-family: Magistral;')
  .replace(/viewBox="[^"]*"/, 'viewBox="125 108 912 172"')

export function Logo({ className = '' }: { className?: string }) {
  return (
    <a
      href="#top"
      aria-label="Allrisk VESELKA"
      className={`block [&>svg]:h-full [&>svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: logo }}
    />
  )
}

export function App() {
  useLayoutEffect(() => initMotion(), [])
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Intro />
        <Benefits />
        <Audience />
        <Gallery />
        <Location />
        <Partners />
        <Social />
        <Contact />
      </main>
      <Footer />
    </>
  )
}

// allrisk.cz's header (`HeaderShell` + `header-items.ts` in @allrisk/ui): an 80px blue
// gradient bar, see-through over the hero, sliding away on a scroll down and back on a scroll up.
const barItem =
  'relative inline-flex h-12 items-center rounded-lg px-4 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-white/14'
const drawerRow =
  'flex h-12 w-full items-center rounded-lg px-4 text-base font-medium text-white transition-colors hover:bg-white/14'

function Header() {
  const [atTop, setAtTop] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    let last = window.scrollY
    // While the hero's curtain runs the bar stays see-through and in place; motion.ts
    // publishes where the curtain ends (data-end), without motion it is the top of the page.
    const heroEnd = () =>
      Number(document.querySelector<HTMLElement>('[data-hero]')?.dataset.end) || 24
    const on = () => {
      const y = window.scrollY
      const end = heroEnd()
      setAtTop(y < end)
      if (y < Math.max(80, end)) setHidden(false)
      else if (y - last > 6) setHidden(true)
      else if (y - last < -6) setHidden(false)
      last = y
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    c.nav.forEach((n) => {
      const el = document.querySelector(n.href)
      if (el) io.observe(el)
    })
    return () => {
      window.removeEventListener('scroll', on)
      io.disconnect()
    }
  }, [])

  useEffect(() => {
    document.documentElement.style.overflow = open ? 'hidden' : ''
  }, [open])

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 text-white transition-transform duration-300 ${hidden && !open ? '-translate-y-full' : ''}`}
      >
        <div
          aria-hidden
          className={`bg-blue-gradient absolute inset-0 -z-10 transition-opacity duration-300 ${atTop ? 'opacity-0' : ''}`}
        />
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
          <Logo className="h-11" />
          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {c.nav.map((n) => (
              <a
                key={n.href}
                href={n.href}
                className={`${barItem} ${active === n.href ? 'bg-white/14' : ''}`}
              >
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href="#kontakt"
            className={`hidden h-12 items-center gap-2 rounded-lg bg-white px-[22px] text-base font-semibold whitespace-nowrap transition-colors lg:inline-flex ${atTop ? 'text-gold hover:bg-gold-wash' : 'text-primary hover:bg-tint'}`}
          >
            <IconPhone size={20} />
            Kontakt
          </a>
          <button
            className={`${barItem} w-12 justify-center px-0 lg:hidden`}
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
          >
            <IconMenu2 size={24} />
          </button>
        </div>
      </header>

      {open && (
        <div className="bg-blue-gradient fixed inset-x-0 top-0 z-[100] h-dvh overflow-y-auto lg:hidden">
          <div className="mx-auto flex h-20 items-center justify-between px-6">
            <Logo className="h-11 text-white" />
            <button
              className={`${barItem} w-12 justify-center px-0`}
              onClick={() => setOpen(false)}
              aria-label="Zavřít menu"
            >
              <IconX size={24} />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-6 pb-10">
            {c.nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className={drawerRow}>
                {n.label}
              </a>
            ))}
            <a
              href="#kontakt"
              onClick={() => setOpen(false)}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-white font-semibold text-primary"
            >
              Kontakt
            </a>
          </nav>
        </div>
      )}
    </>
  )
}

const curtain = slats(22, 5)

function Hero() {
  return (
    <section
      id="top"
      data-hero
      className="relative z-20 h-[100svh] min-h-[640px] overflow-hidden bg-deep"
    >
      <img
        data-hero-img
        src={c.hero.image}
        alt=""
        className="absolute inset-0 size-full object-cover object-[50%_60%]"
      />
      {/* dark only where the header and the copy sit, and lightly - the building stays a bright
          photo; the copy's own shadow keeps it legible over the busy parts */}
      <div data-hero-shade className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/45 to-transparent" />
      <div data-hero-shade className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div data-hero-shade className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-black/20 to-transparent" />

      {/* the curtain: the facade's gold fins close over the hero and part again on the intro,
          which has slid in underneath; the gold backing fills the gaps between the leaning fins */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
        <div
          data-hero-backing
          className="absolute inset-0 opacity-0 bg-[linear-gradient(90deg,#8a6420,#d9a640_50%,#8a6420)]"
        />
        {curtain.map((s, i) => (
          <span
            key={s.i}
            data-hero-strip={i % 2 ? 'up' : 'down'}
            data-skew={s.skew}
            className="absolute -top-[10%] h-[120%]"
            style={{
              left: `${(i / curtain.length) * 100 - 2}%`,
              width: `${100 / curtain.length + 4}%`,
              background: `linear-gradient(180deg, #f6d47a, ${s.color} 45%, #6e5418)`,
              transform: `skewX(${s.skew}deg) translateY(${i % 2 ? -115 : 115}%)`,
            }}
          />
        ))}
      </div>

      <div
        data-hero-copy
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 [text-shadow:0_2px_20px_rgb(0_0_0/0.45)] lg:px-8 lg:pb-24"
      >
        <div data-hero-fade className="mb-5">
          <Eyebrow className="text-white/85">
            {c.hero.eyebrow}
          </Eyebrow>
        </div>
        <h1 className="font-display text-[clamp(40px,7vw,76px)] leading-[1.04] font-medium tracking-[-0.02em] text-white [&_strong]:font-bold [&_strong]:text-gold-light lg:max-w-[62%]">
          {c.hero.title.map((line) => (
            <span key={line} className="block overflow-hidden pt-[0.12em]">
              <span data-hero-line className="block">
                <Emph text={line} />
              </span>
            </span>
          ))}
        </h1>
        <p data-hero-fade className="mt-6 max-w-lg text-lg text-white/85">
          {c.hero.lead}
        </p>
        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-4">
          <a href="#kontakt" className={`${btn} bg-gold text-white hover:bg-[#a07c22]`}>
            {c.hero.cta}
            <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
          </a>
          <a
            href="#projekt"
            className="inline-flex items-center gap-2 px-3 py-4 text-sm text-white/85 hover:text-white"
          >
            <IconArrowDown size={16} className="animate-bounce" /> {c.hero.scroll}
          </a>
        </div>
      </div>
    </section>
  )
}

/** The kicker above every title. */
function Eyebrow({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <p
      className={`text-[13px] font-bold tracking-[0.16em] uppercase ${className}`}
    >
      {children}
    </p>
  )
}

/** A title's `*phrase*` is its emphasis. On white it is AllBlue as on allrisk.cz, gold in
 *  the gold section; on a blue band it is a light blue. The rest is always the heading ink. */
type Accent = 'blue' | 'gold'
const emph = (light: boolean, accent: Accent = 'blue') =>
  `[&_strong]:font-bold ${light ? (accent === 'gold' ? '[&_strong]:text-gold-light' : '[&_strong]:text-blue-300') : accent === 'gold' ? '[&_strong]:text-gold' : '[&_strong]:text-primary'}`

export const parts = (text: string) =>
  text
    .split(/(\*[^*]+\*)/)
    .filter(Boolean)
    .map((p) => ({ strong: p.startsWith('*'), text: p.replace(/\*/g, '') }))

export const plain = (text: string) => text.replace(/\*/g, '')

export function Emph({ text }: { text: string }) {
  return <>{parts(text).map((p, i) => (p.strong ? <strong key={i}>{p.text}</strong> : p.text))}</>
}

function SectionHead({
  eyebrow,
  title,
  lead,
  light = false,
  accent = 'blue',
}: {
  eyebrow: string
  title: string
  lead?: string
  light?: boolean
  accent?: Accent
}) {
  return (
    <div data-reveal className="max-w-3xl">
      <Eyebrow
        className={light ? 'text-blue-200' : 'text-primary'}
      >
        {eyebrow}
      </Eyebrow>
      <h2
        className={`mt-4 font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-balance lg:text-[40px] ${light ? 'text-white' : 'text-heading'} ${emph(light, accent)}`}
      >
        <Emph text={title} />
      </h2>
      {lead && (
        <p className={`mt-4 text-lg leading-relaxed ${light ? 'text-blue-100' : ''}`}>{lead}</p>
      )}
    </div>
  )
}

/** The sections' photo ground: the render turned gold, fading into the grey page towards the
 *  top - strongest at the very bottom. */
function Backdrop({ src }: { src: string }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <img src={src} alt="" loading="lazy" className="size-full object-cover brightness-110 contrast-110 grayscale" />
      {/* `color` keeps the photo's light and dark and lays the gold's hue over them */}
      <div className="absolute inset-0 bg-[#d4a640] mix-blend-color" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-page)_0%,var(--color-page)_45%,rgb(248_249_250/0.6)_75%,rgb(248_249_250/0)_100%)]" />
    </div>
  )
}

const wrap = 'mx-auto max-w-7xl px-5 lg:px-8'
const btn =
  'group inline-flex h-12 items-center justify-center gap-3 rounded-lg px-7 font-semibold transition-colors'

/** What the hero's curtain opens onto: the title, the two paragraphs side by side under it,
 *  at the copy's own height. motion.ts slides it in under the pinned hero. */
function Intro() {
  return (
    <section
      data-intro
      className="bg-blue-gradient relative overflow-hidden pt-[var(--intro-pad)] pb-20 text-white [--intro-pad:5rem] lg:pb-28 lg:[--intro-pad:7rem]"
    >
      {/* the living facade the curtain opens onto: loose fins that line up into the chevron and
          lean away from the pointer. It covers the screen's worth at the foot only - the top of
          the section is spent under the curtain, and the fins bend around their middle. */}
      <div
        data-hero-facade
        data-order="0"
        className="absolute inset-x-0 bottom-0 h-[100svh]"
      >
        <Facade gap={30} amp={0.12} opacity={0.2} tone="blue" />
      </div>
      {/* the anchor is the copy, not the section: the section's top is spent under the curtain */}
      <div id="projekt" className={`relative scroll-mt-24 ${wrap}`}>
        <div data-reveal className="max-w-4xl">
          <Eyebrow className="text-white/70">{c.intro.eyebrow}</Eyebrow>
          <h2
            className={`mt-4 font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-white lg:text-[40px] ${emph(true, 'gold')}`}
          >
            <Emph text={c.intro.title} />
          </h2>
        </div>
        <div
          data-stagger
          className="mt-10 grid gap-6 text-lg leading-relaxed text-white/80 md:grid-cols-2 md:gap-12 lg:mt-14 lg:gap-20"
        >
          {c.intro.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

/** On the gold render: white cards, the Fit Out card the section's one gold element. */
function Benefits() {
  const cards = [
    ...c.benefits.items.map((b) => ({ ...b, inverse: false })),
    {
      icon: 'building',
      image: c.benefits.fitout.image,
      title: plain(c.benefits.fitout.title),
      text: c.benefits.fitout.text,
      inverse: true,
    },
  ]
  return (
    <section
      id="benefity"
      data-hscroll
      className="relative scroll-mt-16 overflow-hidden bg-page py-24 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:py-0"
    >
      <Backdrop src="/img/ext-2.webp" />
      <div className={`relative flex w-full items-end justify-between gap-10 ${wrap}`}>
        <SectionHead eyebrow={c.benefits.eyebrow} title={c.benefits.title} />
        <div aria-hidden className="mb-3 hidden h-1 w-56 shrink-0 rounded-full bg-primary/15 lg:block">
          <div data-hscroll-progress className="h-full origin-left scale-x-0 rounded-full bg-primary" />
        </div>
      </div>
      <div
        data-hscroll-track
        className="relative mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-6 lg:overflow-visible lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
      >
        {cards.map((b) => (
          <article
            key={b.title}
            data-hscroll-card
            className={`flex w-[82vw] shrink-0 snap-start flex-col rounded-2xl p-6 sm:w-[24rem] lg:p-8 ${b.inverse ? 'bg-gold text-white' : 'border border-hairline bg-white'}`}
          >
            <div className="h-44 overflow-hidden rounded-xl lg:h-[min(13rem,22vh)]">
              <img src={b.image} alt="" loading="lazy" className="size-full object-cover" />
            </div>
            <div className="pt-6">
              <div className="flex items-center gap-4">
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-xl ${b.inverse ? 'bg-white text-gold' : 'bg-primary text-white'}`}
                >
                  <Icon name={b.icon} size={24} />
                </span>
                <h3
                  className={`text-xl leading-snug font-semibold ${b.inverse ? 'text-white' : 'text-heading'}`}
                >
                  {b.title}
                </h3>
              </div>
              <p className={`mt-3 leading-relaxed ${b.inverse ? 'text-white/90' : ''}`}>
                {b.text}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

type Persona = (typeof c.audience.items)[number]

function PersonaCopy({ a }: { a: Persona }) {
  return (
    <>
      <div className="flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold text-white">
          <Icon name={a.icon} size={24} />
        </span>
        <h3 className="text-2xl leading-snug font-semibold text-heading">{a.title}</h3>
      </div>
      <p className="mt-4 max-w-md text-lg leading-relaxed">{a.text}</p>
      <ul className="mt-5 flex flex-wrap gap-2">
        {a.kinds.map((k) => (
          <li key={k} className="rounded-md bg-tint px-3 py-1.5 text-sm font-semibold text-primary">
            {k}
          </li>
        ))}
      </ul>
    </>
  )
}

const photo = 'min-h-0 overflow-hidden rounded-xl bg-tint [&>img]:size-full [&>img]:object-cover'

/** The personas as a stack: each card sticks under the header and the next one rises over it
 *  from below, the one beneath stepping back (motion.ts, desktop). White cards with the
 *  allrisk.cz hairline on the grey page, their icons the section's gold. */
function Audience() {
  const items = c.audience.items
  return (
    <section id="pro-koho" className="scroll-mt-16 bg-page py-24 lg:py-32">
      <div className={wrap}>
        <SectionHead
          eyebrow={c.audience.eyebrow}
          title={c.audience.title}
          lead={c.audience.lead}
        />
        <div className="mt-14 flex flex-col gap-6 lg:gap-10">
          {items.map((a, i) => (
            <article
              key={a.title}
              data-stack
              className="relative origin-top overflow-hidden rounded-2xl border border-hairline bg-white lg:sticky lg:h-[min(34rem,72vh)]"
              style={{ top: `calc(7rem + ${i * 1.5}rem)` }}
            >
              {/* half and half: the main photo on the left; on the right the copy over the
                  other two photos side by side, again half and half */}
              <div className="grid h-full gap-6 p-5 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:p-6">
                <div className={`h-72 md:h-full ${photo}`}>
                  <img src={a.images[0]} alt="" loading="lazy" />
                </div>
                <div className="grid gap-6 md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)]">
                  <div className="flex flex-col justify-center md:px-2">
                    <PersonaCopy a={a} />
                  </div>
                  <div className="grid h-40 grid-cols-2 gap-3 md:h-auto">
                    {a.images.slice(1).map((src) => (
                      <div key={src} className={photo}>
                        <img src={src} alt="" loading="lazy" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <span
                data-stack-shade
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-page opacity-0"
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

// Seven renders as one mosaic (4 columns x 3 rows on desktop): the hero shot takes a 2x2 tile.
const tile = [
  'col-span-2 row-span-2',
  'col-span-2',
  '',
  '',
  '',
  '',
  'col-span-2',
]

/** The renders as a mosaic on a dark ground, each opening the full-screen viewer. */
function Gallery() {
  const shots = c.gallery.shots
  const [cur, setCur] = useState<number | null>(null)
  const go = (d: number) => setCur((i) => ((i ?? 0) + d + shots.length) % shots.length)

  useEffect(() => {
    if (cur === null) return
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCur(null)
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const shot = cur === null ? null : shots[cur]

  return (
    <section
      id="vizualizace"
      className="relative scroll-mt-16 overflow-hidden bg-page py-24 lg:py-32"
    >
      <Backdrop src="/img/ext-5.webp" />
      <div className={`relative ${wrap}`}>
        <SectionHead
          eyebrow={c.gallery.eyebrow}
          title={c.gallery.title}
          lead={c.gallery.lead}
          accent="gold"
        />
        <div
          data-stagger
          className="mt-14 grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[200px] lg:auto-rows-[min(260px,28vh)] lg:grid-cols-4 lg:gap-4"
        >
          {shots.map((s, i) => (
            <button
              key={s.src}
              onClick={() => setCur(i)}
              className={`group relative overflow-hidden rounded-2xl bg-tint text-left text-white ${tile[i] ?? ''}`}
            >
              <img
                src={s.src}
                alt={s.caption}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-80 transition-opacity duration-300 lg:opacity-0 lg:group-hover:opacity-100" />
              <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3 transition-[opacity,translate] duration-300 lg:translate-y-2 lg:opacity-0 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
                <span>
                  <span className="block text-xs font-bold tracking-[0.16em] text-blue-200 uppercase">
                    {c.gallery.tabs[s.kind as 'exterior' | 'interior']}
                  </span>
                  <span className="mt-1 block text-sm font-semibold sm:text-base">{s.caption}</span>
                </span>
                <span className="hidden size-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur sm:grid">
                  <IconArrowsMaximize size={18} />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {shot && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-footer/95 p-4 backdrop-blur"
          onClick={() => setCur(null)}
        >
          <img
            key={shot.src}
            src={shot.src}
            alt={shot.caption}
            className="animate-[fade_.4s_ease] max-h-[86vh] max-w-full rounded-2xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="absolute top-6 left-6 text-sm font-semibold text-white/80">
            {(cur ?? 0) + 1} / {shots.length} · {shot.caption}
          </span>
          {[
            { d: -1, I: IconChevronLeft, pos: 'left-4', label: 'Předchozí' },
            { d: 1, I: IconChevronRight, pos: 'right-4', label: 'Další' },
          ].map(({ d, I, pos, label }) => (
            <button
              key={d}
              onClick={(e) => {
                e.stopPropagation()
                go(d)
              }}
              aria-label={label}
              className={`absolute top-1/2 ${pos} grid size-12 -translate-y-1/2 place-items-center rounded-xl bg-white/10 text-white backdrop-blur transition-colors hover:bg-white/20`}
            >
              <I size={24} />
            </button>
          ))}
          <button
            onClick={() => setCur(null)}
            aria-label="Zavřít"
            className="absolute top-4 right-4 grid size-12 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20"
          >
            <IconX size={24} />
          </button>
        </div>
      )}
    </section>
  )
}

/** Gold: the copy and its three points as blocks, the map beside them half and half, its
 *  navigate button inside it. */
function Location() {
  return (
    <section id="lokalita" className="scroll-mt-16 bg-page py-24 lg:py-32">
      <div className={`grid gap-6 lg:grid-cols-2 lg:items-center ${wrap}`}>
        <div>
          <SectionHead
            eyebrow={c.location.eyebrow}
            title={c.location.title}
            lead={c.location.text}
          />
          <ul data-stagger className="mt-10 flex flex-col gap-3">
            {c.location.points.map((p) => (
              <li key={p.title} className="flex gap-4 rounded-2xl border border-hairline bg-white p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
                  <Icon name={p.icon} size={24} />
                </span>
                <div>
                  <h3 className="font-semibold text-heading">{p.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div data-reveal className="relative h-[24rem] overflow-hidden rounded-2xl lg:h-[min(40rem,75vh)]">
          <LocationMap
            lat={c.location.pin.lat}
            lng={c.location.pin.lng}
            label="Allrisk VESELKA"
            tone="gold"
          />
          {/* top left, clear of the map's own zoom buttons on the right */}
          <a
            href={c.location.navigate.href}
            target="_blank"
            rel="noreferrer"
            className={`${btn} absolute top-4 left-4 bg-gold text-white shadow-[0_12px_24px_-12px_rgb(110_84_24/0.6)] hover:bg-[#a07c22]`}
          >
            <IconNavigation size={20} />
            {c.location.navigate.label}
          </a>
        </div>
      </div>
    </section>
  )
}

/** Who builds it: the white logos on the blue band, the fins behind them. */
function Partners() {
  return (
    <section
      id="partneri"
      aria-label={plain(c.partners.title)}
      className="bg-blue-gradient relative scroll-mt-16 overflow-hidden"
    >
      {/* the living facade: loose fins the pointer blows about */}
      <div className="absolute inset-0">
        <Facade gap={26} amp={0.2} order={0} opacity={0.2} tone="blue" />
      </div>
      <ul
        data-stagger
        className={`relative grid items-center gap-12 py-16 sm:grid-cols-3 sm:gap-8 ${wrap}`}
      >
        {c.partners.items.map((p) => (
          <li key={p.name} className="flex justify-center">
            {p.logo ? (
              <img src={p.logo} alt={p.name} className="h-12 w-auto object-contain" />
            ) : (
              <Logo className="h-12 text-white" />
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

// the networks' own colours, as on allrisk.cz's `SocialIconButton`
const socialBg: Record<string, string> = {
  facebook: 'bg-[#1877F2]',
  instagram: 'bg-[linear-gradient(45deg,#F58529,#DD2A7B_50%,#8134AF)]',
  linkedin: 'bg-[#0A66C2]',
  youtube: 'bg-[#FF0000]',
}
const socialInk: Record<string, string> = {
  facebook: 'group-hover:text-[#1877F2]',
  instagram: 'group-hover:text-[#DD2A7B]',
  linkedin: 'group-hover:text-[#0A66C2]',
  youtube: 'group-hover:text-[#FF0000]',
}

function Social() {
  return (
    <section id="socialni-site" className="scroll-mt-16 bg-page py-24 lg:py-32">
      <div className={`grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16 ${wrap}`}>
        <div>
          <SectionHead
            eyebrow={c.social.eyebrow}
            title={c.social.title}
            lead={c.social.lead}
          />
          <p data-reveal className="mt-8 font-display text-2xl font-medium text-gold">
            {c.social.handle}
          </p>
        </div>
        <div data-stagger className="grid gap-4 sm:grid-cols-2">
          {c.contact.socials.map((s) => (
            <a
              key={s.label}
              href={s.href}
              target="_blank"
              rel="noreferrer"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-hairline bg-white p-6 transition-[translate,border-color] duration-300 hover:-translate-y-1 hover:border-transparent lg:p-8"
            >
              <span
                aria-hidden
                className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${socialBg[s.icon]}`}
              />
              <span className="relative flex items-start justify-between">
                <span
                  className={`grid size-12 place-items-center rounded-xl text-white transition-colors duration-300 group-hover:bg-none group-hover:bg-white ${socialBg[s.icon]} ${socialInk[s.icon]}`}
                >
                  <Icon name={s.icon} size={24} />
                </span>
                <IconArrowUpRight
                  size={24}
                  className="text-subtle transition-[color,translate] duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
                />
              </span>
              <span className="relative mt-10 text-xl font-semibold text-heading transition-colors duration-300 group-hover:text-white">
                {s.label}
              </span>
              <span className="relative mt-1 transition-colors duration-300 group-hover:text-white/85">
                {s.text}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}

const field =
  'h-[54px] w-full rounded-2xl border-[1.5px] border-hairline bg-white px-4 text-heading placeholder:text-subtle outline-none transition focus:border-primary focus:bg-tint focus:ring-[3px] focus:ring-primary/12'

/** allrisk.cz's `ContactBand`: the blue block with the title and the ways in, the form as a
 *  white card. The spaces' details are not public yet, so the form asks only for a way back. */
function Contact() {
  const [sent, setSent] = useState(false)
  // No backend yet: the final version posts to a CMS submissions endpoint (as energie does).
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.info('Veselka poptávka', Object.fromEntries(new FormData(e.currentTarget)))
    setSent(true)
  }
  const boxes = [
    {
      icon: IconPhone,
      value: c.contact.phone,
      label: 'Zavolejte nám',
      href: `tel:${c.contact.phone.replace(/\s/g, '')}`,
    },
    { icon: IconMail, value: c.contact.email, label: 'Napište nám', href: `mailto:${c.contact.email}` },
  ]
  return (
    <section id="kontakt" className="relative scroll-mt-16 overflow-hidden bg-page py-24 lg:py-32">
      <Backdrop src="/img/ext-1.webp" />
      <div className={`relative ${wrap}`}>
        <div
          data-reveal
          className="bg-blue-gradient relative isolate overflow-hidden rounded-3xl px-6 py-12 md:p-12"
        >
          <div className="absolute inset-0 -z-10">
            <Facade gap={30} amp={0.14} order={0} opacity={0.18} tone="blue" />
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col">
              <h2
                className="font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-white lg:text-[40px] [&_strong]:font-bold"
              >
                <Emph text={c.contact.title} />
              </h2>
              <p className="mt-4 mb-12 leading-[1.6] text-white/80">{c.contact.lead}</p>
              <div data-stagger className="mt-auto flex flex-col gap-4">
                {boxes.map(({ icon: I, value, label, href }) => (
                  <a
                    key={value}
                    href={href}
                    className="flex min-w-0 items-center gap-4 rounded-xl bg-white/12 p-4 transition-colors hover:bg-white/20"
                  >
                    <span className="grid size-8 shrink-0 place-items-center text-white">
                      <I size={24} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-[18px] leading-7 font-semibold text-white">
                        {value}
                      </span>
                      <span className="truncate text-sm leading-5 font-medium text-white/75">
                        {label}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 sm:p-8">
              {sent ? (
                <div className="grid min-h-[22rem] place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-xl bg-primary text-white">
                      <IconCheck size={24} />
                    </span>
                    <h3 className="mt-6 text-2xl font-semibold text-heading">
                      {c.contact.success.title}
                    </h3>
                    <p className="mt-2">{c.contact.success.text}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-4">
                  <input
                    name="name"
                    required
                    autoComplete="name"
                    placeholder="Jméno a příjmení *"
                    className={field}
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="E-mail *"
                      className={field}
                    />
                    <input
                      name="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="Telefon *"
                      className={field}
                    />
                  </div>
                  <textarea
                    name="message"
                    rows={4}
                    placeholder="Zpráva"
                    className={`${field} h-auto py-3.5`}
                  />
                  <label className="flex gap-3 text-sm text-subtle">
                    <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-primary" />
                    {c.contact.consent}
                  </label>
                  <button className={`${btn} w-full bg-gold text-white hover:bg-[#a07c22]`}>
                    {c.contact.submit}
                    <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const footerLink = 'text-base text-grey-400 transition-colors hover:text-white'

// @allrisk/ui `SocialIconButton`: a 48px glass square that takes the network's colour on hover.
const socialHover: Record<string, string> = {
  facebook: 'hover:bg-[#1877F2]',
  instagram: 'hover:bg-[#833AB4]',
  linkedin: 'hover:bg-[#0A66C2]',
  youtube: 'hover:bg-[#FF0000]',
}

/** allrisk.cz's footer (`FooterShell`): brand column, link columns, hairline, legal row. */
function Footer() {
  return (
    <footer className="bg-grey-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6">
        <div data-stagger className="flex flex-col gap-12 py-16 md:flex-row md:justify-between">
          <div className="flex flex-col gap-6 md:w-1/3">
            <Logo className="h-11 text-white" />
            <p className="max-w-[36ch] text-grey-400">{c.footer.intro}</p>
            <nav aria-label="Sociální sítě" className="flex gap-4">
              {c.contact.socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className={`inline-flex size-12 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white transition-colors ${socialHover[s.icon]}`}
                >
                  <Icon name={s.icon} size={24} />
                </a>
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-12 md:flex-row md:gap-24">
            <nav aria-label={c.footer.columns.nav} className="flex flex-col gap-4">
              <h2 className="font-display text-xl font-medium">{c.footer.columns.nav}</h2>
              <div className="flex flex-col gap-3">
                {c.nav.map((n) => (
                  <a key={n.href} href={n.href} className={footerLink}>
                    {n.label}
                  </a>
                ))}
              </div>
            </nav>
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-xl font-medium">{c.footer.columns.contact}</h2>
              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${c.contact.phone.replace(/\s/g, '')}`}
                  className={`flex items-center gap-3 ${footerLink}`}
                >
                  <IconPhone size={20} /> {c.contact.phone}
                </a>
                <a
                  href={`mailto:${c.contact.email}`}
                  className={`flex items-center gap-3 ${footerLink}`}
                >
                  <IconMail size={20} /> {c.contact.email}
                </a>
                <p className="flex items-center gap-3 text-grey-400">
                  <IconMapPin size={20} /> {plain(c.location.title)}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-white/10" />
        <div className="flex flex-col gap-4 pb-6 text-grey-400 md:flex-row md:items-center">
          <div className="flex-1">
            © {new Date().getFullYear()} {c.footer.copyright}
          </div>
          <nav aria-label="Právní informace" className="flex flex-col gap-4 md:flex-row">
            {c.footer.legal.map((l) => (
              <a key={l.label} href={l.href} className="transition-colors hover:text-white">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  )
}
