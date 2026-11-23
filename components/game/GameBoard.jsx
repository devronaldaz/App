import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Flame, LogOut, RotateCcw, Layers } from 'lucide-react'
import FlipCard, { CardBack, CARD_SIZE } from './Card'
import { nameOf, playerList } from '@/lib/game/logic'
import { splitQuestion } from '@/lib/game/questions'
import { MiniSunflower } from '@/components/gift/Sunflower'

/** Tablero sincronizado: mazo, carta volteada, turnos y acciones */
export default function GameBoard({ room, me, onDraw, onResolve, onConfirm, onCancelClaim, onBackToLobby, onLeave }) {
  const players = playerList(room)
  const myTurn = room.turn === me.id
  const turnName = nameOf(room, room.turn)
  const otherOf = (id) => players.find((p) => p.id !== id)?.id
  const otherName = nameOf(room, otherOf(room.turn))
  const claim = room.current?.claim
  // si quien debe confirmar está desconectado, el jugador en turno puede confirmarse solo
  const judgeAway = room.players[otherOf(room.turn)]?.online === false
  const remaining = Math.max(0, room.deck.length - room.deckIndex)
  const stackSize = Math.min(remaining, 4)
  const finished = room.status === 'finished'
  const [busy, setBusy] = useState(false)

  // La carta solo hace la animación de volteo si se sacó hace muy poco
  // (si alguien recarga la página, aparece directamente boca arriba).
  const mountedAt = useRef(Date.now())
  const animateIn = !!room.current && room.current.drawnAt > mountedAt.current - 1500

  // Aviso de penalidad, visible para los dos durante unos segundos
  const [penalty, setPenalty] = useState(null)
  const lastKey = room.lastEvent?.key
  useEffect(() => {
    const ev = room.lastEvent
    if (!ev || ev.type !== 'penalty' || ev.at < mountedAt.current - 1500) return
    setPenalty(ev)
    const t = setTimeout(() => setPenalty(null), 4200)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastKey])

  // Carta que se está descartando: se guarda un momento para animar su salida
  const [leaving, setLeaving] = useState(null) // { card, type, key }
  const prevCurrent = useRef(room.current)
  const currentKey = room.current ? `${room.round}-${room.current.number}` : null
  useEffect(() => {
    const prev = prevCurrent.current
    prevCurrent.current = room.current
    if (!prev || (room.current && room.current.number === prev.number)) return
    const key = `${room.round}-${prev.number}-out`
    setLeaving({ card: prev, type: room.lastEvent?.type || 'answered', key })
    setTimeout(() => setLeaving((l) => (l?.key === key ? null : l)), 700)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentKey])

  const act = async (fn) => {
    if (busy) return
    setBusy(true)
    try {
      await fn()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-6">
      {/* Barra superior: marcador */}
      <div className="flex items-center justify-between">
        <span className="rounded-full border border-sun-200 bg-white/60 px-3 py-1 font-serif text-[13px] tracking-[0.25em] text-ink">
          {room.code}
        </span>
        <button type="button" onClick={onLeave} className="flex items-center gap-1.5 text-[12.5px] text-muted transition active:scale-95">
          <LogOut size={14} /> Salir
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        {players.map((p) => {
          const s = room.scores?.[p.id] || { answered: 0, penalties: 0 }
          const active = room.turn === p.id && !finished
          return (
            <motion.div
              key={p.id}
              animate={{ scale: active ? 1 : 0.97 }}
              className={`card flex items-center gap-3 px-3.5 py-3 transition-colors duration-500 ${active ? '!border-sun-300 !bg-sun-50/90' : ''}`}
            >
              <span
                className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-[15px] ${
                  active ? 'bg-sun-500 text-white' : 'bg-sun-100 text-sun-700'
                }`}
              >
                {p.name.charAt(0).toUpperCase()}
                {!p.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-cream bg-muted/50" />}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-ink">
                  {p.name}
                  {p.id === me.id && <span className="font-light text-muted"> (tú)</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-2 text-[11px] text-muted">
                  <span className="flex items-center gap-0.5">
                    <Check size={11} /> {s.answered}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Flame size={11} /> {s.penalties}
                  </span>
                </p>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Indicador de turno */}
      {!finished && (
          <p key={room.turn} className="anim-fade-in mt-7 text-center font-serif text-[21px] text-ink">
            {myTurn ? (
              <>
                Es <span className="italic text-sun-600">tu</span> turno de responder
              </>
            ) : (
              <>
                Es turno de <span className="italic text-sun-600">{turnName}</span> de responder
              </>
            )}
          </p>
      )}

      {/* Mesa */}
      <div className="relative my-6 flex flex-1 items-center justify-center" style={{ perspective: 1200 }}>
        {finished ? (
          <Summary room={room} players={players} />
        ) : (
          <>
            {/* mazo boca abajo */}
            {remaining > 0 && (
              <div className={`absolute ${CARD_SIZE}`}>
                {Array.from({ length: stackSize }, (_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{ transform: `translate(${(stackSize - 1 - i) * 3}px, ${(stackSize - 1 - i) * 4}px) rotate(${(i % 2 ? 1 : -1) * (stackSize - 1 - i) * 1.2}deg)` }}
                  >
                    <CardBack />
                  </div>
                ))}
              </div>
            )}

            {/* carta que se descarta (vuela fuera) */}
            {leaving && (
              <div className="pointer-events-none absolute z-10">
                <FlipCard key={leaving.key} card={leaving.card} leaving={leaving.type} />
              </div>
            )}

            {/* carta sacada (se voltea) */}
            {room.current && (
              <div className="absolute z-20">
                <FlipCard key={currentKey} card={room.current} animateIn={animateIn} />
              </div>
            )}

            {remaining > 0 && !room.current && (
              <p className="absolute -bottom-3 flex items-center gap-1.5 text-[11.5px] text-muted">
                <Layers size={13} /> {remaining === 1 ? 'Queda 1 carta' : `Quedan ${remaining} cartas`}
              </p>
            )}
          </>
        )}
      </div>

      {/* Acciones */}
      <div className="min-h-[124px]">
        {finished ? (
          <motion.button
            type="button"
            whileTap={{ scale: 0.96 }}
            onClick={() => act(onBackToLobby)}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 py-4 text-[15px] font-medium text-white shadow-glow"
          >
            <RotateCcw size={16} /> Jugar otra vez
          </motion.button>
        ) : !room.current ? (
          <div className="text-center">
            <motion.button
              type="button"
              whileTap={{ scale: 0.95 }}
              disabled={busy}
              onClick={() => act(onDraw)}
              className="w-full rounded-full bg-gradient-to-b from-sun-400 to-sun-600 py-4 text-[15.5px] font-medium text-white shadow-glow disabled:opacity-60"
            >
              Sacar Carta
            </motion.button>
            <p className="mt-3 text-[12px] font-light text-muted">Cualquiera de los dos puede sacarla.</p>
          </div>
        ) : claim && myTurn ? (
          /* Dije "Respondido": espero que el otro lo confirme */
          <div key="claim-wait" className="anim-fade-in flex flex-col items-center pt-2 text-center">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              <MiniSunflower size={26} />
            </motion.span>
            <p className="mt-3 text-[13.5px] font-light text-muted">
              Esperando a que <span className="font-medium text-ink">{otherName}</span> confirme que respondiste…
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {judgeAway && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act(() => onConfirm(true))}
                  className="rounded-full bg-sun-100 px-4 py-2 text-[12.5px] font-medium text-sun-700 transition active:scale-95"
                >
                  Confirmar yo ({otherName} está desconectado)
                </button>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => act(onCancelClaim)}
                className="rounded-full px-3 py-2 text-[12.5px] text-muted underline-offset-4 transition hover:underline active:scale-95"
              >
                Me equivoqué, aún no respondo
              </button>
            </div>
          </div>
        ) : claim && !myTurn ? (
          /* El otro dice que respondió: yo confirmo o lo rechazo */
          <div key="claim-judge" className="anim-fade-in">
            <p className="mb-3 text-center text-[14px] text-ink">
              <span className="font-medium">{turnName}</span> dice que ya respondió. ¿Es verdad?
            </p>
            <div className="flex flex-col gap-2.5">
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={busy}
                onClick={() => act(() => onConfirm(true))}
                className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 py-4 text-[15.5px] font-medium text-white shadow-glow disabled:opacity-60"
              >
                <Check size={17} /> Sí, respondió
              </motion.button>
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                disabled={busy}
                onClick={() => act(() => onConfirm(false))}
                className="flex items-center justify-center gap-2 rounded-full border border-[#e3b1a3] bg-white/60 py-3.5 text-[14px] font-medium text-[#a8614d] disabled:opacity-60"
              >
                <Flame size={15} /> No respondió (Penalidad)
              </motion.button>
            </div>
          </div>
        ) : myTurn ? (
          <div key={currentKey} className="anim-fade-in flex flex-col gap-2.5" style={{ animationDelay: animateIn ? '0.9s' : '0s' }}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={busy}
              onClick={() => act(() => onResolve('answered'))}
              className="flex items-center justify-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 py-4 text-[15.5px] font-medium text-white shadow-glow disabled:opacity-60"
            >
              <Check size={17} /> Respondido
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              disabled={busy}
              onClick={() => act(() => onResolve('penalty'))}
              className="flex items-center justify-center gap-2 rounded-full border border-[#e3b1a3] bg-white/60 py-3.5 text-[14px] font-medium text-[#a8614d] disabled:opacity-60"
            >
              <Flame size={15} /> No quiero responder (Penalidad)
            </motion.button>
          </div>
        ) : (
          <div className="anim-fade-in flex flex-col items-center pt-4 text-center">
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}>
              <MiniSunflower size={26} />
            </motion.span>
            <p className="mt-3 text-[13.5px] font-light text-muted">
              Esperando a que <span className="font-medium text-ink">{turnName}</span> responda…
            </p>
          </div>
        )}
      </div>

      {/* Aviso de penalidad */}
      {penalty && (
          <div key={penalty.key} className="anim-toast-in fixed inset-x-0 top-6 z-40 mx-auto w-[min(92vw,380px)]">
            <div className="rounded-3xl border border-[#efc7b9] bg-[#fdf1ec] px-5 py-4 text-center shadow-soft">
              <p className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.28em] text-[#b9715d]">
                <Flame size={12} /> Penalidad para {nameOf(room, penalty.playerId)}
              </p>
              {penalty.reason === 'rejected' && (
                <p className="mt-1 text-[11.5px] text-[#b9715d]/80">No convenció a {nameOf(room, otherOf(penalty.playerId))} 👀</p>
              )}
              {(() => {
                const { title, body } = splitQuestion(penalty.penalty)
                return (
                  <>
                    {title && <p className="mt-2 font-serif text-[18px] leading-tight text-ink">{title}</p>}
                    <p className={`${title ? 'mt-1 text-[14px] text-ink/85' : 'mt-2 font-serif text-[17px] text-ink'} leading-snug`}>{body}</p>
                  </>
                )
              })()}
            </div>
          </div>
      )}
    </div>
  )
}

function Summary({ room, players }) {
  return (
    <div className="anim-fade-in card w-full px-6 py-8 text-center">
      <MiniSunflower size={34} className="mx-auto" />
      <h2 className="mt-4 font-serif text-[26px] text-ink">¡Se acabó el mazo!</h2>
      <p className="mt-1 text-[13px] font-light text-muted">Así quedó la partida:</p>
      <div className="mt-6 flex flex-col gap-2.5">
        {players.map((p) => {
          const s = room.scores?.[p.id] || { answered: 0, penalties: 0 }
          return (
            <div key={p.id} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
              <span className="text-[14px] font-medium text-ink">{p.name}</span>
              <span className="flex items-center gap-3 text-[12.5px] text-muted">
                <span className="flex items-center gap-1">
                  <Check size={13} /> {s.answered}
                </span>
                <span className="flex items-center gap-1">
                  <Flame size={13} /> {s.penalties}
                </span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
