"use client";

import { Plus, Trash2 } from "lucide-react";
import { formatCurrency, calculateLineTotal, calculateVatAmount } from "@/lib/invoice-utils";

export interface InvoiceItemRow {
  id?: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  vatRate: number;
  productId?: string;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  vatRate: number;
  unit: string;
}

interface Props {
  items: InvoiceItemRow[];
  onChange: (items: InvoiceItemRow[]) => void;
  products: Product[];
}

const VAT_RATES = ["0", "10", "14", "25.5"];
const UNITS = ["kpl", "h", "pv", "kk", "kg", "m", "m²", "l"];

function emptyRow(): InvoiceItemRow {
  return { description: "", quantity: 1, unit: "kpl", unitPrice: 0, vatRate: 25.5 };
}

export default function InvoiceItemsEditor({ items, onChange, products }: Props) {
  function update(index: number, field: keyof InvoiceItemRow, value: string | number) {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange(updated);
  }

  function addRow() {
    onChange([...items, emptyRow()]);
  }

  function removeRow(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    const updated = items.map((item, i) =>
      i === index
        ? { ...item, productId, description: product.name, unitPrice: product.unitPrice, vatRate: product.vatRate, unit: product.unit }
        : item
    );
    onChange(updated);
  }

  const inputClass = "w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-900";

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-8">#</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500">Kuvaus</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-20">Määrä</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-20">Yksikkö</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-28">Á-hinta €</th>
              <th className="text-left py-2 pr-3 text-xs font-medium text-gray-500 w-20">ALV %</th>
              <th className="text-right py-2 text-xs font-medium text-gray-500 w-28">Yhteensä</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const lineTotal = calculateLineTotal(item.quantity, item.unitPrice);
              const vatAmount = calculateVatAmount(lineTotal, item.vatRate);
              const total = lineTotal + vatAmount;
              return (
                <tr key={i} className="border-b border-gray-100">
                  <td className="py-2 pr-3 text-gray-400">{i + 1}</td>
                  <td className="py-2 pr-3">
                    {products.length > 0 && (
                      <select
                        className={`${inputClass} mb-1`}
                        value={item.productId ?? ""}
                        onChange={(e) => selectProduct(i, e.target.value)}
                      >
                        <option value="">— valitse tuote —</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    )}
                    <input
                      className={inputClass}
                      value={item.description}
                      onChange={(e) => update(i, "description", e.target.value)}
                      placeholder="Kuvaus"
                      required
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      className={inputClass}
                      value={item.quantity}
                      onChange={(e) => update(i, "quantity", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select className={inputClass} value={item.unit} onChange={(e) => update(i, "unit", e.target.value)}>
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-2 pr-3">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={inputClass}
                      value={item.unitPrice}
                      onChange={(e) => update(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </td>
                  <td className="py-2 pr-3">
                    <select className={inputClass} value={item.vatRate} onChange={(e) => update(i, "vatRate", parseFloat(e.target.value))}>
                      {VAT_RATES.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td className="py-2 text-right font-medium text-gray-900">
                    <div>{formatCurrency(total)}</div>
                    <div className="text-xs text-gray-400">+ alv {formatCurrency(vatAmount)}</div>
                  </td>
                  <td className="py-2 pl-2">
                    {items.length > 1 && (
                      <button type="button" onClick={() => removeRow(i)} className="text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-3 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <Plus size={15} />
        Lisää rivi
      </button>
    </div>
  );
}