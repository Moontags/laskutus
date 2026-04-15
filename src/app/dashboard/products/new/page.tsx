import ProductForm from "@/components/products/product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Uusi tuote tai palvelu</h1>
      <ProductForm />
    </div>
  );
}