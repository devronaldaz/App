import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import Photo from './Photo'
import { MEDIA } from '@/config/media'

/** 2. Portada del regalo */
export default function Cover() {
  return (
    <header className="relative h-[86dvh] min-h-[540px] w-full overflow-hidden rounded-b-[36px]">
      {/* 📸 INSERTA TU URL DE FOTO AQUÍ → se configura en src/config/media.js (coverPhoto) */}
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Photo src={MEDIA.coverPhoto} alt="Foto de portada" label="Foto de portada"
          className="absolute bottom-0 left-0 !h-[118%] object-[center_bottom]" />
      </motion.div>

      {/* degradado para que se lea el texto */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#2b1d12]/10 via-[#2b1d12]/10 to-[#2b1d12]/60" />

      {/* Logo / header */}
      <p className="absolute inset-x-0 top-[max(1.25rem,env(safe-area-inset-top))] text-center font-serif text-[20px] tracking-wide text-white/90 drop-shadow">
        App4u🌻
      </p>

      <div className="absolute inset-x-0 bottom-0 px-6 pb-14 text-center text-white">
        <motion.p
          className="text-[10.5px] font-medium uppercase tracking-[0.34em] text-white/80"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          Para ti
        </motion.p>
        <motion.h1
          className="mt-3 font-serif text-[44px] leading-none"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          [Insertar título]
        </motion.h1>
        <motion.p
          className="mt-3 font-serif text-[18px] italic text-white/90"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 1 }}
        >
          [Insertar nombres]
        </motion.p>
        <motion.p
          className="mt-5 text-[10px] font-medium uppercase tracking-[0.3em] text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.35, duration: 1 }}
        >
          [Insertar fecha]
        </motion.p>
        <motion.div
          className="mt-8 flex justify-center text-white/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{ opacity: { delay: 2 }, y: { duration: 2, repeat: Infinity, ease: 'easeInOut' } }}
        >
          <ChevronDown size={20} strokeWidth={1.5} />
        </motion.div>
      </div>
    </header>
  )
}
