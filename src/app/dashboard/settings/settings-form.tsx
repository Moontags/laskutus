"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OrgData {
  name: string;
  businessId: string;
  vatNumber: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  street: string;
  city: string;
  postalCode: string;
  bankAccount: string | null;
  bankBic: string | null;
  defaultDueDays: number;
  defaultVatRate: number;
  invoicePrefix: string;
  defaultPaymentTerms: string | null;
  lateInterestRate: number;
  penaltyFee: number;
}

export default function SettingsForm({ initial }: { initial: OrgData }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: initial.name,
    businessId: initial.businessId,
    vatNumber: initial.vatNumber ?? "",
    email: initial.email,
    phone: initial.phone ?? "",
    website: initial.website ?? "",
    street: initial.street,
    city: initial.city,
    postalCode: initial.postalCode,
    bankAccount: initial.bankAccount ?? "",
    bankBic: initial.bankBic ?? "",
    defaultDueDays: initial.defaultDueDays.toString(),
    defaultVatRate: initial.defaultVatRate.toString(),
    invoicePrefix: initial.invoicePrefix,
    defaultPaymentTerms: initial.defaultPaymentTerms ?? "",
    lateInterestRate: initial.lateInterestRate.toString(),
    penaltyFee: initial.penaltyFee.toString(),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setSuccess(true);
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
        <h2 className="text-sm font-medium text-gray-700 mb-4">Yrityksen perustiedot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yrityksen nimi *</label>
            <input name="name" value={form.name} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Y-tunnus *</label>
            <input name="businessId" value={form.businessId} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ALV-tunnus</label>
            <input name="vatNumber" value={form.vatNumber} onChange={handleChange} className={inputClass} placeholder="FI12345678" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sähköposti *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Puhelin</label>
            <input name="phone" value={form.phone} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verkkosivusto</label>
            <input name="website" value={form.website} onChange={handleChange} className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Osoite</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Katuosoite *</label>
            <input name="street" value={form.street} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Postinumero *</label>
            <input name="postalCode" value={form.postalCode} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kaupunki *</label>
            <input name="city" value={form.city} onChange={handleChange} required className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Pankkitiedot</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">IBAN-tilinumero</label>
            <input name="bankAccount" value={form.bankAccount} onChange={handleChange} className={inputClass} placeholder="FI12 3456 7890 1234 56" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">BIC/SWIFT</label>
            <input name="bankBic" value={form.bankBic} onChange={handleChange} className={inputClass} placeholder="NDEAFIHH" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-medium text-gray-700 mb-4">Laskutusasetukset</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Laskuprefiksi</label>
            <input name="invoicePrefix" value={form.invoicePrefix} onChange={handleChange} className={inputClass} placeholder="LASKU" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maksuaika (päivää)</label>
            <input name="defaultDueDays" type="number" value={form.defaultDueDays} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Oletusasetukset ALV %</label>
            <input name="defaultVatRate" type="number" step="0.1" value={form.defaultVatRate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Viivästyskorko %</label>
            <input name="lateInterestRate" type="number" step="0.1" value={form.lateInterestRate} onChange={handleChange} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Muistutuskulut €</label>
            <input name="penaltyFee" type="number" step="0.01" value={form.penaltyFee} onChange={handleChange} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Maksuehto (teksti)</label>
            <input name="defaultPaymentTerms" value={form.defaultPaymentTerms} onChange={handleChange} className={inputClass} placeholder="Maksuehto 14 pv netto" />
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-600 bg-green-50 px-4 py-3 rounded-lg">Asetukset tallennettu!</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Tallennetaan..." : "Tallenna asetukset"}
      </button>
    </form>
  );
}
