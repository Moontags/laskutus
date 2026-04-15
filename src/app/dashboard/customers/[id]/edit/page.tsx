import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import CustomerForm from "@/components/customers/customer-form";

export default async function EditCustomerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const { id } = await params;
  const { data: customer } = await adminSupabase
    .from("customers")
    .select("*")
    .eq("id", id)
    .eq("organizationId", org.id)
    .single();

  if (!customer) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Muokkaa asiakasta</h1>
      <CustomerForm initial={customer} customerId={customer.id} />
    </div>
  );
}