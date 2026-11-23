import { motion } from 'framer-motion'

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
}

/** Sección con etiqueta pequeña + título serif + aparición suave al hacer scroll */
export default function Section({ eyebrow, title, description, children, className = '' }) {
  return (
    <motion.section
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className={`px-6 py-16 ${className}`}
    >
      <div className="mx-auto max-w-md text-center">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && (
          <h2 className="mt-3 font-serif text-[27px] leading-tight text-ink [text-wrap:balance]">{title}</h2>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-[34ch] text-[14.5px] font-light leading-relaxed text-muted">
            {description}
          </p>
        )}
      </div>
      <div className="mx-auto mt-8 max-w-md">{children}</div>
    </motion.section>
  )
}
