import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getUserOrganization } from "@/lib/organization";
import SettingsForm from "./settings-form";

export default async function SettingsPage() {
	const user = await getUser();
	if (!user) redirect("/auth/login");

	const org = await getUserOrganization(user.id);
	if (!org) redirect("/dashboard/setup");

	return (
		<div className="max-w-3xl">
			<h1 className="text-2xl font-semibold text-gray-900 mb-6">Asetukset</h1>
			<SettingsForm initial={org} />
		</div>
	);
}