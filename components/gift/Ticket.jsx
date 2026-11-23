import { forwardRef } from 'react'
import { MiniSunflower } from './Sunflower'

// Recorta dos muescas (semicírculos) en el borde indicado: 'bottom' o 'top'
const notchMask = (edge) => {
  const y = edge === 'bottom' ? '100%' : '0'
  const m = `radial-gradient(circle at 0 ${y}, transparent 13px, #000 13.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% ${y}, transparent 13px, #000 13.5px) right / 51% 100% no-repeat`
  return { WebkitMask: m, mask: m }
}

/**
 * Boleto final con muescas y línea perforada.
 * El ref apunta al contenedor que se convierte en imagen al tocar "Descargar Ticket"
 * (incluye un margen color crema para que la sombra y las muescas se vean en la foto).
 */
const Ticket = forwardRef(function Ticket(_, ref) {
  return (
    <div ref={ref} className="mx-auto w-full max-w-[378px] bg-cream p-6">
      <div className="relative w-full text-left drop-shadow-[0_14px_22px_rgba(90,58,31,0.2)]">
        {/* Parte superior */}
        <div
          className="rounded-t-[26px] bg-gradient-to-br from-[#fffaf0] to-[#fcf1da] px-7 pb-7 pt-7"
          style={notchMask('bottom')}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-sun-600">Boleto • Admite 2</span>
            <MiniSunflower size={22} />
          </div>
          <h4 className="mt-5 font-serif text-[27px] leading-tight text-ink">¡Lo lograste!</h4>
          <p className="mt-3 text-[14.5px] font-light leading-relaxed text-ink/80">
            Escribe aquí el premio de tu ticket.
          </p>
        </div>

        {/* Talón */}
        <div
          className="relative rounded-b-[26px] bg-gradient-to-br from-[#fbedd0] to-[#f5dfb3] px-7 pb-6 pt-6"
          style={notchMask('top')}
        >
          {/* Línea perforada */}
          <div className="absolute inset-x-5 top-0 border-t-2 border-dashed border-sun-500/45" />
          <div className="flex items-end justify-between gap-4">
            <div className="space-y-2.5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted">Válido para</p>
                <p className="mt-0.5 whitespace-nowrap text-[13px] font-medium text-ink">Tu premio 🎟️</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-muted">Emitido</p>
                <p className="mt-0.5 text-[13px] font-medium text-ink">Fecha especial</p>
              </div>
            </div>
            {/* "código de barras" decorativo */}
            <div className="flex h-12 shrink-0 items-end gap-[2px]" aria-hidden="true">
              {[3, 1, 2, 1, 3, 2, 1, 3, 1, 2, 1, 3].map((w, i) => (
                <span key={i} className="h-full bg-seed/70" style={{ width: w }} />
              ))}
            </div>
          </div>
          <p className="mt-4 text-center text-[9px] font-medium uppercase tracking-[0.35em] text-muted/80">
            A &amp; B • Nº 0001
          </p>
        </div>
      </div>
    </div>
  )
})

export default Ticket
