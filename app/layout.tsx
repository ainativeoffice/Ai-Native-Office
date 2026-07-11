import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Source_Serif_4 } from 'next/font/google'
import './globals.css'

const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', style: ['normal', 'italic'], weight: ['400', '500', '600'] })

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
  themeColor: '#f3efe5',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${sourceSerif.variable} bg-background`}>
      <body className="antialiased font-sans">
        <a href="#main-content" className="skip-link no-print">[ Skip to content ]</a>
        {children}
      </body>
    </html>
  )
}
