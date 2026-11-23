/**
 * Reglas del juego como funciones puras.
 * Cada "updater" recibe la sala actual y devuelve la sala nueva.
 *   - devuelve `undefined` → acción inválida, no se guarda nada
 *   - devuelve `null`      → la sala no existe / se borra
 * Se ejecutan dentro de una transacción, así dos jugadores nunca pisan
 * los cambios del otro (por ejemplo, si ambos tocan "Sacar carta" a la vez).
 */
import { BASE_QUESTIONS, PENALTIES } from './questions'

export const MAX_PLAYERS = 2
export const MAX_QUESTION_LENGTH = 220
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // sin O/0 ni I/1
const ID_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

const pick = (alphabet, n) =>
  Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')

export const randomCode = () => pick(CODE_ALPHABET, 4)
export const randomId = (n = 12) => pick(ID_ALPHABET, n)
export const normalizeCode = (s = '') => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)

function shuffle(list) {
  const a = [...list]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Firebase guarda los arrays como objetos y borra los vacíos: lo normalizamos.
const toArray = (v) =>
  Array.isArray(v)
    ? v.filter(Boolean)
    : v
      ? Object.keys(v)
          .sort((a, b) => Number(a) - Number(b))
          .map((k) => v[k])
      : []

export function normalizeRoom(raw) {
  if (!raw) return null
  return {
    ...raw,
    players: raw.players || {},
    questions: raw.questions || {},
    scores: raw.scores || {},
    deck: toArray(raw.deck),
    deckIndex: raw.deckIndex || 0,
    current: raw.current || null,
    lastEvent: raw.lastEvent || null,
    disabledBase: raw.disabledBase || {}, // { b3: true } = pregunta base quitada del mazo
    disabledPenalties: raw.disabledPenalties || {}, // { p1: true } = penalidad base quitada
    customPenalties: raw.customPenalties || {}, // penalidades agregadas en la sala
  }
}

/* ------------------------- Mazo editable (por sala) ------------------------- */

export const baseQuestionList = (room) =>
  BASE_QUESTIONS.map((text, i) => ({ id: `b${i}`, text, enabled: !room?.disabledBase?.[`b${i}`] }))

export const penaltyList = (room) => [
  ...PENALTIES.map((text, i) => ({ id: `p${i}`, text, source: 'base', enabled: !room?.disabledPenalties?.[`p${i}`] })),
  ...Object.entries(room?.customPenalties || {})
    .sort(([, a], [, b]) => (a.createdAt || 0) - (b.createdAt || 0))
    .map(([id, p]) => ({ id, text: p.text, source: 'custom', author: p.authorName, enabled: true })),
]

export const activePenalties = (room) => penaltyList(room).filter((p) => p.enabled)

/** Cuántas cartas tendrá el mazo con la configuración actual */
export const deckSize = (room) =>
  baseQuestionList(room).filter((q) => q.enabled).length + Object.keys(room?.questions || {}).length

export const toggleBaseQuestionUpdater = (questionId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (room.status !== 'lobby') return undefined
  if (room.disabledBase[questionId]) delete room.disabledBase[questionId]
  else room.disabledBase[questionId] = true
  return room
}

export const togglePenaltyUpdater = (penaltyId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (room.status !== 'lobby') return undefined
  if (room.customPenalties[penaltyId]) {
    delete room.customPenalties[penaltyId] // las agregadas en la sala se eliminan
  } else if (room.disabledPenalties[penaltyId]) {
    delete room.disabledPenalties[penaltyId]
  } else {
    room.disabledPenalties[penaltyId] = true
  }
  return room
}

export const addPenaltyUpdater = (player, text) => (raw) => {
  if (!raw) return null
  const clean = text.trim().slice(0, MAX_QUESTION_LENGTH)
  if (!clean) return undefined
  const room = normalizeRoom(raw)
  room.customPenalties[`x${randomId(9)}`] = { text: clean, authorName: player.name, createdAt: Date.now() }
  return room
}

/** Jugadores ordenados por llegada (ignora registros incompletos) */
export const playerList = (room) =>
  Object.entries(room?.players || {})
    .filter(([, p]) => p && p.name)
    .map(([id, p]) => ({ id, ...p }))
    .sort((a, b) => (a.joinedAt || 0) - (b.joinedAt || 0))

export const nameOf = (room, id) => room?.players?.[id]?.name || '—'

/* ------------------------------ Lobby ------------------------------ */

export const createRoomUpdater = (code, player) => (current) => {
  if (current) return undefined // el código ya existe → probar otro
  const now = Date.now()
  return {
    code,
    createdAt: now,
    hostId: player.id,
    status: 'lobby',
    round: 0,
    players: { [player.id]: { name: player.name, ready: false, online: true, joinedAt: now } },
  }
}

export const joinRoomUpdater = (player) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  const existing = room.players[player.id]
  if (existing) {
    room.players[player.id] = { ...existing, name: player.name, online: true }
    return room
  }
  if (playerList(room).length >= MAX_PLAYERS) return undefined
  if (room.status !== 'lobby') return undefined
  room.players[player.id] = { name: player.name, ready: false, online: true, joinedAt: Date.now() }
  return room
}

export const addQuestionUpdater = (player, text) => (raw) => {
  if (!raw) return null
  const clean = text.trim().slice(0, MAX_QUESTION_LENGTH)
  if (!clean) return undefined
  const room = normalizeRoom(raw)
  room.questions[randomId(10)] = {
    text: clean,
    authorId: player.id,
    authorName: player.name,
    createdAt: Date.now(),
  }
  return room
}

export const removeQuestionUpdater = (playerId, questionId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (room.questions[questionId]?.authorId !== playerId) return undefined
  delete room.questions[questionId]
  return room
}

export const toggleReadyUpdater = (playerId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  const me = room.players[playerId]
  if (!me || room.status !== 'lobby') return undefined
  room.players[playerId] = { ...me, ready: !me.ready }

  // ¿Están los dos listos? → arranca la partida
  const players = playerList(room)
  if (players.length === MAX_PLAYERS && players.every((p) => p.ready) && deckSize(room) > 0) {
    return startGame(room, players)
  }
  return room
}

function buildDeck(room) {
  const base = baseQuestionList(room)
    .filter((q) => q.enabled)
    .map(({ id, text }) => ({ id, text, source: 'base' }))
  const custom = Object.entries(room.questions).map(([id, q]) => ({
    id: `c_${id}`,
    text: q.text,
    source: 'custom',
    author: q.authorName || '',
  }))
  return shuffle([...base, ...custom])
}

function startGame(room, players) {
  const scores = {}
  players.forEach((p) => (scores[p.id] = { answered: 0, penalties: 0 }))
  return {
    ...room,
    status: 'playing',
    round: (room.round || 0) + 1,
    startedAt: Date.now(),
    deck: buildDeck(room),
    deckIndex: 0,
    current: null,
    lastEvent: null,
    turn: players[Math.floor(Math.random() * players.length)].id,
    scores,
  }
}

/* ------------------------------ Partida ------------------------------ */

/** Cualquiera de los dos puede sacar la carta; responde quien tiene el turno */
export const drawCardUpdater = (playerId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (room.status !== 'playing' || room.current || !room.players[playerId]) return undefined
  if (room.deckIndex >= room.deck.length) return undefined
  room.current = {
    ...room.deck[room.deckIndex],
    number: room.deckIndex + 1,
    total: room.deck.length,
    drawnBy: playerId,
    drawnAt: Date.now(),
  }
  room.deckIndex += 1
  return room
}

const otherPlayer = (room, playerId) => playerList(room).find((p) => p.id !== playerId)

/** Cierra la carta actual: suma al marcador, pasa el turno y la descarta */
function finishCard(room, result, reason = null) {
  const playerId = room.turn
  const s = room.scores[playerId] || { answered: 0, penalties: 0 }
  room.scores[playerId] =
    result === 'answered' ? { ...s, answered: s.answered + 1 } : { ...s, penalties: s.penalties + 1 }

  const pool = activePenalties(room)
  room.lastEvent = {
    key: randomId(8),
    type: result,
    reason, // 'rejected' = el otro jugador dijo que no respondió
    playerId,
    at: Date.now(),
    penalty:
      result === 'penalty'
        ? pool.length
          ? pool[Math.floor(Math.random() * pool.length)].text
          : 'Esta vez te salvaste: no quedan penalidades en el mazo 😇'
        : null,
  }
  room.current = null

  const other = otherPlayer(room, playerId)
  room.turn = other ? other.id : playerId // el turno se alterna solo
  if (room.deckIndex >= room.deck.length) room.status = 'finished'
  return room
}

/**
 * El jugador en turno elige:
 *  - 'penalty'  → se aplica de inmediato
 *  - 'answered' → queda pendiente hasta que el OTRO jugador lo confirme
 */
export const resolveCardUpdater = (playerId, result) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (!room.current || room.turn !== playerId) return undefined
  if (result === 'penalty') return finishCard(room, 'penalty')
  if (room.current.claim) return undefined
  room.current.claim = { at: Date.now() }
  return room
}

/** El jugador en turno retira su "Respondido" (por si lo tocó sin querer) */
export const cancelClaimUpdater = (playerId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (!room.current?.claim || room.turn !== playerId) return undefined
  delete room.current.claim
  return room
}

/**
 * El otro jugador confirma (accept=true) o rechaza (accept=false) el "Respondido".
 * Si el otro está desconectado, el propio jugador en turno puede confirmar para no trabar el juego.
 */
export const confirmClaimUpdater = (playerId, accept) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  if (!room.current?.claim || !room.players[playerId]) return undefined
  const other = otherPlayer(room, room.turn)
  const isJudge = playerId !== room.turn
  const judgeAway = !other || other.online === false
  if (!isJudge && !(judgeAway && accept)) return undefined
  return accept ? finishCard(room, 'answered') : finishCard(room, 'penalty', 'rejected')
}

export const backToLobbyUpdater = () => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  Object.keys(room.players).forEach((id) => (room.players[id] = { ...room.players[id], ready: false }))
  return { ...room, status: 'lobby', deck: null, deckIndex: 0, current: null, lastEvent: null, scores: null, turn: null }
}

export const leaveRoomUpdater = (playerId) => (raw) => {
  if (!raw) return null
  const room = normalizeRoom(raw)
  delete room.players[playerId]
  const left = playerList(room)
  if (left.length === 0) return null // último en salir → se borra la sala
  if (room.hostId === playerId) room.hostId = left[0].id
  if (room.status !== 'lobby') return backToLobbyUpdater()(room)
  return room
}
