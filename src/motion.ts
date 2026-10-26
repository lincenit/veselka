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
 * - pinned scenes: the hero curtain (data-hero-*) and v3's horizontal run (data-hscroll)
 * - Benefits: each photo rises into the sticky frame as its card comes up (data-benefit)
 * - Pro koho's stacking cards (data-stack)
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

  const mm = gsap.matchMedia()
  const calm = '(prefers-reduced-motion: no-preference)'

  // 1. the hero curtain (every width)
  mm.add(calm, () => {
    gsap.from('[data-hero-line]', { yPercent: 110, duration: 1.4, stagger: 0.12, ease, delay: 0.15 })
    gsap.from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: 1.2, stagger: 0.1, ease, delay: 0.6 })

    // The hero closes behind the facade's gold fins, which part again on the intro. The hero
    // pins without a spacer, so the page goes on scrolling under it: the intro arrives at the
    // top just as the fins start to open and slides into place while they part.
    const hero = document.querySelector<HTMLElement>('[data-hero]')
    const intro = document.querySelector<HTMLElement>('[data-intro]')
    if (!hero || !intro) return

    // ?hero=frame (the default): the photo pulls away into a frame over the blue facade, whose
    // fins line up meanwhile; nothing is pinned, the intro simply follows
    if (hero.dataset.heroMode === 'frame') {
      gsap
        .timeline({
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
        })
        .fromTo(
          '[data-hero-frame]',
          { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
          { clipPath: 'inset(12% 5% 0% 5% round 24px)', ease: 'none' },
          0,
        )
        .to('[data-hero-img]', { scale: 1.12, ease: 'none' }, 0)
        .to('[data-hero-copy]', { y: -120, autoAlpha: 0, ease: 'none', duration: 0.4 }, 0)
        .fromTo(
          '[data-hero-facade]',
          { attr: { 'data-order': 0 } },
          { attr: { 'data-order': 1 }, ease: 'none' },
          0,
        )
      return
    }

    const strips = all('[data-hero-strip]')
    if (!strips.length) return
    // the inline transform only hides them before this runs; GSAP takes over every part of it
    gsap.set(strips, {
      y: 0,
      skewX: (_: number, el: HTMLElement) => Number(el.dataset.skew),
      yPercent: (_: number, el: HTMLElement) => (el.dataset.heroStrip === 'up' ? -115 : 115),
    })
    const length = () => window.innerHeight * (window.innerWidth >= 1024 ? 2.2 : 1.6)
    const tl = gsap
      .timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: () => `+=${length()}`,
          scrub: 1,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        },
      })
      .to('[data-hero-img]', { scale: 1.15, ease: 'none', duration: 1 }, 0)
      .to(strips, { yPercent: 0, stagger: { each: 0.03, from: 'end' }, ease: 'power2.out' }, 0)
      // the gold backing grows in the gaps between the leaning fins while they close and
      // fades while they open, so the gaps go photo -> gold -> intro with no visible swap
      .to('[data-hero-backing]', { opacity: 1, ease: 'power2.in', duration: 1.6 }, 0)
      // behind the closed fins the hero lets go of its photo, so the intro shows when they part;
      // the emptied hero still lies over the page, so it must stop catching the pointer
      .set(hero, { backgroundColor: 'transparent', pointerEvents: 'none' })
      .set('[data-hero-img], [data-hero-shade], [data-hero-copy]', { autoAlpha: 0 })
      .addLabel('open')
      .to(strips, { scaleX: 0, stagger: { each: 0.025, from: 'start' }, ease: 'power2.in' }, 'open')
      .to('[data-hero-backing]', { opacity: 0, ease: 'power1.out', duration: 0.9 }, 'open')
      // the facade on the intro: its loose fins line up into chevrons
      .to(
        '[data-hero-facade]',
        { attr: { 'data-order': 1 }, duration: 1.2, ease: 'power1.inOut' },
        'open+=0.4',
      )

    // The intro's top meets the screen's top when the fins start to open; it keeps scrolling
    // while they part, so its top padding takes that distance and the copy ends where it belongs.
    const place = () => {
      const opensAt = (tl.labels.open / tl.duration()) * length()
      intro.style.marginTop = `${opensAt - hero.offsetHeight}px`
      intro.style.paddingTop = `calc(${length() - opensAt}px + var(--intro-pad))`
      hero.dataset.end = String(length())
    }
    place()
    ScrollTrigger.addEventListener('refreshInit', place)
    return () => {
      ScrollTrigger.removeEventListener('refreshInit', place)
      intro.style.marginTop = ''
      intro.style.paddingTop = ''
      delete hero.dataset.end
    }
  })

  // 2. Benefits' horizontal run (desktop)
  mm.add(`(min-width: 1024px) and ${calm}`, () => {
    all('[data-hscroll]').forEach((section) => {
      const track = section.querySelector<HTMLElement>('[data-hscroll-track]')
      const last = track?.lastElementChild as HTMLElement | null
      if (!track || !last) return
      // run until the last card meets the content column's edge (max-w-7xl, 2rem gutter),
      // not the screen's - otherwise it stops with the card cut by the window
      const gutter = () => Math.max(32, (window.innerWidth - 1280) / 2 + 32)
      const dist = () =>
        Math.max(0, last.offsetLeft + last.offsetWidth - (window.innerWidth - gutter()))
      const tween = gsap.to(track, {
        x: () => -dist(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `+=${dist() + window.innerHeight * 0.3}`,
          scrub: 1,
          pin: true,
          invalidateOnRefresh: true,
          onUpdate: (st) =>
            gsap.set(section.querySelector('[data-hscroll-progress]'), { scaleX: st.progress }),
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
    })
  })

  // 2b. Benefits: the next photo rises in as a rounded panel that widens to the frame, the one
  // under it sinking back into the dark (desktop)
  mm.add(`(min-width: 1024px) and ${calm}`, () => {
    const items = all('[data-benefit]')
    const layers = all('[data-benefit-layer]')
    const imgs = layers.map((l) => l.querySelector('img'))
    const count = document.querySelector('[data-benefit-count]')
    document.documentElement.dataset.motion = ''
    items.forEach((li, i) => {
      if (i > 0 && layers[i]) {
        gsap
          .timeline({ scrollTrigger: { trigger: li, start: 'top 95%', end: 'top 40%', scrub: true } })
          .fromTo(
            layers[i],
            { clipPath: 'inset(100% 10% 0% 10% round 24px)' },
            { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'power3.inOut' },
            0,
          )
          .fromTo(imgs[i], { scale: 1.3, yPercent: 15 }, { scale: 1, yPercent: 0, ease: 'power2.out' }, 0)
          // fromTo, not to: a plain to would start from this photo's own pre-entry scale
          .fromTo(
            imgs[i - 1],
            { scale: 1, yPercent: 0, filter: 'brightness(1)' },
            { scale: 1.08, yPercent: -6, filter: 'brightness(0.45)', ease: 'none', immediateRender: false },
            0,
          )
      }
      const zone = { trigger: li, start: 'top 55%', end: 'bottom 55%' }
      ScrollTrigger.create({
        ...zone,
        onToggle: (st) => {
          li.classList.toggle('is-active', st.isActive)
          if (st.isActive && count) count.textContent = String(i + 1).padStart(2, '0')
        },
      })
      gsap.fromTo(
        li.querySelector('[data-benefit-bar]'),
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { ...zone, scrub: true } },
      )
    })
    return () => {
      delete document.documentElement.dataset.motion
      items.forEach((li) => li.classList.remove('is-active'))
    }
  })

  // 3. Pro koho: the cards stack, each rising over the one before, which steps back (desktop)
  mm.add(`(min-width: 1024px) and ${calm}`, () => {
    const cards = all('[data-stack]')
    cards.forEach((card, i) => {
      const next = cards[i + 1]
      if (!next) return
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
    mm.revert()
    gsap.ticker.remove(raf)
    lenis.destroy()
  }
}
