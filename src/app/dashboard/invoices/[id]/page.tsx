import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/invoice-utils";
import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const { id } = await params;

  const { data: invoice } = await adminSupabase
    .from("invoices")
    .select(`*, customer:customers(*), items:invoice_items(*)`)
    .eq("id", id)
    .eq("organizationId", org.id)
    .single();

  if (!invoice) notFound();

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{invoice.invoiceNumber}</h1>
          <div className="flex items-center gap-3 mt-1">
            <InvoiceStatusBadge status={invoice.status} />
            <span className="text-sm text-gray-500">Luotu {formatDate(invoice.createdAt)}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/invoices/${id}/edit`} className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
            Muokkaa
          </Link>
          <Link href="/dashboard/invoices" className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            Takaisin
          </Link>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Laskuttaja</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">{org.name}</p>
              <p className="text-gray-600">{org.street}</p>
              <p className="text-gray-600">{org.postalCode} {org.city}</p>
              <p className="text-gray-600">Y-tunnus: {org.businessId}</p>
              {org.vatNumber && <p className="text-gray-600">ALV-tunnus: {org.vatNumber}</p>}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-xs font-medium text-gray-500 uppercase mb-3">Laskutetaan</h2>
            <div className="text-sm space-y-1">
              <p className="font-medium text-gray-900">{invoice.customer?.name}</p>
              <p className="text-gray-600">{invoice.customer?.street}</p>
              <p className="text-gray-600">{invoice.customer?.postalCode} {invoice.customer?.city}</p>
              {invoice.customer?.businessId && <p className="text-gray-600">Y-tunnus: {invoice.customer.businessId}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
            <div>
              <span className="text-gray-500">Laskupäivä</span>
              <p className="font-medium text-gray-900 mt-0.5">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Eräpäivä</span>
              <p className="font-medium text-gray-900 mt-0.5">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <span className="text-gray-500">Viitenumero</span>
              <p className="font-medium text-gray-900 mt-0.5">{invoice.reference ?? "—"}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 text-xs font-medium text-gray-500">Kuvaus</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Määrä</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Á-hinta</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">ALV</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500">Yhteensä</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items?.sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder).map((item: {
                id: string; description: string; quantity: number; unit: string;
                unitPrice: number; vatRate: number; totalAmount: number; vatAmount: number;
              }) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-gray-900">{item.description}</td>
                  <td className="py-3 text-right text-gray-600">{item.quantity} {item.unit}</td>
                  <td className="py-3 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-3 text-right text-gray-600">{item.vatRate}%</td>
                  <td className="py-3 text-right font-medium text-gray-900">{formatCurrency(item.totalAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Veroton</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ALV</span>
                <span>{formatCurrency(invoice.vatAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-200 pt-2 text-base">
                <span>Yhteensä</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {(org.bankAccount || invoice.notes) && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm space-y-2">
            {org.bankAccount && (
              <p className="text-gray-600">Tilinumero: <span className="font-medium text-gray-900">{org.bankAccount}</span>{org.bankBic && ` (${org.bankBic})`}</p>
            )}
            {invoice.notes && <p className="text-gray-600">{invoice.notes}</p>}
          </div>
        )}
      </div>
    </div>
  );
}