import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import ProductList from "@/components/products/product-list";

export default async function ProductsPage() {
	const user = await getUser();
	if (!user) redirect("/auth/login");

	const org = await getUserOrganization(user.id);
	if (!org) redirect("/dashboard/setup");

	const { data: products } = await adminSupabase
		.from("products")
		.select("id, name, description, unit, unitPrice, vatRate")
		.eq("organizationId", org.id)
		.eq("isActive", true)
		.order("name");

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl font-semibold text-gray-900">Tuotteet ja palvelut</h1>
				<Link href="/dashboard/products/new" className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors">
					<Plus size={16} />
					Uusi tuote
				</Link>
			</div>
			<ProductList products={products ?? []} />
		</div>
	);
}