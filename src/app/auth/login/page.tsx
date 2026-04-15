import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const user = await getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Laskutus</h1>
          <p className="text-gray-500 mt-2">Kirjaudu sisään</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}