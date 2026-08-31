import type { Metadata } from 'next';
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://infolders.app'),
  title: {
    default: "InFolders — Organizza le tue conversazioni AI in cartelle",
    template: "%s | InFolders"
  },
  description: "InFolders è un'estensione browser che organizza le conversazioni AI da ChatGPT, Gemini, Claude e Perplexity in cartelle, bookmark, prompt e profili istruzioni. Multi-dispositivo, drag & drop, ricerca globale.",
  keywords: ["InFolders", "ChatGPT folders", "Gemini folders", "Claude folders", "Perplexity folders", "organize AI chats", "browser extension", "AI sidebar", "ChatGPT bookmarks", "prompt library"],
  authors: [{ name: "InFolders Team" }],
  creator: "InFolders",
  publisher: "InFolders",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/icon-128.png', sizes: '128x128', type: 'image/png' },
    ],
    apple: '/icon-128.png',
    shortcut: '/icon-48.png',
  },
  openGraph: {
    title: 'InFolders — Organizza le tue conversazioni AI',
    description: "Cartelle, bookmark, prompt e profili istruzioni per ChatGPT, Gemini, Claude e Perplexity.",
    url: 'https://infolders.app',
    siteName: 'InFolders',
    images: [
      {
        url: '/icon-128.png',
        width: 128,
        height: 128,
        alt: 'InFolders Logo',
      }
    ],
    locale: 'it_IT',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'InFolders — Organizza le tue conversazioni AI',
    description: "Cartelle, bookmark, prompt e profili istruzioni per ChatGPT, Gemini, Claude e Perplexity.",
    images: ['/icon-128.png'],
    creator: '@infolders',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
