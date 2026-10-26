import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

gsap.registerPlugin(ScrollTrigger)
ScrollTrigger.config({ ignoreMobileResize: true })

const all = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) =>
  Array.from(root.querySelectorAll<T>(sel))

const ease = 'expo.out'

// The wipe: a picture rises in from the bottom behind a straight edge carrying one fine
// gold line.
function wipe(img: HTMLElement, edge: Element | null, p: number) {
  const y = 100 - p * 100
  img.style.clipPath = `inset(${y}% 0% 0% 0%)`
  if (!edge) return
  edge.querySelector('polyline')?.setAttribute('points', `0,${y} 100,${y}`)
  ;(edge as SVGElement).style.opacity = p > 0.01 && p < 0.99 ? '1' : '0'
}

/**
 * Version 2's motion. Every scene is scrubbed to the scroll, so it reads at any speed and
 * backwards:
 * - hero: the photo pulls away into a frame while the gold fins behind it line up
 * - benefits: each picture rises in behind a fine gold line, a gold rail fills
 * - gallery and Fit Out: the same wipe as each picture arrives
 * - intro: the statement lights up word by word; personas: the cards stack
 * Nothing is hidden before this runs, so reduced motion gets the static page.
 */
export function initMotion() {
  const lenis = new Lenis({ anchors: { offset: -72 } })
  lenis.on('scroll', ScrollTrigger.update)
  const raf = (t: number) => lenis.raf(t * 1000)
  gsap.ticker.add(raf)
  gsap.ticker.lagSmoothing(0)

  const mm = gsap.matchMedia()
  const calm = '(prefers-reduced-motion: no-preference)'

  mm.add(calm, () => {
    document.documentElement.dataset.motion = ''

    gsap.from('[data-hero-line]', { yPercent: 110, duration: 1.3, stagger: 0.12, ease, delay: 0.1 })
    gsap.from('[data-hero-fade]', { y: 24, autoAlpha: 0, duration: 1.1, stagger: 0.1, ease, delay: 0.5 })

    gsap
      .timeline({
        scrollTrigger: { trigger: '[data-hero]', start: 'top top', end: 'bottom top', scrub: true },
      })
      .fromTo(
        '[data-hero-frame]',
        { clipPath: 'inset(0% 0% 0% 0% round 0px)' },
        { clipPath: 'inset(12% 5% 0% 5% round 24px)', ease: 'none' },
        0,
      )
      .to('[data-hero-img]', { scale: 1.12, ease: 'none' }, 0)
      .to('[data-hero-copy]', { y: -120, autoAlpha: 0, ease: 'none', duration: 0.4 }, 0)
      // the Facade canvas reads its parent's data-order: loose fins line up into the chevron
      .fromTo('[data-hero-facade]', { attr: { 'data-order': 0 } }, { attr: { 'data-order': 1 }, ease: 'none' }, 0)

    all('[data-words]').forEach((el) =>
      gsap.fromTo(
        all('[data-word]', el),
        { opacity: 0.18 },
        {
          opacity: 1,
          stagger: 0.1,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true },
        },
      ),
    )

    all('[data-wipe]').forEach((box) => {
      const img = box.querySelector<HTMLElement>('[data-wipe-img]')
      if (!img) return
      const edge = box.querySelector('[data-wipe-edge]')
      const st = { p: 0 }
      gsap.to(st, {
        p: 1,
        ease: 'power2.inOut',
        onUpdate: () => wipe(img, edge, st.p),
        scrollTrigger: { trigger: box, start: 'top 95%', end: 'top 45%', scrub: true },
      })
      gsap.fromTo(
        img,
        { scale: 1.18 },
        {
          scale: 1,
          ease: 'none',
          scrollTrigger: { trigger: box, start: 'top 95%', end: 'top 30%', scrub: true },
        },
      )
    })

    const frame = document.querySelector('[data-map-frame]')
    if (frame)
      gsap.fromTo(
        frame,
        { clipPath: 'inset(10% 10% 10% 10% round 24px)' },
        {
          clipPath: 'inset(0% 0% 0% 0% round 24px)',
          ease: 'none',
          scrollTrigger: { trigger: frame, start: 'top 90%', end: 'top 35%', scrub: true },
        },
      )

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

    return () => {
      delete document.documentElement.dataset.motion
      all('[data-wipe-img]').forEach((img) => (img.style.clipPath = ''))
    }
  })

  mm.add(`(min-width: 1024px) and ${calm}`, () => {
    const items = all('[data-benefit]')
    const imgs = all('[data-benefit-img]')
    const edge = document.querySelector('[data-wipe-edge="benefits"]')
    const count = document.querySelector('[data-benefit-count]')
    items.forEach((li, i) => {
      if (i > 0) {
        const st = { p: 0 }
        wipe(imgs[i], null, 0)
        gsap.to(st, {
          p: 1,
          ease: 'power1.inOut',
          onUpdate: () => {
            wipe(imgs[i], edge, st.p)
            // the picture going away sinks back as the new one rises over it
            gsap.set(imgs[i], { scale: 1.15 - 0.15 * st.p })
            gsap.set(imgs[i - 1], { scale: 1 + 0.08 * st.p, filter: `brightness(${1 - 0.35 * st.p})` })
          },
          scrollTrigger: { trigger: li, start: 'top 90%', end: 'top 45%', scrub: true },
        })
      }
      ScrollTrigger.create({
        trigger: li,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (st) => {
          li.classList.toggle('is-active', st.isActive)
          if (st.isActive && count) count.textContent = String(i + 1).padStart(2, '0')
        },
      })
    })
    gsap.fromTo(
      '[data-benefit-rail]',
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-benefits]', start: 'top 55%', end: 'bottom 55%', scrub: true },
      },
    )

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

    all('[data-parallax]').forEach((col) => {
      const v = Number(col.dataset.parallax)
      gsap.fromTo(
        col,
        { y: v },
        {
          y: -v,
          ease: 'none',
          scrollTrigger: { trigger: col.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    })

    return () => {
      items.forEach((li) => li.classList.remove('is-active'))
      imgs.forEach((img) => {
        img.style.clipPath = ''
        img.style.filter = ''
      })
    }
  })

  // trigger points are measured once; fonts and late images move them
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
