import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import { adminSupabase } from "@/lib/supabase/admin";
import ProductForm from "@/components/products/product-form";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);
  if (!org) redirect("/dashboard/setup");

  const { id } = await params;
  const { data: product } = await adminSupabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("organizationId", org.id)
    .single();

  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Muokkaa tuotetta</h1>
      <ProductForm initial={product} productId={product.id} />
    </div>
  );
}