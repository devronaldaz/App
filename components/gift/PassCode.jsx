import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Check } from 'lucide-react'

// 🔑 CLAVE DE ACCESO (fecha en formato DD MM AAAA, solo números)
const PASSWORD = '01012000'

// Grupos de casillas: DD / MM / AAAA
const GROUPS = [
  { label: 'DD', size: 2 },
  { label: 'MM', size: 2 },
  { label: 'AAAA', size: 4 },
]
const LENGTH = GROUPS.reduce((n, g) => n + g.size, 0)

/** Ventana emergente para ingresar la clave (una fecha) */
export default function PassCode({ onSuccess }) {
  const [digits, setDigits] = useState(Array(LENGTH).fill(''))
  const [status, setStatus] = useState(null) // null | 'wrong' | 'right'
  const inputs = useRef([])

  useEffect(() => {
    const t = setTimeout(() => inputs.current[0]?.focus(), 650)
    return () => clearTimeout(t)
  }, [])

  const check = (next) => {
    if (next.some((d) => d === '')) return
    if (next.join('') === PASSWORD) {
      setStatus('right')
      inputs.current.forEach((el) => el?.blur())
      setTimeout(onSuccess, 1100)
    } else {
      setStatus('wrong')
      setTimeout(() => {
        setDigits(Array(LENGTH).fill(''))
        setStatus(null)
        inputs.current[0]?.focus()
      }, 1300)
    }
  }

  const setAt = (i, value) => {
    if (status) return
    const clean = value.replace(/\D/g, '')
    if (!clean) return
    const next = [...digits]
    // permite pegar o autocompletar varios dígitos a la vez
    let j = i
    for (const ch of clean) {
      if (j >= LENGTH) break
      next[j++] = ch
    }
    setDigits(next)
    if (j < LENGTH) inputs.current[j]?.focus()
    check(next)
  }

  const onKeyDown = (i, e) => {
    if (status) return
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = [...digits]
      if (next[i]) {
        next[i] = ''
      } else if (i > 0) {
        next[i - 1] = ''
        inputs.current[i - 1]?.focus()
      }
      setDigits(next)
    } else if (e.key === 'ArrowLeft' && i > 0) {
      inputs.current[i - 1]?.focus()
    } else if (e.key === 'ArrowRight' && i < LENGTH - 1) {
      inputs.current[i + 1]?.focus()
    }
  }

  let idx = 0

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      {/* fondo */}
      <div className="absolute inset-0 bg-[#3a2e28]/25 backdrop-blur-[3px]" />

      {/* pestaña */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="clave-titulo"
        initial={{ y: '100%' }}
        animate={{ y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
        exit={{ y: '100%', transition: { duration: 0.45 } }}
        className="relative w-full max-w-[480px] rounded-t-[32px] bg-cream px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_50px_-20px_rgba(90,58,31,0.35)] sm:rounded-[32px]"
      >
        <div className="mx-auto mb-6 h-1 w-10 rounded-full bg-muted/25" />

        <div className="text-center">
          <motion.div
            className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-500 ${
              status === 'right' ? 'bg-sun-500 text-white' : 'bg-sun-100 text-sun-600'
            }`}
            animate={status === 'right' ? { scale: [1, 1.15, 1] } : {}}
          >
            {status === 'right' ? <Check size={20} strokeWidth={2.2} /> : <Lock size={19} strokeWidth={1.8} />}
          </motion.div>
          <p className="eyebrow mt-4">Un último paso</p>
          <h3 id="clave-titulo" className="mt-2 font-serif text-[25px] leading-tight text-ink">
            Ingresa la clave
          </h3>
          <p className="mx-auto mt-2 max-w-[30ch] text-[13.5px] font-light leading-relaxed text-muted">
            [Insertar pista de la clave]
          </p>
        </div>

        {/* casillas */}
        <motion.div
          className="mt-7 flex items-end justify-center gap-1.5"
          animate={status === 'wrong' ? { x: [0, -10, 10, -7, 7, -3, 0] } : { x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {GROUPS.map((g, gi) => (
            <div key={g.label} className="flex items-end gap-1.5">
              <div className="flex flex-col items-center">
                {/* formato encima de las casillas */}
                <span className="mb-2 text-[11px] font-semibold tracking-[0.3em] text-sun-600">{g.label}</span>
                <div className="flex gap-1">
                  {Array.from({ length: g.size }, () => {
                    const i = idx++
                    const filled = digits[i] !== ''
                    return (
                      <input
                        key={i}
                        ref={(el) => (inputs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete="one-time-code"
                        maxLength={LENGTH}
                        value={digits[i]}
                        onChange={(e) => setAt(i, e.target.value)}
                        onKeyDown={(e) => onKeyDown(i, e)}
                        onFocus={(e) => e.target.select()}
                        aria-label={`${g.label}, dígito ${i + 1} de ${LENGTH}`}
                        className={`h-12 w-[30px] rounded-[10px] border p-0 text-center font-serif text-[20px] text-ink caret-sun-500 outline-none transition-all duration-300 focus:border-sun-400 focus:bg-white focus:ring-2 focus:ring-sun-200 ${
                          status === 'wrong'
                            ? 'border-[#e3b1a3] bg-[#fbe9e3]'
                            : status === 'right'
                              ? 'border-sun-400 bg-sun-50'
                              : filled
                                ? 'border-sun-300 bg-white'
                                : 'border-linen bg-white/60'
                        }`}
                      />
                    )
                  })}
                </div>
              </div>
              {gi < GROUPS.length - 1 && <span className="pb-3 font-serif text-[20px] text-muted/50">/</span>}
            </div>
          ))}
        </motion.div>

        <p className="mt-3 text-center text-[11.5px] text-muted/80">Ejemplo: 25 / 12 / 2000</p>

        <div className="mt-4 h-5 text-center text-[13px]">
          <AnimatePresence mode="wait">
            {status === 'wrong' && (
              <motion.p key="w" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[#b9715d]">
                Esa no es… piénsalo otra vez.
              </motion.p>
            )}
            {status === 'right' && (
              <motion.p key="r" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-sun-600">
                ¡Correcto! Abriendo tu regalo…
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
