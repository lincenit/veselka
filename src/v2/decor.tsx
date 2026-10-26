import { Facade } from '../lamellas'

// Version 2's graphic language is the facade: gold fins on every blue field, and a fine gold
// line on the edge of every picture as it comes in (motion.ts).

// Gold fins thinned out with opacity turn grey on blue, so they stay strong and a mask keeps
// them to the part of the field the copy does not use.
const MASKS = {
  right: '[mask-image:linear-gradient(90deg,transparent_25%,black_75%)]',
  bottom: '[mask-image:linear-gradient(0deg,black_0%,transparent_65%)]',
  // only the band under the copy
  foot: '[mask-image:linear-gradient(0deg,black_0%,transparent_40%)]',
}

/** The living facade on a blue field: gold fins, loose until the field reaches the middle of
 *  the screen, then lined up into the chevron. */
export function Lamellas({ opacity = 0.6, mask }: { opacity?: number; mask?: keyof typeof MASKS }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 ${mask ? MASKS[mask] : ''}`}>
      <Facade gap={26} amp={0.16} opacity={opacity} />
    </div>
  )
}

/** The fine gold line riding the edge of a picture that is being revealed. motion.ts writes
 *  the same points into it and into the picture's clip-path. */
export function WipeEdge({ name = '' }: { name?: string }) {
  return (
    <svg
      data-wipe-edge={name}
      aria-hidden
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-20 size-full opacity-0"
    >
      <polyline fill="none" stroke="#f6d47a" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      
    </svg>
  )
}
