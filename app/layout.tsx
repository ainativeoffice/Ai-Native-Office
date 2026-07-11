import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--app-font-sans' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--app-font-serif', style: ['normal', 'italic'], weight: ['400', '600', '700'] })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--app-font-mono', weight: ['400', '500', '700'] })

export const metadata: Metadata = {
  title: 'The AI-Native Office — The Room as the Machine · Draft Specification v0.5 (RFC)',
  description: 'A technical specification for the AI-Native Office — a sovereign compute edge node that collapses the distance between human collaboration and machine inference to exactly zero.',
  authors: [{ name: 'Timothy Walsh' }, { name: 'Parham Alizadeh' }],
  robots: { index: true, follow: true },
  metadataBase: new URL('https://ainativeoffice.org'),
  alternates: { canonical: 'https://ainativeoffice.org/' },
  openGraph: {
    title: 'The AI-Native Office — The Room as the Machine · Draft Specification v0.5 (RFC)',
    description: 'A technical specification for the AI-Native Office — a sovereign compute edge node that collapses the distance between human collaboration and machine inference to exactly zero.',
    type: 'article',
    url: 'https://ainativeoffice.org/',
    siteName: 'The AI-Native Office',
    locale: 'en_US',
    images: [{ url: 'https://ainativeoffice.org/opengraph.jpg', width: 1200, height: 630, alt: 'The AI-Native Office — The Room as the Machine' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@ainativeoffice',
    creator: '@ainativeoffice',
    title: 'The AI-Native Office — The Room as the Machine · Draft Specification v0.5 (RFC)',
    description: 'A technical specification for the AI-Native Office — a sovereign compute edge node that collapses the distance between human collaboration and machine inference to exactly zero.',
    images: ['https://ainativeoffice.org/opengraph.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0A0A0A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} bg-background`}>
      <body className="antialiased font-sans">
        <a href="#main-content" className="skip-link no-print">[ Skip to content ]</a>
        {children}
      </body>
    </html>
  )
}
