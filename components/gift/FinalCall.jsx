import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { fadeUp } from './Section'
import { MiniSunflower } from './Sunflower'

/** 8. Cierre y transición hacia la trivia */
export default function FinalCall({ onStart }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      className="px-6 pb-10 pt-16"
    >
      <div className="card mx-auto max-w-md px-7 pb-10 pt-9 text-center">
        <motion.div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun-100"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <MiniSunflower size={28} />
        </motion.div>
        <p className="eyebrow mt-5">[Insertar subtítulo]</p>
        <p className="mx-auto mt-4 max-w-[30ch] text-[14px] font-light leading-relaxed text-muted">
          [Insertar mensaje]
        </p>
        <p className="mt-1 font-serif text-[15px] italic text-ink/80">[Insertar mensaje]</p>

        <motion.button
          type="button"
          onClick={onStart}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 px-7 py-3.5 text-[14px] font-medium text-white shadow-glow"
        >
          [Insertar texto del botón]
          <ArrowRight size={16} />
        </motion.button>
      </div>
    </motion.section>
  )
}
