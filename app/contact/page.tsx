"use client";

import { useState } from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";

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
        // Optionally show mailResult for debugging
        if (data?.mailResult && data.mailResult.ok === false) {
          console.warn("mailResult:", data.mailResult);
        }
        // Clear form
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

  return (
    <div className="min-h-screen bg-[#0f1419] relative overflow-x-hidden selection:bg-[#1b3caf] selection:text-white">
      <UnifiedNavbar />

      {/* Background Gradients */}
      <div className="pointer-events-none select-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-[#1b3caf]/10 rounded-full blur-[100px] opacity-40 animate-pulse-slow" />
        <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-[#0f9fdf]/10 rounded-full blur-[80px] opacity-30 animate-pulse-slow2" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1b3caf]/20 rounded-full blur-[100px] opacity-40" />
      </div>

      <main className="w-full relative z-10 pt-32 pb-20">
        <div className="max-w-[1600px] mx-auto px-6 sm:px-10 lg:px-20">
          {/* Header */}
          <div className="text-center mb-20">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
              Skontaktuj się z <span className="text-[#1b3caf]">nami</span>
            </h1>
            <p className="text-[#b0b0b0] text-lg max-w-2xl mx-auto">
              Masz pytania dotyczące naszych maszyn? Chcesz umówić się na
              prezentację? Jesteśmy do Twojej dyspozycji.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm hover:border-[#1b3caf]/30 transition-colors duration-300">
                <h3 className="text-2xl font-bold text-white mb-8">
                  Dane kontaktowe
                </h3>

                <div className="space-y-8">
                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-[#1b3caf]/10 flex items-center justify-center text-[#1b3caf] group-hover:bg-[#1b3caf] group-hover:text-white transition-all duration-300">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[#6b7280] text-sm uppercase font-bold tracking-wider mb-1">
                        Zadzwoń do nas
                      </p>
                      <a
                        href="tel:+48787148016"
                        className="text-xl text-white font-medium hover:text-[#1b3caf] transition-colors"
                      >
                        +48 787 148 016
                      </a>
                      <p className="text-[#b0b0b0] text-sm mt-1">
                        Pon - Pt: 8:00 - 16:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-[#1b3caf]/10 flex items-center justify-center text-[#1b3caf] group-hover:bg-[#1b3caf] group-hover:text-white transition-all duration-300">
                      <Mail className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[#6b7280] text-sm uppercase font-bold tracking-wider mb-1">
                        Napisz do nas
                      </p>
                      <a
                        href="mailto:biuro@rippapolska.pl"
                        className="text-xl text-white font-medium hover:text-[#1b3caf] transition-colors"
                      >
                        biuro@rippapolska.pl
                      </a>
                      <p className="text-[#b0b0b0] text-sm mt-1">
                        Odpowiadamy w ciągu 24h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-[#1b3caf]/10 flex items-center justify-center text-[#1b3caf] group-hover:bg-[#1b3caf] group-hover:text-white transition-all duration-300">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[#6b7280] text-sm uppercase font-bold tracking-wider mb-1">
                        Odwiedź nas
                      </p>
                      <p className="text-xl text-white font-medium">
                        Mostowa 4
                      </p>
                      <p className="text-[#b0b0b0] text-sm mt-1">
                        34-120 Sułkowice
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden h-64 md:h-80 relative group">
                <iframe
                  src="https://www.google.com/maps?q=Mostowa+4+34-120+Sulkowice&output=embed"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa - Mostowa 4, 34-120 Sułkowice"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300 pointer-events-none" />
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-sm">
              <h3 className="text-2xl font-bold text-white mb-2">
                Formularz kontaktowy
              </h3>
              <p className="text-[#b0b0b0] mb-8">
                Wypełnij formularz, a skontaktujemy się z Tobą najszybciej jak
                to możliwe.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-white"
                    >
                      Imię i nazwisko
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#0f1419] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-white"
                    >
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#0f1419] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all"
                      placeholder="+48 000 000 000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-white"
                  >
                    Adres e-mail
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0f1419] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all"
                    placeholder="jan@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="topic"
                    className="text-sm font-medium text-white"
                  >
                    Temat
                  </label>
                  <select
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-[#0f1419] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all appearance-none"
                  >
                    <option value="">Wybierz temat rozmowy</option>
                    <option value="offer">Zapytanie o ofertę</option>
                    <option value="service">Serwis i części</option>
                    <option value="partnership">Współpraca</option>
                    <option value="other">Inne</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-medium text-white"
                  >
                    Wiadomość
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#0f1419] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-[#6b7280] focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all resize-none"
                    placeholder="Opisz nam jak możemy Ci pomóc..."
                  ></textarea>
                </div>

                {error && <p className="text-sm text-red-400">{error}</p>}
                {success && <p className="text-sm text-green-400">{success}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full ${submitting ? "opacity-60 pointer-events-none" : ""} bg-[#1b3caf] hover:bg-[#2850d4] text-white font-bold py-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group`}
                >
                  <span>
                    {submitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                  </span>
                  <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-[#6b7280] text-center mt-4">
                  Wysyłając formularz akceptujesz naszą politykę prywatności.
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.2;
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s infinite;
        }
        @keyframes pulse-slow2 {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.15;
          }
        }
        .animate-pulse-slow2 {
          animation: pulse-slow2 10s infinite;
        }
      `}</style>
    </div>
  );
}
