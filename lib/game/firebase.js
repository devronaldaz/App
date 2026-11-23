import { initializeApp, getApps } from 'firebase/app'
import { getDatabase } from 'firebase/database'

// 🔧 Valores que vienen de .env.local (local) o de Vercel → Environment Variables
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.databaseURL)

let db = null

/** Inicializa Firebase una sola vez y solo en el navegador */
export function getDb() {
  if (!db) {
    const app = getApps()[0] || initializeApp(config)
    db = getDatabase(app)
  }
  return db
}
