import type { Metadata, Viewport } from 'next';
import { Baloo_2, Mukta } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { AppContextProvider } from '@/lib/context/AppContext';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { AppHeader } from '@/components/layout/AppHeader';
import { MobileTopBar } from '@/components/layout/MobileShell';
import { BottomNav } from '@/components/layout/BottomNav';
import { GlobalModals } from '@/components/layout/GlobalModals';
import { ServiceWorkerRegister } from '@/components/pwa/ServiceWorkerRegister';

const baloo = Baloo_2({
  subsets: ['latin', 'devanagari'],
  variable: '--font-baloo',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const mukta = Mukta({
  subsets: ['latin', 'devanagari'],
  variable: '--font-mukta',
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'New Yuwa Boys Mandal Book - न्यू युवा गणेश मंडळ, केऱ्हाळे बु.',
  description: 'न्यू युवा गणेश मंडळ, केऱ्हाळे बुद्रुक (Kerhale Bk.) अधिकृत डिजिटल जमा-खर्च, वर्गणी WhatsApp पावती व ताळेबंद प्रणाली.',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'न्यू युवा बॉईज',
  },
};

export const viewport: Viewport = {
  themeColor: '#F67020',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mr" translate="no" className={`notranslate ${baloo.variable} ${mukta.variable}`}>
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="min-h-screen bg-gray-50/50 text-gray-900 font-body antialiased flex flex-col selection:bg-saffron-500 selection:text-white">
        <AuthProvider>
          <I18nProvider>
            <AppContextProvider>
              <div className="flex-1 flex flex-col min-h-screen">
                <div className="hidden sm:block">
                  <AppHeader />
                </div>
                <div className="sm:hidden">
                  <MobileTopBar />
                </div>
                <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-28 sm:pb-12">
                  {children}
                </main>
                <BottomNav />
                <GlobalModals />
                <ServiceWorkerRegister />
              </div>
            </AppContextProvider>
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
