"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculateInvoiceTotals, formatCurrency, addDays } from "@/lib/invoice-utils";
import InvoiceItemsEditor, { InvoiceItemRow } from "./invoice-items-editor";

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; unitPrice: number; vatRate: number; unit: string; }

interface Props {
  invoice: {
    id: string;
    customerId: string;
    invoiceDate: string;
    dueDate: string;
    notes: string | null;
    internalNotes: string | null;
    status: string;
    items: InvoiceItemRow[];
  };
  customers: Customer[];
  products: Product[];
  organization: { defaultDueDays: number; defaultVatRate: number };
}

export default function InvoiceEditForm({ invoice, customers, products, organization }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerId: invoice.customerId,
    invoiceDate: invoice.invoiceDate.split("T")[0],
    dueDate: invoice.dueDate.split("T")[0],
    notes: invoice.notes ?? "",
    internalNotes: invoice.internalNotes ?? "",
  });

  const [items, setItems] = useState<InvoiceItemRow[]>(
    invoice.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unit: item.unit,
      unitPrice: item.unitPrice,
      vatRate: item.vatRate,
      productId: item.productId,
      sortOrder: item.sortOrder,
    }))
  );

  const totals = calculateInvoiceTotals(items);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.customerId) { setError("Valitse asiakas"); return; }
    if (items.some(i => !i.description)) { setError("Täytä kaikkien rivien kuvaus"); return; }

    setLoading(true);
    setError(null);

    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items }),
    });

    if (res.ok) {
      router.push(`/dashboard/invoices/${invoice.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Jokin meni pieleen");
    }
    setLoading(false);
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Laskun tiedot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asiakas *</label>
            <select name="customerId" value={form.customerId} onChange={handleChange} required className={inputClass}>
              <option value="">— valitse asiakas —</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laskupäivä</label>
            <input type="date" name="invoiceDate" value={form.invoiceDate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Eräpäivä</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Laskurivit</h2>
        <InvoiceItemsEditor items={items} onChange={setItems} products={products} />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Veroton yhteensä</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>ALV yhteensä</span>
              <span>{formatCurrency(totals.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-gray-900 border-t border-gray-200 pt-2">
              <span>Yhteensä</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Lisätiedot</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Viesti asiakkaalle</label>
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sisäiset muistiinpanot</label>
            <textarea name="internalNotes" value={form.internalNotes} onChange={handleChange} rows={2} className={inputClass} />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {loading ? "Tallennetaan..." : "Tallenna muutokset"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
          Peruuta
        </button>
      </div>
    </form>
  );
}
