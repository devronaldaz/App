import { motion } from 'framer-motion'

/**
 * Girasol dibujado en SVG.
 * - `bloom`  (0 → 1): qué tan abiertos están los pétalos.
 * - `size`   tamaño en px.
 */
export default function Sunflower({ size = 140, bloom = 1, className = '' }) {
  const back = Array.from({ length: 16 }, (_, i) => i * (360 / 16) + 11.25)
  const front = Array.from({ length: 16 }, (_, i) => i * (360 / 16))
  const seeds = Array.from({ length: 34 }, (_, i) => {
    const a = i * 137.508 * (Math.PI / 180)
    const r = 2.6 * Math.sqrt(i + 1)
    // redondeado: servidor y navegador deben generar exactamente el mismo número
    return { x: Math.round(Math.cos(a) * r * 100) / 100, y: Math.round(Math.sin(a) * r * 100) / 100 }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="-60 -60 120 120"
      className={className}
      aria-hidden="true"
    >
      {/* Pétalos de atrás (más oscuros) */}
      <g>
        {back.map((deg, i) => (
          <g key={`b${i}`} transform={`rotate(${deg}) translate(0 -30)`}>
            <motion.ellipse
              rx="8.5"
              ry="21"
              fill="#DE9A16"
              opacity="0.85"
              initial={false}
              animate={{ scaleY: 0.55 + bloom * 0.45 }}
              transition={{ duration: 0.9, delay: i * 0.015, ease: [0.22, 1, 0.36, 1] }}
            />
          </g>
        ))}
      </g>
      {/* Pétalos de adelante */}
      <g>
        {front.map((deg, i) => (
          <g key={`f${i}`} transform={`rotate(${deg}) translate(0 -28)`}>
            <motion.ellipse
              rx="8"
              ry="20"
              fill="url(#petal)"
              initial={false}
              animate={{ scaleY: 0.5 + bloom * 0.5 }}
              transition={{ duration: 0.9, delay: 0.08 + i * 0.015, ease: [0.22, 1, 0.36, 1] }}
            />
          </g>
        ))}
      </g>
      {/* Centro */}
      <circle r="19" fill="#5A3A1F" />
      <circle r="19" fill="url(#center)" />
      {seeds.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r="1.15" fill="#2F1E10" opacity="0.55" />
      ))}
      <defs>
        <linearGradient id="petal" x1="0" y1="-1" x2="0" y2="1">
          <stop offset="0%" stopColor="#F8DC8E" />
          <stop offset="55%" stopColor="#F0B530" />
          <stop offset="100%" stopColor="#E39F1C" />
        </linearGradient>
        <radialGradient id="center" cx="0.38" cy="0.35" r="0.8">
          <stop offset="0%" stopColor="#8A5A2B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#3D2614" stopOpacity="0.2" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/** Girasol pequeño para iconos / decoraciones */
export function MiniSunflower({ size = 18, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="-12 -12 24 24" className={className} aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse key={i} rx="2.4" ry="5" fill="#F0B530" transform={`rotate(${i * 36}) translate(0 -6)`} />
      ))}
      <circle r="4" fill="#5A3A1F" />
    </svg>
  )
}
