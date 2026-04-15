import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { invoiceSchema } from "@/lib/validations";
import {
  calculateLineTotal,
  calculateVatAmount,
  calculateInvoiceTotals,
  generateInvoiceNumber,
  calculateFinnishReference,
} from "@/lib/invoice-utils";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { data, error } = await adminSupabase
    .from("invoices")
    .select(`*, customer:customers(id, name, email)`)
    .eq("organizationId", org.id)
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const body = await request.json();
  const { draft, ...invoiceData } = body;

  const result = invoiceSchema.safeParse(invoiceData);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { items, ...invoice } = result.data;
  const totals = calculateInvoiceTotals(items);

  const invoiceNumber = generateInvoiceNumber(org.invoicePrefix, org.nextInvoiceNumber);
  const reference = calculateFinnishReference(invoiceNumber);

  const { data: newInvoice, error: invoiceError } = await adminSupabase
    .from("invoices")
    .insert({
      ...invoice,
      organizationId: org.id,
      invoiceNumber,
      reference,
      status: draft ? "DRAFT" : "DRAFT",
      subtotal: totals.subtotal,
      vatAmount: totals.vatAmount,
      total: totals.total,
      bankAccount: org.bankAccount,
      bankBic: org.bankBic,
      updatedAt: new Date().toISOString(),
    })
    .select()
    .single();

  if (invoiceError) return NextResponse.json({ error: invoiceError.message }, { status: 500 });

  const itemRows = items.map((item, index) => {
    const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
    const vatAmount = calculateVatAmount(lineTotal, item.vatRate);
    return {
      invoiceId: newInvoice.id,
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

  const { error: itemsError } = await adminSupabase
    .from("invoice_items")
    .insert(itemRows);

  if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });

  await adminSupabase
    .from("organizations")
    .update({ nextInvoiceNumber: org.nextInvoiceNumber + 1, updatedAt: new Date().toISOString() })
    .eq("id", org.id);

  return NextResponse.json(newInvoice, { status: 201 });
}