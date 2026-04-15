"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { formatCurrency } from "@/lib/invoice-utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  unitPrice: number;
  vatRate: number;
}

export default function ProductList({ products }: { products: Product[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Poistetaanko tuote "${name}"?`)) return;
    setDeleting(id);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    router.refresh();
    setDeleting(null);
  }

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <p className="text-gray-500 mb-4">Ei tuotteita vielä</p>
        <Link href="/dashboard/products/new" className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
          <Plus size={16} />
          Lisää ensimmäinen tuote
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
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Hinta</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">ALV</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Yksikkö</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                {p.description && <div className="text-xs text-gray-500">{p.description}</div>}
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{formatCurrency(p.unitPrice)}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{p.vatRate}%</td>
              <td className="px-6 py-4 text-sm text-gray-600">{p.unit}</td>
              <td className="px-6 py-4">
                <div className="flex items-center gap-2 justify-end">
                  <Link href={`/dashboard/products/${p.id}/edit`} className="p-1.5 text-gray-400 hover:text-gray-900 transition-colors">
                    <Pencil size={15} />
                  </Link>
                  <button onClick={() => handleDelete(p.id, p.name)} disabled={deleting === p.id} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50">
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