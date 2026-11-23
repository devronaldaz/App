/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // El proyecto en Vercel se creó como Vite y espera la salida en "dist".
  // Next.js genera ahí su build para coincidir con esa configuración.
  distDir: 'dist',
  experimental: {
    // La carta está en /private (no pública): hay que incluirla en la función del servidor
    outputFileTracingIncludes: {
      '/api/carta': ['./private/**/*'],
    },
  },
}

export default nextConfig
