import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import InvoiceEditForm from "@/components/invoices/invoice-edit-form";

export default async function EditInvoicePage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const user = await getUser();
	if (!user) redirect("/auth/login");

	const org = await getUserOrganization(user.id);
	if (!org) redirect("/dashboard/setup");

	const { id } = await params;

	const [{ data: invoice }, { data: customers }, { data: products }] = await Promise.all([
		adminSupabase
			.from("invoices")
			.select(`*, items:invoice_items(*)`)
			.eq("id", id)
			.eq("organizationId", org.id)
			.single(),
		adminSupabase
			.from("customers")
			.select("id, name")
			.eq("organizationId", org.id)
			.eq("isActive", true)
			.order("name"),
		adminSupabase
			.from("products")
			.select("id, name, unitPrice, vatRate, unit")
			.eq("organizationId", org.id)
			.eq("isActive", true)
			.order("name"),
	]);

	if (!invoice) notFound();

	return (
		<div className="max-w-4xl">
			<h1 className="text-2xl font-semibold text-gray-900 mb-6">
				Muokkaa laskua {invoice.invoiceNumber}
			</h1>
			<InvoiceEditForm
				invoice={invoice}
				customers={customers ?? []}
				products={products ?? []}
				organization={org}
			/>
		</div>
	);
}