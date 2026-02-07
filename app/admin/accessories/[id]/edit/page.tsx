"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Accessories are now managed directly in the model editor (tab "Akcesoria").
// This page redirects to the accessories overview.
export default function EditAccessoryPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/accessories");
  }, [router]);

  return (
    <div className="p-8">
      <p className="text-white">Przekierowywanie...</p>
    </div>
  );
}
