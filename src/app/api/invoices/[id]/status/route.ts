import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";

const VALID_STATUSES = ["DRAFT", "SENT", "VIEWED", "PAID", "OVERDUE", "CANCELLED"];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { id } = await params;
  const { status } = await request.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Virheellinen tila" }, { status: 400 });
  }

  const updateData: Record<string, unknown> = {
    status,
    updatedAt: new Date().toISOString(),
  };

  if (status === "PAID") {
    updateData.paidAt = new Date().toISOString();
  }

  const { data, error } = await adminSupabase
    .from("invoices")
    .update(updateData)
    .eq("id", id)
    .eq("organizationId", org.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}