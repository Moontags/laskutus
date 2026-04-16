import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { calculateLineTotal, calculateVatAmount, calculateInvoiceTotals } from "@/lib/invoice-utils";
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { id } = await params;
  const body = await request.json();
  const { items, ...invoiceData } = body;

  const totals = calculateInvoiceTotals(items);

  const { error: invoiceError } = await adminSupabase
    .from("invoices")
    .update({
      customerId: invoiceData.customerId,
      invoiceDate: invoiceData.invoiceDate,
      dueDate: invoiceData.dueDate,
      notes: invoiceData.notes || null,
      internalNotes: invoiceData.internalNotes || null,
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("organizationId", org.id);

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  await adminSupabase.from("invoice_items").delete().eq("invoiceId", id);

  const itemRows = items.map((item: {
    description: string; quantity: number; unit: string;
    unitPrice: number; vatRate: number; productId?: string; sortOrder?: number;
  }, index: number) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    const vatAmount = calculateVatAmount(lineTotal, item.vatRate);
    return {
      invoiceId: id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      lineTotal,
      vatAmount,
      totalAmount: lineTotal + vatAmount,
      sortOrder: index,
      productId: item.productId ?? null,
    };
  });

  const { error: itemsError } = await adminSupabase.from("invoice_items").insert(itemRows);
  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { id } = await params;
  const { data, error } = await adminSupabase
    .from("invoices")
    .select(`*, customer:customers(*), items:invoice_items(*)`)
    .eq("id", id)
    .eq("organizationId", org.id)
    .single();

  if (error) return NextResponse.json({ error: "Laskua ei löydy" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { id } = await params;
  const { error } = await adminSupabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("organizationId", org.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}