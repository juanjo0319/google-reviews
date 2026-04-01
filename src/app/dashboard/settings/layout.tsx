import { SettingsNav } from "@/components/dashboard/SettingsNav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your organization settings and preferences
        </p>
      </div>
      <SettingsNav />
      {children}
    </div>
  );
}
