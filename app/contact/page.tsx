"use client";

import { useState, useEffect, useRef } from "react";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, MessageSquare } from "lucide-react";

/* ─── Scroll-triggered animation hook ─── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          obs.unobserve(el);
        }
      },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, isVisible };
}

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

  // Scroll reveals
  const heroReveal = useScrollReveal(0.1);
  const contentReveal = useScrollReveal(0.1);

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
    } catch (err) {
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
      delay: "0ms",
    },
    {
      icon: Mail,
      label: "Napisz do nas",
      value: "biuro@rippapolska.pl",
      sub: "Odpowiadamy w ciągu 24h",
      href: "mailto:biuro@rippapolska.pl",
      delay: "100ms",
    },
    {
      icon: MapPin,
      label: "Odwiedź nas",
      value: "Sadowa 1, 34-120 Sułkowice",
      sub: null,
      href: "https://maps.google.com/?q=Sadowa+1+34-120+Sulkowice",
      delay: "200ms",
    },
    {
      icon: Clock,
      label: "Godziny pracy",
      value: "Pon – Pt: 8:00 – 16:00",
      sub: "Sob – Nd: nieczynne",
      href: null,
      delay: "300ms",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] selection:bg-[#1b3caf] selection:text-white">
        <UnifiedNavbar />
        
        {/* Core Content Section with Hero Layout */}
        <section className="min-h-screen flex flex-col pt-32 pb-16 relative overflow-hidden">
             {/* Background glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#1b3caf]/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#0f9fdf]/5 rounded-full blur-[100px] pointer-events-none" />
            
            {/* Floating particles background */}
            <div className="absolute top-40 left-[10%] w-2 h-2 bg-[#1b3caf]/30 rounded-full animate-bounce" style={{ animationDuration: "3s" }} />
            <div className="absolute top-60 right-[15%] w-1.5 h-1.5 bg-[#0f9fdf]/40 rounded-full animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }} />
            
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full flex-grow">
                
                {/* Header Section */}
                <div 
                    ref={heroReveal.ref}
                    className={`text-center mb-16 transition-all duration-1000 ${
                        heroReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1b3caf]/10 border border-[#1b3caf]/30 mb-6 animate-pulse">
                        <MessageSquare className="w-4 h-4 text-[#1b3caf]" />
                        <span className="text-sm text-[#b0b0b0]">Jesteśmy do Twojej dyspozycji</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                    Skontaktuj się z nami
                    </h1>
                    <p className="text-lg text-[#b0b0b0] max-w-2xl mx-auto">
                    Masz pytania dotyczące maszyn, serwisu lub finansowania? 
                    Napisz lub zadzwoń – nasi eksperci chętnie pomogą.
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] mx-auto mt-8" />
                </div>

                <div 
                    ref={contentReveal.ref}
                    className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 transition-all duration-1000 delay-200 ${
                        contentReveal.isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
                    }`}
                >
                    {/* Left Column: Contact Info */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-white/[7%] to-white/[2%] backdrop-blur-sm rounded-2xl p-8 border border-white/10 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-8">Dane kontaktowe</h3>
                            <div className="space-y-6">
                            {contactInfo.map((item, index) => (
                                <div 
                                    key={index} 
                                    className="flex items-start space-x-4 group"
                                    style={{ transitionDelay: item.delay }}
                                >
                                <div className="flex-shrink-0 w-12 h-12 bg-[#1b3caf]/10 rounded-xl flex items-center justify-center text-[#1b3caf] group-hover:bg-[#1b3caf]/20 group-hover:scale-110 transition-all duration-300">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#8b92a9] mb-1">{item.label}</p>
                                    {item.href ? (
                                    <a
                                        href={item.href}
                                        className="text-lg font-semibold text-white hover:text-[#1b3caf] transition-colors"
                                    >
                                        {item.value}
                                    </a>
                                    ) : (
                                    <p className="text-lg font-semibold text-white">{item.value}</p>
                                    )}
                                    {item.sub && <p className="text-sm text-[#8b92a9] mt-1">{item.sub}</p>}
                                </div>
                                </div>
                            ))}
                            </div>
                        </div>

                        {/* Why Us Box */}
                        <div className="bg-gradient-to-br from-[#1b3caf]/10 to-[#0f9fdf]/5 rounded-2xl p-8 border border-[#1b3caf]/20">
                            <h3 className="text-xl font-bold text-white mb-6">Dlaczego warto nas wybrać?</h3>
                            <ul className="space-y-4">
                            {[
                                "Profesjonalne doradztwo techniczne",
                                "Szybka realizacja zamówień",
                                "Wsparcie posprzedażowe i serwis",
                                "Konkurencyjne ceny na rynku"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center text-[#d0d8e6] group">
                                    <div className="mr-3 p-1 rounded-full bg-[#1b3caf]/20 group-hover:bg-[#1b3caf]/40 transition-colors">
                                        <CheckCircle2 className="w-4 h-4 text-[#1b3caf]" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="bg-gradient-to-br from-white/[7%] to-white/[2%] backdrop-blur-sm rounded-2xl p-8 md:p-10 border border-white/10 shadow-2xl relative">
                        {/* Glow behind form */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#1b3caf]/5 to-transparent rounded-2xl pointer-events-none" />
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold text-white mb-2">Napisz do nas</h3>
                            <p className="text-[#b0b0b0] mb-8">Odpowiemy najszybciej jak to możliwe</p>
                            
                            {success ? (
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-8 text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                                </div>
                                <h4 className="text-2xl font-bold text-white mb-3">Dziękujemy!</h4>
                                <p className="text-[#d0d8e6] mb-8">{success}</p>
                                <button
                                    onClick={() => setSuccess(null)}
                                    className="px-8 py-3 bg-[#2a3040] hover:bg-[#3a4050] text-white rounded-xl transition-all hover:scale-105 font-medium"
                                >
                                    Wyślij kolejną wiadomość
                                </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start space-x-3 text-red-400">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <p>{error}</p>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-[#b0b0b0]">
                                        Imię i nazwisko *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all placeholder:text-gray-600"
                                        placeholder="Jan Kowalski"
                                        required
                                    />
                                    </div>
                                    <div className="space-y-2">
                                    <label htmlFor="phone" className="block text-sm font-medium text-[#b0b0b0]">
                                        Telefon
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all placeholder:text-gray-600"
                                        placeholder="+48 000 000 000"
                                    />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-sm font-medium text-[#b0b0b0]">
                                    Adres email *
                                    </label>
                                    <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all placeholder:text-gray-600"
                                    placeholder="jan@example.com"
                                    required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="topic" className="block text-sm font-medium text-[#b0b0b0]">
                                    Temat
                                    </label>
                                    <div className="relative">
                                        <select
                                            id="topic"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all cursor-pointer placeholder:text-gray-600 [&>option]:text-white"
                                        >
                                            <option value="" className="bg-[#1a1f2e] text-white">Wybierz temat...</option>
                                            <option value="sprzedaz" className="bg-[#1a1f2e] text-white">Sprzedaż maszyn</option>
                                            <option value="serwis" className="bg-[#1a1f2e] text-white">Serwis i części</option>
                                            <option value="wspolpraca" className="bg-[#1a1f2e] text-white">Współpraca</option>
                                            <option value="inne" className="bg-[#1a1f2e] text-white">Inny temat</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="message" className="block text-sm font-medium text-[#b0b0b0]">
                                    Wiadomość *
                                    </label>
                                    <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#1b3caf] focus:ring-1 focus:ring-[#1b3caf] transition-all resize-none placeholder:text-gray-600"
                                    placeholder="W czym możemy Ci pomóc?"
                                    required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:shadow-lg hover:shadow-blue-500/20 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {submitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                        <span>Wysyłanie...</span>
                                    </>
                                    ) : (
                                    <>
                                        <span>Wyślij wiadomość</span>
                                        <Send className="w-5 h-5" />
                                    </>
                                    )}
                                </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator removed */}
            </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
