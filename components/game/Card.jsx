import { MiniSunflower } from '@/components/gift/Sunflower'
import { splitQuestion } from '@/lib/game/questions'

/* Tamaño de naipe (proporción 5:7), adaptable a celular */
export const CARD_SIZE = 'w-[min(72vw,270px)] aspect-[5/7]'

/** Reverso de la carta (placeholder: patrón generado con CSS, sin imágenes) */
export function CardBack({ className = '' }) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-[22px] border border-sun-200/70 p-2.5 shadow-soft ${className}`}
      style={{
        background:
          'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.35) 0 18%, transparent 19%), repeating-linear-gradient(45deg, #efc463 0 6px, #e8b44a 6px 12px)',
      }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-[16px] border-2 border-white/60 bg-[radial-gradient(circle,rgba(255,250,240,0.25),transparent_70%)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream/90 shadow-card">
          <MiniSunflower size={44} />
        </div>
      </div>
    </div>
  )
}

/** Cara de la carta con la pregunta */
export function CardFace({ card }) {
  const { title, body } = splitQuestion(card?.text)
  const secret = card?.source === 'custom'
  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-linen bg-gradient-to-b from-[#fffdf8] to-[#fbf3e6] px-6 py-6 shadow-soft">
      {/* "palos" del naipe */}
      <div className="absolute left-4 top-4 flex flex-col items-center gap-1">
        <span className="font-serif text-[13px] leading-none text-sun-600">{card?.number ?? ''}</span>
        <MiniSunflower size={13} />
      </div>
      <div className="absolute bottom-4 right-4 flex rotate-180 flex-col items-center gap-1">
        <span className="font-serif text-[13px] leading-none text-sun-600">{card?.number ?? ''}</span>
        <MiniSunflower size={13} />
      </div>

      <p className="mt-6 text-center text-[9.5px] font-semibold uppercase tracking-[0.28em] text-muted">
        {secret ? `Carta secreta${card.author ? ` · de ${card.author}` : ''}` : `Carta ${card?.number} de ${card?.total}`}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {title && <h3 className="font-serif text-[21px] leading-tight text-ink [text-wrap:balance]">{title}</h3>}
        <div className="mx-auto my-4 h-px w-10 bg-sun-400/70" />
        <p className={`text-ink/85 [text-wrap:pretty] ${body.length > 140 ? 'text-[13.5px]' : 'text-[15px]'} font-light leading-relaxed`}>
          {body}
        </p>
      </div>
    </div>
  )
}

/**
 * Carta que se voltea al aparecer (sale del mazo y gira como un naipe).
 * - `animateIn=false` la muestra directamente boca arriba (p. ej. al recargar).
 * - `leaving` ('answered' | 'penalty') la hace salir volando y descartarse.
 * Las animaciones son CSS (ver globals.css) para que no se traben si se bloquea la pantalla.
 */
export default function FlipCard({ card, animateIn = true, leaving = null, className = '' }) {
  const anim = leaving
    ? leaving === 'penalty'
      ? 'anim-card-out-down'
      : 'anim-card-out-right'
    : animateIn
      ? 'anim-card-in'
      : ''
  return (
    <div className={`relative ${CARD_SIZE} ${anim} ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
        <CardFace card={card} />
      </div>
      <div
        className="absolute inset-0"
        style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
      >
        <CardBack />
      </div>
    </div>
  )
}
