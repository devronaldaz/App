/* ==========================================================================
   🃏  PREGUNTAS BASE DEL MAZO
   --------------------------------------------------------------------------
   Edita, borra o agrega las que quieras (una por línea, entre comillas).
   Formato: "Título: texto". Lo que va antes de los dos puntos se muestra
   como título de la carta. Se mezclan al azar con las preguntas secretas
   que agreguen los jugadores en la sala de espera.
   ========================================================================== */

export const BASE_QUESTIONS = [
  "Modo Avión: ¿Qué haces cuando necesitas desconectarte de todo?",
  "El Antojo: Si mañana pudieras escaparte un día entero, ¿a dónde irías y qué comerías?",
  "La Banda Sonora: Si tu vida este año fuera una película, ¿qué canción sonaría en los créditos finales?",
  "El Dilema: ¿Preferirías hablar siempre gritando o siempre susurrando?",
  "El Miedo Irracional: ¿Cuál es tu miedo más absurdo?",
  "Viaje Express: Si te regalaran un pasaje para mañana mismo, ¿a dónde irías?",
  "El Orgullo Oculto: ¿De qué pequeño logro de este año te sientes más orgullos@?",
  "El Consejo: ¿Qué consejo le darías a tu yo de hace cinco años?",
]

/* Penalidades: se muestra una al azar cuando alguien no responde.
   Mismo formato "Título: texto". */
export const PENALTIES = [
  "La Invitación: Te toca invitar el próximo snack o bebida.",
  "El Concierto: Canta el coro de la última canción que escuchaste.",
  "El Impostor: Imita a un personaje famoso durante 15 segundos.",
  "Exposición Digital: Muestra el último meme que guardaste en tu celular.",
  "El Artista: Dibuja a la otra persona en menos de 2 minutos.",
]

/** Separa "Título: texto" en { title, body } */
export function splitQuestion(text = '') {
  const i = text.indexOf(':')
  if (i > 0 && i < 48) {
    return { title: text.slice(0, i).trim(), body: text.slice(i + 1).trim() }
  }
  return { title: '', body: text.trim() }
}
