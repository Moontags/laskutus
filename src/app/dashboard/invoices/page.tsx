import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import InvoiceList from "@/components/invoices/invoice-list";

export default async function InvoicesPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const { data: rawInvoices } = await adminSupabase
    .from("invoices")
    .select(`id, invoiceNumber, status, invoiceDate, dueDate, total, customer:customers(id, name)`)
    .eq("organizationId", org.id)
    .order("createdAt", { ascending: false });

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
      <InvoiceList invoices={invoices} />
    </div>
  );
}