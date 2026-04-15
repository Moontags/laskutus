import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import SetupForm from "./setup-form";

export default async function SetupPage() {
  const user = await getUser();
  if (!user) redirect("/auth/login");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Yrityksen tiedot</h1>
          <p className="text-gray-500 mt-2">Täytä yrityksesi perustiedot aloittaaksesi laskutuksen</p>
        </div>
        <SetupForm userId={user.id} />
      </div>
    </div>
  );
}