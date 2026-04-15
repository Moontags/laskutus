"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CustomerInput } from "@/lib/validations";

interface CustomerFormProps {
	initial?: Partial<CustomerInput>;
	customerId?: string;
}

const VAT_RATES = [
	{ value: "25.5", label: "25,5%" },
	{ value: "14", label: "14%" },
	{ value: "10", label: "10%" },
	{ value: "0", label: "0%" },
];

export default function CustomerForm({ initial, customerId }: CustomerFormProps) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [form, setForm] = useState({
		name: initial?.name ?? "",
		businessId: initial?.businessId ?? "",
		vatNumber: initial?.vatNumber ?? "",
		email: initial?.email ?? "",
		phone: initial?.phone ?? "",
		contactPerson: initial?.contactPerson ?? "",
		street: initial?.street ?? "",
		city: initial?.city ?? "",
		postalCode: initial?.postalCode ?? "",
		country: initial?.country ?? "FI",
		notes: initial?.notes ?? "",
	});

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
		setForm({ ...form, [e.target.name]: e.target.value });
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const url = customerId ? `/api/customers/${customerId}` : "/api/customers";
		const method = customerId ? "PUT" : "POST";

		const res = await fetch(url, {
			method,
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});

		if (res.ok) {
			router.push("/dashboard/customers");
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
				<h2 className="text-sm font-medium text-gray-700 mb-4">Perustiedot</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Nimi <span className="text-red-500">*</span></label>
						<input name="name" value={form.name} onChange={handleChange} required className={inputClass} placeholder="Yritys Oy tai Etunimi Sukunimi" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Y-tunnus</label>
						<input name="businessId" value={form.businessId} onChange={handleChange} className={inputClass} placeholder="1234567-8" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Sähköposti <span className="text-red-500">*</span></label>
						<input name="email" type="email" value={form.email} onChange={handleChange} required className={inputClass} placeholder="laskutus@yritys.fi" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Puhelin</label>
						<input name="phone" value={form.phone} onChange={handleChange} className={inputClass} placeholder="+358 40 123 4567" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Yhteyshenkilö</label>
						<input name="contactPerson" value={form.contactPerson} onChange={handleChange} className={inputClass} placeholder="Etunimi Sukunimi" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">ALV-tunnus</label>
						<input name="vatNumber" value={form.vatNumber} onChange={handleChange} className={inputClass} placeholder="FI12345678" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h2 className="text-sm font-medium text-gray-700 mb-4">Osoite</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-1">Katuosoite <span className="text-red-500">*</span></label>
						<input name="street" value={form.street} onChange={handleChange} required className={inputClass} placeholder="Esimerkkikatu 1" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Postinumero <span className="text-red-500">*</span></label>
						<input name="postalCode" value={form.postalCode} onChange={handleChange} required className={inputClass} placeholder="00100" />
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-1">Kaupunki <span className="text-red-500">*</span></label>
						<input name="city" value={form.city} onChange={handleChange} required className={inputClass} placeholder="Helsinki" />
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 p-6">
				<h2 className="text-sm font-medium text-gray-700 mb-4">Lisätiedot</h2>
				<textarea
					name="notes"
					value={form.notes}
					onChange={handleChange}
					rows={3}
					className={inputClass}
					placeholder="Muistiinpanot tästä asiakkaasta..."
				/>
			</div>

			{error && (
				<p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-lg">{error}</p>
			)}

			<div className="flex gap-3">
				<button
					type="submit"
					disabled={loading}
					className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
				>
					{loading ? "Tallennetaan..." : customerId ? "Tallenna muutokset" : "Lisää asiakas"}
				</button>
				<button
					type="button"
					onClick={() => router.back()}
					className="px-6 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
				>
					Peruuta
				</button>
			</div>
		</form>
	);
}