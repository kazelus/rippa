import { redirect } from "next/navigation";

export default function SmtpRedirect() {
  redirect("/admin/settings");
}
