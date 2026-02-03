import { redirect } from "next/navigation";

export default function AdminSettingsRedirect() {
  // Redirect the legacy /admin/settings page to the SMTP settings subpage
  redirect("/admin/settings/smtp");
}
