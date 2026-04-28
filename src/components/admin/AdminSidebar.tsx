"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "@/components/ThemeToggle";
import Logo3TT from "@/components/Logo3TT";

const NAV = [
  { href: "/admin",           label: "Dashboard",   icon: "📊" },
  { href: "/admin/foro",      label: "Foro",        icon: "💬" },
  { href: "/admin/contenido", label: "Contenido",   icon: "🎙️" },
  { href: "/admin/cursos",    label: "Cursos",      icon: "🎓" },
  { href: "/admin/eventos",   label: "Eventos",     icon: "📅" },
  { href: "/admin/usuarios",  label: "Usuarios",    icon: "👥" },
  { href: "/admin/newsletter",label: "Newsletter",  icon: "📧" },
  { href: "/admin/planes",    label: "Planes",      icon: "💎" },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto
        `}
        style={{ background: "var(--bg-admin-side)", borderRight: "1px solid var(--border)" }}
      >
        <div className="px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
          <Link href="/admin" className="flex items-center gap-3" onClick={onClose}>
            <Logo3TT size={24} />
            <div>
              <p className="font-display text-lg tracking-wider text-foreground">3TT ADMIN</p>
              <p className="text-[10px] text-muted uppercase tracking-wider">Panel de gestión</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? "border"
                    : "border border-transparent hover:opacity-80"
                  }
                `}
                style={active ? {
                  background: "var(--admin-active)",
                  color: "var(--admin-active-text)",
                  borderColor: "rgba(0,168,168,0.2)",
                } : {
                  color: "var(--text-muted)",
                }}
              >
                <span className="text-lg opacity-80">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <Link href="/" className="text-xs text-muted hover:text-teal transition-colors">
            ← Volver a la web
          </Link>
          <ThemeToggle />
        </div>
      </aside>
    </>
  );
}
