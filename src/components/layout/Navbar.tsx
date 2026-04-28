"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, X, LogOut, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/academia",  label: "Academia"  },
  { href: "/comunidad", label: "Comunidad" },
  { href: "/podcast",   label: "Podcast"   },
  { href: "/eventos",   label: "Eventos"   },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
    setLoggingOut(false);
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center px-6 md:px-[6%] transition-all duration-500 ${
      scrolled
        ? "bg-navy-deep/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
        : "bg-transparent"
    }`}>
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mr-auto group">
        <Image
          src="/images/logo-3tt.svg"
          alt="3TT"
          width={32}
          height={38}
          className="transition-transform duration-300 group-hover:scale-110"
        />
        <span className="text-white font-display text-xl tracking-wider">3TOUCH TRIBE</span>
      </Link>

      {/* Desktop links */}
      <ul className="hidden md:flex gap-1 list-none">
        {NAV_LINKS.map(l => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="relative text-white/50 hover:text-white text-sm font-medium transition-colors px-4 py-2 rounded-lg hover:bg-white/[0.04]"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      {/* Auth CTA */}
      {user ? (
        <div className="hidden md:flex items-center gap-3 ml-6">
          <Link href="/perfil" className="flex items-center gap-2 text-white/50 hover:text-teal text-sm transition-colors px-3 py-2 rounded-lg hover:bg-white/[0.04]">
            <div className="w-7 h-7 rounded-full bg-teal/15 border border-teal/20 flex items-center justify-center">
              <User size={14} className="text-teal" />
            </div>
            <span>{user.user_metadata?.username || user.email?.split("@")[0]}</span>
          </Link>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-white/30 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/[0.04]"
            title="Cerrar sesión"
          >
            <LogOut size={16} />
          </button>
        </div>
      ) : (
        <Link href="/login" className="hidden md:inline-flex ml-6 btn-primary !py-2.5 !px-6 text-sm">
          Acceder
        </Link>
      )}

      {/* Mobile menu toggle */}
      <button
        className="md:hidden text-white/60 hover:text-white ml-4 p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
        onClick={() => setOpen(o => !o)}
        aria-label="Menú"
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className="absolute top-[72px] left-0 right-0 bg-navy-deep/95 backdrop-blur-xl border-t border-white/[0.06] flex flex-col p-6 gap-3 md:hidden shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
          {NAV_LINKS.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className="text-white/60 hover:text-teal font-medium py-2 px-3 rounded-lg hover:bg-white/[0.04] transition-all"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <div className="divider-glow my-2" />
          {user ? (
            <>
              <Link href="/perfil" className="text-white/60 hover:text-teal font-medium py-2 px-3 rounded-lg hover:bg-white/[0.04] flex items-center gap-2 transition-all" onClick={() => setOpen(false)}>
                <User size={16} /> {user.user_metadata?.username || user.email?.split("@")[0]}
              </Link>
              <button onClick={() => { handleLogout(); setOpen(false); }} className="text-red-400/70 hover:text-red-400 font-medium text-left py-2 px-3 rounded-lg hover:bg-white/[0.04] flex items-center gap-2 transition-all">
                <LogOut size={16} /> Cerrar sesión
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-center mt-2" onClick={() => setOpen(false)}>Acceder</Link>
          )}
        </div>
      )}
    </nav>
  );
}
