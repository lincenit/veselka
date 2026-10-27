import { useEffect, useLayoutEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  IconArrowDown,
  IconArrowRight,
  IconArrowUpRight,
  IconArrowsMaximize,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconMapPin,
  IconMenu2,
  IconNavigation,
  IconPhone,
  IconX,
} from '@tabler/icons-react'
import { Emph, Icon, Logo, parts, plain } from '../app'
import { LocationMap } from '../map'
import * as c from '../content'
import { Facade } from '../lamellas'
import { Lamellas, WipeEdge } from './decor'
import { initMotion } from './motion'

// Version 2 of the page: the same words (content.ts), laid out along the allrisk.cz system
// (DESIGN.md: 12px buttons, 16px cards, 24px bands). One colour rule in every section:
// blue is Allrisk - every coloured ground, headings, icons, tags; gold is the facade - the
// fins and every graphic, actions, emphasis, numbers. Gold is never a ground. Gold words are
// #8a6a1f on white (5:1) and gold-light on blue; the button gold carries white at 4.6:1.

const wrap = 'mx-auto max-w-7xl px-4 md:px-6 lg:px-8'
const gap = 'py-20 md:py-32'
const btn =
  'group inline-flex h-12 items-center justify-center gap-3 rounded-xl px-7 font-semibold transition-colors'
const goldBtn = `${btn} bg-[#937020] text-white hover:bg-[#7d5f1a]`
const display = 'font-display font-medium tracking-[-0.02em] text-balance'
const headline = `${display} text-[clamp(28px,4.5vw,44px)] leading-[1.08]`

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

function Header() {
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    let last = window.scrollY
    const on = () => {
      const y = window.scrollY
      const heroEnd = (document.querySelector('[data-hero]')?.clientHeight ?? 0) - 80
      setSolid(y > heroEnd)
      if (y < heroEnd) setHidden(false)
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

  const item =
    'inline-flex h-12 items-center rounded-xl px-4 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-white/14'

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-transform duration-300 ${hidden && !open ? '-translate-y-full' : ''}`}
      >
        <div
          aria-hidden
          className={`bg-blue-gradient absolute inset-0 -z-10 transition-opacity duration-300 ${solid ? '' : 'opacity-0'}`}
        />
        <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 text-white md:px-6">
          <Logo className="h-11" />
          <nav className="ml-auto hidden items-center gap-1 xl:flex">
            {c.nav.map((n) => (
              <a key={n.href} href={n.href} className={`${item} ${active === n.href ? 'bg-white/14' : ''}`}>
                {n.label}
              </a>
            ))}
          </nav>
          <a
            href="#kontakt"
            className="ml-auto hidden h-12 items-center gap-2 rounded-xl bg-white px-[22px] font-semibold whitespace-nowrap text-primary transition-colors hover:bg-tint sm:inline-flex xl:ml-0"
          >
            <IconPhone size={20} />
            Kontakt
          </a>
          <button
            className={`${item} ml-auto w-12 justify-center px-0 sm:ml-0 xl:hidden`}
            onClick={() => setOpen(true)}
            aria-label="Otevřít menu"
            aria-expanded={open}
          >
            <IconMenu2 size={24} />
          </button>
        </div>
      </header>

      {open && (
        <div className="bg-blue-gradient fixed inset-0 z-[100] overflow-y-auto text-white xl:hidden">
          <div className="flex h-20 items-center justify-between px-4 md:px-6">
            <Logo className="h-11" />
            <button className={`${item} w-12 justify-center px-0`} onClick={() => setOpen(false)} aria-label="Zavřít menu">
              <IconX size={24} />
            </button>
          </div>
          <nav className="mt-4 flex flex-col gap-1 px-4 pb-10 md:px-6">
            {c.nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setOpen(false)} className={item}>
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

function Eyebrow({ children, light = false }: { children: ReactNode; light?: boolean }) {
  return (
    <p
      className={`text-xs font-bold tracking-[0.15em] uppercase ${light ? 'text-gold-light' : 'text-[#8a6a1f]'}`}
    >
      {children}
    </p>
  )
}

function SectionHead({
  eyebrow,
  title,
  lead,
  light = false,
  className = '',
}: {
  eyebrow: string
  title: string
  lead?: string
  light?: boolean
  className?: string
}) {
  return (
    <div data-reveal className={`max-w-3xl ${className}`}>
      <Eyebrow light={light}>{eyebrow}</Eyebrow>
      <h2
        className={`mt-5 ${headline} [&_strong]:font-bold ${light ? 'text-white [&_strong]:text-gold-light' : 'text-heading [&_strong]:text-[#8a6a1f]'}`}
      >
        <Emph text={title} />
      </h2>
      {lead && (
        <p className={`mt-4 max-w-[62ch] text-lg leading-relaxed ${light ? 'text-blue-100' : ''}`}>
          {lead}
        </p>
      )}
    </div>
  )
}

/** The photo pulls away into a framed picture as the page scrolls; behind it the blue with
 *  the facade's gold fins, which line up meanwhile and carry on into the intro. */
function Hero() {
  return (
    <section id="top" data-hero className="bg-blue-gradient relative h-[100svh] min-h-[640px] overflow-hidden">
      <div data-hero-facade data-order="0" aria-hidden className="pointer-events-none absolute inset-0">
        <Facade gap={26} amp={0.16} opacity={0.6} />
      </div>
      <div data-hero-frame className="absolute inset-0 overflow-hidden bg-deep">
        <img
          data-hero-img
          src={c.hero.image}
          alt=""
          className="absolute inset-0 size-full object-cover object-[50%_60%]"
        />
        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/65 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-[#072e77]/90 via-[#072e77]/35 to-transparent" />
      </div>

      <div
        data-hero-copy
        className={`relative flex h-full flex-col justify-end pb-14 text-white lg:pb-20 ${wrap}`}
      >
        <div data-hero-fade>
          <Eyebrow light>{c.hero.eyebrow}</Eyebrow>
        </div>
        <h1
          className={`mt-6 ${display} text-[clamp(36px,7vw,68px)] leading-[1.04] [&_strong]:font-bold [&_strong]:text-gold-light lg:max-w-[64%]`}
        >
          {c.hero.title.map((line) => (
            <span key={line} className="block overflow-hidden pt-[0.12em]">
              <span data-hero-line className="block">
                <Emph text={line} />
              </span>
            </span>
          ))}
        </h1>
        <p data-hero-fade className="mt-6 max-w-[52ch] text-lg leading-relaxed text-white/85">
          {c.hero.lead}
        </p>
        <div data-hero-fade className="mt-10 flex flex-wrap items-center gap-3">
          <a href="#kontakt" className={goldBtn}>
            {c.hero.cta}
            <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
          </a>
          <a
            href="#projekt"
            className={`${btn} border-[1.5px] border-white/35 text-white hover:bg-white hover:text-primary`}
          >
            {c.hero.secondary}
            <IconArrowDown size={18} />
          </a>
        </div>
      </div>
    </section>
  )
}

/** The statement lights up word by word; the facts sit under it like a spec line. */
function Intro() {
  const words = parts(c.intro.title).flatMap((p) =>
    p.text
      .split(' ')
      .filter(Boolean)
      .map((w) => ({ w, strong: p.strong })),
  )
  return (
    <section id="projekt" className={`bg-blue-gradient relative -mt-px overflow-hidden text-white ${gap}`}>
      <Lamellas mask="foot" opacity={0.7} />
      <div className={`relative ${wrap}`}>
        <Eyebrow light>{c.intro.eyebrow}</Eyebrow>
        <p
          data-words
          className={`mt-6 max-w-5xl ${display} text-[clamp(28px,4.4vw,54px)] leading-[1.12]`}
        >
          {words.map((x, i) => (
            <span key={i} data-word className={x.strong ? 'font-bold text-gold-light' : ''}>
              {x.w}{' '}
            </span>
          ))}
        </p>
        <div className="mt-16 grid gap-12 lg:grid-cols-[5fr_6fr] lg:gap-20">
          <dl data-stagger className="grid content-start gap-0 border-t border-white/15">
            {c.hero.facts.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-6 border-b border-white/15 py-5">
                <dt className="text-xs font-bold tracking-[0.15em] text-blue-200 uppercase">{f.label}</dt>
                <dd className="text-right font-display text-xl font-medium">{f.value}</dd>
              </div>
            ))}
          </dl>
          <div data-stagger className="flex flex-col gap-6 text-lg leading-relaxed text-white/80 lg:max-w-[62ch]">
            {c.intro.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/** A sticky picture on the left: each reason passing on the right brings its photo in behind
 *  a fine gold line, the old one sinking back; a gold rail fills alongside. Below lg
 *  every reason carries its own photo. */
function Benefits() {
  const items = c.benefits.items
  return (
    <section id="benefity" className={`scroll-mt-16 bg-white ${gap}`}>
      <div className={wrap}>
        <SectionHead eyebrow={c.benefits.eyebrow} title={c.benefits.title} />
        <div className="mt-14 grid gap-16 lg:mt-4 lg:grid-cols-2">
          <div className="hidden lg:block">
            <div className="sticky top-[calc(50vh-min(34vh,19rem))] h-[min(68vh,38rem)] overflow-hidden rounded-3xl bg-blue-950">
              {items.map((b, i) => (
                <img
                  key={b.title}
                  data-benefit-img
                  src={b.image}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 size-full object-cover"
                  style={{ zIndex: i }}
                />
              ))}
              <WipeEdge name="benefits" />
              <span className="absolute bottom-5 left-5 z-30 rounded-xl bg-white/90 px-4 py-2 font-display text-lg font-medium text-heading backdrop-blur">
                <span data-benefit-count>01</span>
                <span className="text-subtle"> / {String(items.length).padStart(2, '0')}</span>
              </span>
            </div>
          </div>
          <ol data-benefits className="relative">
            <span aria-hidden className="absolute top-0 bottom-0 left-0 hidden w-px bg-hairline lg:block">
              <span data-benefit-rail className="block size-full origin-top bg-gold" />
            </span>
            {items.map((b, i) => (
              <li
                key={b.title}
                data-benefit
                className="flex flex-col justify-center py-6 lg:min-h-[62vh] lg:py-10 lg:pl-14"
              >
                <div data-wipe className="relative mb-6 aspect-[16/10] overflow-hidden rounded-2xl lg:hidden">
                  <img data-wipe-img src={b.image} alt="" loading="lazy" className="size-full object-cover" />
                  <WipeEdge />
                </div>
                <span className="font-display text-5xl font-medium text-[#8a6a1f]">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mt-5 flex items-center gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-tint text-primary">
                    <Icon name={b.icon} size={24} />
                  </span>
                  <h3 className="font-display text-[clamp(20px,3vw,26px)] leading-[1.15] font-bold tracking-[-0.02em] text-heading">
                    {b.title}
                  </h3>
                </div>
                <p className="mt-4 max-w-[46ch] text-lg leading-relaxed">{b.text}</p>
              </li>
            ))}
          </ol>
        </div>

        <FitOut />
      </div>
    </section>
  )
}

/** Shell & Core or Fit Out: a blue band with the gold fins, its photo wiped in. */
function FitOut() {
  const f = c.benefits.fitout
  return (
    <div
      data-reveal
      className="bg-blue-gradient relative isolate mt-20 grid overflow-hidden rounded-3xl text-white lg:mt-28 lg:grid-cols-2"
    >
      <div className="absolute inset-0 -z-10">
        <Lamellas mask="bottom" opacity={0.5} />
      </div>
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
        <span className="grid size-12 place-items-center rounded-xl bg-white text-primary">
          <Icon name="building" size={24} />
        </span>
        <h3 className={`mt-6 ${display} text-[clamp(24px,3.6vw,34px)] leading-[1.12] [&_strong]:font-bold [&_strong]:text-gold-light`}>
          <Emph text={f.title} />
        </h3>
        <p className="mt-4 max-w-[46ch] text-lg leading-relaxed text-white/85">{f.text}</p>
        <a href="#kontakt" className={`${goldBtn} mt-8 self-start`}>
          {c.hero.cta}
          <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
        </a>
      </div>
      <div data-wipe className="relative min-h-72 overflow-hidden">
        <img data-wipe-img src={f.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
        <WipeEdge />
      </div>
    </div>
  )
}

type Persona = (typeof c.audience.items)[number]

/** The personas stack: each card sticks under the header and the next one slides over it,
 *  the one beneath stepping back. */
function Audience() {
  const items = c.audience.items
  return (
    <section id="pro-koho" className={`scroll-mt-16 bg-page ${gap}`}>
      <div className={wrap}>
        <SectionHead eyebrow={c.audience.eyebrow} title={c.audience.title} lead={c.audience.lead} />
        <div className="mt-14 flex flex-col gap-6 lg:gap-10">
          {items.map((a, i) => (
            <article
              key={a.title}
              data-stack
              className="relative origin-top overflow-hidden rounded-3xl border border-hairline bg-white lg:sticky lg:h-[min(36rem,72vh)]"
              style={{ top: `calc(7rem + ${i * 1.5}rem)` }}
            >
              <div className="grid h-full gap-8 p-5 md:grid-cols-[6fr_5fr] md:grid-rows-[minmax(0,1fr)] md:p-8">
                <PersonaPhotos a={a} />
                <PersonaCopy a={a} n={i + 1} />
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

function PersonaPhotos({ a }: { a: Persona }) {
  return (
    <div className="grid h-72 grid-cols-2 grid-rows-[minmax(0,3fr)_minmax(0,2fr)] gap-3 md:h-full">
      {a.images.map((src, j) => (
        <div key={src} className={`min-h-0 overflow-hidden rounded-2xl bg-tint ${j === 0 ? 'col-span-2' : ''}`}>
          <img src={src} alt="" loading="lazy" className="size-full object-cover" />
        </div>
      ))}
    </div>
  )
}

function PersonaCopy({ a, n }: { a: Persona; n: number }) {
  return (
    <div className="flex flex-col justify-center">
      <p className="text-xs font-bold tracking-[0.15em] text-[#8a6a1f] uppercase">
        {String(n).padStart(2, '0')} / {String(c.audience.items.length).padStart(2, '0')}
      </p>
      <div className="mt-4 flex items-center gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary text-white">
          <Icon name={a.icon} size={24} />
        </span>
        <h3 className="font-display text-[clamp(20px,3vw,26px)] leading-[1.15] font-bold tracking-[-0.02em] text-heading">
          {a.title}
        </h3>
      </div>
      <p className="mt-4 max-w-md text-lg leading-relaxed">{a.text}</p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {a.kinds.map((k) => (
          <li key={k} className="rounded-md bg-tint px-3 py-1.5 text-sm font-semibold text-primary">
            {k}
          </li>
        ))}
      </ul>
    </div>
  )
}

// three columns at three speeds on desktop; the order reads left to right, top to bottom
const columns = [
  { shots: [0, 3, 6], speed: 40 },
  { shots: [1, 4], speed: -60 },
  { shots: [2, 5], speed: 90 },
]

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
    <section id="vizualizace" className={`scroll-mt-16 overflow-hidden bg-white ${gap}`}>
      <div className={wrap}>
        <SectionHead eyebrow={c.gallery.eyebrow} title={c.gallery.title} lead={c.gallery.lead} />
        <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {columns.map((col, ci) => (
            <div
              key={ci}
              data-parallax={col.speed}
              className={`flex flex-col gap-4 lg:gap-6 ${ci === 1 ? 'lg:pt-24' : ''} ${ci === 2 ? 'md:col-span-2 md:grid md:grid-cols-2 lg:col-span-1 lg:flex' : ''}`}
            >
              {col.shots.map((i) => {
                const s = shots[i]
                return (
                  <button
                    key={s.src}
                    data-wipe
                    onClick={() => setCur(i)}
                    className={`group relative overflow-hidden rounded-2xl bg-tint text-left text-white ${i === 0 || i === 4 || i === 5 ? 'aspect-[4/5]' : 'aspect-[4/3]'}`}
                  >
                    <img
                      data-wipe-img
                      src={s.src}
                      alt={s.caption}
                      loading="lazy"
                      className="absolute inset-0 size-full object-cover"
                    />
                    <WipeEdge />
                    <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/0 to-transparent" />
                    <span className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                      <span>
                        <span className="block text-xs font-bold tracking-[0.15em] text-gold-light uppercase">
                          {c.gallery.tabs[s.kind as 'exterior' | 'interior']}
                        </span>
                        <span className="mt-1 block font-semibold">{s.caption}</span>
                      </span>
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/15 backdrop-blur transition-colors group-hover:bg-white group-hover:text-primary">
                        <IconArrowsMaximize size={18} />
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
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
            className="max-h-[86vh] max-w-full animate-[fade_.4s_ease] rounded-2xl object-contain"
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

/** The copy and the three points beside the map, whose frame opens as it scrolls in. */
function Location() {
  return (
    <section id="lokalita" className={`scroll-mt-16 bg-page ${gap}`}>
      <div className={`grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 ${wrap}`}>
        <div>
          <SectionHead eyebrow={c.location.eyebrow} title={c.location.title} lead={c.location.text} />
          <ul data-stagger className="mt-10 flex flex-col gap-3">
            {c.location.points.map((p) => (
              <li key={p.title} className="flex gap-4 rounded-2xl border border-hairline bg-white p-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-tint text-primary">
                  <Icon name={p.icon} size={24} />
                </span>
                <div>
                  <h3 className="font-display text-[17.5px] leading-[1.3] font-bold text-heading">{p.title}</h3>
                  <p className="mt-1 leading-relaxed">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-8">
            <a href={c.location.navigate.href} target="_blank" rel="noreferrer" className={goldBtn}>
              <IconNavigation size={20} />
              {c.location.navigate.label}
            </a>
          </div>
        </div>
        <div data-map-frame className="relative h-[26rem] overflow-hidden rounded-3xl lg:h-[min(44rem,80vh)]">
          <LocationMap lat={c.location.pin.lat} lng={c.location.pin.lng} label="Allrisk VESELKA" tone="gold" />
        </div>
      </div>
    </section>
  )
}

/** Who builds it, on a blue band with the gold fins. */
function Partners() {
  return (
    <section
      id="partneri"
      className={`bg-blue-gradient relative scroll-mt-16 overflow-hidden text-white ${gap}`}
    >
      <Lamellas mask="right" opacity={0.5} />
      <div className={`relative ${wrap}`}>
        <SectionHead eyebrow={c.partners.eyebrow} title={c.partners.title} light />
        <ul data-stagger className="mt-14 grid gap-4 md:grid-cols-3">
          {c.partners.items.map((p) => (
            <li key={p.name} className="flex flex-col rounded-2xl bg-blue-900/70 p-6 ring-1 ring-white/15 backdrop-blur-sm lg:p-8">
              <div className="flex h-14 items-center">
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="h-12 w-auto object-contain" />
                ) : (
                  <Logo park={false} className="h-9 text-white" />
                )}
              </div>
              <p className="mt-8 text-xs font-bold tracking-[0.15em] text-gold-light uppercase">{p.role}</p>
              <p className="mt-2 font-display text-lg font-medium">{p.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

const socialBg: Record<string, string> = {
  facebook: 'group-hover:bg-[#1877F2]',
  instagram: 'group-hover:bg-[#DD2A7B]',
  linkedin: 'group-hover:bg-[#0A66C2]',
  youtube: 'group-hover:bg-[#FF0000]',
}

function Social() {
  return (
    <section id="socialni-site" className={`scroll-mt-16 bg-white ${gap}`}>
      <div className={`grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16 ${wrap}`}>
        <div>
          <SectionHead eyebrow={c.social.eyebrow} title={c.social.title} lead={c.social.lead} />
          <p data-reveal className="mt-6 font-display text-2xl font-medium text-primary">
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
              className="group flex items-start gap-4 rounded-2xl border border-hairline bg-white p-5 transition-[translate,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary hover:shadow-[0_10px_15px_-3px_rgb(13_31_91/0.1),0_4px_6px_-2px_rgb(13_31_91/0.05)]"
            >
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-xl bg-tint text-primary transition-colors group-hover:text-white ${socialBg[s.icon]}`}
              >
                <Icon name={s.icon} size={24} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between font-display text-[17.5px] font-bold text-heading">
                  {s.label}
                  <IconArrowUpRight size={20} className="text-subtle transition-colors group-hover:text-primary" />
                </span>
                <span className="mt-1 block text-[15px] leading-relaxed">{s.text}</span>
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

/** allrisk.cz's contact band: the blue block with the gold fins and the ways in, the form
 *  as a white card. */
function Contact() {
  const [sent, setSent] = useState(false)
  // no backend yet: the final version posts to a CMS submissions endpoint
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.info('Veselka poptávka', Object.fromEntries(new FormData(e.currentTarget)))
    setSent(true)
  }
  const ways = [
    { icon: IconPhone, value: c.contact.phone, label: 'Zavolejte nám', href: `tel:${c.contact.phone.replace(/\s/g, '')}` },
    { icon: IconMail, value: c.contact.email, label: 'Napište nám', href: `mailto:${c.contact.email}` },
  ]
  return (
    <section id="kontakt" className={`scroll-mt-16 bg-page ${gap}`}>
      <div className={wrap}>
        <div data-reveal className="bg-blue-gradient relative isolate overflow-hidden rounded-3xl px-5 py-12 text-white md:p-12 lg:p-16">
          <div className="absolute inset-0 -z-10">
            <Lamellas mask="bottom" opacity={0.5} />
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
            <div className="flex flex-col">
              <h2 className={`${headline} [&_strong]:font-bold [&_strong]:text-gold-light`}>
                <Emph text={c.contact.title} />
              </h2>
              <p className="mt-4 mb-12 text-lg leading-relaxed text-white/80">{c.contact.lead}</p>
              <div className="mt-auto flex flex-col gap-3">
                {ways.map(({ icon: I, value, label, href }) => (
                  <a
                    key={value}
                    href={href}
                    className="flex min-w-0 items-center gap-4 rounded-xl bg-blue-900/60 p-4 ring-1 ring-white/10 backdrop-blur-sm transition-colors hover:bg-blue-900/80"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-primary">
                      <I size={20} />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-lg font-semibold">{value}</span>
                      <span className="truncate text-sm font-medium text-white/70">{label}</span>
                    </span>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 text-text sm:p-8">
              {sent ? (
                <div className="grid min-h-[22rem] place-items-center text-center">
                  <div>
                    <span className="mx-auto grid size-12 place-items-center rounded-xl bg-[#937020] text-white">
                      <IconCheck size={24} />
                    </span>
                    <h3 className="mt-6 font-display text-2xl font-bold text-heading">{c.contact.success.title}</h3>
                    <p className="mt-2">{c.contact.success.text}</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="flex flex-col gap-4">
                  <input name="name" required autoComplete="name" placeholder="Jméno a příjmení *" className={field} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input name="email" type="email" required autoComplete="email" placeholder="E-mail *" className={field} />
                    <input name="phone" type="tel" required autoComplete="tel" placeholder="Telefon *" className={field} />
                  </div>
                  <textarea name="message" rows={4} placeholder="Zpráva" className={`${field} h-auto py-3.5`} />
                  <label className="flex gap-3 text-sm text-subtle">
                    <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-primary" />
                    {c.contact.consent}
                  </label>
                  <button className={`${goldBtn} w-full`}>
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

function Footer() {
  return (
    <footer className="bg-footer text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 md:px-6">
        <div className="flex flex-col gap-12 py-16 md:flex-row md:justify-between">
          <div className="flex flex-col gap-6 md:w-1/3">
            <Logo className="h-11 text-white" />
            <p className="max-w-[36ch] text-grey-400">{c.footer.intro}</p>
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
                <a href={`tel:${c.contact.phone.replace(/\s/g, '')}`} className={`flex items-center gap-3 ${footerLink}`}>
                  <IconPhone size={20} /> {c.contact.phone}
                </a>
                <a href={`mailto:${c.contact.email}`} className={`flex items-center gap-3 ${footerLink}`}>
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
