import Link from "next/link";
import { Plus } from "lucide-react";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import CustomerList from "@/components/customers/customer-list";

export default async function CustomersPage() {
	const user = await getUser();
	if (!user) redirect("/auth/login");

	const org = await getUserOrganization(user.id);
	if (!org) redirect("/dashboard/setup");

	const { data: customers } = await adminSupabase
		.from("customers")
		.select("id, name, email, phone, city, businessId")
		.eq("organizationId", org.id)
		.eq("isActive", true)
		.order("name");

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">Asiakkaat</h1>
				<Link
					href="/dashboard/customers/new"
					className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
				>
					<Plus size={16} />
					Uusi asiakas
				</Link>
			</div>
			<CustomerList customers={customers ?? []} />
		</div>
	);
}