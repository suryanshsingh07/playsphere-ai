import type { Metadata } from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthProvider';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PlaySphere AI — Sports Venue Discovery for Lucknow',
  description:
    'Discover and book badminton courts, football turfs, swimming pools, and akharas across Lucknow with AI-powered recommendations.',
  keywords: 'sports booking Lucknow, badminton court Lucknow, football turf Lucknow, AI sports, PlaySphere',
  openGraph: {
    title: 'PlaySphere AI',
    description: 'AI-powered sports venue discovery and booking for Lucknow',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} scroll-smooth`}>
      <body className="bg-slate-950 text-white antialiased">
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

