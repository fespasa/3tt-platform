"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/academia",  label: "Academia"  },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/podcast",   label: "Podcast"   },
  { href: "/eventos",   label: "Eventos"   },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-deep/95 backdrop-blur-md border-b border-teal/10 h-[70px] flex items-center px-6 md:px-[6%]">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mr-auto">
        <svg width="32" height="32" viewBox="0 0 88 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4"  y="6"  width="28" height="10" rx="1.5" fill="white"/>
          <rect x="18" y="6"  width="14" height="30" rx="1.5" fill="white"/>
          <rect x="4"  y="28" width="28" height="10" rx="1.5" fill="white"/>
          <rect x="18" y="28" width="14" height="30" rx="1.5" fill="white"/>
          <rect x="4"  y="50" width="28" height="10" rx="1.5" fill="white"/>
          <rect x="38" y="6"  width="20" height="10" rx="1.5" fill="white"/>
          <rect x="44" y="6"  width="8"  height="54" rx="1.5" fill="white"/>
          <rect x="62" y="6"  width="22" height="10" rx="1.5" fill="white"/>
          <rect x="68" y="6"  width="8"  height="54" rx="1.5" fill="white"/>
          <rect x="4"  y="74" width="80" height="10" rx="3"   fill="#00A8A8"/>
        </svg>
        <span className="text-white font-black text-sm uppercase tracking-widest">3Touch Tribe</span>
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-8 list-none">
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            <Link href={l.href} className="text-white/60 hover:text-teal text-sm font-medium transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <Link href="/login" className="hidden md:inline-flex ml-8 btn-primary !py-2 !px-5 text-sm">
        Acceder
      </Link>

      {/* Mobile menu toggle */}
      <button
        className="md:hidden text-white ml-4"
        onClick={() => setOpen(o => !o)}
        aria-label="Menú"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-[70px] left-0 right-0 bg-navy-deep border-t border-white/10 flex flex-col p-6 gap-4 md:hidden">
          {NAV_LINKS.map(l => (
            <Link key={l.href} href={l.href} className="text-white/70 hover:text-teal font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" className="btn-primary text-center" onClick={() => setOpen(false)}>Acceder</Link>
        </div>
      )}
    </nav>
  );
}
