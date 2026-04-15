export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { renderToStream } from "@react-pdf/renderer";
import { InvoiceDocument } from "@/components/invoices/invoice-pdf";
import React from "react";

export async function GET(
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

  const element = React.createElement(InvoiceDocument, {
    invoice: { ...invoice, customer },
    organization: org,
  }) as any;

  const stream = await renderToStream(element);

  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Buffer>) {
    chunks.push(Buffer.from(chunk));
  }
  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    },
  });
}