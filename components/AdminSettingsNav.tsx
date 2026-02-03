"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSettingsNav() {
  const pathname = usePathname() || "";
  const items = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/contacts", label: "Zgłoszenia" },
    { href: "/admin/settings/smtp", label: "SMTP / SendGrid" },
    { href: "/admin/users", label: "Użytkownicy" },
  ];

  return (
    <nav className="mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-1 rounded-md text-sm ${
                active
                  ? "bg-[#1b3caf] text-white"
                  : "text-[#b0b0b0] bg-[#242d3d]"
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
