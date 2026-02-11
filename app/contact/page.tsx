"use client";

import { useState } from "react";
import Link from "next/link";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] to-[#1a1f2e] selection:bg-[#1b3caf] selection:text-white">
      <UnifiedNavbar />

      <main className="relative z-10 pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 mb-4 text-xs font-bold tracking-[0.15em] text-[#0f9fdf] border border-[#1b3caf]/20 rounded-full uppercase bg-[#1b3caf]/5">
              Kontakt
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Porozmawiajmy o{" "}
              <span className="bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] bg-clip-text text-transparent">
                Twoim projekcie
              </span>
            </h1>
            <p className="text-[#8b92a9] text-lg max-w-xl mx-auto">
              Masz pytania dotyczące naszych maszyn? Chcesz umówić się na
              prezentację? Jesteśmy do Twojej dyspozycji.
            </p>
          </div>

          {/* Contact cards row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {contactInfo.map((item, i) => {
              const Inner = (
                <div className="group h-full p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-[#1b3caf]/25 hover:bg-white/[0.04] transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/10 flex items-center justify-center text-[#0f9fdf] mb-4 group-hover:from-[#1b3caf]/30 group-hover:to-[#0f9fdf]/20 transition-all">
                    <item.icon className="w-4.5 h-4.5" />
                  </div>
                  <p className="text-[#636b82] text-xs font-semibold uppercase tracking-wider mb-1.5">
                    {item.label}
                  </p>
                  <p className="text-white font-medium text-sm mb-0.5">{item.value}</p>
                  {item.sub && (
                    <p className="text-[#636b82] text-xs">{item.sub}</p>
                  )}
                </div>
              );
              return item.href ? (
                <a key={i} href={item.href} target={item.href.startsWith("http") ? "_blank" : undefined} rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}>
                  {Inner}
                </a>
              ) : (
                <div key={i}>{Inner}</div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

            {/* Form — wider */}
            <div className="lg:col-span-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-1">
                Wyślij wiadomość
              </h3>
              <p className="text-[#8b92a9] text-sm mb-8">
                Wypełnij formularz, a skontaktujemy się najszybciej jak to możliwe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                      Imię i nazwisko <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0a0e15] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5068] focus:outline-none focus:border-[#1b3caf]/50 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0a0e15] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5068] focus:outline-none focus:border-[#1b3caf]/50 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all"
                      placeholder="+48 000 000 000"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                      Adres e-mail <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0e15] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5068] focus:outline-none focus:border-[#1b3caf]/50 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all"
                      placeholder="jan@example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="topic" className="text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                      Temat
                    </label>
                    <select
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full bg-[#0a0e15] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#1b3caf]/50 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all appearance-none"
                    >
                      <option value="">Wybierz temat</option>
                      <option value="offer">Zapytanie o ofertę</option>
                      <option value="service">Serwis i części</option>
                      <option value="partnership">Współpraca</option>
                      <option value="other">Inne</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-xs font-semibold text-[#8b92a9] uppercase tracking-wider">
                    Wiadomość <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0a0e15] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-[#4a5068] focus:outline-none focus:border-[#1b3caf]/50 focus:ring-1 focus:ring-[#1b3caf]/30 transition-all resize-none"
                    placeholder="Opisz nam jak możemy Ci pomóc..."
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-400/5 border border-red-400/10 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/5 border border-emerald-400/10 rounded-xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    {success}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${submitting ? "opacity-60 pointer-events-none" : ""} bg-gradient-to-r from-[#1b3caf] to-[#0f4fdf] hover:shadow-lg hover:shadow-[#1b3caf]/25 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center gap-2 group text-sm`}
                >
                  {submitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                  <Send className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-[#4a5068] text-center">
                  Wysyłając formularz akceptujesz naszą{" "}
                  <Link href="/privacy" className="text-[#0f9fdf] hover:underline">
                    politykę prywatności
                  </Link>
                  .
                </p>
              </form>
            </div>

            {/* Map */}
            <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] overflow-hidden h-full min-h-[400px] lg:min-h-0 relative">
              <iframe
                src="https://www.google.com/maps?q=Sadowa+1+34-120+Sulkowice&output=embed"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mapa - Sadowa 1, 34-120 Sułkowice"
              />
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
