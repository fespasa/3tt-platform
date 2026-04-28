import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditProfileForm from "@/components/auth/EditProfileForm";

export const metadata: Metadata = { title: "Editar perfil" };

export default async function EditarPerfilPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/perfil/editar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="mb-8">
        <a href="/perfil" className="text-sm text-gray3tt hover:text-teal transition-colors">← Volver al perfil</a>
        <h1 className="text-2xl font-black text-navy mt-3">Editar perfil</h1>
      </div>
      <EditProfileForm profile={profile ?? null} userEmail={user.email ?? ""} />
    </div>
  );
}
