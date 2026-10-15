"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const LINKS = [
  { href: "/", label: "Accueil" },
  { href: "/jeux", label: "Jeux" },
  { href: "/regles", label: "Règles" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Image
            src="/assets/logo.png"
            alt="Logo PlayBoard"
            width={40}
            height={40}
            className="h-10 w-10 rounded-xl"
            priority
          />
          <span className="text-lg font-extrabold tracking-tight">
            Play<span className="text-amber-400">Board</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex" aria-label="Navigation principale">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/jeux"
            className="ml-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-900/30 transition-colors hover:bg-amber-400"
          >
            Jouer maintenant
          </Link>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="ml-auto rounded-lg border border-slate-700 p-2 text-slate-300 hover:bg-slate-800 md:hidden"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            {open ? (
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            ) : (
              <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <nav className="border-t border-slate-800 px-4 py-3 md:hidden" aria-label="Menu mobile">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2.5 font-medium text-slate-200 hover:bg-slate-800"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/jeux"
            onClick={() => setOpen(false)}
            className="mt-2 block rounded-xl bg-amber-500 px-3 py-2.5 text-center font-bold text-slate-950"
          >
            Jouer maintenant
          </Link>
        </nav>
      )}
    </header>
  );
}
