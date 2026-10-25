// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
// @ts-ignore: side-effect CSS import handled by Next.js
import './globals.css';
import { Toaster } from 'react-hot-toast';
import QueryProvider from '@/components/layout/QueryProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AfriConnect — Réseau Professionnel Africain',
  description: 'Connectez-vous avec les professionnels africains',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <QueryProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a2e',
                color: '#fff',
                border: '1px solid #16213e',
              },
            }}
          />
        </QueryProvider>
      </body>
    </html>
  );
}