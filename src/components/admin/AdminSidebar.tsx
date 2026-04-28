"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin",           label: "Dashboard",   icon: "📊" },
  { href: "/admin/foro",      label: "Foro",        icon: "💬" },
  { href: "/admin/contenido", label: "Contenido",   icon: "🎙️" },
  { href: "/admin/eventos",   label: "Eventos",     icon: "📅" },
  { href: "/admin/usuarios",  label: "Usuarios",    icon: "👥" },
  { href: "/admin/newsletter",label: "Newsletter",  icon: "📧" },
  { href: "/admin/planes",    label: "Planes",      icon: "💎" },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {/* overlay mobile */}
      {open && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />}

      <aside className={`
        fixed top-0 left-0 z-50 h-full w-64 gradient-navy text-white flex flex-col
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <span className="text-2xl">🏐</span>
            <div>
              <p className="font-black text-sm tracking-widest">3TT ADMIN</p>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">Panel de gestión</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${active
                    ? "bg-teal/20 text-teal"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                  }
                `}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/40 hover:text-white/60 transition-colors">
            ← Volver a la web
          </Link>
        </div>
      </aside>
    </>
  );
}
