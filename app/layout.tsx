import type { Metadata } from 'next';
import { Inter, Archivo } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const archivo = Archivo({
  subsets: ['latin'],
  variable: '--font-archivo',
});

export const metadata: Metadata = {
  title: 'Blueprxnt Admin Dashboard',
  description: 'Admin dashboard for Blueprxnt website management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${archivo.variable} font-sans`}>{children}</body>
    </html>
  );
}
