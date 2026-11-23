import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, Download, Loader2 } from 'lucide-react'
import Ticket from './Ticket'
import GameLink from './GameLink'
import { MiniSunflower } from './Sunflower'

const QUESTIONS = [
  { q: "Pregunta 1: escribe aquí tu pregunta", options: ["Opción A", "Opción B", "Opción C"], correct: 0 },
  { q: "Pregunta 2: escribe aquí tu pregunta", options: ["Opción A", "Opción B", "Opción C"], correct: 1 },
  { q: "Pregunta 3: escribe aquí tu pregunta", options: ["Opción A", "Opción B", "Opción C"], correct: 2 },
]

const LETTERS = ['A', 'B', 'C']

/** 9. Minijuego (trivia) + recompensa final */
export default function Trivia({ onClose }) {
  const [step, setStep] = useState(0) // 0..2 preguntas, 3 = ganó
  const [picked, setPicked] = useState(null)
  const [status, setStatus] = useState(null) // 'right' | 'wrong'
  const [showTicket, setShowTicket] = useState(false)
  const ticketRef = useRef(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  /** Convierte el ticket en imagen PNG y la descarga / comparte para guardarla en la galería */
  const downloadTicket = async () => {
    if (!ticketRef.current || saving) return
    setSaving(true)
    setSaveError('')
    try {
      const { toBlob } = await import('html-to-image')
      const opts = { pixelRatio: 3, backgroundColor: '#FBF6EE', cacheBust: true }
      await toBlob(ticketRef.current, opts) // 1ª pasada: Safari a veces no pinta fuentes/emojis a la primera
      const blob = await toBlob(ticketRef.current, opts)
      if (!blob) throw new Error('sin imagen')
      const file = new File([blob], 'Ticket App4u.png', { type: 'image/png' })

      // En el celular: menú de compartir → "Guardar imagen" (va directo a la galería)
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: 'Mi ticket 🎟️' })
          return
        } catch (e) {
          if (e?.name === 'AbortError') return // cerró el menú sin elegir
        }
      }
      // En computadora (o si no se puede compartir): descarga directa
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Ticket App4u.png'
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(url), 4000)
    } catch {
      setSaveError('No se pudo guardar. Prueba con una captura de pantalla 📸')
    } finally {
      setSaving(false)
    }
  }

  // bloquear el scroll del fondo
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    if (step === 3) {
      const t = setTimeout(() => setShowTicket(true), 1600)
      return () => clearTimeout(t)
    }
  }, [step])

  const choose = (i) => {
    if (status === 'right') return
    setPicked(i)
    if (i === QUESTIONS[step].correct) {
      setStatus('right')
      setTimeout(() => {
        setStep((s) => s + 1)
        setPicked(null)
        setStatus(null)
      }, 900)
    } else {
      setStatus('wrong')
      setTimeout(() => {
        setPicked(null)
        setStatus(null)
      }, 1100)
    }
  }

  const won = step === 3

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-cream"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.6 } }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_55%_at_50%_0%,#fdf0d5_0%,transparent_70%)]" />

      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-5 top-5 z-10 rounded-full p-2 text-muted transition active:scale-90"
      >
        <X size={20} strokeWidth={1.5} />
      </button>

      <div className="relative mx-auto flex min-h-full max-w-md flex-col justify-center px-6 py-16">
        <AnimatePresence mode="wait">
          {!won ? (
            <motion.div
              key={`q${step}`}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }}
              exit={{ opacity: 0, y: -20, transition: { duration: 0.35 } }}
            >
              {step === 0 && (
                <p className="mx-auto mb-6 max-w-[34ch] text-center text-[13px] font-light leading-relaxed text-muted">
                  Para descubrir la última sorpresa tendrás que responder unas preguntas sobre nosotros.
                </p>
              )}

              {/* progreso */}
              <div className="mb-8 flex justify-center gap-1.5">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === step ? 'w-6 bg-sun-500' : i < step ? 'w-1.5 bg-sun-400' : 'w-1.5 bg-muted/25'
                    }`}
                  />
                ))}
              </div>

              <motion.div
                className="card px-6 pb-6 pt-7"
                animate={status === 'wrong' ? { x: [0, -10, 10, -7, 7, -3, 0] } : { x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <p className="eyebrow">Pregunta {step + 1} de 3</p>
                <h3 className="mt-3 font-serif text-[23px] leading-snug text-ink">{QUESTIONS[step].q}</h3>

                <div className="mt-6 flex flex-col gap-2.5">
                  {QUESTIONS[step].options.map((opt, i) => {
                    const isPicked = picked === i
                    const right = isPicked && status === 'right'
                    const wrong = isPicked && status === 'wrong'
                    return (
                      <motion.button
                        key={opt}
                        type="button"
                        onClick={() => choose(i)}
                        whileTap={{ scale: 0.98 }}
                        className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 text-left text-[15px] transition-colors duration-300 ${
                          right
                            ? 'border-sun-400 bg-sun-100 text-ink'
                            : wrong
                              ? 'border-[#e3b1a3] bg-[#fbe9e3] text-ink'
                              : 'border-linen bg-white/60 text-ink/85'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
                            right ? 'bg-sun-500 text-white' : wrong ? 'bg-[#d98e78] text-white' : 'bg-sand text-muted'
                          }`}
                        >
                          {right ? <Check size={14} strokeWidth={2.5} /> : wrong ? <X size={14} strokeWidth={2.5} /> : LETTERS[i]}
                        </span>
                        {opt}
                      </motion.button>
                    )
                  })}
                </div>

                <div className="h-6 pt-4 text-center text-[12.5px]">
                  <AnimatePresence mode="wait">
                    {status === 'wrong' && (
                      <motion.p key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[#b9715d]">
                        Mmm… casi. Inténtalo otra vez.
                      </motion.p>
                    )}
                    {status === 'right' && (
                      <motion.p key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-sun-600">
                        ¡Correcto!
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="win"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.8 } }}
              className="text-center"
            >
              <FloatingPetals />
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 1, ease: [0.22, 1, 0.36, 1] } }}
              >
                <h3 className="font-serif text-[32px] text-ink">¡Lo has conseguido! 🌻</h3>
                <p className="mx-auto mt-2 max-w-[30ch] text-[13.5px] font-light text-muted [text-wrap:balance]">
                  Sabía que no ibas a fallar. Aquí tienes tu recompensa.
                </p>
              </motion.div>

              <AnimatePresence>
                {showTicket && (
                  <motion.div
                    key="ticket"
                    initial={{ opacity: 0, y: 80, rotateX: 55, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
                    style={{ transformPerspective: 900 }}
                    className="mt-6"
                  >
                    <Ticket ref={ticketRef} />
                    <div className="flex flex-col items-center">
                      <button
                        type="button"
                        onClick={downloadTicket}
                        disabled={saving}
                        className="mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 px-7 py-3.5 text-[15px] font-medium text-white shadow-glow transition active:scale-95 disabled:opacity-60"
                      >
                        {saving ? <Loader2 size={17} className="animate-spin" /> : <Download size={17} />}
                        Descargar Ticket
                      </button>
                      {saveError && <p className="mt-2 text-[12px] text-[#b9715d]">{saveError}</p>}
                      <GameLink compact />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

/** Pétalos / girasoles que flotan hacia arriba (como los corazones del video) */
function FloatingPetals() {
  const items = Array.from({ length: 18 }, (_, i) => ({
    left: (i * 37) % 100,
    delay: (i % 6) * 0.45 + Math.floor(i / 6) * 0.2,
    dur: 5 + (i % 4),
    size: 8 + (i % 3) * 5,
    flower: i % 4 === 0,
  }))
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      {items.map((p, i) => (
        <motion.span
          key={i}
          className="absolute bottom-[-30px]"
          style={{ left: `${p.left}%` }}
          initial={{ y: 0, opacity: 0, rotate: 0 }}
          animate={{ y: '-110vh', opacity: [0, 0.9, 0.9, 0], rotate: 220, x: [0, 14, -10, 6] }}
          transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        >
          {p.flower ? (
            <MiniSunflower size={p.size + 8} />
          ) : (
            <svg width={p.size} height={p.size * 1.8} viewBox="0 0 10 18">
              <ellipse cx="5" cy="9" rx="4" ry="8.5" fill="#F0B530" opacity="0.8" />
            </svg>
          )}
        </motion.span>
      ))}
    </div>
  )
}
