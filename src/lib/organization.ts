import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getUserOrganization(userId: string) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data, error } = await supabase
    .from("organization_members")
    .select(`
      role,
      organization:organizations (
        id, name, businessId, vatNumber, email, phone, website,
        street, city, postalCode, country,
        bankAccount, bankBic, defaultDueDays, defaultVatRate,
        invoicePrefix, nextInvoiceNumber, logoUrl,
        defaultPaymentTerms, lateInterestRate, penaltyFee
      )
    `)
    .eq("userId", userId)
    .single();

  if (error || !data) return null;
  return data.organization as unknown as {
    id: string; name: string; businessId: string; vatNumber: string | null;
    email: string; phone: string | null; website: string | null;
    street: string; city: string; postalCode: string; country: string;
    bankAccount: string | null; bankBic: string | null;
    defaultDueDays: number; defaultVatRate: number;
    invoicePrefix: string; nextInvoiceNumber: number; logoUrl: string | null;
    defaultPaymentTerms: string | null; lateInterestRate: number; penaltyFee: number;
  };
}

export async function requireOrganization(userId: string) {
  const org = await getUserOrganization(userId);
  if (!org) throw new Error("No organization found");
  return org;
}