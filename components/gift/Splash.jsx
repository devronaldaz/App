import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sunflower from './Sunflower'
import PassCode from './PassCode'

/**
 * 1. Pantalla de inicio.
 * Al tocar el girasol: se abre (pétalos), gira y crece,
 * aparece "Has abierto tu regalo" y luego se revela el contenido.
 */
export default function Splash({ onOpen }) {
  const [phase, setPhase] = useState('idle') // idle → blooming → opened
  const [asking, setAsking] = useState(false) // ventana de la clave

  const handleTap = () => {
    if (phase !== 'idle') return
    setPhase('blooming')
    setTimeout(() => setPhase('opened'), 1100)
    // tras "Has abierto tu regalo" aparece la ventana de la clave
    setTimeout(() => setAsking(true), 2600)
  }

  return (
    <motion.div
      key="splash"
      exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden px-6"
    >
      {/* Logo / header */}
      <motion.p
        className="absolute inset-x-0 top-[max(1.5rem,env(safe-area-inset-top))] text-center font-serif text-[22px] tracking-wide text-ink"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: phase === 'idle' ? 1 : 0, y: 0 }}
        transition={{ duration: 0.9 }}
      >
        App4u🌻
      </motion.p>

      <AnimatePresence>
        {phase === 'idle' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] } }}
            exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.6 } }}
            className="card w-full max-w-sm px-7 pb-8 pt-9 text-center"
          >
            <p className="eyebrow">Tienes un regalo</p>
            <div className="mx-auto mt-3 h-5 w-px rotate-[20deg] bg-muted/40" />
            <h1 className="mt-3 font-serif text-[30px] leading-[1.18] text-ink [text-wrap:balance]">
              Porque hay personas que son luz
            </h1>
            <div className="mx-auto my-5 h-px w-14 bg-sun-400/60" />
            <p className="mx-auto max-w-[30ch] font-serif text-[15px] italic leading-relaxed text-ink/75">
              Todo lo que vas a ver aquí fue hecho especialmente para ti. Tómate tu tiempo para explorarlo.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Girasol interactivo */}
      <motion.button
        type="button"
        onClick={handleTap}
        aria-label="Toca el girasol para abrir el regalo"
        className="relative mt-10 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-sun-400/60"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={
          phase === 'idle'
            ? { opacity: 1, scale: 1, y: 0, rotate: 0, transition: { duration: 1, delay: 0.6 } }
            : { opacity: 1, scale: 1.55, y: -40, rotate: 120, transition: { duration: 1.6, ease: [0.22, 1, 0.36, 1] } }
        }
        whileTap={{ scale: 0.92 }}
      >
        {/* halo */}
        <motion.span
          className="absolute inset-0 -z-10 rounded-full bg-sun-300/40 blur-2xl"
          animate={{ scale: [0.9, 1.25, 0.9], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* palpitar suave */}
        <motion.div
          animate={phase === 'idle' ? { scale: [1, 1.07, 1, 1.04, 1] } : { scale: 1 }}
          transition={{ duration: 1.8, repeat: phase === 'idle' ? Infinity : 0, ease: 'easeInOut' }}
        >
          <Sunflower size={128} bloom={phase === 'idle' ? 0.72 : 1} />
        </motion.div>
      </motion.button>

      <AnimatePresence>
        {phase === 'idle' && (
          <motion.p
            key="hint"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.3, duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.4 } }}
            className="mt-6 text-[13px] font-light tracking-wide text-muted"
          >
            Toca el girasol para abrirlo.
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'opened' && (
          <motion.div
            key="opened"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }}
            className="absolute inset-x-0 bottom-[22%] px-8 text-center"
          >
            <h2 className="font-serif text-[28px] text-ink">Has abierto tu regalo</h2>
            <p className="mt-2 text-[13px] font-light text-muted">
              Cada sección guarda un pedacito de este regalo.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>{asking && <PassCode onSuccess={onOpen} />}</AnimatePresence>
    </motion.div>
  )
}
