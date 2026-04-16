import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { z } from "zod";

const settingsSchema = z.object({
  name: z.string().min(1),
  businessId: z.string().min(1),
  vatNumber: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().optional(),
  street: z.string().min(1),
  city: z.string().min(1),
  postalCode: z.string().min(1),
  bankAccount: z.string().optional(),
  bankBic: z.string().optional(),
  defaultDueDays: z.coerce.number().default(14),
  defaultVatRate: z.coerce.number().default(25.5),
  invoicePrefix: z.string().default("LASKU"),
  defaultPaymentTerms: z.string().optional(),
  lateInterestRate: z.coerce.number().default(7),
  penaltyFee: z.coerce.number().default(5),
});

export async function PUT(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const result = settingsSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { data, error } = await adminSupabase
    .from("organizations")
    .update({ ...result.data, updatedAt: new Date().toISOString() })
    .eq("id", org.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
