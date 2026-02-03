"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import {
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  ChevronDown,
  Maximize2,
  X,
  Fuel,
  Crosshair,
  Clock,
  Download as DownloadIcon,
  FileText,
} from "lucide-react";
import ChatWidget from "@/components/ChatWidget";

interface Section {
  title: string;
  text: string;
  image?: { url: string; alt: string };
}

interface Model {
  id: string;
  name: string;
  description: string;
  heroDescription?: string; // New field
  power: number;
  depth: number;
  weight: number;
  bucket: number;
  price: number;
  featured: boolean;
  category?: { id: string; name: string; slug: string };
  images: Array<{ id: string; url: string; alt: string }>;
  sections?: Section[];
  heroImageId?: string; // Dodane pole
  downloads?: Array<{
    name: string;
    url: string;
    fileType: string;
    fileSize?: number;
  }>;
  features?: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    options?: any;
    value: any;
  }>;
}

export default function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [productId, setProductId] = useState<string>("");
  const [model, setModel] = useState<Model | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [quoteModalOpen, setQuoteModalOpen] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    params.then((p) => setProductId(p.id));
  }, [params]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (productId) {
      fetchModel();
    }
  }, [productId]);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const addToCompare = (e?: any) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    try {
      const item = {
        id: productId || (model && model.id),
        name: model?.name,
        url:
          model?.images && model.images.length > 0
            ? model.images[0].url
            : undefined,
      };
      if (!item.id) return;
      const raw = localStorage.getItem("compareModels");
      const arr = raw ? JSON.parse(raw) : [];
      const itemId = String(item.id);
      if (arr.find((x: any) => String(x.id) === itemId)) {
        window.dispatchEvent(
          new CustomEvent("rippa-toast", {
            detail: { message: "Model już jest w porównaniu", type: "info" },
          }),
        );
        return;
      }
      if (arr.length >= 4) {
        window.dispatchEvent(
          new CustomEvent("rippa-toast", {
            detail: {
              message: "Możesz porównać maksymalnie 4 modele",
              type: "error",
            },
          }),
        );
        return;
      }
      arr.push({ ...item, id: itemId });
      try {
        localStorage.setItem("compareModels", JSON.stringify(arr));
      } catch {}
      window.dispatchEvent(new Event("compare-updated"));
      window.dispatchEvent(
        new CustomEvent("rippa-toast", {
          detail: { message: "Dodano do porównania", type: "success" },
        }),
      );
    } catch (err) {
      console.error("addToCompare error", err);
    }
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteName || !quoteEmail || !quoteMessage) return;

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productName: model?.name,
          name: quoteName,
          email: quoteEmail,
          phone: quotePhone,
          message: quoteMessage,
        }),
      });

      if (response.ok) {
        setQuoteModalOpen(false);
        setQuoteName("");
        setQuoteEmail("");
        setQuotePhone("");
        setQuoteMessage("");
        window.dispatchEvent(
          new CustomEvent("rippa-toast", {
            detail: {
              message:
                "Dziękujemy za zapytanie! Wkrótce się z Tobą skontaktujemy.",
              type: "success",
            },
          }),
        );
      }
    } catch (error) {
      console.error("Error submitting quote:", error);
      window.dispatchEvent(
        new CustomEvent("rippa-toast", {
          detail: {
            message: "Błąd przy wysyłaniu zapytania. Spróbuj ponownie.",
            type: "error",
          },
        }),
      );
    }
  };

  const fetchModel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/models/${productId}`);
      if (!response.ok) {
        throw new Error("Product not found");
      }
      const data = await response.json();
      setModel(data);
    } catch (error) {
      console.error("Error fetching model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-[#1b3caf]/30 rounded-full mx-auto mb-4"></div>
          <p className="text-white text-lg">Ładowanie produktu...</p>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
        <UnifiedNavbar />
        <div className="flex flex-col items-center justify-center min-h-[70vh] mt-20">
          <p className="text-[#b0b0b0] mb-4 text-lg">Produkt nie znaleziony</p>
          <Link
            href="/products"
            className="px-6 py-2 bg-[#1b3caf] hover:bg-[#1b3caf]/80 text-white rounded-lg transition"
          >
            Wróć do katalogu
          </Link>
        </div>
      </div>
    );
  }

  // Hero image: always show heroImageId if set
  const heroImageObj = model.heroImageId
    ? model.images?.find((img) => img.id === model.heroImageId)
    : null;
  const heroImageUrl = heroImageObj ? heroImageObj.url : model.images?.[0]?.url;

  // Gallery main image: use slider
  const galleryImageUrl = model.images?.[selectedImageIndex]?.url;

  // Nowoczesny Hero z animacją: tylko zdjęcie w tle
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />

      {/* Hero Section - Modern Full-Screen Design */}
      <section
        className="relative bg-transparent overflow-hidden min-h-screen w-full flex items-center justify-center transition-opacity duration-500 pt-20"
        style={{
          opacity: Math.max(0, 1 - scrollY / (isMobile ? 500 : 200)),
        }}
      >
        <div className="relative w-full h-auto min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Hero Image - Full responsive */}
          {heroImageUrl && (
            <div className="w-full lg:w-1/2 flex items-center justify-center">
              <div className="relative w-full max-w-md lg:max-w-none">
                <img
                  src={heroImageUrl}
                  alt={model.name}
                  className="w-full h-auto object-contain transition-transform duration-500 hover:scale-105"
                />
              </div>
            </div>
          )}

          {/* Content - No box background, clean text */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center gap-6 lg:gap-8">
            {/* Main Title */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#1b3caf] via-white to-[#0f9fdf] tracking-tight leading-tight mb-4">
                {model.name}
              </h1>
              <div className="h-1.5 w-24 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] rounded-full" />
            </div>

            {/* Price */}
            <div>
              <p className="text-sm uppercase tracking-widest text-[#b0b0b0] mb-2">
                Cena startowa
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf]">
                Od{" "}
                {model.price
                  .toLocaleString("pl-PL")
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                PLN
              </p>
            </div>

            {/* Description - Clean text without background */}
            <p className="text-lg sm:text-xl text-[#d0d8e6] leading-relaxed font-light max-w-lg">
              {model.heroDescription || model.description}
            </p>

            {/* Quick Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-b border-white/10">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                  Moc
                </p>
                <p className="text-lg font-bold text-white">{model.power} KM</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                  Głębokość
                </p>
                <p className="text-lg font-bold text-white">{model.depth} m</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                  Waga
                </p>
                <p className="text-lg font-bold text-white">{model.weight} t</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                  Pojemność
                </p>
                <p className="text-lg font-bold text-white">
                  {model.bucket} m³
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setQuoteModalOpen(true)}
                className="px-8 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:from-[#1b3caf]/80 hover:to-[#0f9fdf]/80 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-[#1b3caf]/40 transform hover:scale-105"
              >
                Zapytaj o cenę
              </button>
              <button
                onClick={() => addToCompare()}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition duration-300 border border-white/20"
              >
                Dodaj do porównania
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Down Arrow - Animated */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-[#1b3caf] drop-shadow-lg" />
        </div>
      </section>

      {/* Main Content */}
      <main className="w-full bg-gradient-to-b from-transparent via-[#1b3caf]/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          {/* Gallery & Specs Grid - Modern Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Gallery - Left side, spans 2 columns */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Main Image (Gallery) with Navigation Arrows */}
              <div className="relative group">
                {galleryImageUrl ? (
                  <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-[#242d3d] to-[#1a1f2e] rounded-2xl overflow-hidden border border-white/10">
                    <img
                      src={galleryImageUrl}
                      alt={model.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition duration-300"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1419]/40 via-transparent to-transparent pointer-events-none" />

                    {/* Left Arrow */}
                    {model.images && model.images.length > 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            selectedImageIndex === 0
                              ? model.images!.length - 1
                              : selectedImageIndex - 1,
                          )
                        }
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition duration-300 z-10 backdrop-blur-sm border border-white/20"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}

                    {/* Right Arrow */}
                    {model.images && model.images.length > 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            selectedImageIndex === model.images!.length - 1
                              ? 0
                              : selectedImageIndex + 1,
                          )
                        }
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition duration-300 z-10 backdrop-blur-sm border border-white/20"
                      >
                        <ChevronRight className="w-6 h-6" />
                      </button>
                    )}

                    {/* Zoom button */}
                    <button
                      onClick={() => setLightboxOpen(true)}
                      className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition duration-300 z-10 backdrop-blur-sm border border-white/20"
                    >
                      <Maximize2 className="w-5 h-5" />
                    </button>

                    {/* Image counter */}
                    {model.images && model.images.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20">
                        {selectedImageIndex + 1} / {model.images.length}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-[16/9] bg-gradient-to-br from-[#242d3d] to-[#1f2e] rounded-2xl flex items-center justify-center border border-white/10">
                    <span className="text-[#6b7280]">Brak zdjęcia</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {model.images && model.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {model.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition duration-300 ${
                        selectedImageIndex === index
                          ? "border-[#1b3caf] shadow-lg shadow-[#1b3caf]/20"
                          : "border-white/10 hover:border-[#1b3caf]/50"
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info Sidebar - Sticky & Premium */}
            <div className="flex flex-col gap-8 lg:sticky lg:top-24">
              {/* Sticky Card */}
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 lg:p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                {/* Availability Badge */}
                <div className="mb-6 pb-6 border-b border-white/10">
                  <span className="inline-block px-3 py-1 bg-green-500/20 text-green-300 text-xs font-bold rounded-full border border-green-500/30">
                    Dostępny na zamówienie
                  </span>
                </div>

                {/* Price Highlight */}
                <div className="mb-6">
                  <p className="text-sm uppercase tracking-widest text-[#8b92a9] mb-2">
                    Cena od
                  </p>
                  <p className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf]">
                    {model.price
                      .toLocaleString("pl-PL")
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
                    PLN
                  </p>
                </div>

                {/* Quick Specs */}
                <div className="grid grid-cols-2 gap-3 mb-6 py-6 border-t border-b border-white/10">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                      Moc
                    </p>
                    <p className="text-lg font-bold text-white">
                      {model.power} KM
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                      Głębokość
                    </p>
                    <p className="text-lg font-bold text-white">
                      {model.depth} m
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                      Waga
                    </p>
                    <p className="text-lg font-bold text-white">
                      {model.weight} t
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                      Pojemność
                    </p>
                    <p className="text-lg font-bold text-white">
                      {model.bucket} m³
                    </p>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setQuoteModalOpen(true)}
                    className="w-full px-6 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:from-[#1b3caf]/80 hover:to-[#0f9fdf]/80 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-[#1b3caf]/30 transform hover:scale-105"
                  >
                    Zapytaj o cenę
                  </button>
                  <button
                    onClick={() => addToCompare()}
                    className="w-full px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition duration-300 border border-white/20"
                  >
                    Dodaj do porównania
                  </button>
                </div>
              </div>

              {/* Contact Info Card */}
              <div className="bg-gradient-to-br from-white/5 to-white/[2%] p-6 rounded-xl border border-white/10 hover:border-white/20 transition">
                <h3 className="text-white font-bold mb-4 text-lg">
                  Potrzebujesz poradnika?
                </h3>
                <div className="space-y-2">
                  <a
                    href="tel:+48787148016"
                    className="flex items-center gap-2 text-[#b0b0b0] hover:text-white transition text-sm"
                  >
                    <Phone className="w-4 h-4 text-[#1b3caf] flex-shrink-0" />
                    +48 787 148 016
                  </a>
                  <a
                    href="mailto:info@rippa.pl"
                    className="flex items-center gap-3 text-[#b0b0b0] hover:text-white transition"
                  >
                    <Mail className="w-5 h-5 text-[#1b3caf]" />
                    info@rippa.pl
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        {model.description && (
          <section className="bg-white/5 border-t border-b border-white/10 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                Opis produktu
              </h2>
              <p className="text-[#b0b0b0] leading-relaxed text-lg">
                {model.description}
              </p>
            </div>
          </section>
        )}

        {/* Specs Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-12">
              Specyfikacja techniczna
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-[#1b3caf]" />
                  <h3 className="text-xl font-bold text-white">
                    Parametry silnika
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Moc</span>
                    <span className="text-white font-semibold">
                      {model.power} KM
                    </span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Typ</span>
                    <span className="text-white font-semibold">
                      Kubota V2203
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-8 rounded-xl border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-[#1b3caf]" />
                  <h3 className="text-xl font-bold text-white">
                    Wymiary i waga
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Głębokość kopania</span>
                    <span className="text-white font-semibold">
                      {model.depth} m
                    </span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Waga</span>
                    <span className="text-white font-semibold">
                      {model.weight} ton
                    </span>
                  </div>
                  <div className="h-px bg-white/10"></div>
                  <div className="flex justify-between">
                    <span className="text-[#b0b0b0]">Pojemność łyżki</span>
                    <span className="text-white font-semibold">
                      {model.bucket} m³
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sections from Product Data */}
        {model.sections && model.sections.length > 0 && (
          <section className="py-20 border-t border-white/10 bg-gradient-to-b from-transparent via-[#1b3caf]/5 to-transparent">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
              {model.sections.map((section, idx) => (
                <div key={idx} className="group">
                  {/* Alternating Layout - Elegant with Slide-in Effect */}
                  {section.image?.url ? (
                    <div
                      className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${idx % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
                    >
                      {/* Content - Left for even, Right for odd */}
                      <div className={idx % 2 === 1 ? "lg:order-2" : ""}>
                        {/* Title Only */}
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                          {section.title}
                        </h3>

                        {/* Description - clean text */}
                        <p className="text-[#d0d8e6] text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-light">
                          {section.text}
                        </p>
                      </div>

                      {/* Image - Right for even, Left for odd - With Slide Effect */}
                      <div
                        className={`relative h-[400px] lg:h-[500px] ${idx % 2 === 1 ? "lg:order-1" : ""}`}
                      >
                        {/* Gradient glow background */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-r ${idx % 2 === 0 ? "from-[#1b3caf]/30 via-[#0f9fdf]/20 to-transparent" : "from-transparent via-[#0f9fdf]/20 to-[#1b3caf]/30"} rounded-xl blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 -z-10`}
                        ></div>

                        {/* Image container with slide effect */}
                        <div
                          className={`relative h-full transform transition-all duration-700 ease-out ${idx % 2 === 0 ? "group-hover:translate-x-2" : "group-hover:-translate-x-2"}`}
                        >
                          <img
                            src={section.image.url}
                            alt={section.image.alt || section.title}
                            className="w-full h-full object-contain group-hover:scale-105 transition duration-700 ease-out"
                            loading="lazy"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-3xl">
                      {/* Title Only */}
                      <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                        {section.title}
                      </h3>

                      {/* Description - clean text */}
                      <p className="text-[#d0d8e6] text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-light">
                        {section.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Downloads Section */}
        {model.downloads && model.downloads.length > 0 && (
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                Pliki do pobrania
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {model.downloads.map((download, i) => (
                  <a
                    key={i}
                    href={download.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-[#1b3caf]/50 transition duration-300 group"
                  >
                    <div className="w-12 h-12 bg-[#1b3caf]/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-[#1b3caf] transition-colors">
                      <FileText className="w-6 h-6 text-[#1b3caf] group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">
                        {download.name}
                      </h3>
                      <div className="flex items-center text-xs text-[#8b92a9] gap-3">
                        <span className="uppercase">{download.fileType}</span>
                        {download.fileSize && (
                          <span>
                            {(download.fileSize / 1024 / 1024).toFixed(2)} MB
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[#1b3caf] group-hover:text-[#0f9fdf] transition-colors">
                          <DownloadIcon className="w-3 h-3" /> Pobierz
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Product Features (admin-configured) */}
        {model?.features && model.features.length > 0 && (
          <section className="py-16 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-8">
                Cechy produktu
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {model.features.map((f: any) => {
                  const raw = f.value;
                  let display = "";
                  try {
                    if (f.type === "boolean") {
                      display = raw ? "Tak" : "Nie";
                    } else if (f.type === "number") {
                      display =
                        typeof raw === "number"
                          ? raw.toLocaleString("pl-PL")
                          : String(raw);
                    } else if (f.type === "date") {
                      display = raw
                        ? new Date(raw).toLocaleDateString("pl-PL")
                        : "";
                    } else if (f.type === "enum" && f.options) {
                      const opts = Array.isArray(f.options) ? f.options : [];
                      if (opts.length && typeof opts[0] === "object") {
                        const found = opts.find(
                          (o: any) => o.value == raw || o.value === raw,
                        );
                        display = found ? found.label : String(raw ?? "");
                      } else {
                        display = String(raw ?? "");
                      }
                    } else {
                      if (raw === null || typeof raw === "undefined")
                        display = "—";
                      else if (typeof raw === "object")
                        display = JSON.stringify(raw);
                      else display = String(raw);
                    }
                  } catch (e) {
                    display = String(raw ?? "");
                  }

                  return (
                    <div
                      key={f.id}
                      className="p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="text-sm text-[#b0b0b0]">{f.label}</div>
                      <div className="text-lg font-semibold text-white mt-1">
                        {display || "—"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Features Section - "Why choose us" */}
        <section className="w-full py-32 bg-gradient-to-b from-white/5 to-transparent border-t border-white/10 relative">
          <div className="w-full px-4 sm:px-6 md:px-12 lg:px-20 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Dlaczego Rippa?
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  title: "Niskie spalanie",
                  desc: "Zoptymalizowane silniki Kubota zapewniające maksymalną wydajność przy minimalnym zużyciu paliwa.",
                  Icon: Fuel,
                },
                {
                  title: "Precyzyjna praca",
                  desc: "Zaawansowana hydraulika pozwala na milimetrową dokładność nawet przy najtrudniejszych zadaniach.",
                  Icon: Crosshair,
                },
                {
                  title: "Serwis w Polsce",
                  desc: "Autoryzowane punkty serwisowe i magazyn części zamiennych dostępny od ręki w kraju.",
                  Icon: MapPin,
                },
                {
                  title: "Szybka dostępność",
                  desc: "Większość modeli dostępna od ręki z naszego placu. Nie czekaj miesiącami na maszynę.",
                  Icon: Clock,
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-[#1b3caf]/50 transition-all duration-300 rounded-xl hover:-translate-y-1 relative overflow-hidden"
                >
                  {/* Large icon in background */}
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <feature.Icon className="w-24 h-24 text-[#1b3caf]" />
                  </div>

                  {/* Small icon in circle */}
                  <div className="w-12 h-12 bg-[#1b3caf]/10 rounded flex items-center justify-center mb-6 group-hover:bg-[#1b3caf] transition-colors">
                    <feature.Icon className="w-6 h-6 text-[#1b3caf] group-hover:text-white transition-colors" />
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-[#b0b0b0] text-sm leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-2xl">
              {/* Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#1b3caf]/20 to-[#0f9fdf]/20 border border-[#1b3caf]/30"></div>
              <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#1b3caf]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#0f9fdf]/10 rounded-full blur-3xl"></div>

              {/* Content */}
              <div className="relative p-12 text-center">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Zainteresowany?
                </h2>
                <p className="text-[#b0b0b0] text-lg mb-12 max-w-2xl mx-auto">
                  Skontaktuj się z nami, aby uzyskać szczegółową wycenę i
                  warunki dostawy na terenie całej Polski
                </p>

                {/* Contact Options Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Phone */}
                  <a
                    href="tel:+48787148016"
                    className="group flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:border-[#1b3caf]/50 hover:bg-white/10 transition duration-300"
                  >
                    <Phone className="w-8 h-8 text-[#1b3caf] mb-3 group-hover:scale-110 transition" />
                    <span className="text-sm text-[#8b92a9] mb-1">Zadzwoń</span>
                    <span className="text-xl font-bold text-white">
                      +48 787 148 016
                    </span>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:info@rippa.pl"
                    className="group flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:border-[#1b3caf]/50 hover:bg-white/10 transition duration-300"
                  >
                    <Mail className="w-8 h-8 text-[#1b3caf] mb-3 group-hover:scale-110 transition" />
                    <span className="text-sm text-[#8b92a9] mb-1">Email</span>
                    <span className="text-lg font-semibold text-white truncate">
                      info@rippa.pl
                    </span>
                  </a>

                  {/* Chat */}
                  <div className="group flex flex-col items-center p-6 bg-gradient-to-br from-[#1b3caf]/20 to-[#0f9fdf]/20 border border-[#1b3caf]/40 rounded-xl hover:border-[#1b3caf] hover:from-[#1b3caf]/30 hover:to-[#0f9fdf]/30 transition duration-300 cursor-pointer">
                    <div className="w-8 h-8 text-[#1b3caf] mb-3 group-hover:scale-110 transition">
                      <svg fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" />
                      </svg>
                    </div>
                    <span className="text-sm text-[#8b92a9] mb-1">
                      Chat na żywo
                    </span>
                    <span className="text-lg font-semibold text-white">
                      Porozmawiaj z nami
                    </span>
                  </div>
                </div>

                {/* Main Button */}
                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="px-8 py-4 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] hover:from-[#1b3caf]/80 hover:to-[#0f9fdf]/80 text-white font-bold rounded-lg transition duration-300 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 text-lg"
                >
                  Zapytaj o cenę
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0f1419]/80 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#b0b0b0] text-sm">
          <p>&copy; 2025 Rippa Polska. Wszystkie prawa zastrzeżone.</p>
        </div>
      </footer>

      {/* Lightbox Modal */}
      {lightboxOpen && galleryImageUrl && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-[#1b3caf] transition"
          >
            <X className="w-8 h-8" />
          </button>

          {/* Left arrow */}
          {model.images && model.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(
                  selectedImageIndex === 0
                    ? model.images!.length - 1
                    : selectedImageIndex - 1,
                );
              }}
              className="absolute left-4 text-white hover:text-[#1b3caf] transition p-2"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Right arrow */}
          {model.images && model.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(
                  selectedImageIndex === model.images!.length - 1
                    ? 0
                    : selectedImageIndex + 1,
                );
              }}
              className="absolute right-4 text-white hover:text-[#1b3caf] transition p-2"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}

          {/* Image */}
          <img
            src={galleryImageUrl}
            alt={model.name}
            className="max-w-5xl max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          {model.images && model.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full font-medium">
              {selectedImageIndex + 1} / {model.images.length}
            </div>
          )}
        </div>
      )}

      {/* Chat Widget Button - always visible */}
      <ChatWidget phone="+48787148016" />

      {/* Quote Modal */}
      {quoteModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setQuoteModalOpen(false)}
        >
          <div
            className="bg-gradient-to-br from-[#1a2238] to-[#0f1419] rounded-2xl border border-white/10 p-8 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] bg-clip-text text-transparent">
                Zapytaj o cenę
              </h2>
              <button
                onClick={() => setQuoteModalOpen(false)}
                className="text-white/60 hover:text-white transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Product info */}
            {model && (
              <div className="mb-6 pb-6 border-b border-white/10">
                <p className="text-sm text-[#8b92a9] mb-2">Produkt:</p>
                <p className="text-lg font-semibold text-white">{model.name}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#1b3caf] focus:bg-white/10 transition"
                  placeholder="Jan Nowak"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#1b3caf] focus:bg-white/10 transition"
                  placeholder="jan@example.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Telefon
                </label>
                <input
                  type="tel"
                  value={quotePhone}
                  onChange={(e) => setQuotePhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#1b3caf] focus:bg-white/10 transition"
                  placeholder="+48 787 148 016"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Wiadomość *
                </label>
                <textarea
                  value={quoteMessage}
                  onChange={(e) => setQuoteMessage(e.target.value)}
                  className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#1b3caf] focus:bg-white/10 transition resize-none"
                  placeholder="Poproszę o wycenę dla moje firmy..."
                  rows={4}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                Wyślij zapytanie
              </button>

              <p className="text-xs text-[#8b92a9] text-center">
                * Pola wymagane. Twoje dane będą przetwarzane zgodnie z naszą
                polityką prywatności.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Animacje CSS */}
      <style jsx global>{`
        @keyframes fadein {
          from {
            opacity: 0;
            transform: scale(1.1);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes slideup {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideup2 {
          from {
            opacity: 0;
            transform: translateY(60px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadein2 {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadein {
          animation: fadein 1s ease;
        }
        .animate-slideup {
          animation: slideup 1s cubic-bezier(0.4, 2, 0.3, 1);
        }
        .animate-slideup2 {
          animation: slideup2 1.2s cubic-bezier(0.4, 2, 0.3, 1);
        }
        .animate-fadein2 {
          animation: fadein2 1.5s ease;
        }
      `}</style>
    </div>
  );
}
