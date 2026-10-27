import { StrictMode, useEffect, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import {
  IconArrowLeft,
  IconBuildingSkyscraper,
  IconDiamond,
  IconRoad,
} from '@tabler/icons-react'
import { Chevrons } from './chevrons'
import { Facade, LinedChevrons, slats } from './lamellas'
import { Lattice } from './lattice'
import { Zigzag } from './zigzag'
import * as c from './content'
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

/** 11: the reasons as a stack - each card its photo across the whole card with a white
 *  panel over it, sticking under the top, the next rising over it. */
const stackIcons = [IconBuildingSkyscraper, IconRoad, IconDiamond]
function PhotoStack() {
  return (
    <div className={`${wrap} flex flex-col gap-10`}>
      {c.benefits.items.slice(0, 3).map((b, i) => {
        const I = stackIcons[i]
        return (
          <article
            key={b.title}
            className="sticky top-[calc(5rem+var(--i)*1.5rem)] flex h-[min(34rem,72vh)] flex-col justify-end overflow-hidden rounded-3xl bg-deep p-3 md:p-8"
            style={{ '--i': i } as CSSProperties}
          >
            <img src={b.image} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="relative isolate overflow-hidden rounded-2xl bg-white p-6 md:max-w-md">
              <I
                aria-hidden
                size={104}
                stroke={1.1}
                className="absolute top-4 right-4 -z-1 text-gold-wash"
              />
              <span className="grid size-14 place-items-center rounded-xl bg-gold-wash text-gold">
                <I size={28} stroke={1.5} />
              </span>
              <h3 className="mt-6 text-2xl leading-snug font-semibold text-heading">
                {i + 1}. {b.title}
              </h3>
              <p className="mt-4 text-lg leading-relaxed">{b.text}</p>
              <span aria-hidden className="mt-6 block h-[3px] rounded-full bg-gold" />
            </div>
          </article>
        )
      })}
    </div>
  )
}

/** A direction's opening: its name and what it grows out of. */
function Part({
  id,
  label,
  title,
  children,
}: {
  id: string
  label: string
  title: string
  children: ReactNode
}) {
  return (
    <div id={id} className={`${wrap} scroll-mt-16 pt-32`}>
      <div className="border-t border-hairline pt-12">
        <p className="text-[13px] font-bold tracking-[0.16em] text-primary uppercase">{label}</p>
        <h2 className="mt-3 font-display text-[40px] leading-[1.05] font-medium tracking-[-0.02em] text-heading lg:text-[52px]">
          {title}
        </h2>
        <div className="mt-4 max-w-3xl text-lg leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

// Gold fins thinned out with opacity turn grey on blue, so they stay strong and a mask keeps
// them to the part of the field the copy does not use.
const MASKS = {
  right: '[mask-image:linear-gradient(90deg,transparent_25%,black_75%)]',
  bottom: '[mask-image:linear-gradient(0deg,black_0%,transparent_65%)]',
  // only the band under the copy
  foot: '[mask-image:linear-gradient(0deg,black_0%,transparent_40%)]',
}

/** 9: the living facade on a blue field, gold fins kept by a mask to where the copy is not. */
function MaskedFins({ mask }: { mask: keyof typeof MASKS }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${MASKS[mask]}`}>
      <Facade gap={26} amp={0.16} opacity={0.6} />
    </div>
  )
}

/** 10: a section's photo ground, the render turned gold, fading into the grey page towards
 *  the top - strongest at the very bottom. */
function GoldBackdrop({ src }: { src: string }) {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <img src={src} alt="" className="size-full object-cover brightness-110 contrast-110 grayscale" />
      {/* `color` keeps the photo's light and dark and lays the gold's hue over them */}
      <div className="absolute inset-0 bg-[#d4a640] mix-blend-color" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--color-page)_0%,var(--color-page)_45%,rgb(248_249_250/0.6)_75%,rgb(248_249_250/0)_100%)]" />
    </div>
  )
}

function Page() {
  useMotion()
  return (
    <>
      <header className="bg-blue-gradient fixed inset-x-0 top-0 z-50 text-white">
        <div className={`flex h-16 items-center justify-between ${wrap}`}>
          <span className="font-display text-lg font-medium">
            Allrisk VESELKA · <span className="text-gold-light">návrhy grafiky</span>
          </span>
          <a href="./" className="inline-flex items-center gap-2 text-sm font-semibold hover:text-gold-light">
            <IconArrowLeft size={18} /> Späť na web
          </a>
        </div>
      </header>

      <main className="bg-page pt-16 pb-32">
        <div className={`${wrap} pt-16`}>
          <h1 className="max-w-3xl font-display text-[32px] leading-[1.1] font-medium tracking-[-0.02em] text-heading lg:text-[40px]">
            Všetky grafické nápady <strong className="text-gold">na jednom mieste</strong>
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-relaxed">
            Každý smer, ktorý sme skúšali, s jeho prvkami naživo. Scrolluj pomaly, väčšina
            prvkov reaguje na scroll aj na kurzor. Na webe sú len verzie 1 a 2, všetko ostatné
            je len tu.
          </p>
        </div>

        <Part id="zlom" label="Verzia 1 · hlavná" title="Zlom">
          Kľúčový vizuál z firemných materiálov: fotka sa lomí do modrej plochy po hrane {'„<“'} a
          vedľa nej beží zlatá linka. Je to ohyb jednej lamely fasády, zväčšený na celú stránku.
        </Part>

        <Head n={1} title="Kľúčový vizuál">
          Pásy a zlatá linka vždy idú v opačnej fáze, {'„<“'} proti {'„>“'}. To prekríženie robí motív.
          Hrana je prechod z fotky do modrej, voľná a modrá verzia sa dajú použiť samostatne.
        </Head>
        <div className={`${wrap} grid gap-6 sm:grid-cols-3`}>
          <Tile label="Hrana: fotka do modrej (hero → O projektu)">
            <Chevrons variant="edge" className="h-full" />
          </Tile>
          <Tile label="Voľná, na bielej">
            <Chevrons variant="free" className="h-full" />
          </Tile>
          <Tile label="Na modrej" dark>
            <Chevrons variant="on-blue" className="h-full" />
          </Tile>
        </div>

        <Head n={2} title="Pásy na modrej ploche">
          Každá modrá plocha (O projektu, Partneri, Kontakt) má rovnaké pásy so zlatou linkou.
          Linka sa kreslí, ako plocha prechádza obrazovkou, a pásy sa jemne nakláňajú za
          kurzorom.
        </Head>
        <div className="bg-blue-gradient relative h-[70vh] overflow-hidden">
          <Zigzag />
          <div className={`relative flex h-full items-end pb-12 ${wrap}`}>
            <p className="font-display text-[32px] font-medium text-white lg:text-[40px]">
              Nejde o další komerční zónu.
              <br />
              Jde o <strong className="text-blue-300">místo s vlastním výrazem.</strong>
            </p>
          </div>
        </div>

        <Head n={3} title="Prechod cez zlom">
          Fotky v hero sa striedajú po hrane {'„<“'} a každá sa pomaly približuje. Pri scrolle sa
          sekcia O projektu vtiahne sprava cez hero aj s hranou, potom sa nakreslí jej zlatá
          linka. Vidno to na webe vo verzii 1.
        </Head>

        <Part id="lamely" label="Verzia 2" title="Lamely">
          Fasádu Veselky tvoria stovky plochých zlatých lamiel. Každá je zlomená v trochu inej
          výške a pod iným uhlom. Šípka z nich berie len tvar, tieto návrhy vracajú do grafiky aj
          tú textúru.
        </Part>
        <div className={`${wrap} mt-10`}>
          <img src="/img/facade.webp" alt="" className="h-64 w-full rounded-2xl object-cover" />
        </div>

        <Head n={4} title="Živá fasáda">
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

        <Head n={5} title="Pohľad cez lamely">
          Vizualizácie sa neodhalia obyčajným fade-in, lamely sa pri scrolle po jednej otočia a
          render sa ukáže pomedzi ne, ako keď sa pozeráš z interiéru von. Pre mozaiku
          vizualizácií, karty Pro koho a obrázky v Pět důvodů.
        </Head>
        <div className={`${wrap} grid gap-6 sm:grid-cols-3`}>
          <SlatImage src="/img/ext-1.webp" seed={1} />
          <SlatImage src="/img/ext-3.webp" seed={2} />
          <SlatImage src="/img/int-1.webp" seed={4} />
        </div>

        <Head n={6} title="Prechod z hero cez lamely">
          Namiesto modrého panelu, ktorý prejde cez fotku, sa hero zatvorí zlatými lamelami ako
          závesom a tie sa potom rozostúpia na modrú sekciu O projektu. Scrolluj ďalej, sekcia sa
          na chvíľu zastaví.
        </Head>
        <Curtain />

        <Head n={7} title="Šípka z lamiel">
          Najmenší zásah: tá istá šípka, nie z plných pásov, ale z hustých tenkých čiar s
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
          <Tile label="Zoradená fasáda ako statický vzor (návrh 4 v pokoji)" dark>
            <Facade gap={22} amp={0.16} order={1} wind={false} />
          </Tile>
          <Tile label="Voľná fasáda ako statický vzor">
            <div className="size-full bg-[#1d1813]">
              <Facade gap={18} order={0} wind={false} />
            </div>
          </Tile>
        </div>

        <Part id="kosoctverce" label="Ďalší smer" title="Kosoštvorce">
          Kde sa zlomené lamely krížia, nechávajú vysoké kosoštvorcové otvory. Nakreslené ako
          sieť robia mriežku, jeden samostatný kosoštvorec je značka na odznakoch, rohoch fotiek
          a nad nadpismi.
        </Part>

        <Head n={8} title="Mriežka na modrej">
          Jemné čiary, kosoštvorce okolo kurzora sa rozsvietia do zlata a občas cez plochu
          pomaly prejde pás svetla.
        </Head>
        <div className="bg-blue-gradient relative h-[60vh] overflow-hidden">
          <Lattice />
        </div>

        <Part id="zlato-na-grafike" label="Ďalší smer" title="Zlato len na grafike">
          Rozloženie podľa systému allrisk.cz s jedným pravidlom farieb: modrá je
          Allrisk (plochy, nadpisy, ikony), zlatá je fasáda (grafika, akcie, zvýraznenie, čísla).
          Zlatá nikdy nie je plocha.
        </Part>

        <Head n={9} title="Zlaté lamely s maskou">
          Lamely na modrej sú plné zlaté, nie priesvitné, aby na modrej nezošedli. Maska ich drží
          v časti plochy, kde nie je text. Pri odhaľovaní obrázka by sa navyše po jeho
          hrane viezla tenká zlatá linka.
        </Head>
        <div className={`${wrap} grid gap-6 sm:grid-cols-3`}>
          <Tile label="Maska vpravo (hero, O projektu)" dark>
            <MaskedFins mask="right" />
          </Tile>
          <Tile label="Maska dole (Partneri)" dark>
            <MaskedFins mask="bottom" />
          </Tile>
          <Tile label="Len pás pod textom (Kontakt)" dark>
            <MaskedFins mask="foot" />
          </Tile>
        </div>

        <Part id="dve-modre" label="Ďalší smer" title="Dve modré plochy">
          Verzia 1, ale modré sú len O projektu a Partneri, ostatné sekcie sú na sivej. Každá
          sekcia má práve jeden zlatý prvok: zvýraznenie nadpisu, kartu, ikony, špendlík na mape
          alebo tlačidlo.
        </Part>

        <Head n={10} title="Rendery v pozadí do zlata">
          Render v pozadí sekcie dostane zlatý odtieň a smerom hore sa stratí v sivej stránke,
          najsilnejší je úplne dole.
        </Head>
        <div className="relative h-[60vh] overflow-hidden">
          <GoldBackdrop src="/img/ext-2.webp" />
          <div className={`relative pt-12 ${wrap}`}>
            <p className="font-display text-[32px] font-medium text-heading lg:text-[40px]">
              <strong className="text-gold">Šest důvodů</strong>, proč tady růst
            </p>
          </div>
        </div>

        <Part id="sekcie" label="Nápady na sekcie" title="Šest důvodů">
          Skúšané podoby sekcie Šest důvodů, ktoré na stránke nie sú.
        </Part>

        <Head n={11} title="Skladané karty s fotkou">
          Každý dôvod je fotka cez celú kartu a na nej biely panel s ikonou, nadpisom, textom a
          zlatou linkou. Karty sa pri scrolle ukladajú na seba, každá trochu nižšie, a
          predchádzajúca ustúpi. Funguje rovnako na mobile. Na stránke nie je, lebo rovnaký
          pohyb má Pro koho.
        </Head>
        <PhotoStack />
      </main>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
