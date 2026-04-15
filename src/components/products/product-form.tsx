"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductFormProps {
	initial?: {
		name?: string;
		description?: string;
		unit?: string;
		unitPrice?: number;
		vatRate?: number;
	};
	productId?: string;
}

const VAT_RATES = [
	{ value: "25.5", label: "25,5% — yleinen" },
	{ value: "14", label: "14% — elintarvikkeet" },
	{ value: "10", label: "10% — kirjat, lääkkeet" },
	{ value: "0", label: "0% — veroton" },
];

const UNITS = ["kpl", "h", "pv", "kk", "kg", "m", "m²", "l"];

export default function ProductForm({ initial, productId }: ProductFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: initial?.name ?? "",
		description: initial?.description ?? "",
		unit: initial?.unit ?? "kpl",
		unitPrice: initial?.unitPrice?.toString() ?? "",
		vatRate: initial?.vatRate?.toString() ?? "25.5",
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const url = productId ? `/api/products/${productId}` : "/api/products";
		const method = productId ? "PUT" : "POST";

		const res = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				...form,
				unitPrice: parseFloat(form.unitPrice),
				vatRate: parseFloat(form.vatRate),
			}),
		});

		if (res.ok) {
			router.push("/dashboard/products");
			router.refresh();
		} else {
			const data = await res.json();
			setError(data.error || "Jokin meni pieleen");
		}
		setLoading(false);
	}

	const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent";

	const unitPrice = parseFloat(form.unitPrice) || 0;
	const vatRate = parseFloat(form.vatRate) || 0;
	const vatAmount = unitPrice * (vatRate / 100);
	const totalPrice = unitPrice + vatAmount;

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h2 className="text-sm font-medium text-gray-700 mb-4">Tuotteen tiedot</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Nimi <span className="text-red-500">*</span>
						</label>
						<input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Esim. Konsultointi" />
					</div>
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">Kuvaus</label>
						<textarea name="description" value={form.description} onChange={handleChange} rows={2} className={inputClass} placeholder="Lyhyt kuvaus tuotteesta tai palvelusta" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">
							Hinta (veroton) <span className="text-red-500">*</span>
						</label>
						<div className="relative">
							<input name="unitPrice" type="number" step="0.01" min="0" value={form.unitPrice} onChange={handleChange} required className={inputClass} placeholder="0.00" />
							<span className="absolute right-3 top-2 text-sm text-gray-400">€</span>
						</div>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Yksikkö</label>
						<select name="unit" value={form.unit} onChange={handleChange} className={inputClass}>
							{UNITS.map(u => <option key={u} value={u}>{u}</option>)}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">ALV-kanta</label>
						<select name="vatRate" value={form.vatRate} onChange={handleChange} className={inputClass}>
							{VAT_RATES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
						</select>
					</div>
					<div className="bg-gray-50 rounded-lg p-3">
						<div className="text-xs text-gray-500 mb-1">Hinta ALV:n kanssa</div>
						<div className="text-lg font-semibold text-gray-900">
							{totalPrice.toFixed(2)} €
						</div>
						<div className="text-xs text-gray-400">sis. ALV {vatAmount.toFixed(2)} €</div>
					</div>
				</div>
			</div>

			{error && (
				<p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
			)}

			<div className="flex gap-3">
				<button type="submit" disabled={loading} className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors">
					{loading ? "Tallennetaan..." : productId ? "Tallenna muutokset" : "Lisää tuote"}
				</button>
				<button type="button" onClick={() => router.back()} className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
					Peruuta
				</button>
			</div>
		</form>
	);
}