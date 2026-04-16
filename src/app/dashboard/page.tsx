import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";

import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import Link from "next/link";
import { formatCurrency } from "@/lib/invoice-utils";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const [
    { count: invoiceCount },
    { count: customerCount },
    { count: overdueCount },
    { data: recentInvoices },
    { data: unpaidInvoices },
  ] = await Promise.all([
    adminSupabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("organizationId", org.id),
    adminSupabase
      .from("customers")
      .select("*", { count: "exact", head: true })
      .eq("organizationId", org.id)
      .eq("isActive", true),
    adminSupabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("organizationId", org.id)
      .eq("status", "OVERDUE"),
    adminSupabase
      .from("invoices")
      .select(`id, invoiceNumber, status, total, dueDate, customer:customers(name)`)
      .eq("organizationId", org.id)
      .order("createdAt", { ascending: false })
      .limit(5),
    adminSupabase
      .from("invoices")
      .select("total")
      .eq("organizationId", org.id)
      .in("status", ["SENT", "VIEWED", "OVERDUE"]),
  ]);

  const totalUnpaid = (unpaidInvoices ?? []).reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Tervetuloa, {org.name}</h1>
        <p className="text-gray-500 mt-1 text-sm">Tässä yhteenveto toiminnastasi</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/invoices" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-colors">
          <div className="text-3xl font-bold text-gray-900 mb-1">{invoiceCount ?? 0}</div>
          <div className="text-sm text-gray-500">Laskua yhteensä</div>
        </Link>
        <Link href="/dashboard/customers" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-colors">
          <div className="text-3xl font-bold text-gray-900 mb-1">{customerCount ?? 0}</div>
          <div className="text-sm text-gray-500">Asiakasta</div>
        </Link>
        <Link href="/dashboard/invoices" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-colors">
          <div className="text-2xl font-bold text-gray-900 mb-1">{formatCurrency(totalUnpaid)}</div>
          <div className="text-sm text-gray-500">Avoimia laskuja</div>
        </Link>
        <Link href="/dashboard/invoices?status=overdue" className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-400 transition-colors">
          <div className={`text-3xl font-bold mb-1 ${(overdueCount ?? 0) > 0 ? "text-red-600" : "text-gray-900"}`}>
            {overdueCount ?? 0}
          </div>
          <div className="text-sm text-gray-500">Erääntynyttä</div>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-900">Viimeisimmät laskut</h2>
          <Link href="/dashboard/invoices/new" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            + Uusi lasku
          </Link>
        </div>
        {recentInvoices && recentInvoices.length > 0 ? (
          <table className="w-full">
            <tbody className="divide-y divide-gray-100">
              {recentInvoices.map((inv) => {
                const customer = Array.isArray(inv.customer) ? inv.customer[0] : inv.customer;
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="text-sm font-medium text-gray-900 hover:text-gray-600">
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-600">{customer?.name ?? "—"}</td>
                    <td className="px-6 py-3 text-sm text-gray-600">{new Date(inv.dueDate).toLocaleDateString("fi-FI")}</td>
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(inv.total)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="px-6 py-8 text-center text-sm text-gray-500">
            Ei laskuja vielä —{" "}
            <Link href="/dashboard/invoices/new" className="text-gray-900 hover:underline">
              luo ensimmäinen lasku
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}