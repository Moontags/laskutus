"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { calculateInvoiceTotals, formatCurrency, addDays } from "@/lib/invoice-utils";
import InvoiceItemsEditor, { InvoiceItemRow } from "./invoice-items-editor";

interface Customer { id: string; name: string; }
interface Product { id: string; name: string; unitPrice: number; vatRate: number; unit: string; }
interface Organization {
  defaultDueDays: number;
  defaultVatRate: number;
}

interface Props {
  customers: Customer[];
  products: Product[];
  organization: Organization;
}

export default function InvoiceForm({ customers, products, organization }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const defaultDue = addDays(new Date(), organization.defaultDueDays).toISOString().split("T")[0];

  const [form, setForm] = useState({
    customerId: "",
    invoiceDate: today,
    dueDate: defaultDue,
    notes: "",
    internalNotes: "",
  });

  const [items, setItems] = useState<InvoiceItemRow[]>([
    { description: "", quantity: 1, unit: "kpl", unitPrice: 0, vatRate: organization.defaultVatRate },
  ]);

  const totals = calculateInvoiceTotals(items);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent, asDraft = false) {
    e.preventDefault();
    if (!form.customerId) { setError("Valitse asiakas"); return; }
    if (items.some(i => !i.description)) { setError("Täytä kaikkien rivien kuvaus"); return; }

    setLoading(true);
    setError(null);

    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, items, draft: asDraft }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/dashboard/invoices/${data.id}`);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Jokin meni pieleen");
    }
    setLoading(false);
  }

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent";

  return (
    <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Laskun tiedot</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Asiakas <span className="text-red-500">*</span>
            </label>
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
        <h2 className="text-sm font-medium text-gray-700 mb-4">Yhteenveto</h2>
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
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={2} className={inputClass} placeholder="Esim. maksuohjeet tai kiitosteksti..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sisäiset muistiinpanot</label>
            <textarea name="internalNotes" value={form.internalNotes} onChange={handleChange} rows={2} className={inputClass} placeholder="Ei näy asiakkaalle..." />
          </div>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
          {loading ? "Luodaan..." : "Luo lasku"}
        </button>
        <button type="button" disabled={loading} onClick={(e) => handleSubmit(e, true)} className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
          Tallenna luonnoksena
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          Peruuta
        </button>
      </div>
    </form>
  );
}