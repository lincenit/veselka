import { StrictMode, useEffect, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { IconArrowLeft } from '@tabler/icons-react'
import { Chevrons } from './chevrons'
import { Facade, LinedChevrons, slats } from './lamellas'
import './styles.css'

gsap.registerPlugin(ScrollTrigger)

const wrap = 'mx-auto max-w-7xl px-5 lg:px-8'

function Head({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className={`${wrap} pt-28 pb-10`}>
      <p className="text-[13px] font-bold tracking-[0.16em] text-gold uppercase">Návrh {n}</p>
      <h2 className="mt-3 font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-heading lg:text-[40px]">
        {title}
      </h2>
      <div className="mt-4 max-w-3xl text-lg leading-relaxed">{children}</div>
    </div>
  )
}

function Note({ children }: { children: ReactNode }) {
  return <p className={`${wrap} mt-4 text-sm text-subtle`}>{children}</p>
}

/** 2: the render shows through fins that turn away, strip by strip. */
function SlatImage({ src, seed }: { src: string; seed: number }) {
  return (
    <div data-slat className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-[#2a2219]">
      <img data-slat-img src={src} alt="" className="size-full object-cover" />
      <div className="absolute inset-0 flex">
        {slats(16, seed).map((s) => (
          <span
            key={s.i}
            data-slat-strip
            className="-mx-px h-full flex-1"
            style={{
              background: `linear-gradient(180deg, ${s.color}, #6e5418)`,
              transform: `skewX(${s.skew}deg) scaleY(1.2)`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

/** 3: the hero closes behind gold fins, which part again on the blue intro. */
function Curtain() {
  const strips = slats(26, 5)
  return (
    <section data-curtain className="relative h-screen overflow-hidden bg-deep">
      <img src="/img/hero.webp" alt="" className="absolute inset-0 size-full object-cover" />
      <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-black/60 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
      <div className={`relative flex h-full flex-col justify-end pb-20 ${wrap}`}>
        <h1 className="font-display text-[clamp(40px,6vw,72px)] leading-[1.04] font-medium tracking-[-0.02em] text-white">
          Prostor s charakterem
          <br />
          <strong className="text-gold-light">pro značky s ambicí</strong>
        </h1>
      </div>
      <div data-curtain-blue className="bg-blue-gradient invisible absolute inset-0">
        <div className={`flex h-full flex-col justify-center ${wrap}`}>
          <p className="text-[13px] font-bold tracking-[0.16em] text-blue-200 uppercase">
            O projektu
          </p>
          <h2
            data-curtain-title
            className="mt-4 max-w-3xl font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-white lg:text-[40px]"
          >
            Nejde o další komerční zónu. Jde o{' '}
            <strong className="text-gold-light">místo s vlastním výrazem.</strong>
          </h2>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0">
        {strips.map((s, i) => (
          <span
            key={s.i}
            data-curtain-strip
            className="absolute -top-[10%] h-[120%]"
            style={{
              left: `${(i / strips.length) * 100 - 0.5}%`,
              width: `${100 / strips.length + 1}%`,
              background: `linear-gradient(180deg, #f6d47a, ${s.color} 45%, #6e5418)`,
              transform: `skewX(${s.skew}deg)`,
            }}
          />
        ))}
      </div>
    </section>
  )
}

function useMotion() {
  useEffect(() => {
    const lenis = new Lenis()
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (t: number) => lenis.raf(t * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-slat]').forEach((el) => {
        const st = { trigger: el, start: 'top 85%', end: 'top 25%', scrub: true }
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

      const curtain = document.querySelector('[data-curtain]')
      if (curtain) {
        const strips = curtain.querySelectorAll('[data-curtain-strip]')
        gsap.set(strips, { yPercent: (i: number) => (i % 2 ? -110 : 110) })
        gsap
          .timeline({
            scrollTrigger: { trigger: curtain, start: 'top top', end: '+=220%', scrub: 1, pin: true },
          })
          .to(strips, { yPercent: 0, stagger: { each: 0.03, from: 'end' }, ease: 'power2.out' })
          .set('[data-curtain-blue]', { visibility: 'visible' })
          .to(strips, {
            scaleX: 0,
            stagger: { each: 0.025, from: 'start' },
            ease: 'power2.in',
          })
          .from('[data-curtain-title]', { y: 40, autoAlpha: 0, duration: 0.4 }, '-=0.5')
      }
    })

    return () => {
      ctx.revert()
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])
}

function Tile({ label, dark, children }: { label: string; dark?: boolean; children: ReactNode }) {
  return (
    <figure>
      <div
        className={`relative flex h-80 justify-center overflow-hidden rounded-2xl ${dark ? 'bg-blue-gradient' : 'border border-hairline bg-white'}`}
      >
        {children}
      </div>
      <figcaption className="mt-3 text-sm font-semibold text-heading">{label}</figcaption>
    </figure>
  )
}

function Page() {
  useMotion()
  return (
    <>
      <header className="bg-blue-gradient fixed inset-x-0 top-0 z-50 text-white">
        <div className={`flex h-16 items-center justify-between ${wrap}`}>
          <span className="font-display text-lg font-medium">
            Allrisk VESELKA · <span className="text-gold-light">návrhy grafiky z fasády</span>
          </span>
          <a href="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gold-light">
            <IconArrowLeft size={18} /> Späť na web
          </a>
        </div>
      </header>

      <main className="bg-page pt-16 pb-32">
        <div className={`${wrap} grid gap-10 pt-16 lg:grid-cols-[1fr_1.2fr] lg:items-center`}>
          <div>
            <h1 className="font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-heading lg:text-[40px]">
              Grafika, ktorá vychádza <strong className="text-gold">z fasády</strong>
            </h1>
            <p className="mt-4 text-lg leading-relaxed">
              Fasádu Veselky tvoria stovky plochých zlatých lamiel. Každá je zlomená v trochu inej
              výške a pod iným uhlom. Naša šípka z nich berie len tvar, nižšie sú štyri spôsoby,
              ako vrátiť do grafiky aj tú textúru. Scrolluj pomaly, väčšina návrhov reaguje na
              scroll aj na kurzor.
            </p>
          </div>
          <img src="/img/facade.webp" alt="" className="h-64 w-full rounded-2xl object-cover" />
        </div>

        <Head n={1} title="Živá fasáda">
          Generované lamely, ktoré pri vstupe do sekcie stoja voľne ako na budove a ako sa sekcia
          dostáva do stredu obrazovky, zoradia sa do našej šípky. Lamely okolo kurzora sa
          rozfúkajú ako trstina vo vetre. Rovnaký komponent v troch použitiach.
        </Head>
        <div className="relative h-[85vh] overflow-hidden bg-[#1d1813]">
          <Facade />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 p-8 lg:p-12">
            <p className="font-display text-[32px] font-medium text-white lg:text-[40px]">
              Na dlhom paneli <strong className="text-gold-light">ako pozadie hero</strong>
            </p>
          </div>
        </div>
        <Note>a) Na tmavom ako fasáda za súmraku, plná intenzita.</Note>
        <div className="bg-blue-gradient relative mt-10 h-[60vh] overflow-hidden">
          <Facade gap={28} amp={0.12} opacity={0.75} />
        </div>
        <Note>b) Na modrej, redšie a jemnejšie, napríklad za formulárom alebo v sekcii O projektu.</Note>
        <div className="relative mt-10 h-36 overflow-hidden bg-white">
          <Facade gap={14} amp={0.18} order={0} />
        </div>
        <Note>c) Úzky pás medzi sekciami, stále voľný, reaguje len na kurzor (náhrada statickej fotky fasády v Pět důvodů).</Note>

        <Head n={2} title="Pohľad cez lamely">
          Vizualizácie sa neodhalia obyčajným fade-in, lamely sa pri scrolle po jednej otočia a
          render sa ukáže pomedzi ne, ako keď sa pozeráš z interiéru von. Pre mozaiku
          vizualizácií, karty Pro koho a obrázky v Pět důvodů.
        </Head>
        <div className={`${wrap} grid gap-6 sm:grid-cols-3`}>
          <SlatImage src="/img/ext-1.webp" seed={1} />
          <SlatImage src="/img/ext-3.webp" seed={2} />
          <SlatImage src="/img/int-1.webp" seed={4} />
        </div>

        <Head n={3} title="Prechod z hero cez lamely">
          Namiesto modrého panelu, ktorý prejde cez fotku, sa hero zatvorí zlatými lamelami ako
          závesom a tie sa potom rozostúpia na modrú sekciu O projektu. Scrolluj ďalej, sekcia sa
          na chvíľu zastaví.
        </Head>
        <Curtain />

        <Head n={4} title="Šípka z lamiel">
          Najmenší zásah: tá istá šípka, ale nie z plných pásov, ale z hustých tenkých čiar s
          jemne iným sklonom, ako lamely. Vľavo súčasná, vpravo nová. Dá sa použiť aj v tlači a
          na sociálnych sieťach.
        </Head>
        <div className={`${wrap} grid gap-6 sm:grid-cols-2`}>
          <Tile label="Súčasná, na modrej" dark>
            <Chevrons variant="on-blue" className="h-full" />
          </Tile>
          <Tile label="Z lamiel, na modrej" dark>
            <LinedChevrons className="h-full" />
          </Tile>
          <Tile label="Súčasná, na bielej">
            <Chevrons variant="free" className="h-full" />
          </Tile>
          <Tile label="Z lamiel, na bielej">
            <LinedChevrons tone="on-white" className="h-full" />
          </Tile>
          <Tile label="Zoradená fasáda ako statický vzor (návrh 1 v pokoji)" dark>
            <Facade gap={22} amp={0.16} order={1} wind={false} />
          </Tile>
          <Tile label="Voľná fasáda ako statický vzor">
            <div className="size-full bg-[#1d1813]">
              <Facade gap={18} order={0} wind={false} />
            </div>
          </Tile>
        </div>
      </main>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
