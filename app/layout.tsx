import type { Metadata, Viewport } from 'next'
import { GeistSans } from 'geist/font/sans'
import { Source_Serif_4 } from 'next/font/google'
import './globals.css'
import { SITE_NAME, SITE_URL, metaTitle } from '@/lib/content/spec'
import { content } from '@/lib/content/content'
import {
  SITE_DESCRIPTION,
  KEYWORDS,
  OG_IMAGE,
  organizationLd,
  websiteLd,
  ecosystemOrganizationNodes,
  jsonLdGraph,
} from '@/lib/seo'
import { JsonLd } from '@/components/JsonLd'
import { GoogleAnalytics } from '@next/third-parties/google'
import { Analytics } from '@vercel/analytics/next'

const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', style: ['normal', 'italic'], weight: ['400', '500', '600'] })

const gaId = process.env.NEXT_PUBLIC_GA_ID

const twitterHandle = content.footer.social.find((s) => s.platform === 'x')?.handle ?? '@ainativeoffice'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: metaTitle(),
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: KEYWORDS,
  authors: content.hero.authors.map((a) => ({ name: a.name })),
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/ainativeoffice-icon.svg', type: 'image/svg+xml' },
      { url: '/ainativeoffice-icon-32.png', type: 'image/png', sizes: '32x32' },
    ],
    shortcut: ['/ainativeoffice-icon.svg'],
    apple: [{ url: '/ainativeoffice-apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  openGraph: {
    title: metaTitle(),
    description: SITE_DESCRIPTION,
    type: 'article',
    url: '/',
    siteName: SITE_NAME,
    locale: 'en_US',
    images: [{ url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
  },
  twitter: {
    card: 'summary_large_image',
    site: twitterHandle,
    creator: twitterHandle,
    title: metaTitle(),
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE.url],
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
        <JsonLd
          data={jsonLdGraph([organizationLd(), websiteLd(), ...ecosystemOrganizationNodes()])}
        />
        <a href="#main-content" className="skip-link no-print">[ Skip to content ]</a>
        {children}
        <Analytics />
      </body>
      {gaId ? <GoogleAnalytics gaId={gaId} /> : null}
    </html>
  )
}
