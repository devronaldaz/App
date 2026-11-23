import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, ArrowRight } from 'lucide-react'
import { CardBack } from './Card'
import { normalizeCode } from '@/lib/game/logic'

/** Pantalla de inicio: nombre + crear sala / unirse con código */
export default function RoomJoin({ initialName = '', initialCode = '', notice = '', demoMode, onCreate, onJoin }) {
  const [name, setName] = useState(initialName)
  const [code, setCode] = useState(initialCode)
  const [mode, setMode] = useState(initialCode ? 'join' : null) // null | 'join'
  const [busy, setBusy] = useState(null) // 'create' | 'join'
  const [error, setError] = useState(notice)

  useEffect(() => setError(notice), [notice])

  const cleanName = name.trim().slice(0, 24)

  const run = async (kind, fn) => {
    if (!cleanName) return setError('Primero escribe tu nombre.')
    setError('')
    setBusy(kind)
    try {
      await fn()
    } catch (e) {
      setError(e.message || 'Algo salió mal. Intenta otra vez.')
    } finally {
      setBusy(null)
    }
  }

  const join = () => {
    if (mode !== 'join') return setMode('join')
    if (code.length !== 4) return setError('El código tiene 4 letras o números.')
    run('join', () => onJoin(cleanName, code))
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12">
      {/* abanico de cartas decorativo */}
      <div className="relative mb-10 h-40 w-40" aria-hidden="true">
        {[-14, 0, 14].map((r, i) => (
          <motion.div
            key={r}
            className="absolute left-1/2 top-0 w-[100px] -translate-x-1/2"
            style={{ aspectRatio: '5 / 7', transformOrigin: '50% 110%' }}
            initial={{ rotate: 0, opacity: 0, y: 20 }}
            animate={{ rotate: r, opacity: 1, y: 0 }}
            transition={{ delay: 0.15 * i, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <CardBack className="!rounded-[14px] !p-1.5" />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.9 }}
        className="w-full max-w-sm text-center"
      >
        <p className="eyebrow">Un juego para dos</p>
        <h1 className="mt-3 font-serif text-[32px] leading-tight text-ink">El Mazo de Preguntas</h1>
        <p className="mx-auto mt-3 max-w-[30ch] text-[14px] font-light leading-relaxed text-muted">
          Preguntas, retos y alguna que otra confesión. Cada uno desde su celular.
        </p>

        <div className="card mt-8 px-5 pb-6 pt-6 text-left">
          <label htmlFor="name" className="eyebrow !text-[9.5px]">
            Tu nombre
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            autoComplete="given-name"
            placeholder="Ej. Alex"
            className="mt-2 w-full rounded-2xl border border-linen bg-white/70 px-4 py-3.5 text-[16px] text-ink outline-none transition focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
          />

          <AnimatePresence initial={false}>
            {mode === 'join' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <label htmlFor="code" className="eyebrow mt-5 block !text-[9.5px]">
                  Código de la sala
                </label>
                <input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(normalizeCode(e.target.value))}
                  autoCapitalize="characters"
                  autoComplete="off"
                  inputMode="text"
                  placeholder="ABCD"
                  className="mt-2 w-full rounded-2xl border border-linen bg-white/70 px-4 py-3.5 text-center font-serif text-[26px] uppercase tracking-[0.5em] text-ink outline-none transition placeholder:text-muted/30 focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 flex flex-col gap-3">
            {mode !== 'join' && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                disabled={!!busy}
                onClick={() => run('create', () => onCreate(cleanName))}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 py-3.5 text-[15px] font-medium text-white shadow-glow disabled:opacity-60"
              >
                {busy === 'create' ? <Loader2 size={17} className="animate-spin" /> : null}
                Crear Sala
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              disabled={!!busy}
              onClick={join}
              className={`flex items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-medium disabled:opacity-60 ${
                mode === 'join'
                  ? 'bg-gradient-to-b from-sun-400 to-sun-600 text-white shadow-glow'
                  : 'border border-sun-300 bg-white/60 text-sun-700'
              }`}
            >
              {busy === 'join' ? <Loader2 size={17} className="animate-spin" /> : null}
              Unirse a Sala
              {mode === 'join' && !busy && <ArrowRight size={16} />}
            </motion.button>
            {mode === 'join' && (
              <button type="button" onClick={() => setMode(null)} className="text-[12.5px] text-muted underline-offset-4 hover:underline">
                Mejor creo una sala nueva
              </button>
            )}
          </div>

          <div className="min-h-[20px] pt-3 text-center text-[13px] text-[#b9715d]" role="alert">
            {error}
          </div>
        </div>

        {demoMode && (
          <p className="mx-auto mt-5 max-w-[34ch] text-[11.5px] leading-relaxed text-muted/80">
            Modo demo: sin Firebase solo sincroniza entre pestañas de este mismo navegador.
          </p>
        )}
      </motion.div>
    </div>
  )
}
