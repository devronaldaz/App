'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import RoomJoin from './RoomJoin'
import Lobby from './Lobby'
import GameBoard from './GameBoard'
import { MiniSunflower } from '@/components/gift/Sunflower'
import { BACKEND, readRoom, setupPresence, subscribeRoom, transactRoom } from '@/lib/game/store'
import {
  MAX_PLAYERS,
  addPenaltyUpdater,
  addQuestionUpdater,
  backToLobbyUpdater,
  cancelClaimUpdater,
  confirmClaimUpdater,
  toggleBaseQuestionUpdater,
  togglePenaltyUpdater,
  createRoomUpdater,
  drawCardUpdater,
  joinRoomUpdater,
  leaveRoomUpdater,
  normalizeCode,
  playerList,
  randomCode,
  randomId,
  removeQuestionUpdater,
  resolveCardUpdater,
  toggleReadyUpdater,
} from '@/lib/game/logic'

// sessionStorage: cada pestaña/celular es un jugador distinto y sobrevive a recargar
const SS_PLAYER = 'ngift-player-id'
const SS_ROOM = 'ngift-room-code'
const LS_NAME = 'ngift-player-name'

const safe = (fn, fallback = null) => {
  try {
    return fn()
  } catch {
    return fallback
  }
}

export default function GameApp() {
  // Todo lo que depende del navegador se lee después de montar → sin errores de hidratación
  const [mounted, setMounted] = useState(false)
  const [me, setMe] = useState({ id: '', name: '' })
  const [code, setCode] = useState(null)
  const [room, setRoom] = useState(undefined) // undefined = cargando, null = no existe
  const [inviteCode, setInviteCode] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let id = safe(() => sessionStorage.getItem(SS_PLAYER))
    if (!id) {
      id = randomId()
      safe(() => sessionStorage.setItem(SS_PLAYER, id))
    }
    const name = safe(() => localStorage.getItem(LS_NAME), '') || ''
    setMe({ id, name })
    setCode(safe(() => sessionStorage.getItem(SS_ROOM)))
    setInviteCode(normalizeCode(new URLSearchParams(window.location.search).get('sala') || ''))
    setMounted(true)
  }, [])

  // Suscripción en tiempo real a la sala
  useEffect(() => {
    if (!code) return
    setRoom(undefined)
    return subscribeRoom(code, setRoom)
  }, [code])

  // Presencia (conectado / desconectado)
  useEffect(() => {
    if (!code || !me.id) return
    return setupPresence(code, me.id)
  }, [code, me.id])

  const exitRoom = useCallback((message = '') => {
    safe(() => sessionStorage.removeItem(SS_ROOM))
    setCode(null)
    setRoom(undefined)
    setNotice(message)
  }, [])

  // Si la sala desaparece o ya no estoy en ella → volver al inicio
  useEffect(() => {
    if (!code || room === undefined) return
    if (room === null) exitRoom('Esa sala ya no existe.')
    else if (!room.players[me.id]) exitRoom('Saliste de la sala.')
  }, [room, code, me.id, exitRoom])

  const enterRoom = (c, name) => {
    safe(() => sessionStorage.setItem(SS_ROOM, c))
    safe(() => localStorage.setItem(LS_NAME, name))
    setMe((m) => ({ ...m, name }))
    setNotice('')
    setCode(c)
  }

  /* ------------------------------ acciones ------------------------------ */

  const createRoom = async (name) => {
    const player = { id: me.id, name }
    for (let attempt = 0; attempt < 6; attempt++) {
      const c = randomCode()
      const res = await transactRoom(c, createRoomUpdater(c, player))
      if (res.committed && res.room) return enterRoom(c, name)
    }
    throw new Error('No se pudo crear la sala. Intenta otra vez.')
  }

  const joinRoom = async (name, c) => {
    const res = await transactRoom(c, joinRoomUpdater({ id: me.id, name }))
    if (res.committed && res.room) return enterRoom(c, name)
    const existing = await readRoom(c)
    if (!existing) throw new Error('No existe una sala con ese código.')
    if (playerList(existing).length >= MAX_PLAYERS) throw new Error('Esta sala ya tiene 2 jugadores.')
    throw new Error('La partida en esa sala ya empezó.')
  }

  const run = (updater) => transactRoom(code, updater)
  const player = { id: me.id, name: me.name }

  const leave = async () => {
    const c = code
    exitRoom('')
    await transactRoom(c, leaveRoomUpdater(me.id))
  }

  /* ------------------------------ vistas ------------------------------ */

  let view = 'loading'
  if (mounted && !code) view = 'join'
  else if (mounted && room) view = room.status === 'lobby' ? 'lobby' : 'game'

  return (
    <main className="min-h-dvh">
        {/* fade-in en CSS: no se traba si el celular bloquea la pantalla durante el cambio */}
        <div key={view} className="anim-fade-in">
          {view === 'loading' && (
            <div className="flex min-h-dvh items-center justify-center">
              <motion.span animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                <MiniSunflower size={36} />
              </motion.span>
            </div>
          )}

          {view === 'join' && (
            <RoomJoin
              initialName={me.name}
              initialCode={inviteCode}
              notice={notice}
              demoMode={BACKEND === 'local'}
              onCreate={createRoom}
              onJoin={joinRoom}
            />
          )}

          {view === 'lobby' && (
            <Lobby
              room={room}
              me={me}
              onAddQuestion={(text) => run(addQuestionUpdater(player, text))}
              onRemoveQuestion={(id) => run(removeQuestionUpdater(me.id, id))}
              onToggleReady={() => run(toggleReadyUpdater(me.id))}
              onToggleBase={(id) => run(toggleBaseQuestionUpdater(id))}
              onTogglePenalty={(id) => run(togglePenaltyUpdater(id))}
              onAddPenalty={(text) => run(addPenaltyUpdater(player, text))}
              onLeave={leave}
            />
          )}

          {view === 'game' && (
            <GameBoard
              room={room}
              me={me}
              onDraw={() => run(drawCardUpdater(me.id))}
              onResolve={(result) => run(resolveCardUpdater(me.id, result))}
              onConfirm={(accept) => run(confirmClaimUpdater(me.id, accept))}
              onCancelClaim={() => run(cancelClaimUpdater(me.id))}
              onBackToLobby={() => run(backToLobbyUpdater())}
              onLeave={leave}
            />
          )}
        </div>
    </main>
  )
}
