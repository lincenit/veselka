import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentProps,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react'
import {
  IconChevronLeft,
  IconChevronRight,
  IconMassage,
  IconKey,
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
import { IntroEdge, IntroPanel, Zigzag } from './zigzag'
import { LocationMap } from './map'
import { OfferStage } from './offer'
import { initMotion } from './motion'
import logoSvg from './logo.svg?raw'
import * as c from './content'

const icons = {
  clinic: IconStethoscope,
  wellbeing: IconMassage,
  cafe: IconCoffee,
  shop: IconShoppingBag,
  fitness: IconBarbell,
  key: IconKey,
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

export function Icon({
  name,
  size = 24,
  stroke = 1.5,
}: {
  name: string
  size?: number
  stroke?: number
}) {
  const I = icons[name as keyof typeof icons]
  return I ? <I size={size} stroke={stroke} /> : null
}

/** A card's icon again, large and pale, whole in its top right corner, as allrisk.cz's
 *  service cards (`IconTile`) have it. The card is `relative isolate`; `className` places
 *  and colours it. */
function Watermark({ name, className }: { name: string; className: string }) {
  return (
    <span aria-hidden className={`pointer-events-none absolute -z-1 ${className}`}>
      <Icon name={name} size={104} stroke={1.1} />
    </span>
  )
}

// The official file (Graphics/Skupina AR LOGA), recoloured by `color` and cropped to its ink.
const logo = logoSvg
  .replace(/<\?xml[^>]*>|<!--[\s\S]*?-->/g, '')
  .replace(' id="Vrstva_1"', '')
  .replace(/#104798/g, 'currentColor')
  .replace(/font-family:[^;]*;/, 'font-family: Magistral;')
  .replace(/viewBox="[^"]*"/, 'viewBox="125 108 912 172"')

// The project's own logo, Allrisk VESELKA without the park's line under it - the developer's,
// shown among the partners. No separate file came with the brand, so it is the same artwork cut short.
const projectLogo = logo
  .replace(/<text[\s\S]*?<\/text>/, '')
  .replace(/viewBox="[^"]*"/, 'viewBox="125 108 912 114"')

/** The header's logo: the brand's own white file (Veselka logo_BLP_white), whose park line is
 *  set wider than the SVG's live text manages. */
function HeaderLogo() {
  return (
    <a href="#top" className="block shrink-0">
      <img
        src="/img/logo-blp-white.webp"
        alt="Allrisk VESELKA Business & Lifestyle Park"
        className="h-10 w-auto lg:h-11"
      />
    </a>
  )
}

export function Logo({ className = '', park = true }: { className?: string; park?: boolean }) {
  return (
    <a
      href="#top"
      aria-label="Allrisk VESELKA"
      className={`block [&>svg]:h-full [&>svg]:w-auto ${className}`}
      dangerouslySetInnerHTML={{ __html: park ? logo : projectLogo }}
    />
  )
}


export function App() {
  useLayoutEffect(() => initMotion(), [])
  return (
    <>
      <Header />
      <main>
        {/* the intro carries its own ground in, over the hero (motion.ts) */}
        <div className="relative overflow-hidden">
          <SlidesProvider>
            <Hero />
          </SlidesProvider>
          <Intro />
          <IntroEdge />
        </div>
        {/* the sections' column, as allrisk.cz's `Sections`: --gap from the intro and the footer */}
        <div className="bg-page py-[var(--sec)]">
          <Benefits />
          <Audience />
          <Gallery />
          <Offer />
          <Location />
          <Partners />
          <Social />
          <Contact />
        </div>
      </main>
      <Footer />
    </>
  )
}

// allrisk.cz's header (`HeaderShell` + `header-items.ts` in @allrisk/ui): an 80px blue
// gradient bar, see-through over the hero, sliding away on a scroll down and back on a scroll up.
const barItem =
  'relative inline-flex h-12 items-center rounded-lg px-4 text-base font-medium whitespace-nowrap text-white transition-colors hover:bg-white/14'
// the menu and close buttons: a 48px square holding the 24px icon (barItem's padding would
// squeeze the icon to 16px wide)
const barIcon =
  'relative grid size-12 shrink-0 place-items-center rounded-lg text-white transition-colors hover:bg-white/14'
const drawerRow =
  'flex h-12 w-full items-center rounded-lg px-4 text-base font-medium text-white transition-colors hover:bg-white/14'

function Header() {
  const [atTop, setAtTop] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    let last = window.scrollY
    // While the hero's scene runs the bar stays see-through and in place; motion.ts
    // publishes where the scene ends (data-end), without motion it is the top of the page.
    const heroEnd = () =>
      Number(document.querySelector<HTMLElement>('[data-hero]')?.dataset.end) || 24
    const on = () => {
      const y = window.scrollY
      const end = heroEnd()
      setAtTop(y < end)
      // back over the hero no section is being read
      if (y < 24) setActive('')
      if (y < Math.max(80, end)) setHidden(false)
      else if (y - last > 6) setHidden(true)
      else if (y - last < -6) setHidden(false)
      last = y
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    const io = new IntersectionObserver(
      // a section still hidden (the intro, waiting over the hero) is not the one read
      (es) =>
        es.forEach(
          (e) =>
            e.isIntersecting &&
            getComputedStyle(e.target).visibility !== 'hidden' &&
            setActive(`#${e.target.id}`),
        ),
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
          <HeaderLogo />
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
            className={`hidden h-12 items-center gap-2 rounded-lg bg-white px-[22px] text-base font-semibold whitespace-nowrap transition-colors lg:inline-flex text-primary hover:bg-tint`}
          >
            <IconPhone size={20} />
            Kontakt
          </a>
          <button
            className={`${barIcon} lg:hidden`}
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
            <HeaderLogo />
            <button className={barIcon} onClick={() => setOpen(false)} aria-label="Zavřít menu">
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

// The hero runs the renders one after another, each coming in from the right behind a "<"
// edge. On the scroll the intro comes in over it from the right.

const heroSection = 'relative z-20 h-[100svh] min-h-[640px] overflow-hidden'
const slideMs = 6500

// each photo's state: the one showing, the one it replaced (still under it while the new one
// comes in) and the rest, out of sight. The new one comes in from the right behind a "<" edge;
// every photo draws slowly closer while it shows and resets only once it is gone.
const slideLook = {
  on: 'z-[2] [clip-path:polygon(-30%_0,120%_0,120%_100%,-30%_100%,-50%_50%)] [transition:clip-path_1.3s_cubic-bezier(0.7,0,0.2,1),scale_9s_linear] motion-safe:scale-110',
  was: 'z-[1] [clip-path:polygon(-30%_0,120%_0,120%_100%,-30%_100%,-50%_50%)] motion-safe:scale-110',
  off: 'opacity-0 [clip-path:polygon(120%_0,120%_0,120%_100%,120%_100%,100%_50%)] [transition:none]',
}

/** Next slide every `ms`; remembers the one before, which stays under the new one. */
function useSlides(count: number, ms: number) {
  const [{ at, was }, set] = useState({ at: 0, was: -1 })
  const go = (i: number) => set((s) => (i === s.at ? s : { at: i, was: s.at }))
  // the photos change only while the page rests at its top: once it scrolls, the hero is
  // leaving (the intro coming in over it), and a photo changing under that is noise
  const [still, setStill] = useState(true)
  // each return to the top starts the photo's time afresh
  const [round, setRound] = useState(0)
  useEffect(() => {
    let top = true
    const on = () => {
      const now = window.scrollY < 8
      if (now === top) return
      top = now
      setStill(now)
      if (now) setRound((r) => r + 1)
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  useEffect(() => {
    if (!still) return
    const t = setTimeout(() => go((at + 1) % count), ms)
    return () => clearTimeout(t)
  }, [at, count, ms, still, round])
  return { at, was, go, still, round }
}

function Hero() {
  return (
    <section
      id="top"
      data-hero
      className={heroSection}
    >
      {/* isolated, so the photos' and the panel's layers stay under the copy */}
      <div className="absolute inset-0 isolate overflow-hidden bg-deep">
        <HeroSlides />
        {/* dark only where the header and the copy sit, and lightly - the building stays a bright
            photo; the copy's own shadow keeps it legible over the busy parts */}
        <div
          data-hero-shade
          className="absolute inset-x-0 top-0 z-[3] h-[30%] bg-gradient-to-b from-black/45 to-transparent"
        />
        <div
          data-hero-shade
          className="absolute inset-x-0 bottom-0 z-[3] h-[60%] bg-gradient-to-t from-black/60 via-black/20 to-transparent"
        />
        <div
          data-hero-shade
          className="absolute inset-y-0 left-0 z-[3] w-3/4 bg-gradient-to-r from-black/50 via-black/20 to-transparent"
        />
      </div>

      <div
        data-hero-copy
        // on a phone: clear of the intro's strip on the right
        className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-16 [text-shadow:0_2px_4px_rgb(0_0_0/0.35),0_4px_32px_rgb(0_0_0/0.65)] lg:px-8 lg:pb-24 pr-16"
      >
        <div data-hero-fade className="mb-5">
          <Eyebrow className="text-white/85">{c.hero.eyebrow}</Eyebrow>
        </div>
        <h1
          // clear of the intro's strip on the right (from 76% of the width)
          className="font-display text-[clamp(40px,7vw,76px)] leading-[1.04] font-medium tracking-[-0.02em] text-white [&_strong]:font-bold [&_strong]:text-gold-light max-lg:text-[34px] lg:max-w-[calc(76vw-11rem)] lg:text-[clamp(36px,3.6vw,56px)]"
        >
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
        </div>
        <SlideBars />
      </div>
    </section>
  )
}

// the slideshow's state is shared by the photos (in the frame) and the bars (with the copy)
const SlidesContext = createContext<ReturnType<typeof useSlides> | null>(null)

function HeroSlides() {
  const slides = c.hero.slides
  const { at, was } = useSlidesState()
  return (
    // motion.ts draws the whole stack closer on the scroll, as it did the single photo
    <div data-hero-img className="absolute inset-0">
      {slides.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt=""
          loading={i ? 'lazy' : undefined}
          className={`absolute inset-0 size-full object-cover ${i === 0 ? 'object-[50%_60%]' : ''} ${
            i === at ? slideLook.on : i === was ? slideLook.was : slideLook.off
          }`}
        />
      ))}
    </div>
  )
}

/** Where the slideshow is - the caption, the count and a bar per photo, each jumping to it. */
function SlideBars() {
  const slides = c.hero.slides
  const { at, go, still, round } = useSlidesState()
  return (
    // kept under the buttons: the intro's panel takes the hero's right side
    <div
      data-hero-fade
      className="mt-8 w-full max-w-80 [text-shadow:none] lg:mt-12"
    >
      {/* under the buttons only the bars: the count and the caption are for screen readers */}
      <p
        aria-live="polite"
        className="mb-3 hidden items-baseline gap-3 text-sm text-white/85 [text-shadow:0_1px_12px_rgb(0_0_0/0.5)]"
      >
        <span className="font-display text-base font-medium text-white">
          {String(at + 1).padStart(2, '0')}
          <span className="text-white/55"> / {String(slides.length).padStart(2, '0')}</span>
        </span>
        {slides[at].caption}
      </p>
      <div className="flex gap-1.5">
        {slides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => go(i)}
            aria-label={s.caption}
            aria-current={i === at}
            className="group h-6 flex-1 py-2.5"
          >
            <span className="block h-1 overflow-hidden rounded-full bg-white/30 transition-colors group-hover:bg-white/50">
              {i < at && <span className="block size-full bg-white" />}
              {i === at && <Fill key={`${at}-${round}`} ms={slideMs} paused={!still} />}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

function useSlidesState() {
  const s = useContext(SlidesContext)
  if (!s) throw new Error('outside SlidesProvider')
  return s
}

function SlidesProvider({ children }: { children: ReactNode }) {
  const s = useSlides(c.hero.slides.length, slideMs)
  return <SlidesContext.Provider value={s}>{children}</SlidesContext.Provider>
}

/** A bar filling from the left over `ms`, held while `paused`. */
function Fill({ ms, paused = false }: { ms: number; paused?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null)
  const anim = useRef<Animation | null>(null)
  useEffect(() => {
    const a = ref.current?.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], {
      duration: ms,
      easing: 'linear',
      fill: 'forwards',
    })
    anim.current = a ?? null
    return () => a?.cancel()
  }, [ms])
  useEffect(() => {
    if (paused) anim.current?.pause()
    else anim.current?.play()
  }, [paused])
  return <span ref={ref} className="block size-full origin-left bg-gold-light" />
}

/** The kicker above every title. */
function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[13px] font-bold tracking-[0.16em] uppercase ${className}`}>{children}</p>
  )
}

/** A title's `*phrase*` is its emphasis. On white it is AllBlue as on allrisk.cz, gold in
 *  the gold section; on a blue band it is a light blue. The rest is always the heading ink. */
type Accent = 'blue' | 'gold'
const emph = (light: boolean, accent: Accent = 'blue') =>
  `[&_strong]:font-bold ${light ? '[&_strong]:text-blue-300' : accent === 'gold' ? '[&_strong]:text-gold' : '[&_strong]:text-primary'}`

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
        className={light ? 'text-blue-200' : accent === 'gold' ? 'text-gold' : 'text-primary'}
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

/** The sections' photo ground: the render in black and white under a light veil, a screen high
 *  at most and set in the middle of the section, fading into the grey page above and below.
 *  `fixed` holds it on the screen instead, the whole way through the section, while the
 *  content scrolls over it. */
function Backdrop({
  src,
  fixed = false,
  held = false,
}: {
  src: string
  fixed?: boolean
  held?: boolean
}) {
  // the page alone in the top and bottom quarter; between them the photo comes in from
  // nothing, fullest at the middle
  const fade = '[mask-image:linear-gradient(180deg,transparent_25%,#000_50%,transparent_75%)]'
  const ground = (
    <>
      <img src={src} alt="" loading="lazy" className="size-full object-cover grayscale" />
      <div className="absolute inset-0 bg-page/75" />
    </>
  )
  if (fixed)
    return (
      // clip, not hidden: a hidden overflow would become the sticky layer's scroller
      <div aria-hidden className="absolute inset-0 overflow-clip">
        <div className={`sticky top-0 h-[100lvh] ${fade}`}>{ground}</div>
      </div>
    )
  // inside a pinned row: one screen centred on the row, so it is held still with it
  if (held)
    return (
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-1/2 h-[100lvh] -translate-y-1/2 ${fade}`}
      >
        {ground}
      </div>
    )
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <div className={`absolute inset-x-0 top-1/2 h-[min(100%,100lvh)] -translate-y-1/2 ${fade}`}>
        {ground}
      </div>
    </div>
  )
}

const wrap = 'mx-auto max-w-7xl px-5 lg:px-8'

/** A band, as @allrisk/ui's `Section`: --sec top and bottom (styles.css), so the gap between
 *  any two sections is always --gap, whatever their ground. */
function Section({ className = '', ...props }: ComponentProps<'section'>) {
  return <section className={`scroll-mt-16 py-[var(--sec)] ${className}`} {...props} />
}

const btn =
  'group inline-flex h-12 items-center justify-center gap-3 rounded-lg px-7 font-semibold transition-colors'

/** What the hero gives way to: the title, the two paragraphs side by side under it,
 *  at the copy's own height. motion.ts slides it in under the pinned hero. */
function Intro() {
  return (
    <section
      data-intro
      className={`relative z-30 flex flex-col justify-center pt-[var(--intro-pad)] pb-[var(--sec)] text-white [--intro-pad:5rem] lg:[--intro-pad:7rem]`}
    >
      <IntroPanel />
      {/* the anchor is the copy, not the section: the section's top is spent under
          the hero */}
      <div id="projekt" data-intro-copy className={`relative w-full scroll-mt-24 ${wrap}`}>
        {/* 42rem at most: the copy ends before the ribbons on the right, a laptop's width too */}
        <div data-reveal className="max-w-2xl">
          <Eyebrow className="text-white/70">{c.intro.eyebrow}</Eyebrow>
          <h2
            className={`mt-4 font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-white lg:text-[40px] ${emph(true)}`}
          >
            <Emph text={c.intro.title} />
          </h2>
        </div>
        <div
          data-stagger
          className="mt-8 grid max-w-2xl gap-5 text-lg leading-relaxed text-white/80 lg:mt-10"
        >
          {c.intro.paragraphs.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

const photo = 'min-h-0 overflow-hidden rounded-xl bg-tint [&>img]:size-full [&>img]:object-cover'

/** Six reasons on a horizontal run: the row of cards is held in the middle of the screen and
 *  they pass from right to left as the page scrolls (motion.ts, data-hscroll) - on a phone as
 *  well. A reason is a white card, its photo on top. */
function Benefits() {
  const items = c.benefits.items
  return (
    <Section id="benefity" className="relative overflow-hidden bg-page">
      <div className={`relative ${wrap}`}>
        <SectionHead eyebrow={c.benefits.eyebrow} title={c.benefits.title} accent="gold" />
      </div>
      {/* the title scrolls away as Pro koho's does; only the cards are held, in the middle of
          the screen */}
      <div data-hscroll className="relative mt-10 lg:mt-14">
        {/* the ground goes with the held row, so it stays put while the cards pass */}
        <Backdrop src="/img/ext-2.webp" held />
        <div
          data-hscroll-track
          className="relative flex gap-4 px-5 lg:gap-6 lg:px-[max(2rem,calc((100vw-80rem)/2+2rem))]"
        >
          {items.map((b, i) => (
            <article
              key={b.title}
              data-hscroll-card
              className="flex w-[85vw] shrink-0 flex-col rounded-2xl border border-hairline bg-white p-4 sm:w-[26rem] md:p-6 lg:w-[28rem]"
            >
              {/* one height for every photo, lower on a short screen so the held row fits it;
                  the cards in a row share the tallest text */}
              <div className={`h-[min(15rem,30svh)] lg:h-[min(18rem,calc(100vh-27rem))] ${photo}`}>
                <img src={b.image} alt="" loading="lazy" />
              </div>
              {/* as allrisk.cz's service cards: the icon on its plate, the title and the text
                  under it, the icon again in the corner */}
              <div className="relative isolate pt-5 lg:pt-6">
                <Watermark name={b.icon} className="top-5 right-0 text-gold-wash lg:top-6" />
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gold-wash text-gold">
                  <Icon name={b.icon} size={28} />
                </span>
                <h3 className="mt-4 text-xl leading-snug font-semibold text-heading">
                  {i + 1}. {b.title}
                </h3>
                <p className="mt-2 leading-relaxed">{b.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </Section>
  )
}

type Persona = (typeof c.audience.items)[number]

function PersonaCopy({ a }: { a: Persona }) {
  return (
    <>
      <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-tint text-primary">
        <Icon name={a.icon} size={28} />
      </span>
      <h3 className="mt-5 text-xl leading-snug font-semibold text-heading lg:mt-6 lg:text-2xl">
        {a.title}
      </h3>
      <p className="mt-3 max-w-md leading-relaxed lg:mt-4 lg:text-lg">{a.text}</p>
      <ul className="mt-4 flex flex-wrap gap-2 lg:mt-5">
        {a.kinds.map((k) => (
          <li key={k} className="rounded-md bg-tint px-3 py-1.5 text-sm font-semibold text-primary">
            {k}
          </li>
        ))}
      </ul>
    </>
  )
}

/** The personas as a stack: each card sticks under the header and the next one rises over it
 *  from below, the one beneath stepping back (motion.ts). White cards with the allrisk.cz
 *  hairline on the grey page. */
function Audience() {
  const items = c.audience.items
  return (
    <Section id="pro-koho" className="bg-page">
      <div className={wrap}>
        <SectionHead eyebrow={c.audience.eyebrow} title={c.audience.title} />
        <div className="mt-14 flex flex-col gap-6 lg:gap-10">
          {items.map((a, i) => (
            <article
              key={a.title}
              data-stack
              // on a phone they stack too, close under the top and compact enough to fit
              className="sticky top-[calc(1rem+var(--i)*0.75rem)] origin-top overflow-hidden rounded-2xl border border-hairline bg-white lg:top-[calc(7rem+var(--i)*1.5rem)] lg:h-[min(34rem,72vh)]"
              style={{ '--i': i } as CSSProperties}
            >
              {/* half and half: the main photo on the left; on the right the copy over the
                  other two photos side by side, again half and half. On a phone the right
                  half dissolves (contents): the copy first, all three photos under it */}
              <div className="grid h-full gap-4 p-4 md:grid-cols-2 md:grid-rows-[minmax(0,1fr)] md:gap-6 md:p-6">
                <div className={`h-40 md:h-full ${photo}`}>
                  <img src={a.images[0]} alt="" loading="lazy" />
                </div>
                <div className="contents md:grid md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)] md:gap-6">
                  <div className="relative isolate order-first flex flex-col justify-center md:order-none">
                    <Watermark name={a.icon} className="top-0 right-0 text-tint" />
                    <PersonaCopy a={a} />
                  </div>
                  <div className="grid h-24 grid-cols-2 gap-3 md:h-auto">
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
    </Section>
  )
}

// Seven renders as one mosaic (4 columns x 3 rows on desktop): the hero shot takes a 2x2 tile.
const tile = ['col-span-2 row-span-2', 'col-span-2', '', '', '', '', 'col-span-2']

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
    <Section id="vizualizace" className="relative overflow-clip bg-page">
      <div className={`relative ${wrap}`}>
        <SectionHead eyebrow={c.gallery.eyebrow} title={c.gallery.title} accent="gold" />
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
                className="absolute inset-0 size-full object-cover"
              />
              {/* only darker and what it shows; on a phone, with no hover, the caption stays */}
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent to-50% transition-colors duration-300 lg:bg-none lg:group-hover:bg-black/50" />
              <span className="absolute inset-x-4 bottom-4 text-sm font-semibold transition-opacity duration-300 sm:text-base lg:opacity-0 lg:group-hover:opacity-100">
                {s.caption}
              </span>
            </button>
          ))}
        </div>
      </div>

      {shot && <Viewer shots={shots} cur={cur ?? 0} setCur={setCur} go={go} />}
    </Section>
  )
}

/** The full-screen viewer, as on the property detail of allriskreality.cz: black, the photo
 *  whole, arrows on its sides and the strip of thumbnails under it. */
function Viewer({
  shots,
  cur,
  setCur,
  go,
}: {
  shots: { src: string; caption: string }[]
  cur: number
  setCur: (i: number | null) => void
  go: (d: number) => void
}) {
  const shot = shots[cur]
  const strip = useRef<HTMLDivElement>(null)
  // the page under it holds still (data-lenis-prevent keeps the smooth scroll off it too)
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
    }
  }, [])
  // the current thumbnail stays in view as the photos change
  useEffect(() => {
    strip.current?.children[cur]?.scrollIntoView({
      block: 'nearest',
      inline: 'center',
      behavior: 'smooth',
    })
  }, [cur])

  return (
    <div
      role="dialog"
      aria-modal
      aria-label={shot.caption}
      data-lenis-prevent
      className="fixed inset-0 z-[300] flex flex-col bg-black text-white"
    >
      <div className="flex h-16 shrink-0 items-center justify-between gap-4 pl-5 lg:pl-8">
        <p className="min-w-0 truncate text-sm">
          <span className="font-semibold">
            {cur + 1} / {shots.length}
          </span>
          <span className="text-white/70"> · {shot.caption}</span>
        </p>
        <button
          onClick={() => setCur(null)}
          aria-label="Zavřít"
          className="grid size-16 shrink-0 place-items-center text-white/80 transition-colors hover:text-white"
        >
          <IconX size={28} />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center"
        onClick={() => setCur(null)}
      >
        <img
          key={shot.src}
          src={shot.src}
          alt={shot.caption}
          className="animate-[fade_.3s_ease] max-h-full max-w-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        {[
          { d: -1, I: IconChevronLeft, pos: 'left-0', label: 'Předchozí' },
          { d: 1, I: IconChevronRight, pos: 'right-0', label: 'Další' },
        ].map(({ d, I, pos, label }) => (
          <button
            key={d}
            onClick={(e) => {
              e.stopPropagation()
              go(d)
            }}
            aria-label={label}
            className={`absolute inset-y-0 ${pos} grid w-14 place-items-center text-white/70 transition-colors hover:text-white lg:w-24`}
          >
            <I size={36} stroke={1.5} />
          </button>
        ))}
      </div>

      <div
        ref={strip}
        className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto px-5 py-4 lg:justify-center lg:px-8"
      >
        {shots.map((s, i) => (
          <button
            key={s.src}
            onClick={() => setCur(i)}
            aria-label={s.caption}
            aria-current={i === cur}
            className={`h-16 w-24 shrink-0 overflow-hidden transition-opacity lg:h-20 lg:w-32 ${i === cur ? 'opacity-100 outline-2 -outline-offset-2 outline-white' : 'opacity-45 hover:opacity-80'}`}
          >
            <img src={s.src} alt="" loading="lazy" className="size-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  )
}

/** The offer, in blue: the building, a floor's plan and a unit in one frame. */
function Offer() {
  return (
    <Section id="prostory" className="relative overflow-clip bg-page">
      <Backdrop src="/img/ext-5.webp" />
      <div className={`relative ${wrap}`}>
        <OfferStage head={<SectionHead eyebrow={c.offer.eyebrow} title={c.offer.title} />} />
      </div>
    </Section>
  )
}

/** Gold: the copy and its three points as blocks, the map beside them half and half, its
 *  navigate button inside it. */
function Location() {
  return (
    <Section id="lokalita" className="bg-page">
      <div className={`grid gap-12 lg:grid-cols-2 lg:items-center ${wrap}`}>
        <div>
          <SectionHead
            eyebrow={c.location.eyebrow}
            title={c.location.title}
            lead={c.location.text}
            accent="gold"
          />
          <ul data-stagger className="mt-10 flex flex-col gap-3">
            {c.location.points.map((p) => (
              <li
                key={p.title}
                className="flex gap-4 rounded-2xl border border-hairline bg-white p-5"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-xl bg-gold-wash text-gold">
                  <Icon name={p.icon} size={28} />
                </span>
                <div>
                  <h3 className="font-semibold text-heading">{p.title}</h3>
                  <p className="mt-1 text-[15px] leading-relaxed">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div
          data-reveal
          className="relative h-[24rem] overflow-hidden rounded-2xl lg:h-[min(40rem,75vh)]"
        >
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
            className={`${btn} absolute top-4 left-4 bg-white text-gold shadow-[0_12px_24px_-12px_rgb(0_0_0/0.35)] hover:bg-gold-wash`}
          >
            <IconNavigation size={20} />
            {c.location.navigate.label}
          </a>
        </div>
      </div>
    </Section>
  )
}

/** Who builds it: the white logos on the blue band, each with its role. */
function Partners() {
  return (
    // the band runs edge to edge inside an ordinary section, so it keeps the same gap to its
    // neighbours as any other section, and its own --sec inside
    <Section id="partneri" aria-label={plain(c.partners.title)}>
      <div className="bg-blue-gradient relative overflow-hidden py-[var(--sec)]">
        {/* the living facade (navrhy.html, the facade's proposal 1): loose fins the pointer blows about */}
        <div className="absolute inset-0">
          <Zigzag />
        </div>
        <ul
          data-stagger
          className={`relative grid items-center gap-12 sm:grid-cols-3 sm:gap-8 ${wrap}`}
        >
          {c.partners.items.map((p) => (
            <li key={p.name} className="flex flex-col items-center text-center">
              {/* one height for the logos, so the roles under them line up */}
              <div className="flex h-12 items-center">
                {p.logo ? (
                  <img src={p.logo} alt={p.name} className="h-12 w-auto object-contain" />
                ) : (
                  <Logo park={false} className="h-9 text-white" />
                )}
              </div>
              <p className="mt-5 text-sm text-white/70">{p.role}</p>
            </li>
          ))}
        </ul>
      </div>
    </Section>
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
    <Section id="socialni-site" className="bg-page">
      <div className={`grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-center lg:gap-16 ${wrap}`}>
        <div>
          <SectionHead eyebrow={c.social.eyebrow} title={c.social.title} lead={c.social.lead} />
          <p data-reveal className="mt-8 font-display text-2xl font-medium text-primary">
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
    </Section>
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
    {
      icon: IconMail,
      value: c.contact.email,
      label: 'Napište nám',
      href: `mailto:${c.contact.email}`,
    },
  ]
  return (
    <Section id="kontakt" className="relative overflow-clip bg-page">
      <Backdrop src="/img/ext-1.webp" />
      <div className={`relative ${wrap}`}>
        <div
          data-reveal
          className="bg-blue-gradient relative isolate overflow-hidden rounded-3xl px-6 py-12 md:p-12"
        >
          {/* the facade's fins faint in the band's own blue */}
          <div className="absolute inset-0 -z-10">
            <Zigzag left />
          </div>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="flex flex-col">
              <h2
                className={`font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-balance text-white lg:text-[40px] ${emph(true)}`}
              >
                <Emph text={c.contact.title} />
              </h2>
              <p className="mt-4 mb-12 leading-[1.6] text-white/80">{c.contact.lead}</p>
              <div data-stagger className="flex flex-col gap-4">
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
                    <input
                      type="checkbox"
                      required
                      className="mt-0.5 size-4 shrink-0 accent-primary"
                    />
                    {c.contact.consent}
                  </label>
                  <button className={`${btn} w-full bg-primary text-white hover:bg-primary-hover`}>
                    {c.contact.submit}
                    <IconArrowRight size={18} className="transition group-hover:translate-x-1" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Section>
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
