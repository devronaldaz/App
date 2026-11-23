import { useState } from 'react'
import { ChevronDown, Plus, Loader2, Trash2 } from 'lucide-react'
import { MAX_QUESTION_LENGTH, baseQuestionList, deckSize, penaltyList } from '@/lib/game/logic'
import { splitQuestion } from '@/lib/game/questions'

/**
 * Editor compartido del mazo: ambos jugadores pueden quitar/volver a poner
 * preguntas base, y quitar/agregar penalidades. Los cambios se ven en vivo
 * en los dos celulares y valen para la próxima partida de esta sala.
 */
export default function DeckEditor({ room, onToggleBase, onTogglePenalty, onAddPenalty }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('questions') // 'questions' | 'penalties'
  const [text, setText] = useState('')
  const [adding, setAdding] = useState(false)

  const questions = baseQuestionList(room)
  const penalties = penaltyList(room)
  const activeQ = questions.filter((q) => q.enabled).length
  const activeP = penalties.filter((p) => p.enabled).length

  const addPenalty = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setAdding(true)
    await onAddPenalty(text)
    setText('')
    setAdding(false)
  }

  return (
    <div className="card mt-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <span>
          <span className="block text-[13.5px] font-medium text-ink">Editar el mazo</span>
          <span className="mt-0.5 block text-[11.5px] font-light text-muted">
            {activeQ}/{questions.length} preguntas base · {activeP} penalidades · ojo: verás las preguntas
          </span>
        </span>
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="anim-fade-in border-t border-linen/80 px-5 pb-5 pt-4">
          {/* pestañas */}
          <div className="grid grid-cols-2 gap-1 rounded-full bg-sand/70 p-1 text-[12.5px] font-medium">
            {[
              ['questions', `Preguntas (${activeQ})`],
              ['penalties', `Penalidades (${activeP})`],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`rounded-full py-2 transition ${tab === key ? 'bg-white text-ink shadow-card' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'questions' ? (
            <>
              <p className="mt-3 text-[11.5px] font-light text-muted">
                Toca una pregunta para quitarla o volver a ponerla. Para agregar nuevas usa “pregunta secreta”.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {questions.map((q) => {
                  const { title, body } = splitQuestion(q.text)
                  return (
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => onToggleBase(q.id)}
                        aria-pressed={q.enabled}
                        className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                          q.enabled ? 'border-sun-200 bg-white/70' : 'border-linen bg-transparent opacity-55'
                        }`}
                      >
                        <Toggle on={q.enabled} />
                        <span className={`text-[12.5px] leading-snug text-ink/85 ${q.enabled ? '' : 'line-through'}`}>
                          {title && <span className="font-medium text-ink">{title}: </span>}
                          {body}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </>
          ) : (
            <>
              <p className="mt-3 text-[11.5px] font-light text-muted">
                Cuando alguien no responde, sale una de estas al azar.
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {penalties.map((p) =>
                  p.source === 'custom' ? (
                    <li key={p.id} className="flex items-start gap-3 rounded-2xl border border-sun-200 bg-sun-50 px-3.5 py-3">
                      <span className="flex-1 text-[12.5px] leading-snug text-ink/85">
                        {p.text}
                        {p.author && <span className="text-muted"> · de {p.author}</span>}
                      </span>
                      <button
                        type="button"
                        onClick={() => onTogglePenalty(p.id)}
                        aria-label="Eliminar penalidad"
                        className="p-0.5 text-muted transition active:scale-90"
                      >
                        <Trash2 size={14} />
                      </button>
                    </li>
                  ) : (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => onTogglePenalty(p.id)}
                        aria-pressed={p.enabled}
                        className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition ${
                          p.enabled ? 'border-sun-200 bg-white/70' : 'border-linen bg-transparent opacity-55'
                        }`}
                      >
                        <Toggle on={p.enabled} />
                        <span className={`text-[12.5px] leading-snug text-ink/85 ${p.enabled ? '' : 'line-through'}`}>
                          {(() => {
                            const { title, body } = splitQuestion(p.text)
                            return (
                              <>
                                {title && <span className="font-medium text-ink">{title}: </span>}
                                {body}
                              </>
                            )
                          })()}
                        </span>
                      </button>
                    </li>
                  ),
                )}
              </ul>
              <form onSubmit={addPenalty} className="mt-3 flex items-center gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={MAX_QUESTION_LENGTH}
                  placeholder="Nueva penalidad…"
                  className="min-w-0 flex-1 rounded-full border border-linen bg-white/70 px-4 py-2.5 text-[14px] text-ink outline-none transition placeholder:text-muted/50 focus:border-sun-400 focus:ring-2 focus:ring-sun-200"
                />
                <button
                  type="submit"
                  disabled={!text.trim() || adding}
                  aria-label="Agregar penalidad"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sun-100 text-sun-700 transition active:scale-95 disabled:opacity-40"
                >
                  {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={16} />}
                </button>
              </form>
            </>
          )}

          {deckSize(room) === 0 && (
            <p className="mt-3 text-center text-[12px] text-[#b9715d]">El mazo está vacío: activa o agrega al menos una pregunta.</p>
          )}
        </div>
      )}
    </div>
  )
}

function Toggle({ on }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-0.5 flex h-5 w-9 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 ${on ? 'bg-sun-500' : 'bg-muted/25'}`}
    >
      <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform duration-300 ${on ? 'translate-x-4' : ''}`} />
    </span>
  )
}
