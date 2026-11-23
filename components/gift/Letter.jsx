import { useEffect, useRef, useState } from 'react'
import { Download, Lock, Mail } from 'lucide-react'
import Section from './Section'
import { MiniSunflower } from './Sunflower'

const pad = (n) => String(n).padStart(2, '0')
const formatHMS = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`
}

/**
 * 5. "Una carta para ti" – Carta bloqueada hasta las 00:00.
 * Quien decide si está abierta es el SERVIDOR (/api/carta/estado), no el reloj del celular.
 * Mientras está bloqueada, el botón de descarga no existe y /api/carta responde 403.
 */
export default function Letter() {
  const [status, setStatus] = useState(null) // null = cargando | { unlocked, unlockAt, offset }
  const [now, setNow] = useState(0)
  const checking = useRef(false)

  const check = async () => {
    if (checking.current) return
    checking.current = true
    try {
      const res = await fetch('/api/carta/estado', { cache: 'no-store' })
      const data = await res.json()
      // diferencia entre la hora del servidor y la del celular (por si el celular está mal)
      setStatus({ unlocked: data.unlocked, unlockAt: data.unlockAt, offset: data.now - Date.now() })
    } catch {
      setStatus((s) => s || { unlocked: false, unlockAt: null, offset: 0 })
    } finally {
      checking.current = false
    }
  }

  useEffect(() => {
    check()
  }, [])

  // contador en vivo
  useEffect(() => {
    if (!status || status.unlocked) return
    const tick = () => setNow(Date.now() + status.offset)
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [status])

  const remaining = status?.unlockAt ? status.unlockAt - now : null

  // al llegar a cero, se le pregunta al servidor (él confirma el desbloqueo)
  useEffect(() => {
    if (status && !status.unlocked && remaining !== null && now > 0 && remaining <= 0) check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining !== null && remaining <= 0])

  if (!status) {
    return (
      <Section eyebrow="Carta" title="[Insertar título de la carta]">
        <div className="card flex h-56 items-center justify-center">
          <MiniSunflower size={28} className="animate-spin [animation-duration:4s]" />
        </div>
      </Section>
    )
  }

  /* ---------------------- Estado 1: bloqueada ---------------------- */
  if (!status.unlocked) {
    return (
      <Section
        eyebrow="Carta"
        title="[Insertar título]"
        description="[Insertar mensaje]"
      >
        <div className="card px-6 pb-8 pt-7 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sun-100 text-sun-600">
            <Lock size={19} strokeWidth={1.8} />
          </div>
          <div className="mt-5 font-serif text-[44px] leading-none tracking-[0.06em] text-ink tabular-nums" aria-live="polite">
            {remaining === null ? '--:--:--' : formatHMS(remaining)}
          </div>
          <div className="mt-3 flex justify-center gap-[2.1rem] text-[9.5px] font-semibold uppercase tracking-[0.28em] text-muted">
            <span>Horas</span>
            <span>Min</span>
            <span>Seg</span>
          </div>
          <p className="mt-6 text-[12px] font-light text-muted">Se abre a las 00:00</p>
        </div>
      </Section>
    )
  }

  /* --------------------- Estado 2: desbloqueada --------------------- */
  return (
    <Section
      eyebrow="Carta"
      title="[Insertar título de la carta]"
      description="[Insertar mensaje]"
    >
      <div className="card anim-fade-in px-6 pb-8 pt-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun-100 text-sun-600">
          <Mail size={22} strokeWidth={1.7} />
        </div>
        <a
          href="/api/carta"
          download="Una carta para ti.jpg"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-sun-400 to-sun-600 px-7 py-3.5 text-[15px] font-medium text-white shadow-glow transition active:scale-95"
        >
          <Download size={17} /> Descargar Carta
        </a>
      </div>
    </Section>
  )
}
