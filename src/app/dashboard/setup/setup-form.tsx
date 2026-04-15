"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetupForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    businessId: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    postalCode: "",
    bankAccount: "",
    bankBic: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, userId }),
    });

    if (res.ok) {
      router.push("/dashboard");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Jokin meni pieleen");
    }
    setLoading(false);
  }

  const fields = [
    { name: "name", label: "Yrityksen nimi", placeholder: "Yritys Oy", required: true },
    { name: "businessId", label: "Y-tunnus", placeholder: "1234567-8", required: true },
    { name: "email", label: "Laskutussähköposti", placeholder: "laskutus@yritys.fi", required: true },
    { name: "phone", label: "Puhelin", placeholder: "+358 40 123 4567", required: false },
    { name: "street", label: "Katuosoite", placeholder: "Esimerkkikatu 1", required: true },
    { name: "city", label: "Kaupunki", placeholder: "Helsinki", required: true },
    { name: "postalCode", label: "Postinumero", placeholder: "00100", required: true },
    { name: "bankAccount", label: "IBAN-tilinumero", placeholder: "FI12 3456 7890 1234 56", required: false },
    { name: "bankBic", label: "BIC/SWIFT", placeholder: "NDEAFIHH", required: false },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name={f.name}
              value={form[f.name as keyof typeof form]}
              onChange={handleChange}
              required={f.required}
              placeholder={f.placeholder}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
        ))}

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors mt-2"
        >
          {loading ? "Tallennetaan..." : "Aloita laskutus"}
        </button>
      </form>
    </div>
  );
}