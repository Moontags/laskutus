import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";

import InvoiceList from "@/components/invoices/invoice-list";

const STATUS_FILTERS = [
  { value: "", label: "Kaikki" },
  { value: "DRAFT", label: "Luonnokset" },
  { value: "SENT", label: "Lähetetyt" },
  { value: "PAID", label: "Maksetut" },
  { value: "OVERDUE", label: "Erääntyneet" },
  { value: "CANCELLED", label: "Peruutetut" },
];

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const { status } = await searchParams;

  let query = adminSupabase
    .from("invoices")
    .select(`id, invoiceNumber, status, invoiceDate, dueDate, total, customer:customers(id, name)`)
    .eq("organizationId", org.id)
    .order("createdAt", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: rawInvoices } = await query;

  const invoices = (rawInvoices ?? []).map((inv) => ({
    ...inv,
    customer: Array.isArray(inv.customer) ? inv.customer[0] ?? null : inv.customer,
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Laskut</h1>
        <Link
          href="/dashboard/invoices/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} />
          Uusi lasku
        </Link>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value ? `/dashboard/invoices?status=${f.value}` : "/dashboard/invoices"}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              status === f.value || (!status && f.value === "")
                ? "bg-gray-900 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <InvoiceList invoices={invoices} />
    </div>
  );
}