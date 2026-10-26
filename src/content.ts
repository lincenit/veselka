// Every word on the page. Copy comes from the client brief (Zuzana Fridrich, 2026-10-23), the
// phone and the partners from "Allrisk VESELKA - základní informace" (2026-10-22); social links
// are placeholders until the client confirms its profiles.
// A `*phrase*` in a title is its emphasis, set in gold.

export const nav = [
  { href: '#projekt', label: 'Projekt' },
  { href: '#benefity', label: 'Benefity' },
  { href: '#pro-koho', label: 'Pro koho' },
  { href: '#vizualizace', label: 'Vizualizace' },
  { href: '#prostory', label: 'Prostory' },
  { href: '#lokalita', label: 'Lokalita' },
]

export const hero = {
  eyebrow: 'Business & Lifestyle Park · Troubsko u Brna',
  title: ['Prémiový prostor s charakterem', '*pro značky s ambicí*'],
  lead: 'Reprezentativní komerční prostory, které nejsou jen dobrou adresou, ale stávají se součástí image vaší značky.',
  cta: 'Mám zájem o prostor',
  secondary: 'Poznat projekt',
  image: '/img/hero.webp',
  // the hero variants with more than one picture (slideshow, mosaic, panels) run through these
  slides: [
    { src: '/img/hero.webp', caption: 'Zlatá fasáda od příjezdové cesty' },
    { src: '/img/ext-1.webp', caption: 'Parter s kavárnou a terasou' },
    { src: '/img/ext-6.webp', caption: 'Příjezd od kruhového objezdu' },
    { src: '/img/ext-3.webp', caption: 'Vstup s orientačním pylonem' },
    { src: '/img/ext-4.webp', caption: 'Letecký pohled od dálnice' },
    { src: '/img/int-1.webp', caption: 'Recepce nájemce po Fit Out' },
  ],
  facts: [
    { label: 'Lokalita', value: 'Troubsko u Brna' },
    { label: 'Nabídka', value: 'Pronájem i prodej' },
    { label: 'Jednotky', value: 'Od 70 m²' },
    { label: 'Provedení', value: 'Shell & Core · Fit Out' },
  ],
  scroll: 'Scrollujte',
}

export const intro = {
  eyebrow: 'O projektu',
  title: 'Nejde o další komerční zónu. Jde o *místo s vlastním výrazem.*',
  paragraphs: [
    'Allrisk VESELKA vzniká jako moderní business & lifestyle park v Troubsku u Brna. Výrazná architektura, strategická dostupnost a promyšlená skladba nájemců vytváří prostředí pro služby a značky s vyšší přidanou hodnotou.',
    'Propojujeme moderní business prostředí, odborné služby, wellbeing koncepty, design a showroomové značky do jednoho funkčního celku. Alternativa k anonymním retailovým zónám a generickým kancelářským komplexům, jaká nemá nejen v Brně obdoby.',
  ],
}

export const benefits = {
  eyebrow: 'Proč Allrisk VESELKA',
  title: '*Šest důvodů*, proč tady růst',
  items: [
    {
      icon: 'building',
      image: '/img/architektura.webp',
      title: 'Výrazná architektura a identita',
      text: 'Zlatá fasáda přirozeně přitahuje pozornost, zvyšuje zapamatovatelnost místa a podporuje image značek, které tu sídlí.',
    },
    {
      icon: 'road',
      image: '/img/ext-4.webp',
      title: 'Strategická poloha',
      text: 'Výborná dostupnost autem i MHD a napojení na hlavní dopravní tahy. Bez zajíždění do centra a bez hledání parkování.',
    },
    {
      icon: 'diamond',
      image: '/img/ext-1.webp',
      title: 'Exkluzivní prostředí a kvalitní klientela',
      text: 'Bonitní klienti orientovaní na kvalitu, profesionální služby na vysoké úrovni a silný zákaznický zážitek.',
    },
    {
      icon: 'puzzle',
      image: '/img/ext-2.webp',
      title: 'Synergie nájemců',
      text: 'Promyšlený mix služeb, značek a konceptů, které se vzájemně podporují typem klientely i úrovní služeb.',
    },
    {
      icon: 'parking',
      image: '/img/ext-6.webp',
      title: 'Komfort pro vaše služby i klientelu',
      text: 'Parkování přímo v areálu pro klienty i zaměstnance, přehlednost, diskrétnost a soukromí, které prémiová klientela očekává.',
    },
    {
      icon: 'key',
      image: '/img/int-1.webp',
      title: 'Shell & Core i Fit Out',
      text: 'Komerční jednotky od 70 m² k prodeji i pronájmu. Prostor převezmete ve stavu Shell & Core a dotvoříte po svém, nebo vám jej připravíme na klíč přesně podle vašich představ.',
    },
  ],
  // the earlier separate gold block, still shown by v2.html and v3.html
  fitout: {
    image: '/img/int-1.webp',
    title: 'Shell & Core *i Fit Out*',
    text: 'Komerční jednotky od 70 m² k prodeji i pronájmu. Prostor převezmete ve stavu Shell & Core a dotvoříte po svém, nebo vám jej připravíme na klíč přesně podle vašich představ.',
  },
}

// The tenant categories of "základní informace" (2026-10-22), each with its line from the same
// document. The photos are the building's renders and Unsplash stand-ins (free licence) until
// the client sends its own.
export const audience = {
  eyebrow: 'Pro koho',
  title: 'Moderní komerční prostory *pro všechna vaše zaměření*',
  lead: 'Společným jmenovatelem našich nájemců je důraz na profesionalitu, důvěryhodnost, estetiku a prémiový klientský servis.',
  items: [
    {
      icon: 'clinic',
      images: ['/img/persona-clinic.jpg', '/img/persona-clinic-2.jpg', '/img/persona-clinic-3.jpg'],
      title: 'Kliniky a ordinace',
      text: 'Moderní komerční prostory pro vaši ordinaci i kliniku.',
      kinds: ['Ordinace', 'Privátní klinika', 'Estetická medicína', 'Fyzioterapie'],
    },
    {
      icon: 'cafe',
      images: ['/img/ext-1.webp', '/img/persona-showroom-3.jpg', '/img/persona-cafe.jpg'],
      title: 'Kavárny a restaurace',
      text: 'Moderní komerční prostory pro vaši restauraci či kavárnu.',
      kinds: ['Kavárna', 'Restaurace', 'Bistro'],
    },
    {
      icon: 'shop',
      images: ['/img/persona-showroom.jpg', '/img/persona-showroom-2.jpg', '/img/ext-2.webp'],
      title: 'Obchody a služby',
      text: 'Velkorysé komerční prostory pro váš market, služby i obchodní jednotku.',
      kinds: ['Market', 'Obchodní jednotka', 'Showroom', 'Služby'],
    },
    {
      icon: 'wellbeing',
      images: ['/img/persona-beauty.jpg', '/img/persona-wellbeing-2.jpg', '/img/persona-wellbeing.jpg'],
      title: 'Beauty a wellbeing koncepty',
      text: 'Prémiové komerční prostory pro váš beauty salon i wellbeing koncept.',
      kinds: ['Beauty salon', 'Kosmetika', 'Masáže', 'Wellbeing'],
    },
    {
      icon: 'fitness',
      images: ['/img/persona-fitness.jpg', '/img/persona-fitness-2.jpg', '/img/persona-fitness-3.jpg'],
      title: 'Fitness centrum',
      text: 'Exkluzivní komerční prostory pro vaše fitness studio.',
      kinds: ['Fitness centrum', 'Fitness studio', 'Pohyb a aktivní životní styl'],
    },
  ],
}

export const gallery = {
  eyebrow: 'Vizualizace',
  title: 'Architektura, která se *nezapomíná*',
  lead: 'Zlatá fasáda, prosklené parterové jednotky a parkování přímo před vstupem.',
  // The renders from the current allriskveselka.cz (webadmin media, originals up to 4000px).
  tabs: { exterior: 'Exteriér', interior: 'Interiér' },
  shots: [
    { src: '/img/ext-1.webp', kind: 'exterior', caption: 'Parter s kavárnou a terasou' },
    { src: '/img/ext-6.webp', kind: 'exterior', caption: 'Příjezd od kruhového objezdu' },
    { src: '/img/ext-3.webp', kind: 'exterior', caption: 'Vstup s orientačním pylonem' },
    { src: '/img/ext-2.webp', kind: 'exterior', caption: 'Nároží s obchodní jednotkou' },
    { src: '/img/ext-4.webp', kind: 'exterior', caption: 'Letecký pohled od dálnice' },
    { src: '/img/ext-5.webp', kind: 'exterior', caption: 'Letecký pohled od Troubska' },
    { src: '/img/int-1.webp', kind: 'interior', caption: 'Recepce nájemce po Fit Out' },
  ],
}

// The offer itself (offer.tsx); its units are mock data until the Realman feed is connected.
export const offer = {
  eyebrow: 'Nabídka prostor',
  title: 'Vyberte si *svůj prostor*',
}

export const location = {
  eyebrow: 'Lokalita',
  title: 'Troubsko *u Brna*',
  text: 'Na dosah Brna, a přesto mimo jeho dopravu. Vaši klienti přijedou rychle, zaparkují přímo před vchodem a nemusí řešit centrum města.',
  points: [
    {
      icon: 'road',
      title: 'Napojení na hlavní tahy',
      text: 'Rychlý příjezd autem i MHD odkudkoli z Brna i okolí, bez hledání cesty.',
    },
    {
      icon: 'building',
      title: 'Mimo centrum města',
      text: 'Žádné zácpy ani zóny placeného stání, vaši klienti přijedou v klidu.',
    },
    {
      icon: 'parking',
      title: 'Parkování v areálu',
      text: 'Stání přímo před vchodem, pro nájemce i jejich klienty.',
    },
  ],
  // read off the map label "Veselka" by Troubsko, not surveyed - replace with the plot's own
  pin: { lat: 49.1785, lng: 16.507 },
  navigate: { label: 'Navigovat', href: 'https://mapy.cz/zakladni?x=16.507&y=49.1785&z=15' },
}

export const partners = {
  eyebrow: 'Kdo stojí za projektem',
  title: 'Za projektem stojí',
  items: [
    { logo: '', name: 'Allrisk Veselka, s.r.o.', role: 'Developer projektu' },
    {
      logo: '/img/partner-gebas-white.png',
      name: 'Gebas atelier architects',
      role: 'Generální projektant',
    },
    {
      logo: '/img/partner-reality-white.png',
      name: 'Allrisk reality & finance, a.s.',
      role: 'Výhradní realitní zástupce',
    },
  ],
}

// the handle is a placeholder like the links until the client confirms its profiles
export const social = {
  eyebrow: 'Sociální sítě',
  title: 'Sledujte, jak *Veselka roste*',
  lead: 'Průběh výstavby, noví nájemci a akce v parku. Všechno nejdřív na našich sítích.',
  handle: '@allriskveselka',
}

export const contact = {
  eyebrow: 'Kontakt',
  title: 'Najděte pro svou značku *adresu s charakterem*',
  lead: 'Zanechte nám kontakt a my se vám ozveme s podrobnostmi o prostorech, dispozicích a možnostech pronájmu či koupě.',
  consent: 'Souhlasím se zpracováním osobních údajů za účelem odpovědi na můj dotaz.',
  submit: 'Odeslat poptávku',
  success: {
    title: 'Děkujeme za váš zájem',
    text: 'Vaši poptávku jsme přijali a brzy se vám ozveme.',
  },
  phone: '+420 770 332 223',
  email: 'info@allriskveselka.cz',
  web: 'www.allriskveselka.cz',
  socials: [
    { icon: 'instagram', label: 'Instagram', href: '#', text: 'Fotky z výstavby a život v parku' },
    { icon: 'facebook', label: 'Facebook', href: '#', text: 'Novinky, akce a pozvánky' },
    { icon: 'youtube', label: 'YouTube', href: '#', text: 'Videa a prohlídky prostorů' },
    { icon: 'linkedin', label: 'LinkedIn', href: '#', text: 'Nájemci, partneři a byznys' },
  ],
}

export const footer = {
  intro: 'Prémiový business & lifestyle park v Troubsku u Brna pro značky a služby s ambicí.',
  columns: {
    nav: 'Projekt',
    contact: 'Kontakt',
  },
  copyright: 'Allrisk Veselka, s.r.o.',
  legal: [
    { label: 'Ochrana osobních údajů', href: '#' },
    { label: 'Cookies', href: '#' },
  ],
  note: 'Vizualizace jsou ilustrativní.',
}
