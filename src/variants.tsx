import { useState } from 'react'
import { IconAdjustmentsHorizontal, IconCheck, IconX } from '@tabler/icons-react'

// The review switcher: every section with more than one take registers its variants here with
// `variant()`, the corner panel lists them. The choice lives in the URL (?hero=wipe), so a
// link carries the exact combination; switching reloads, as the motion is measured once.
// A `hidden` option is kept in the code and reachable by its URL, but not offered.

type Option = { value: string; label: string; hidden?: boolean }
type Slot = { key: string; label: string; options: Option[]; value: string }

const slots: Slot[] = []
const params = new URLSearchParams(window.location.search)

/** The chosen variant of a section, the first option unless the URL names another. */
export function variant<const T extends string>(
  key: string,
  label: string,
  options: { value: T; label: string; hidden?: boolean }[],
): T {
  const asked = params.get(key)
  const value = options.find((o) => o.value === asked)?.value ?? options[0].value
  slots.push({ key, label, options, value })
  return value
}

function choose(key: string, value: string, first: string) {
  const url = new URL(window.location.href)
  if (value === first) url.searchParams.delete(key)
  else url.searchParams.set(key, value)
  url.hash = ''
  window.location.replace(url)
}

export function Switcher() {
  const [open, setOpen] = useState(false)
  return (
    <div className="fixed bottom-4 left-4 z-[200] font-sans text-sm">
      {open ? (
        <div className="w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-white p-4 text-heading shadow-[0_12px_40px_rgb(0_0_0/0.25)]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-[0.16em] text-subtle uppercase">
              Varianty
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Zavřít přepínač"
              className="grid size-8 place-items-center rounded-lg hover:bg-tint"
            >
              <IconX size={18} />
            </button>
          </div>

          {/* a section with a single take on offer has nothing to switch */}
          {slots
            .filter((s) => s.options.filter((o) => !o.hidden).length > 1)
            .map((s) => (
              <div key={s.key}>
                <p className="mt-4 mb-1.5 font-semibold">{s.label}</p>
                <div className="flex flex-col">
                  {s.options
                    .filter((o) => !o.hidden || o.value === s.value)
                    .map((o) => (
                      <button
                        key={o.value}
                        onClick={() =>
                          o.value !== s.value && choose(s.key, o.value, s.options[0].value)
                        }
                        className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left ${o.value === s.value ? 'bg-tint font-semibold text-primary' : 'hover:bg-page'}`}
                      >
                        {o.label}
                        {o.value === s.value && <IconCheck size={16} />}
                      </button>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Přepínač variant"
          className="relative flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-white font-semibold text-primary shadow-[0_8px_24px_rgb(0_0_0/0.25)] hover:bg-tint lg:px-4"
        >
          <IconAdjustmentsHorizontal size={18} />
          <span className="hidden lg:inline">Varianty</span>
          {slots.some((s) => s.value !== s.options[0].value) && (
            // something other than the first take is on
            <span className="absolute top-1 right-1 size-2 rounded-full bg-gold lg:static" />
          )}
        </button>
      )}
    </div>
  )
}
