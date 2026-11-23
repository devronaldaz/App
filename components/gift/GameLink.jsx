import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp } from './Section'
import { CardBack } from '@/components/game/Card'

/** Botón que lleva al juego (/juego) desde la página del regalo */
export default function GameLink({ compact = false }) {
  if (compact) {
    return (
      <Link
        href="/juego"
        className="mx-auto mt-6 inline-flex items-center gap-2 rounded-full border border-sun-300 bg-white/70 px-5 py-3 text-[14px] font-medium text-sun-700 transition active:scale-95"
      >
        🃏 Ir al Mazo de Preguntas <ArrowRight size={15} />
      </Link>
    )
  }

  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="px-6 pb-6 pt-4"
    >
      <div className="card mx-auto flex max-w-md items-center gap-5 px-6 py-6">
        {/* mini abanico de cartas */}
        <div className="relative h-[84px] w-[64px] shrink-0" aria-hidden="true">
          {[-10, 8].map((r) => (
            <div key={r} className="absolute inset-0" style={{ transform: `rotate(${r}deg)` }}>
              <CardBack className="!rounded-[10px] !p-1" />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="eyebrow !text-[9.5px]">Un juego para dos</p>
          <p className="mt-1 font-serif text-[19px] leading-tight text-ink">El Mazo de Preguntas</p>
          <Link
            href="/juego"
            className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 px-4 py-2 text-[13px] font-medium text-white shadow-glow transition active:scale-95"
          >
            Jugar <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.section>
  )
}
