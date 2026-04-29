import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const AC_API_URL = process.env.ACTIVECAMPAIGN_API_URL; // e.g. https://fespasa.activehosted.com
const AC_API_KEY = process.env.ACTIVECAMPAIGN_API_KEY;
const AC_TAG_ID = 47;   // "3TT - User"
const AC_LIST_ID = 9;   // "3TT - Usuarios"

async function acFetch(endpoint: string, body: unknown) {
  if (!AC_API_URL || !AC_API_KEY) {
    throw new Error("ActiveCampaign env vars not configured");
  }
  const res = await fetch(`${AC_API_URL}/api/3/${endpoint}`, {
    method: "POST",
    headers: {
      "Api-Token": AC_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AC API error ${res.status}: ${text}`);
  }
  return res.json();
}

export async function POST(request: Request) {
  try {
    // Verify the user is authenticated
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { fullName, email, role } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Split name into first/last
    const nameParts = (fullName || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    // 1. Create or update contact
    const contactRes = await acFetch("contact/sync", {
      contact: { email, firstName, lastName },
    });

    const contactId = contactRes.contact?.id;
    if (!contactId) {
      throw new Error("No contact ID returned from AC");
    }

    // 2. Add tag "3TT - User"
    await acFetch("contactTags", {
      contactTag: { contact: contactId, tag: AC_TAG_ID },
    });

    // 3. Subscribe to list "3TT - Usuarios"
    await acFetch("contactLists", {
      contactList: { list: AC_LIST_ID, contact: contactId, status: 1 },
    });

    // 4. Add role tag
    if (role) {
      const roleTagMap: Record<string, string> = {
        player: "3TT - Jugador",
        coach: "3TT - Entrenador",
        professional: "3TT - Profesional",
      };
      const roleTagName = roleTagMap[role];
      if (roleTagName) {
        try {
          const tagRes = await acFetch("tags", {
            tag: { tag: roleTagName, tagType: "contact", description: `Rol en 3Touch Tribe: ${role}` },
          });
          const roleTagId = tagRes.tag?.id;
          if (roleTagId) {
            await acFetch("contactTags", {
              contactTag: { contact: contactId, tag: roleTagId },
            });
          }
        } catch {
          console.warn("Failed to add role tag to AC contact");
        }
      }
    }

    return NextResponse.json({ ok: true, contactId });
  } catch (err) {
    console.error("ActiveCampaign sync error:", err);
    return NextResponse.json(
      { error: "Error sincronizando con ActiveCampaign" },
      { status: 500 }
    );
  }
}
