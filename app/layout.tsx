import type {Metadata} from 'next';
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'Onyx Forge',
  description: 'Generate high-quality, professional banner ads in standard sizes using product descriptions and URLs.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrains.variable} dark`}>
      <body className="bg-[#0A0A0A] text-slate-300 antialiased min-h-screen flex flex-col font-sans" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
