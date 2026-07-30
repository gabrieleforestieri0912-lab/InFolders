'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="border-b border-white/5 sticky top-0 z-50 bg-[#09000d]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <Image src="/icon-48.png" alt="InFolders icon" width={28} height={28} className="rounded-lg" />
          <span className="text-lg font-bold tracking-tight text-white">InFolders</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 text-sm text-zinc-400 sm:flex">
          <Link href="/#features" className="transition-colors hover:text-white">Funzionalità</Link>
          <Link href="/#pricing" className="transition-colors hover:text-white">Prezzi</Link>
          <Link href="/guide" className="transition-colors hover:text-white">Guida</Link>
          <Link href="/#faq" className="transition-colors hover:text-white">FAQ</Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <a
            href="https://chromewebstore.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#a855f7] to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 512 512" fill="white" aria-hidden="true">
              <path d="M0 256C0 209.4 12.47 165.6 34.27 127.1L144.1 318.3C166 357.5 207.9 384 256 384C270.3 384 283.1 381.7 296.8 377.4L220.5 509.6C95.9 492.3 0 385.3 0 256zM365.1 321.6C377.4 302.4 384 279.1 384 256C384 217.8 367.2 183.5 340.7 160H493.4C505.4 189.6 512 222 512 256C512 397.4 397.4 512 256 512C242.3 512 228.8 511.1 215.6 509.2L365.1 321.6zM477.8 128H256C193.1 128 142.3 172.1 130.5 230.7L54.19 98.47C103 38.53 178.2 0 256 0C350.8 0 433.5 51.26 477.8 128zM168 256C168 207.4 207.4 168 256 168C304.6 168 344 207.4 344 256C344 304.6 304.6 344 256 344C207.4 344 168 304.6 168 256z"/>
            </svg>
            Aggiungi a Chrome
          </a>

          {/* Hamburger Menu Toggle */}
          <button
            onClick={toggleMobileMenu}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-300 transition-colors hover:bg-white/10 sm:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-in-out sm:hidden"
        style={{ gridTemplateRows: mobileMenuOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden bg-[#0a000e] border-t border-white/5">
          <nav className="flex flex-col gap-4 px-6 py-6 text-sm font-medium text-zinc-400">
            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-colors hover:text-white"
            >
              Funzionalità
            </Link>
            <Link
              href="/#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-colors hover:text-white"
            >
              Prezzi
            </Link>
            <Link
              href="/guide"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-colors hover:text-white"
            >
              Guida
            </Link>
            <Link
              href="/#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="transition-colors hover:text-white"
            >
              FAQ
            </Link>
            <a
              href="https://chromewebstore.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex justify-center rounded-lg bg-gradient-to-r from-[#a855f7] to-[#7c3aed] py-2.5 text-center font-semibold text-white transition-opacity hover:opacity-90"
            >
              Aggiungi a Chrome
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
