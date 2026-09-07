import type { Metadata } from 'next';
import { Inter, Fraunces, Geist_Mono } from 'next/font/google';
import { ClerkProvider } from '@/lib/clerk';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getSiteUrl } from '@/lib/site-url';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'] });
const fraunces = Fraunces({ variable: '--font-fraunces', subsets: ['latin'], weight: ['500', '600', '700'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

const SITE_URL = getSiteUrl();
const SITE_DESCRIPTION = 'A public marketplace of real, everyday problems reported by developers and teams. Builders come here to see exactly what\'s broken and who\'s waiting for a fix.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'NeedBoard — Collective Problem Clustering',
    template: '%s | NeedBoard',
  },
  description: SITE_DESCRIPTION,
  keywords: ['product market fit', 'problem discovery', 'startup ideas', 'developer pain points', 'saas ideas', 'build in public'],
  openGraph: {
    type: 'website',
    url: SITE_URL,
    siteName: 'NeedBoard',
    title: 'NeedBoard — Collective Problem Clustering',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeedBoard — Collective Problem Clustering',
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          {/* Blocking (pre-hydration) theme read — a raw script tag here runs
              synchronously while the browser parses <head>, before <body> is
              ever painted. Light is the CSS default, so this only needs to
              act when the user explicitly chose dark (or explicitly chose
              light, overriding an OS dark preference). */}
          <script
            dangerouslySetInnerHTML={{
              __html: `try{var t=localStorage.getItem('needboard-theme');if(t==='dark'||t==='light')document.documentElement.setAttribute('data-theme',t);}catch(e){}`,
            }}
          />
        </head>
        <body className="min-h-full flex flex-col bg-bg text-ink selection:bg-accent/20 selection:text-ink" suppressHydrationWarning>
          <Header />
          <main className="flex-grow flex flex-col relative z-10">{children}</main>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
