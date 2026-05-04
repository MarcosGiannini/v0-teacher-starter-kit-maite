import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteControls } from '@/components/site-controls'
import { getLocale } from '@/lib/i18n/get-locale'
import { translations } from '@/lib/i18n/translations'
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
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://superteacher.es'
  ),
  title: {
    default: 'Super Teacher · Aprende español con Maite Colodrón',
    template: '%s · Super Teacher',
  },
  description:
    'Plataforma de membresía para aprender español. Vídeos, PDFs, cursos y mentoría personalizada con Maite Colodrón. Niveles A1 a C1, certificaciones DELE/SIELE.',
  keywords: [
    'aprender español',
    'clases de español online',
    'Maite Colodrón',
    'DELE',
    'SIELE',
    'español para extranjeros',
    'cursos de español',
  ],
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
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f7f3ec' },
    { media: '(prefers-color-scheme: dark)',  color: '#1c1410' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const labels = translations[locale].controls

  return (
    <html lang={locale} className={`${cormorant.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SiteControls locale={locale} labels={labels} />
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
