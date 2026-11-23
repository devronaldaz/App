import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Copy, Share2, X, LogOut, Plus, Lock, UserRound, Loader2 } from 'lucide-react'
import { MAX_PLAYERS, MAX_QUESTION_LENGTH, baseQuestionList, deckSize, playerList } from '@/lib/game/logic'
import DeckEditor from './DeckEditor'

/** Sala de espera: jugadores conectados, preguntas secretas, editor del mazo y "Estoy Listo" */
export default function Lobby({
  room,
  me,
  onAddQuestion,
  onRemoveQuestion,
  onToggleReady,
  onToggleBase,
  onTogglePenalty,
  onAddPenalty,
  onLeave,
}) {
  const baseActive = baseQuestionList(room).filter((q) => q.enabled).length
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)
  const [copied, setCopied] = useState(false)

  const players = playerList(room)
  const mine = players.find((p) => p.id === me.id)
  const questions = Object.entries(room.questions || {})
  const myQuestions = questions.filter(([, q]) => q.authorId === me.id)
  const othersCount = questions.length - myQuestions.length
  const full = players.length === MAX_PLAYERS

  const share = async () => {
    const url = `${window.location.origin}/juego?sala=${room.code}`
    try {
      if (navigator.share) {
        await navigator.share({ title: 'El Mazo de Preguntas', text: `Únete a mi sala: ${room.code}`, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* el usuario canceló compartir */
    }
  }

  const add = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setAdding(true)
    await onAddQuestion(text)
    setText('')
    setAdding(false)
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-6 pb-10 pt-8">
      <div className="flex items-center justify-between">
        <p className="eyebrow">Sala de espera</p>
        <button type="button" onClick={onLeave} className="flex items-center gap-1.5 text-[12.5px] text-muted transition active:scale-95">
          <LogOut size={14} /> Salir
        </button>
      </div>

      {/* Código de la sala */}
      <div className="anim-fade-in mt-6 text-center">
        <p className="text-[13px] font-light text-muted">Comparte este código</p>
        <div className="mt-3 flex justify-center gap-2">
          {room.code.split('').map((ch, i) => (
            <span
              key={i}
              className="flex h-16 w-14 items-center justify-center rounded-2xl border border-sun-200 bg-white/70 font-serif text-[32px] text-ink shadow-card"
            >
              {ch}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={share}
          className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-sun-300 bg-white/60 px-4 py-2 text-[12.5px] font-medium text-sun-700 transition active:scale-95"
        >
          {copied ? <Check size={14} /> : typeof navigator !== 'undefined' && navigator.share ? <Share2 size={14} /> : <Copy size={14} />}
          {copied ? '¡Enlace copiado!' : 'Compartir enlace'}
        </button>
      </div>

      {/* Jugadores */}
      <div className="mt-8 grid grid-cols-2 gap-3">
        {Array.from({ length: MAX_PLAYERS }, (_, i) => {
          const p = players[i]
          return (
            <motion.div key={p?.id || `empty-${i}`} layout className={`card px-4 py-4 text-center ${!p ? 'border-dashed !bg-white/30' : ''}`}>
              {p ? (
                <>
                  <div className="relative mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-sun-100 font-serif text-[18px] text-sun-700">
                    {p.name.charAt(0).toUpperCase()}
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-cream ${p.online ? 'bg-emerald-400' : 'bg-muted/40'}`}
                      title={p.online ? 'Conectado' : 'Desconectado'}
                    />
                  </div>
                  <p className="mt-2 truncate text-[14px] font-medium text-ink">
                    {p.name}
                    {p.id === me.id && <span className="font-light text-muted"> (tú)</span>}
                  </p>
                  <p className={`mt-1 text-[11px] font-medium uppercase tracking-[0.18em] ${p.ready ? 'text-sun-600' : 'text-muted/70'}`}>
                    {p.ready ? '✓ Listo' : p.online ? 'Conectado' : 'Desconectado'}
                  </p>
                </>
              ) : (
                <div className="flex h-full flex-col items-center justify-center py-1 text-muted/70">
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2, repeat: Infinity }}>
                    <UserRound size={26} strokeWidth={1.4} />
                  </motion.span>
                  <p className="mt-2 text-[12px]">Esperando…</p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Preguntas secretas */}
      <div className="card mt-6 px-5 pb-5 pt-5">
        <div className="flex items-center gap-2">
          <Lock size={14} className="text-sun-600" />
          <p className="text-[13.5px] font-medium text-ink">Agrega una pregunta o reto secreto al mazo</p>
        </div>
        <p className="mt-1 text-[12px] font-light text-muted">Opcional. El otro jugador no la verá hasta que salga en el juego.</p>
        <form onSubmit={add} className="mt-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_QUESTION_LENGTH}
            rows={3}
            placeholder="Ej. Reto: cuéntame tu anécdota más vergonzosa del colegio."
            className="w-full resize-none rounded-2xl border border-linen bg-white/70 px-4 py-3 text-[15px] leading-snug text-ink outline-none transition placeholder:text-muted/50 focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[11px] text-muted/70">
              {text.length}/{MAX_QUESTION_LENGTH}
            </span>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.95 }}
              disabled={!text.trim() || adding}
              className="flex items-center gap-1.5 rounded-full bg-sun-100 px-4 py-2 text-[13px] font-medium text-sun-700 transition disabled:opacity-40"
            >
              {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Agregar al mazo
            </motion.button>
          </div>
        </form>

        {myQuestions.map(([id, q]) => (
            <div key={id} className="anim-fade-in">
              <div className="mt-2 flex items-start gap-2 rounded-xl bg-sun-50 px-3 py-2.5">
                <p className="flex-1 text-[13px] leading-snug text-ink/85">{q.text}</p>
                <button type="button" onClick={() => onRemoveQuestion(id)} aria-label="Quitar pregunta" className="p-0.5 text-muted transition active:scale-90">
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}

        <p className="mt-4 text-center text-[11.5px] text-muted">
          En el mazo: {baseActive} cartas base · {questions.length} secreta{questions.length === 1 ? '' : 's'}
          {othersCount > 0 && ` (${othersCount} del otro jugador 🤫)`}
        </p>
      </div>

      {/* Editor compartido del mazo base y las penalidades */}
      <DeckEditor room={room} onToggleBase={onToggleBase} onTogglePenalty={onTogglePenalty} onAddPenalty={onAddPenalty} />

      {/* Listo */}
      <div className="mt-auto pt-8 text-center">
        <motion.button
          type="button"
          whileTap={{ scale: 0.96 }}
          onClick={onToggleReady}
          className={`w-full rounded-full py-4 text-[15.5px] font-medium transition-colors duration-300 ${
            mine?.ready ? 'border border-sun-300 bg-white/70 text-sun-700' : 'bg-gradient-to-b from-sun-400 to-sun-600 text-white shadow-glow'
          }`}
        >
          {mine?.ready ? '✓ Listo — toca para cancelar' : 'Estoy Listo'}
        </motion.button>
        <p className="mt-3 text-[12.5px] font-light text-muted">
          {!full
            ? 'Falta que se una el otro jugador.'
            : deckSize(room) === 0
              ? 'El mazo está vacío: activa o agrega alguna pregunta.'
              : mine?.ready
              ? 'Esperando a que el otro jugador esté listo…'
              : 'El juego empieza cuando los dos estén listos.'}
        </p>
      </div>
    </div>
  )
}
