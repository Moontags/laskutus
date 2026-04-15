import CustomerForm from "@/components/customers/customer-form";

export default function NewCustomerPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Uusi asiakas</h1>
      <CustomerForm />
    </div>
  );
}