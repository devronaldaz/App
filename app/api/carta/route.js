import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { LETTER_FILE, isLetterUnlocked } from '@/lib/letter'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/** Descarga de la carta: bloqueada por la hora del servidor */
export async function GET() {
  if (!isLetterUnlocked()) {
    return Response.json({ error: 'Aún no es el momento...' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  }

  const file = await readFile(path.join(process.cwd(), 'private', LETTER_FILE))
  return new Response(file, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(file.length),
      // descarga directa con el nombre correcto (con tildes y espacios)
      'Content-Disposition': `attachment; filename="Una carta para ti.jpg"; filename*=UTF-8''${encodeURIComponent(LETTER_FILE)}`,
      'Cache-Control': 'private, no-store',
    },
  })
}
