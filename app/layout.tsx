import type { Metadata } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-serif"
});

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: {
    default: 'Super Teacher · Aprende español con Maite Colodrón',
    template: '%s · Super Teacher',
  },
  description:
    'Plataforma de membresía para aprender español. Vídeos, PDFs, cursos y mentoría personalizada con Maite Colodrón. Niveles A1 a C1, certificaciones DELE/SIELE.',
  keywords: ['aprender español', 'clases de español online', 'Maite Colodrón', 'DELE', 'SIELE', 'español para extranjeros'],
  authors: [{ name: 'Maite Colodrón' }],
  openGraph: {
    title: 'Super Teacher · Aprende español con Maite Colodrón',
    description: 'Plataforma de membresía para aprender español online con vídeos, cursos y mentoría.',
    type: 'website',
    locale: 'es_ES',
    siteName: 'Super Teacher',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Super Teacher · Aprende español con Maite Colodrón',
    description: 'Aprende español online con Maite Colodrón. Niveles A1–C1, DELE/SIELE.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
