/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    // Permite Server Actions desde GitHub Codespaces y localhost.
    // Sin esto, Next.js rechaza el formulario login/signup con
    // "Invalid Server Actions request." porque la URL *.app.github.dev
    // no coincide con el host interno del servidor.
    serverActions: {
      allowedOrigins: [
        'localhost:3000',
        '*.app.github.dev',
      ],
    },
  },
}

export default nextConfig
