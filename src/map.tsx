import { useEffect, useRef } from 'react'
import { IconMinus, IconPlus } from '@tabler/icons-react'
import 'maplibre-gl/dist/maplibre-gl.css'

// The same basemap as the reality site (OpenFreeMap "positron", free, no key) - not Google.
const STYLE = 'https://tiles.openfreemap.org/styles/positron'

type Props = {
  lat: number
  lng: number
  label: string
  /** on desktop, the share of the width covered by the page's copy: the pin centres in the rest */
  padLeft?: number
  /** the section's colour for the pin and the zoom buttons */
  tone?: 'blue' | 'gold'
}

export function LocationMap({ lat, lng, label, padLeft = 0, tone = 'blue' }: Props) {
  const box = useRef<HTMLDivElement>(null)
  const zoom = useRef<{ remove: () => void; zoomIn: () => void; zoomOut: () => void }>(undefined)

  useEffect(() => {
    let map: (typeof zoom)['current']
    let gone = false
    // MapLibre is ~800 kB; it loads only when the section is reached.
    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (gone || !box.current) return
      try {
        const m = new maplibregl.Map({
          container: box.current,
          style: STYLE,
          center: [lng, lat],
          zoom: 11.5,
          // the page scrolls with the wheel; the map zooms with its buttons
          scrollZoom: false,
          attributionControl: { compact: true },
        })
        const pin = document.createElement('div')
        pin.className = `veselka-pin ${tone === 'gold' ? 'is-gold' : ''}`
        pin.innerHTML = `<span>${label}</span>`
        new maplibregl.Marker({ element: pin, anchor: 'bottom' }).setLngLat([lng, lat]).addTo(m)
        const pad = () =>
          m.setPadding({
            top: 0,
            right: 0,
            bottom: 0,
            left: window.innerWidth >= 1024 ? m.getContainer().clientWidth * padLeft : 0,
          })
        pad()
        m.on('resize', pad)
        map = m
        zoom.current = m
      } catch {
        // no WebGL: the box keeps its tinted ground and the navigate link still works
      }
    })
    return () => {
      gone = true
      map?.remove()
    }
  }, [lat, lng, label, padLeft, tone])

  // our own buttons, styled like the page's "Navigovat" one, instead of MapLibre's control
  const btn =
    `grid size-11 place-items-center rounded-lg bg-white shadow-[0_12px_24px_-12px_rgb(0_0_0/0.35)] transition-colors ${tone === 'gold' ? 'text-gold hover:bg-gold-wash' : 'text-primary hover:bg-tint'}`
  return (
    <>
      {/* the tiles in black and white like every photo ground on the page; the pin keeps its blue */}
      <div ref={box} className="size-full bg-tint [&_.maplibregl-canvas]:grayscale" />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button onClick={() => zoom.current?.zoomIn()} aria-label="Přiblížit" className={btn}>
          <IconPlus size={20} />
        </button>
        <button onClick={() => zoom.current?.zoomOut()} aria-label="Oddálit" className={btn}>
          <IconMinus size={20} />
        </button>
      </div>
    </>
  )
}
