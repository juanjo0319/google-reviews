import { getCurrentOrg } from "@/lib/auth/permissions";
import { GeneralSettingsForm } from "./general-form";

export default async function GeneralSettingsPage() {
  const orgData = await getCurrentOrg();

  return (
    <GeneralSettingsForm
      orgId={orgData?.orgId ?? ""}
      name={orgData?.organization?.name ?? ""}
      slug={orgData?.organization?.slug ?? ""}
    />
  );
}
