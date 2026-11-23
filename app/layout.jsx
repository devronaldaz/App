import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata = {
  title: 'App4u🌻',
  description: 'Un regalo hecho con cariño.',
  icons: { icon: '/favicon.svg' },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FBF6EE',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body>{children}</body>
    </html>
  )
}
