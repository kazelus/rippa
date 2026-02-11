"use client";

import { useState } from "react";
import Link from "next/link";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

// Static breadcrumbs for Contact page
const breadcrumbsJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    {
      '@type': 'ListItem',
      position: 1,
      name: 'Strona główna',
      item: 'https://rippapolska.pl',
    },
    {
      '@type': 'ListItem',
      position: 2,
      name: 'Kontakt',
      item: 'https://rippapolska.pl/contact',
    },
  ],
};

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setError(null);
    setSuccess(null);

    if (!name || !email || !message) {
      setError("Uzupełnij wymagane pola: imię, email i wiadomość.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: null,
          productName: null,
          name,
          email,
          phone,
          topic,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Błąd serwera podczas wysyłki formularza.");
      } else {
        setSuccess(data?.message || "Wiadomość wysłana pomyślnie.");
        if (data?.mailResult && data.mailResult.ok === false) {
          console.warn("mailResult:", data.mailResult);
        }
        setName("");
        setPhone("");
        setEmail("");
        setTopic("");
        setMessage("");
      }
    } catch (err: any) {
      console.error(err);
      setError("Błąd sieci podczas wysyłki formularza.");
    } finally {
      setSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      label: "Zadzwoń do nas",
      value: "+48 787 148 016",
      sub: "Pon – Pt: 8:00 – 16:00",
      href: "tel:+48787148016",
    },
    {
      icon: Mail,
      label: "Napisz do nas",
      value: "biuro@rippapolska.pl",
      sub: "Odpowiadamy w ciągu 24h",
      href: "mailto:biuro@rippapolska.pl",
    },
    {
      icon: MapPin,
      label: "Odwiedź nas",
      value: "Sadowa 1, 34-120 Sułkowice",
      sub: null,
      href: "https://maps.google.com/?q=Sadowa+1+34-120+Sulkowice",
    },
    {
      icon: Clock,
      label: "Godziny pracy",
      value: "Pon – Pt: 8:00 – 16:00",
      sub: "Sob – Nd: nieczynne",
      href: null,
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] selection:bg-[#1b3caf] selection:text-white">
      <UnifiedNavbar />
      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ...existing code... */}
        </div>
      </main>
    </div>
    <Footer />
    </>
  );
}
