/**
 * Carta con bloqueo por tiempo.
 * Se desbloquea en la fecha indicada abajo (UTC).
 *
 * La imagen vive en /private (NO en /public) y solo la entrega la ruta
 * /api/carta cuando la hora del SERVIDOR ya pasó ese momento. Cambiar la hora
 * del celular o inspeccionar el código no sirve para abrirla antes.
 *
 * Para probar en local se puede definir CARTA_DESBLOQUEO=2020-01-01T00:00:00Z en .env.local
 */
export const LETTER_UNLOCK_AT = process.env.CARTA_DESBLOQUEO
  ? Date.parse(process.env.CARTA_DESBLOQUEO)
  : Date.UTC(2027, 0, 1, 5, 0, 0) // cambia esta fecha (UTC)

export const LETTER_FILE = 'Una carta para ti.jpg'

export const isLetterUnlocked = (now = Date.now()) => now >= LETTER_UNLOCK_AT
