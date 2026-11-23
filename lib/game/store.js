/**
 * Capa de tiempo real.
 * - Con Firebase configurado: Realtime Database (sincroniza entre celulares).
 * - Sin configurar: "modo demo" con localStorage, sincroniza solo entre
 *   pestañas del mismo navegador. Sirve para probar sin crear nada.
 *
 * Estructura en la base de datos:
 *   rooms/{CODIGO}  →  { status, players, questions, deck, deckIndex, current, turn, scores, lastEvent }
 */
import {
  ref,
  get,
  onValue,
  runTransaction,
  onDisconnect,
} from 'firebase/database'
import { getDb, isFirebaseConfigured } from './firebase'
import { normalizeRoom } from './logic'

export const BACKEND = isFirebaseConfigured ? 'firebase' : 'local'

// Firebase no acepta `undefined`: limpiamos el objeto antes de guardarlo
const clean = (obj) => JSON.parse(JSON.stringify(obj))

/* ------------------------------ Firebase ------------------------------ */

const roomRef = (code) => ref(getDb(), `rooms/${code}`)

const firebaseStore = {
  async read(code) {
    const snap = await get(roomRef(code))
    return normalizeRoom(snap.val())
  },
  async transact(code, updater) {
    const res = await runTransaction(roomRef(code), (current) => {
      const next = updater(current)
      if (next === undefined) return undefined
      return next === null ? null : clean(next)
    })
    return { committed: res.committed, room: normalizeRoom(res.snapshot.val()) }
  },
  subscribe(code, cb) {
    return onValue(roomRef(code), (snap) => cb(normalizeRoom(snap.val())))
  },
  presence(code, playerId) {
    const db = getDb()
    const playerRef = ref(db, `rooms/${code}/players/${playerId}`)
    const unsub = onValue(ref(db, '.info/connected'), async (snap) => {
      if (snap.val() !== true) return
      // si se cierra la pestaña o se cae la conexión → online: false
      await onDisconnect(playerRef).update({ online: false })
      await runTransaction(playerRef, (p) => (p ? { ...p, online: true } : p))
    })
    return () => {
      unsub()
      onDisconnect(playerRef).cancel()
    }
  },
}

/* ------------------------- Modo demo (localStorage) ------------------------- */

const KEY = (code) => `ngift-room-${code}`
const listeners = new Map()

const localRead = (code) => {
  try {
    return normalizeRoom(JSON.parse(localStorage.getItem(KEY(code))))
  } catch {
    return null
  }
}

const emit = (code, room) => (listeners.get(code) || []).forEach((cb) => cb(room))

const localStore = {
  async read(code) {
    return localRead(code)
  },
  async transact(code, updater) {
    const next = updater(localRead(code))
    if (next === undefined) return { committed: false, room: localRead(code) }
    if (next === null) localStorage.removeItem(KEY(code))
    else localStorage.setItem(KEY(code), JSON.stringify(clean(next)))
    const room = localRead(code)
    emit(code, room)
    return { committed: true, room }
  },
  subscribe(code, cb) {
    const set = listeners.get(code) || new Set()
    set.add(cb)
    listeners.set(code, set)
    const onStorage = (e) => {
      if (e.key === KEY(code)) cb(localRead(code))
    }
    window.addEventListener('storage', onStorage)
    cb(localRead(code))
    return () => {
      set.delete(cb)
      window.removeEventListener('storage', onStorage)
    }
  },
  presence(code, playerId) {
    const setOnline = (online) =>
      localStore.transact(code, (raw) => {
        if (!raw?.players?.[playerId]) return undefined
        raw.players[playerId].online = online
        return raw
      })
    setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('pagehide', off)
    return () => window.removeEventListener('pagehide', off)
  },
}

const store = BACKEND === 'firebase' ? firebaseStore : localStore

export const readRoom = (code) => store.read(code)
export const transactRoom = (code, updater) => store.transact(code, updater)
export const subscribeRoom = (code, cb) => store.subscribe(code, cb)
export const setupPresence = (code, playerId) => store.presence(code, playerId)
