import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, businessId, email, phone, street, city, postalCode, bankAccount, bankBic } = body;

  if (!name || !businessId || !email || !street || !city || !postalCode) {
    return NextResponse.json({ error: "Pakollisia kenttiä puuttuu" }, { status: 400 });
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: org, error: orgError } = await adminSupabase
    .from("organizations")
    .insert({
      name,
      businessId,
      email,
      phone: phone || null,
      street,
      city,
      postalCode,
      bankAccount: bankAccount || null,
      bankBic: bankBic || null,
      vatNumber: `FI${businessId.replace("-", "")}`,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (orgError) {
    if (orgError.code === "23505") {
      return NextResponse.json({ error: "Y-tunnus on jo käytössä" }, { status: 400 });
    }
    return NextResponse.json({ error: orgError.message }, { status: 500 });
  }

  const { error: memberError } = await adminSupabase
    .from("organization_members")
    .insert({
      organizationId: org.id,
      userId: user.id,
      role: "OWNER",
    });

  if (memberError) {
    return NextResponse.json({ error: memberError.message }, { status: 500 });
  }

  return NextResponse.json({ org });
}