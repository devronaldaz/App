'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Splash from './Splash'
import Cover from './Cover'
import Playlist from './Playlist'
import Letter from './Letter'
import FinalCall from './FinalCall'
import Trivia from './Trivia'
import GameLink from './GameLink'
import { MiniSunflower } from './Sunflower'

export default function App() {
  const [opened, setOpened] = useState(false)
  const [trivia, setTrivia] = useState(false)

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[480px]">
      <AnimatePresence>{!opened && <Splash onOpen={() => setOpened(true)} />}</AnimatePresence>

      {opened && (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2 }}>
          <Cover />
          <Playlist />
          <Divider />
          <Letter />
          <Divider />
          <FinalCall onStart={() => setTrivia(true)} />
          <GameLink />

          <footer className="px-6 pb-12 pt-6 text-center">
            <p className="text-[9.5px] font-medium uppercase tracking-[0.34em] text-muted/70">
              [Insertar firma]
            </p>
          </footer>
        </motion.main>
      )}

      <AnimatePresence>{trivia && <Trivia onClose={() => setTrivia(false)} />}</AnimatePresence>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center justify-center gap-3 opacity-70" aria-hidden="true">
      <span className="h-px w-10 bg-sun-300/70" />
      <MiniSunflower size={14} />
      <span className="h-px w-10 bg-sun-300/70" />
    </div>
  )
}
