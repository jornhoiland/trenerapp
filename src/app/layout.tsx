import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ThemeRegistry from '@/lib/ThemeRegistry';
import BottomNav from '@/components/BottomNav';
import TopBar from '@/components/TopBar';
import NavigationProgress from '@/components/NavigationProgress';

export const metadata: Metadata = {
  title: 'Tren',
  description: 'Planlegg og gjennomfør treningsøkter',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0B0D17',
};

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="no">
      <body>
        <ThemeRegistry>
          <NavigationProgress>
            <TopBar fontClass={inter.className} />
            <main
              className={inter.className}
              style={{
                paddingTop: '64px',
                paddingBottom: '72px',
                minHeight: '100vh',
                background: '#0B0D17',
              }}
            >
              {children}
            </main>
            <BottomNav />
          </NavigationProgress>
        </ThemeRegistry>
      </body>
    </html>
  );
}
