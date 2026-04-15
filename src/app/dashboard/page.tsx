import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  const org = await getUserOrganization(user.id);

  if (!org) redirect("/dashboard/setup");

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">Laskutus</h1>
          <span className="text-sm text-gray-500">{user.email}</span>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Tervetuloa, {org.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a href="/dashboard/invoices" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-500">Laskua yhteensä</div>
          </a>
          <a href="/dashboard/customers" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors">
            <div className="text-2xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-sm text-gray-500">Asiakasta</div>
          </a>
          <a href="/dashboard/invoices?status=overdue" className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors">
            <div className="text-2xl font-bold text-red-600 mb-1">0</div>
            <div className="text-sm text-gray-500">Erääntynyttä laskua</div>
          </a>
        </div>
      </main>
    </div>
  );
}