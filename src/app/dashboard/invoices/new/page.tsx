import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import InvoiceForm from "@/components/invoices/invoice-form";

export default async function NewInvoicePage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const [{ data: customers }, { data: products }] = await Promise.all([
    adminSupabase.from("customers").select("id, name").eq("organizationId", org.id).eq("isActive", true).order("name"),
    adminSupabase.from("products").select("id, name, unitPrice, vatRate, unit").eq("organizationId", org.id).eq("isActive", true).order("name"),
  ]);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Uusi lasku</h1>
      <InvoiceForm
        customers={customers ?? []}
        products={products ?? []}
        organization={org}
      />
    </div>
  );
}