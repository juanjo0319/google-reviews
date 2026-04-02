const SUPERADMIN_EMAILS = [
  "juanjo0319@me.com",
];

export function isSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return SUPERADMIN_EMAILS.includes(email.toLowerCase());
}
