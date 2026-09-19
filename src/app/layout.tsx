import type { Metadata, Viewport } from 'next';
import './globals.css';
import { I18nProvider } from '@/lib/i18n/context';
import { AuthProvider } from '@/lib/auth/authContext';
import { LayoutShell } from '@/components/LayoutShell';

export const metadata: Metadata = {
  title: 'AryaSaarthi (आर्यसारथी) — Sahi Vyakti. Sahi Yojna. Sahi Marg.',
  description: 'AryaSaarthi — Sahi Vyakti. Sahi Yojna. Sahi Marg. Empowering SC entrepreneurs, artisans, and students with transparent NSFDC concessional loans, explainable recommendations, and verified channel partners.',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#15803d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi">
      <head>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200">
        <I18nProvider>
          <AuthProvider>
            <LayoutShell>{children}</LayoutShell>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
