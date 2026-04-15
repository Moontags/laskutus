"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError("Väärä sähköposti tai salasana");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else {
        setError(null);
        alert("Tarkista sähköpostisi ja vahvista rekisteröinti!");
      }
    }
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sähköposti
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="nimi@yritys.fi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salasana
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gray-900 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Ladataan..." : mode === "login" ? "Kirjaudu sisään" : "Rekisteröidy"}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(null); }}
          className="text-sm text-gray-500 hover:text-gray-900"
        >
          {mode === "login" ? "Ei tiliä? Rekisteröidy" : "Onko sinulla jo tili? Kirjaudu"}
        </button>
      </div>
    </div>
  );
}