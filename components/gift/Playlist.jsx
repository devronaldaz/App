import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import Section from './Section'
import Photo from './Photo'
import { MiniSunflower } from './Sunflower'
import { MEDIA } from '@/config/media'

/** 3. "Para tus viajes a la Agraria" – Playlist de Spotify */
export default function Playlist() {
  const [spinning, setSpinning] = useState(true)

  return (
    <Section
      eyebrow="[Insertar subtítulo]"
      title="[Insertar título]"
      description="[Insertar mensaje]"
    >
      {/* Disco que gira (decorativo, como en el video) */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <motion.div
            className="relative h-44 w-44 overflow-hidden rounded-full shadow-soft ring-[6px] ring-white/70"
            animate={{ rotate: spinning ? 360 : 0 }}
            transition={spinning ? { duration: 14, repeat: Infinity, ease: 'linear' } : { duration: 0.6 }}
          >
            {/* 📸 INSERTA TU URL DE FOTO AQUÍ → src/config/media.js (discPhoto) */}
            <Photo src={MEDIA.discPhoto} alt="" showLabel={false} />
            {/* surcos del vinilo */}
            <div className="absolute inset-0 rounded-full bg-[repeating-radial-gradient(circle,rgba(90,58,31,0.07)_0_1px,transparent_1px_6px)]" />
            {!MEDIA.discPhoto && (
              <div className="absolute inset-0 flex items-center justify-center">
                <MiniSunflower size={64} className="opacity-60" />
              </div>
            )}
          </motion.div>
          <motion.button
            type="button"
            onClick={() => setSpinning((s) => !s)}
            whileTap={{ scale: 0.88 }}
            aria-label={spinning ? 'Pausar disco' : 'Girar disco'}
            className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-sun-500 text-white shadow-glow"
          >
            {spinning ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
          </motion.button>
        </div>
        <p className="mt-5 font-serif text-[17px] text-ink">[Insertar texto]</p>
        <p className="eyebrow mt-1 !text-[9.5px]">Spotify</p>
      </div>

      {/* 🎵 REEMPLAZAR CON TU PLAYLIST → src/config/media.js (spotifyEmbedUrl) */}
      <div className="mt-8 overflow-hidden rounded-[22px] shadow-card">
        <iframe
          title="Playlist"
          src={MEDIA.spotifyEmbedUrl}
          width="100%"
          height="352"
          frameBorder="0"
          loading="lazy"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          className="block"
          style={{ borderRadius: 22 }}
        />
      </div>
    </Section>
  )
}
