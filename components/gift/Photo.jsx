import { ImageIcon } from 'lucide-react'

/**
 * Muestra la foto si `src` tiene una URL.
 * Si está vacío, muestra un placeholder pastel del mismo tamaño.
 */
export default function Photo({ src, alt = '', label = 'Tu foto aquí', className = '', showLabel = true }) {
  if (src) {
    return <img src={src} alt={alt} className={`h-full w-full object-cover ${className}`} loading="lazy" />
  }
  return (
    <div
      className={`photo-placeholder flex h-full w-full flex-col items-center justify-center gap-2 text-seed/40 ${className}`}
      role="img"
      aria-label={alt || label}
    >
      {showLabel && (
        <>
          <ImageIcon size={26} strokeWidth={1.4} />
          <span className="text-[11px] font-medium uppercase tracking-[0.25em]">{label}</span>
        </>
      )}
    </div>
  )
}
