"use client";

import { useEffect, useState } from "react";
import AdminSettingsNav from "@/components/AdminSettingsNav";

export default function SMTPSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    fetchValues();
  }, []);

  const fetchValues = async () => {
    const res = await fetch("/api/admin/settings/smtp");
    if (res.ok) {
      const data = await res.json();
      setValues(data.values || {});
    }
  };

  const handleChange = (k: string, v: string) =>
    setValues((s) => ({ ...s, [k]: v }));

  const save = async () => {
    setSaving(true);
    const res = await fetch("/api/admin/settings/smtp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) {
      await fetchValues();
    }
    setSaving(false);
  };

  return (
    <div>
      <AdminSettingsNav />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">SMTP / SendGrid</h1>
        <p className="text-sm text-[#b0b0b0] mt-1">
          Konfiguracja serwera SMTP lub SendGrid (API key).
        </p>
      </div>

      <div className="bg-[#1a1f2e] border border-[#1b3caf]/30 rounded-xl p-6 max-w-3xl">
        <div className="space-y-4">
          <div>
            <label className="text-sm text-white block mb-1">
              SendGrid API Key (opcjonalnie)
            </label>
            <input
              value={values.sendgrid_api_key || ""}
              onChange={(e) =>
                handleChange("sendgrid_api_key", e.target.value.trim())
              }
              className="w-full px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
            />
          </div>

          <div>
            <label className="text-sm text-white block mb-1">SMTP Host</label>
            <input
              value={values.smtp_host || ""}
              onChange={(e) => handleChange("smtp_host", e.target.value.trim())}
              className="w-full px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-white block mb-1">SMTP Port</label>
              <input
                value={values.smtp_port || ""}
                onChange={(e) =>
                  handleChange("smtp_port", e.target.value.trim())
                }
                className="w-full px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
              />
            </div>
            <div>
              <label className="text-sm text-white block mb-1">
                SMTP Secure (true/false)
              </label>
              <input
                value={values.smtp_secure || ""}
                onChange={(e) =>
                  handleChange("smtp_secure", e.target.value.trim())
                }
                className="w-full px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-white block mb-1">SMTP User</label>
            <input
              value={values.smtp_user || ""}
              onChange={(e) => handleChange("smtp_user", e.target.value)}
              className="w-full px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
            />
          </div>

          <div>
            <label className="text-sm text-white block mb-1">SMTP Pass</label>
            <div className="flex gap-2">
              <input
                type={showPass ? "text" : "password"}
                value={values.smtp_pass || ""}
                onChange={(e) => handleChange("smtp_pass", e.target.value)}
                className="flex-1 px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="px-3 py-2 bg-[#2a3348] rounded text-sm text-[#b0b0b0]"
              >
                {showPass ? "Ukryj" : "Pokaż"}
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-white block mb-1">
              From Address
            </label>
            <input
              value={values.smtp_from || ""}
              onChange={(e) => handleChange("smtp_from", e.target.value.trim())}
              className="w-full px-3 py-2 rounded bg-[#242d3d] text-white border border-[#1b3caf]/20"
            />
          </div>

          <div>
            <label className="text-sm text-white block mb-1">
              Allow self-signed certificates
            </label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-[#b0b0b0]">
                <input
                  type="checkbox"
                  checked={values.smtp_allow_self_signed === "true"}
                  onChange={(e) =>
                    handleChange(
                      "smtp_allow_self_signed",
                      e.target.checked ? "true" : "false",
                    )
                  }
                />{" "}
                Zezwól
              </label>
              <p className="text-xs text-[#6b7280]">
                Zaznacz przy serwerach z samopodpisanym certyfikatem (tylko
                dev/test)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded text-white"
            >
              {saving ? "Zapisywanie..." : "Zapisz ustawienia"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
