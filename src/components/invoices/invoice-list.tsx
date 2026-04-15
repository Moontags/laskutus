"use client";

import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/invoice-utils";
import InvoiceStatusBadge from "./invoice-status-badge";

interface Invoice {
  id: string;
  invoiceNumber: string;
  status: string;
  invoiceDate: string;
  dueDate: string;
  total: number;
  customer: { id: string; name: string } | null;
}

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">Ei laskuja vielä</p>
        <Link href="/dashboard/invoices/new" className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          Luo ensimmäinen lasku
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Numero</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Asiakas</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Pvm</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Eräpäivä</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tila</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Summa</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {invoices.map((inv) => (
            <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <Link href={`/dashboard/invoices/${inv.id}`} className="text-sm font-medium text-gray-900 hover:text-gray-600">
                  {inv.invoiceNumber}
                </Link>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{inv.customer?.name ?? "—"}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(inv.invoiceDate)}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatDate(inv.dueDate)}</td>
              <td className="px-6 py-4"><InvoiceStatusBadge status={inv.status} /></td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">{formatCurrency(inv.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}