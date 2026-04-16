import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { formatCurrency, formatDate } from "@/lib/invoice-utils";
import InvoiceStatusBadge from "@/components/invoices/invoice-status-badge";
import Link from "next/link";

export default async function CustomerPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await getUser();
	if (!user) redirect("/auth/login");

	const org = await getUserOrganization(user.id);
	if (!org) redirect("/dashboard/setup");

	const { id } = await params;

	const [{ data: customer }, { data: invoices }] = await Promise.all([
		adminSupabase
			.from("customers")
			.select("*")
			.eq("id", id)
			.eq("organizationId", org.id)
			.single(),
		adminSupabase
			.from("invoices")
			.select("id, invoiceNumber, status, invoiceDate, dueDate, total")
			.eq("customerId", id)
			.eq("organizationId", org.id)
			.order("createdAt", { ascending: false }),
	]);

	if (!customer) notFound();

	const totalInvoiced = (invoices ?? []).reduce((sum, inv) => sum + inv.total, 0);
	const totalPaid = (invoices ?? [])
		.filter((inv) => inv.status === "PAID")
		.reduce((sum, inv) => sum + inv.total, 0);
	const totalOpen = (invoices ?? [])
		.filter((inv) => ["SENT", "VIEWED", "OVERDUE"].includes(inv.status))
		.reduce((sum, inv) => sum + inv.total, 0);

	return (
		<div className="max-w-4xl">
			<div className="flex items-center justify-between mb-6">
				<div>
					<h1 className="text-2xl font-semibold text-gray-900">{customer.name}</h1>
					{customer.businessId && (
						<p className="text-sm text-gray-500 mt-1">Y-tunnus: {customer.businessId}</p>
					)}
				</div>
				<div className="flex gap-2">
					<Link
						href={`/dashboard/invoices/new?customerId=${customer.id}`}
						className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
					>
						Uusi lasku
					</Link>
					<Link
						href={`/dashboard/customers/${id}/edit`}
						className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
					>
						Muokkaa
					</Link>
				</div>
			</div>

			<div className="grid grid-cols-2 gap-6 mb-6">
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Yhteystiedot</h2>
					<div className="text-sm space-y-1">
						<p className="text-gray-900">{customer.street}</p>
						<p className="text-gray-900">{customer.postalCode} {customer.city}</p>
						<p className="text-gray-600 mt-2">{customer.email}</p>
						{customer.phone && <p className="text-gray-600">{customer.phone}</p>}
						{customer.contactPerson && <p className="text-gray-600">Yhteyshenkilö: {customer.contactPerson}</p>}
					</div>
				</div>
				<div className="bg-white rounded-xl border border-gray-200 p-6">
					<h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Yhteenveto</h2>
					<div className="space-y-3">
						<div className="flex justify-between text-sm">
							<span className="text-gray-500">Laskutettu yhteensä</span>
							<span className="font-medium">{formatCurrency(totalInvoiced)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-gray-500">Maksettu</span>
							<span className="font-medium text-green-600">{formatCurrency(totalPaid)}</span>
						</div>
						<div className="flex justify-between text-sm">
							<span className="text-gray-500">Avoimena</span>
							<span className={`font-medium ${totalOpen > 0 ? "text-amber-600" : "text-gray-900"}`}>
								{formatCurrency(totalOpen)}
							</span>
						</div>
					</div>
				</div>
			</div>

			<div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h2 className="text-sm font-medium text-gray-900">Laskuhistoria ({invoices?.length ?? 0})</h2>
				</div>
				{invoices && invoices.length > 0 ? (
					<table className="w-full">
						<thead>
							<tr className="border-b border-gray-200 bg-gray-50">
								<th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Numero</th>
								<th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pvm</th>
								<th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Eräpäivä</th>
								<th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Tila</th>
								<th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Summa</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{invoices.map((inv) => (
								<tr key={inv.id} className="hover:bg-gray-50 transition-colors">
									<td className="px-6 py-3">
										<Link href={`/dashboard/invoices/${inv.id}`} className="text-sm font-medium text-gray-900 hover:text-gray-600">
											{inv.invoiceNumber}
										</Link>
									</td>
									<td className="px-6 py-3 text-sm text-gray-600">{formatDate(inv.invoiceDate)}</td>
									<td className="px-6 py-3 text-sm text-gray-600">{formatDate(inv.dueDate)}</td>
									<td className="px-6 py-3"><InvoiceStatusBadge status={inv.status} /></td>
									<td className="px-6 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(inv.total)}</td>
								</tr>
							))}
						</tbody>
					</table>
				) : (
					<div className="px-6 py-8 text-center text-sm text-gray-500">
						Ei laskuja vielä
					</div>
				)}
			</div>
		</div>
	);
}