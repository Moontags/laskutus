"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string;
  businessId: string | null;
}

export default function CustomerList({ customers }: { customers: Customer[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Poistetaanko asiakas "${name}"?`)) return;
    setDeleting(id);
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  }

  if (customers.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">Ei asiakkaita vielä</p>
        <Link
          href="/dashboard/customers/new"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          <Plus size={16} />
          Lisää ensimmäinen asiakas
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nimi</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Sähköposti</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Puhelin</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Kaupunki</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {customers.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{c.name}</div>
                {c.businessId && <div className="text-xs text-gray-500">{c.businessId}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{c.email}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{c.phone ?? "—"}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{c.city}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 justify-end">
                  <Link
                    href={`/dashboard/customers/${c.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    onClick={() => handleDelete(c.id, c.name)}
                    disabled={deleting === c.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}