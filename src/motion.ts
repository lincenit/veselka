import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
// the hero is pinned on phones too; the address bar showing/hiding must not re-measure it
ScrollTrigger.config({ ignoreMobileResize: true })

const all = <T extends Element = HTMLElement>(sel: string) =>
  Array.from(document.querySelectorAll<T>(sel))

const ease = 'expo.out'

/**
 * The page's whole motion vocabulary:
 * - data-reveal / data-stagger: text rises in (one curve everywhere; stagger = the same per child)
 * - data-slat: a photo opens through the facade's gold fins
 * - pinned scenes: the hero (data-hero-*) and Šest důvodů's horizontal run (data-hscroll)
 * - Šest důvodů's horizontal run (data-hscroll), Pro koho's stacking cards (data-stack)
 * Pins are created first: a trigger made before a pin above it would measure the page without
 * the pin's spacer and fire too early - which left the lower sections with no visible reveal.
 * Nothing is hidden before this runs, so reduced motion simply gets the static page.
 */
export function initMotion() {
  const lenis = new Lenis({ anchors: { offset: -72 } })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  // the logo goes to the very top. Its target, the hero, is pinned (version 1) and so always
  // measures at the screen's top - Lenis's own anchor handling would not move at all.
  // Caught before Lenis's handler.
  const toTop = (e: MouseEvent) => {
    if (!(e.target as Element | null)?.closest?.('a[href="#top"]')) return
    e.preventDefault()
    e.stopImmediatePropagation()
    lenis.scrollTo(0, { duration: 1.6 })
  }
  document.addEventListener('click', toTop, true)

  const mm = gsap.matchMedia()
  const calm = '(prefers-reduced-motion: no-preference)'

  // 1. the hero scene (every width)
  mm.add(calm, () => {
    gsap.from('[data-hero-line]', { yPercent: 110, duration: 1.4, stagger: 0.12, ease, delay: 0.15 })
    gsap.from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease, delay: 0.6 })

    const hero = document.querySelector<HTMLElement>('[data-hero]')
    const intro = document.querySelector<HTMLElement>('[data-intro]')
    if (!hero || !intro) return

    // zigzag.tsx: the intro lies over the hero, out to the right, the edge on its
    // left side showing as a strip. The two pin for a screen's worth of scroll while the
    // intro is pulled in whole from the right - copy, ribbons and edge together, the copy
    // there all the way; then the page goes on from the intro. Without motion nothing
    // overlaps and the two simply follow each other.
    const scene = hero.parentElement
    const edge = scene?.querySelector<HTMLElement>('[data-intro-edge]')
    if (!scene || !edge) return
    // the edge's left side shows from 76% of the width (84% on a phone); the intro starts
    // where the edge ends
    const width = () => edge.offsetWidth
    const start = () => window.innerWidth * (window.innerWidth >= 1024 ? 0.76 : 0.84)
    // the hero's own height: max(100svh, 640px)
    gsap.set(intro, { marginTop: 'calc(-1 * max(100svh, 640px))', minHeight: 'max(100svh, 640px)' })
    const tl = gsap
      .timeline({
        scrollTrigger: {
          trigger: scene,
          start: 'top top',
          // a screen for the sweep, then the intro holds while its gold line draws
          end: () => `+=${window.innerHeight * 1.4}`,
          scrub: true,
          pin: true,
          invalidateOnRefresh: true,
        },
      })
      // both follow the scroll one to one, so they stay joined; the hero's copy goes as the
      // edge reaches it
      .fromTo(edge, { x: start }, { x: () => -width(), ease: 'none', duration: 1 }, 0)
      .fromTo(intro, { x: () => start() + width() }, { x: 0, ease: 'none', duration: 1 }, 0)
      .to('[data-hero-copy]', { x: -80, autoAlpha: 0, ease: 'power1.in', duration: 0.4 }, 0.1)
      .to('[data-hero-img]', { scale: 1.1, ease: 'none', duration: 1 }, 0)
      // the edge's gold line draws itself top down with the scroll, the intro's after it,
      // as the fields' lines do further down the page
      .fromTo(
        edge.querySelectorAll('[data-chevron-line]'),
        // autoRound off: the length is 1, and rounding would jump it from nothing to whole
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: 'none', duration: 0.45, autoRound: false },
        0,
      )
      // only once the intro is in place: drawn while it slides in, most of it is still off
      // the screen
      .fromTo(
        intro.querySelectorAll('[data-zz-line]'),
        { strokeDashoffset: 1 },
        { strokeDashoffset: 0, ease: 'none', duration: 0.4, autoRound: false },
        1,
      )
    // the header stays see-through over the scene until the intro has come in
    hero.dataset.end = String(window.innerHeight)
    // a link to the intro (the menu) goes to the end of the sweep: the copy's
    // own place lies at the top of the scene, which would stop it halfway, with the panel
    // over the hero and nothing in it. Caught before Lenis's own anchor handling.
    const toIntro = (e: MouseEvent) => {
      if (!(e.target as Element | null)?.closest?.('a[href="#projekt"]')) return
      e.preventDefault()
      e.stopImmediatePropagation()
      lenis.scrollTo(tl.scrollTrigger?.end ?? window.innerHeight, { duration: 1.6 })
    }
    document.addEventListener('click', toIntro, true)
    return () => {
      document.removeEventListener('click', toIntro, true)
      delete hero.dataset.end
    }
  })

  // 2. Šest důvodů's horizontal run (every width)
  const run = (section: HTMLElement, pad: number) => {
    const track = section.querySelector<HTMLElement>('[data-hscroll-track]')
    const last = track?.lastElementChild as HTMLElement | null
    if (!track || !last) return
    // run until the last card meets the content column's edge (max-w-7xl), not the screen's -
    // otherwise it stops with the card cut by the window
    const gutter = () => Math.max(pad, (window.innerWidth - 1280) / 2 + pad)
    const dist = () =>
      Math.max(0, last.offsetLeft + last.offsetWidth - (window.innerWidth - gutter()))
    const tween = gsap.to(track, {
      x: () => -dist(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        // the row is held in the middle of the screen
        start: 'center center',
        end: () => `+=${dist() + window.innerHeight * 0.3}`,
        scrub: 1,
        pin: true,
        invalidateOnRefresh: true,
      },
    })
    // the cards still off screen rise in as the track brings them - the same rise as text
    track.querySelectorAll<HTMLElement>('[data-hscroll-card]').forEach((card) => {
      if (card.offsetLeft + card.offsetWidth < window.innerWidth) return
      gsap.from(card, {
        y: 60,
        autoAlpha: 0,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          containerAnimation: tween,
          start: 'left 100%',
          end: 'left 70%',
          scrub: true,
        },
      })
    })
  }
  // the content column's gutter: 2rem on a desktop, 1.25rem on a phone
  mm.add(
    { desktop: `(min-width: 1024px) and ${calm}`, phone: `(max-width: 1023px) and ${calm}` },
    (ctx) => all('[data-hscroll]').forEach((s) => run(s, ctx.conditions?.desktop ? 32 : 20)),
  )

  // 3. Pro koho: the cards stack, each rising over the one before, which steps back
  mm.add(calm, () => {
    all('[data-stack]').forEach((card) => {
      const next = card.nextElementSibling
      if (!(next instanceof HTMLElement) || !next.matches('[data-stack]')) return
      const st = {
        trigger: next,
        start: 'top bottom',
        end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
        scrub: true,
        invalidateOnRefresh: true,
      }
      gsap.to(card, { scale: 0.93, ease: 'none', scrollTrigger: st })
      gsap.to(card.querySelector('[data-stack-shade]'), { opacity: 0.6, ease: 'none', scrollTrigger: st })
    })
  })

  // 4. reveals and fins, measured after every pin above them exists
  mm.add(calm, () => {
    all('[data-reveal]').forEach((el) =>
      gsap.from(el, {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        ease,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }),
    )
    all('[data-stagger]').forEach((el) =>
      gsap.from(el.children, {
        y: 40,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.08,
        ease,
        scrollTrigger: { trigger: el, start: 'top 88%' },
      }),
    )
    all('[data-slat]').forEach((el) => {
      const st = { trigger: el, start: 'top 90%', end: 'top 35%', scrub: true }
      gsap.to(el.querySelectorAll('[data-slat-strip]'), {
        scaleX: 0,
        transformOrigin: (i: number) => (i % 2 ? 'left center' : 'right center'),
        stagger: { each: 0.04, from: 'random' },
        ease: 'power2.in',
        scrollTrigger: st,
      })
      gsap.fromTo(
        el.querySelector('[data-slat-img]'),
        { scale: 1.3 },
        { scale: 1, ease: 'none', scrollTrigger: st },
      )
    })
  })

  // pin lengths and start points are measured once; fonts and late images move them
  const refresh = () => ScrollTrigger.refresh()
  window.addEventListener('load', refresh)
  document.fonts.ready.then(refresh)

  return () => {
    window.removeEventListener('load', refresh)
    document.removeEventListener('click', toTop, true)
    mm.revert()
    gsap.ticker.remove(raf)
    lenis.destroy()
  }
}
