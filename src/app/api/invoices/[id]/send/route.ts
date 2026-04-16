import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { Resend } from "resend";
import { formatCurrency, formatDate } from "@/lib/invoice-utils";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const org = await getUserOrganization(user.id);
  if (!org) return NextResponse.json({ error: "No organization" }, { status: 400 });

  const { id } = await params;

  const { data: invoice, error } = await adminSupabase
    .from("invoices")
    .select(`*, customer:customers(*), items:invoice_items(*)`)
    .eq("id", id)
    .eq("organizationId", org.id)
    .single();

  if (error || !invoice) {
    return NextResponse.json({ error: "Laskua ei löydy" }, { status: 404 });
  }

  const customer = Array.isArray(invoice.customer)
    ? invoice.customer[0]
    : invoice.customer;

  if (!customer?.email) {
    return NextResponse.json({ error: "Asiakkaalla ei ole sähköpostiosoitetta" }, { status: 400 });
  }

  const invoiceUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/invoices/${id}`;

  const html = `
<!DOCTYPE html>
<html lang="fi">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
  <h2 style="color: #111; margin-bottom: 4px;">Lasku ${invoice.invoiceNumber}</h2>
  <p style="color: #666; margin-top: 0;">${org.name}</p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <tr>
      <td style="padding: 8px 0; color: #666; font-size: 14px;">Laskupäivä</td>
      <td style="padding: 8px 0; font-size: 14px; text-align: right;">${formatDate(invoice.invoiceDate)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666; font-size: 14px;">Eräpäivä</td>
      <td style="padding: 8px 0; font-size: 14px; text-align: right; font-weight: bold;">${formatDate(invoice.dueDate)}</td>
    </tr>
    <tr>
      <td style="padding: 8px 0; color: #666; font-size: 14px;">Viitenumero</td>
      <td style="padding: 8px 0; font-size: 14px; text-align: right;">${invoice.reference ?? "—"}</td>
    </tr>
    <tr style="border-top: 2px solid #111;">
      <td style="padding: 12px 0; font-size: 16px; font-weight: bold;">Yhteensä</td>
      <td style="padding: 12px 0; font-size: 16px; font-weight: bold; text-align: right;">${formatCurrency(invoice.total)}</td>
    </tr>
  </table>

  ${org.bankAccount ? `
  <div style="background: #f9f9f9; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px; font-weight: bold; font-size: 14px;">Maksutiedot</p>
    <p style="margin: 4px 0; font-size: 13px; color: #555;">Tilinumero: <strong>${org.bankAccount}</strong></p>
    ${org.bankBic ? `<p style="margin: 4px 0; font-size: 13px; color: #555;">BIC: <strong>${org.bankBic}</strong></p>` : ""}
    <p style="margin: 4px 0; font-size: 13px; color: #555;">Viitenumero: <strong>${invoice.reference ?? "—"}</strong></p>
    <p style="margin: 4px 0; font-size: 13px; color: #555;">Eräpäivä: <strong>${formatDate(invoice.dueDate)}</strong></p>
    <p style="margin: 4px 0; font-size: 13px; color: #555;">Summa: <strong>${formatCurrency(invoice.total)}</strong></p>
  </div>
  ` : ""}

  ${invoice.notes ? `<p style="font-size: 14px; color: #555; margin-bottom: 20px;">${invoice.notes}</p>` : ""}

  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">

  <p style="font-size: 12px; color: #999; margin: 0;">
    ${org.name} · ${org.businessId} · ${org.email}
    ${org.phone ? ` · ${org.phone}` : ""}
  </p>
  ${org.lateInterestRate > 0 ? `<p style="font-size: 11px; color: #bbb; margin: 4px 0 0;">Viivästyskorko: ${org.lateInterestRate}% (korkolain mukaan)${org.penaltyFee > 0 ? `. Muistutuskulut: ${formatCurrency(org.penaltyFee)}` : ""}.</p>` : ""}
</body>
</html>
  `;

  const { error: sendError } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: customer.email,
    subject: `Lasku ${invoice.invoiceNumber} — ${org.name} — eräpäivä ${formatDate(invoice.dueDate)}`,
    html,
  });

  if (sendError) {
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  await adminSupabase
    .from("invoices")
    .update({
      status: invoice.status === "DRAFT" ? "SENT" : invoice.status,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ success: true });
}