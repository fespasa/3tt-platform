"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") { router.replace("/"); return; }
      setAuthorized(true);
    })();
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-admin)" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-teal/15 border border-teal/20 flex items-center justify-center mx-auto mb-3 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-teal/40" />
          </div>
          <p className="text-sm text-muted font-medium">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-admin)" }}>
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 backdrop-blur-xl" style={{ background: "var(--bg-nav)", borderBottom: "1px solid var(--border)" }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-secondary hover:text-foreground text-xl transition-colors"
          >
            ☰
          </button>
          <span className="font-display text-lg text-foreground tracking-wider">3TT ADMIN</span>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
