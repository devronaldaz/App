import { LETTER_UNLOCK_AT, isLetterUnlocked } from '@/lib/letter'

export const dynamic = 'force-dynamic'

/** Devuelve la hora del servidor y si la carta ya se puede abrir */
export function GET() {
  const now = Date.now()
  return Response.json(
    { unlocked: isLetterUnlocked(now), unlockAt: LETTER_UNLOCK_AT, now },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
