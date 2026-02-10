"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
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
  Package,
} from "lucide-react";


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
  power?: number;
  depth?: number;
  weight?: number;
  bucket?: number;
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
    affectsPrice?: boolean;
    priceModifier?: number | null;
    priceModifierType?: string;
    isVariant?: boolean;
    variantOptions?: Array<{ name: string; priceModifier: number }> | null;
  }>;
  parameters?: Array<{
    id: string;
    key: string;
    label: string;
    type: string;
    unit?: string;
    group?: string;
    options?: any;
    value: any;
    affectsPrice?: boolean;
    priceModifier?: number | null;
    priceModifierType?: string;
    isVariant?: boolean;
    variantOptions?: Array<{ name: string; priceModifier: number }> | null;
    isQuickSpec?: boolean;
    quickSpecOrder?: number;
    quickSpecLabel?: string | null;
  }>;
  variantGroups?: Array<{
    id: string;
    name: string;
    order: number;
    options: Array<{
      id: string;
      name: string;
      priceModifier: number;
      isDefault: boolean;
      images?: Array<{ url: string; alt: string; isHero?: boolean }> | null;
      parameterOverrides?: Record<string, any> | null;
    }>;
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
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteName, setQuoteName] = useState("");
  const [quoteEmail, setQuoteEmail] = useState("");
  const [quotePhone, setQuotePhone] = useState("");
  const [quoteMessage, setQuoteMessage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [activeParamTab, setActiveParamTab] = useState(0);
  const [accessories, setAccessories] = useState<
    Array<{
      id: string;
      name: string;
      description: string | null;
      price: number | null;
      imageUrl: string | null;
    }>
  >([]);
  // Model-level variant selections: { groupId: optionId }
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});

  // Format price nicely: 150 000 PLN (with non-breaking spaces)
  const formatPrice = (value: number) => {
    return Math.round(value).toLocaleString("pl-PL").replace(/,/g, " ");
  };

  // Calculate total price from model-level variant groups
  const calculateTotalPrice = () => {
    if (!model) return 0;
    let total = Number(model.price) || 0;

    if (model.variantGroups) {
      model.variantGroups.forEach((group) => {
        const selectedOptId = selectedVariants[group.id];
        if (selectedOptId) {
          const opt = group.options.find((o) => o.id === selectedOptId);
          if (opt) {
            total += Number(opt.priceModifier) || 0;
          }
        }
      });
    }

    return total;
  };

  const totalPrice = model ? calculateTotalPrice() : 0;
  const hasVariants =
    model && model.variantGroups && model.variantGroups.length > 0;

  const selectVariant = (groupId: string, optionId: string) => {
    setSelectedVariants((prev) => ({ ...prev, [groupId]: optionId }));
  };

  // Get current effective images (swapped by variant selection)
  const getEffectiveImages = () => {
    if (!model) return [];
    // Check if any selected variant has images - use the LAST one that has images
    let variantImages: Array<{
      url: string;
      alt: string;
      isHero?: boolean;
    }> | null = null;
    if (model.variantGroups) {
      for (const group of model.variantGroups) {
        const selectedOptId = selectedVariants[group.id];
        if (selectedOptId) {
          const opt = group.options.find((o) => o.id === selectedOptId);
          if (opt?.images && opt.images.length > 0) {
            variantImages = opt.images;
          }
        }
      }
    }
    if (variantImages) return variantImages;
    return model.images || [];
  };

  // Get effective hero image URL
  const getEffectiveHeroUrl = () => {
    const imgs = getEffectiveImages();
    const heroImg = imgs.find((i: any) => i.isHero);
    if (heroImg) return heroImg.url;
    // Fallback to model heroImageId
    if (model?.heroImageId) {
      const heroFromModel = model.images?.find(
        (i) => i.id === model.heroImageId,
      );
      if (heroFromModel) return heroFromModel.url;
    }
    return imgs[0]?.url || null;
  };

  // Get parameter overrides from selected variants
  const getParameterOverrides = (): Record<string, any> => {
    const overrides: Record<string, any> = {};
    if (!model?.variantGroups) return overrides;
    for (const group of model.variantGroups) {
      const selectedOptId = selectedVariants[group.id];
      if (selectedOptId) {
        const opt = group.options.find((o) => o.id === selectedOptId);
        if (opt?.parameterOverrides) {
          Object.assign(overrides, opt.parameterOverrides);
        }
      }
    }
    return overrides;
  };

  // Get quick specs from parameters marked as isQuickSpec, with variant overrides applied
  const getQuickSpecs = () => {
    if (!model?.parameters) return [];
    const overrides = getParameterOverrides();
    return model.parameters
      .filter((p) => p.isQuickSpec)
      .sort((a, b) => (a.quickSpecOrder || 0) - (b.quickSpecOrder || 0))
      .map((p) => {
        const hasOverride = p.label in overrides;
        const rawValue = hasOverride ? overrides[p.label] : p.value;
        // Parse JSON-stored value
        let displayValue = rawValue;
        if (typeof rawValue === "string") {
          try {
            displayValue = JSON.parse(rawValue);
          } catch {
            displayValue = rawValue;
          }
        }
        return {
          label: p.quickSpecLabel || p.label,
          value: displayValue,
          unit: hasOverride ? "" : p.unit || "",
          hasOverride,
        };
      })
      .filter((qs) => qs.value != null && qs.value !== "");
  };

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
    if (quoteSubmitting) return;
    if (!quoteName || !quoteEmail || !quoteMessage) return;
    setQuoteSubmitting(true);

    // Build configuration object from current selections
    const buildConfiguration = () => {
      if (!model) return undefined;

      const variants: Array<{
        groupName: string;
        optionName: string;
        priceModifier?: number;
      }> = [];
      if (model.variantGroups) {
        for (const group of model.variantGroups) {
          const selectedOptId = selectedVariants[group.id];
          if (selectedOptId) {
            const opt = group.options.find((o: any) => o.id === selectedOptId);
            if (opt) {
              variants.push({
                groupName: group.name,
                optionName: opt.name,
                priceModifier: Number(opt.priceModifier) || 0,
              });
            }
          }
        }
      }

      const quickSpecs = getQuickSpecs().map((qs) => ({
        label: qs.label,
        value: String(qs.value),
        unit: qs.unit || undefined,
      }));

      return {
        variants: variants.length > 0 ? variants : undefined,
        quickSpecs: quickSpecs.length > 0 ? quickSpecs : undefined,
        totalPrice: formatPrice(calculateTotalPrice()) + " PLN",
      };
    };

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
          configuration: buildConfiguration(),
        }),
      });

      if (response.ok) {
        setQuoteSubmitting(false);
        setQuoteModalOpen(false);
        setQuoteName("");
        setQuoteEmail("");
        setQuotePhone("");
        setQuoteMessage("");
        window.dispatchEvent(
          new CustomEvent("rippa-toast", {
            detail: {
              message:
                "Dziękujemy za zapytanie! Potwierdzenie wysłaliśmy na Twój email.",
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
    } finally {
      setQuoteSubmitting(false);
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

      // Initialize default variant selections from model-level variant groups
      const defaults: Record<string, string> = {};
      if (data.variantGroups) {
        data.variantGroups.forEach((group: any) => {
          const defaultOpt = group.options.find((o: any) => o.isDefault);
          if (defaultOpt) {
            defaults[group.id] = defaultOpt.id;
          } else if (group.options.length > 0) {
            defaults[group.id] = group.options[0].id;
          }
        });
      }
      setSelectedVariants(defaults);

      // Set accessories from model API response
      if (data.accessories && Array.isArray(data.accessories)) {
        setAccessories(data.accessories);
      }
    } catch (error) {
      console.error("Error fetching model:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailClick = () => {
    if (!model) return;
    const subject = `Zapytanie o ${model.name}`;
    const body = `Proszę o wycenę dla modelu ${model.name} (ID: ${model.id}).\nLink: ${window.location.href}\n\nDodatkowe informacje:`;
    window.location.href = `mailto:info@rippa.pl?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;
  };

  if (isLoading) {
      return (
        <LoadingScreen message="Ładowanie produktu..." />
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

  // Hero image: use variant-aware hero
  const heroImageUrl = getEffectiveHeroUrl();

  // Gallery images: use variant-aware gallery
  const effectiveImages = getEffectiveImages();
  const galleryImageUrl =
    effectiveImages[selectedImageIndex]?.url || effectiveImages[0]?.url;

  // Nowoczesny Hero z animacją: tylko zdjęcie w tle
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419]">
      <UnifiedNavbar />

      {/* Hero Section - Modern Full-Screen Design */}
      <section
        className="relative bg-transparent min-h-screen w-full flex items-start justify-center transition-opacity duration-500 pt-20"
        style={{
          opacity: Math.max(0, 1 - scrollY / (isMobile ? 500 : 600)),
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
                {hasVariants ? "Twoja konfiguracja" : "Cena startowa"}
              </p>
              <p className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf]">
                {hasVariants ? "" : "Od "}
                {formatPrice(totalPrice)} PLN
              </p>
              {hasVariants && totalPrice !== Number(model.price) && (
                <p className="text-sm text-[#8b92a9] mt-1 line-through">
                  Cena bazowa: {formatPrice(Number(model.price))} PLN
                </p>
              )}
            </div>

            {/* Variant Configurator */}
            {hasVariants && (
              <div className="space-y-3 py-3">
                {model.variantGroups!.map((group) => {
                  const selectedOptId = selectedVariants[group.id];
                  return (
                    <div key={group.id} className="space-y-1.5">
                      <p className="text-xs font-medium text-[#8b92a9] uppercase tracking-wider">
                        {group.name}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.options.map((opt) => {
                          const isSelected = selectedOptId === opt.id;
                          const isBase = (Number(opt.priceModifier) || 0) === 0;
                          return (
                            <button
                              key={opt.id}
                              onClick={() => {
                                selectVariant(group.id, opt.id);
                                setSelectedImageIndex(0);
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                isSelected
                                  ? "bg-[#1b3caf]/20 text-white border border-[#1b3caf]/60"
                                  : "bg-white/5 text-[#9ca3b8] border border-white/10 hover:border-white/20 hover:text-white"
                              }`}
                            >
                              <span>{opt.name}</span>
                              {!isBase && (
                                <span
                                  className={`${
                                    isSelected
                                      ? "text-[#0f9fdf]"
                                      : "text-[#6b7280]"
                                  }`}
                                >
                                  +{formatPrice(Number(opt.priceModifier))}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Description - Clean text without background */}
            <p className="text-lg sm:text-xl text-[#d0d8e6] leading-relaxed font-light max-w-lg">
              {model.heroDescription || model.description}
            </p>

            {/* Quick Specs */}
            {(() => {
              const quickSpecs = getQuickSpecs();
              if (quickSpecs.length === 0) return null;
              const cols =
                quickSpecs.length <= 3
                  ? `grid-cols-${quickSpecs.length}`
                  : "grid-cols-2 sm:grid-cols-4";
              return (
                <div
                  className={`grid ${cols} gap-3 py-4 border-t border-b border-white/10`}
                >
                  {quickSpecs.map((qs, i) => (
                    <div key={i}>
                      <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                        {qs.label}
                      </p>
                      <p
                        className={`text-lg font-bold ${qs.hasOverride ? "text-[#0f9fdf]" : "text-white"}`}
                      >
                        {qs.value}
                        {qs.unit ? ` ${qs.unit}` : ""}
                      </p>
                    </div>
                  ))}
                </div>
              );
            })()}

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
                    {effectiveImages.length > 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            selectedImageIndex === 0
                              ? effectiveImages.length - 1
                              : selectedImageIndex - 1,
                          )
                        }
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition duration-300 z-10 backdrop-blur-sm border border-white/20"
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </button>
                    )}

                    {/* Right Arrow */}
                    {effectiveImages.length > 1 && (
                      <button
                        onClick={() =>
                          setSelectedImageIndex(
                            selectedImageIndex === effectiveImages.length - 1
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
                    {effectiveImages.length > 1 && (
                      <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm border border-white/20">
                        {selectedImageIndex + 1} / {effectiveImages.length}
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
              {effectiveImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {effectiveImages.map((image: any, index: number) => (
                    <button
                      key={image.id || index}
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
                    {hasVariants ? "Twoja konfiguracja" : "Cena od"}
                  </p>
                  <p className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf]">
                    {formatPrice(totalPrice)} PLN
                  </p>
                  {hasVariants && totalPrice !== Number(model.price) && (
                    <p className="text-xs text-[#8b92a9] mt-1 line-through">
                      Cena bazowa: {formatPrice(Number(model.price))} PLN
                    </p>
                  )}
                </div>

                {/* Sidebar Variant Configurator */}
                {hasVariants && (
                  <div className="mb-6 pb-6 border-b border-white/10 space-y-3">
                    {model.variantGroups!.map((group) => {
                      const selectedOptId = selectedVariants[group.id];
                      return (
                        <div key={group.id} className="space-y-1.5">
                          <p className="text-xs font-medium text-[#8b92a9] uppercase tracking-wider">
                            {group.name}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.options.map((opt) => {
                              const isSelected = selectedOptId === opt.id;
                              const isBase =
                                (Number(opt.priceModifier) || 0) === 0;
                              return (
                                <button
                                  key={opt.id}
                                  onClick={() => {
                                    selectVariant(group.id, opt.id);
                                    setSelectedImageIndex(0);
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                    isSelected
                                      ? "bg-[#1b3caf]/20 text-white border border-[#1b3caf]/60"
                                      : "bg-white/5 text-[#9ca3b8] border border-white/10 hover:border-white/20 hover:text-white"
                                  }`}
                                >
                                  <span>{opt.name}</span>
                                  {!isBase && (
                                    <span
                                      className={`${
                                        isSelected
                                          ? "text-[#0f9fdf]"
                                          : "text-[#6b7280]"
                                      }`}
                                    >
                                      +{formatPrice(Number(opt.priceModifier))}
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Quick Specs */}
                {(() => {
                  const quickSpecs = getQuickSpecs();
                  if (quickSpecs.length === 0) return null;
                  return (
                    <div className="grid grid-cols-2 gap-3 mb-6 py-6 border-t border-b border-white/10">
                      {quickSpecs.map((qs, i) => (
                        <div key={i}>
                          <p className="text-xs uppercase tracking-wide text-[#8b92a9] mb-1">
                            {qs.label}
                          </p>
                          <p
                            className={`text-lg font-bold ${qs.hasOverride ? "text-[#0f9fdf]" : "text-white"}`}
                          >
                            {qs.value}
                            {qs.unit ? ` ${qs.unit}` : ""}
                          </p>
                        </div>
                      ))}
                    </div>
                  );
                })()}

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
              <div className="relative p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/[7%] to-white/[2%] backdrop-blur-sm">
                <div className="absolute -inset-px rounded-2xl pointer-events-none" />
                <h3 className="text-white font-bold mb-2 text-lg">Potrzebujesz pomocy?</h3>
                <p className="text-[#8b92a9] text-sm mb-4">Skontaktuj się z nami — pomożemy z wyceną i finansowaniem.</p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <a href="tel:+48787148016" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-transparent hover:bg-white/5 transition text-white font-medium border border-white/6">
                    <Phone className="w-4 h-4 text-[#1b3caf]" />
                    <span className="text-sm">+48 787 148 016</span>
                  </a>
                  <a href="mailto:info@rippa.pl" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-transparent hover:bg-white/5 transition text-white font-medium border border-white/6">
                    <Mail className="w-4 h-4 text-[#1b3caf]" />
                    <span className="text-sm">info@rippa.pl</span>
                  </a>
                </div>

                <button
                  onClick={() => setQuoteModalOpen(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-semibold rounded-lg hover:scale-105 transition">
                  Wyślij zapytanie
                </button>
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

        {/* Specs Section with Tabs */}
        <section className="py-20 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-white mb-12 text-center bg-gradient-to-r from-[#1b3caf] via-white to-[#0f9fdf] bg-clip-text text-transparent">
              Specyfikacja techniczna
            </h2>

            {model.parameters && model.parameters.length > 0 ? (
              (() => {
                const overrides = getParameterOverrides();

                // Filter out parameters with empty values
                const filledParameters = model.parameters.filter((p: any) => {
                  const overrideValue = overrides[p.label];
                  const hasOverride = overrideValue !== undefined;
                  const val = hasOverride ? overrideValue : p.value;
                  if (val === null || val === undefined || val === "") return false;
                  if (typeof val === "string") {
                    try {
                      const parsed = JSON.parse(val);
                      if (parsed === null || parsed === "" || parsed === undefined) return false;
                    } catch {
                      // not JSON, use raw
                    }
                  }
                  return true;
                });

                if (filledParameters.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <p className="text-[#6b7280] text-lg">
                        Parametry techniczne nie zostały jeszcze zdefiniowane dla tego
                        modelu.
                      </p>
                    </div>
                  );
                }

                // Group parameters by 'group' field
                const grouped = filledParameters.reduce((acc: any, p: any) => {
                  const groupName = p.group || "Ogólne";
                  if (!acc[groupName]) acc[groupName] = [];
                  acc[groupName].push(p);
                  return acc;
                }, {});

                const groupNames = Object.keys(grouped);

                // SVG Icons for parameter groups
                const getGroupIcon = (groupName: string) => {
                  const name = groupName.toLowerCase();
                  if (name.includes("silnik") || name.includes("engine")) {
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    );
                  }
                  if (name.includes("wymiar") || name.includes("dimension")) {
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                        />
                      </svg>
                    );
                  }
                  if (name.includes("hydraul") || name.includes("hydro")) {
                    return (
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    );
                  }
                  // Default icon
                  return (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                      />
                    </svg>
                  );
                };

                return (
                  <>
                    {/* Tabs Navigation */}
                    <div className="flex justify-center mb-8">
                      <div className="inline-flex flex-wrap gap-2 bg-white/5 p-2 rounded-xl border border-white/10">
                        {groupNames.map((groupName, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveParamTab(idx)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                              activeParamTab === idx
                                ? "bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white shadow-lg shadow-blue-500/30"
                                : "text-[#b0b0b0] hover:text-white hover:bg-white/5"
                            }`}
                          >
                            {getGroupIcon(groupName)}
                            {groupName}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tab Content */}
                    {(() => {
                      return groupNames.map(
                        (groupName, idx) =>
                          activeParamTab === idx && (
                            <div
                              key={idx}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn"
                            >
                              {grouped[groupName].map((param: any) => {
                                const overrideValue = overrides[param.label];
                                const hasOverride = overrideValue !== undefined;
                                const displayValue = hasOverride
                                  ? overrideValue
                                  : param.type === "boolean"
                                    ? param.value
                                      ? "Tak"
                                      : "Nie"
                                    : param.value;

                                return (
                                  <div
                                    key={param.id}
                                    className={`bg-white/5 p-6 rounded-xl border transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 ${
                                      hasOverride
                                        ? "border-[#0f9fdf]/40 bg-[#0f9fdf]/5"
                                        : "border-white/10 hover:border-[#1b3caf]/50"
                                    }`}
                                  >
                                    <div className="flex justify-between items-start">
                                      <span className="text-[#b0b0b0] text-sm font-medium">
                                        {param.label}
                                      </span>
                                      <span
                                        className={`font-bold text-lg ${hasOverride ? "text-[#0f9fdf]" : "text-white"}`}
                                      >
                                        {displayValue}
                                        {!hasOverride &&
                                          param.unit &&
                                          ` ${param.unit}`}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ),
                      );
                    })()}
                  </>
                );
              })()
            ) : (
              <div className="text-center py-12">
                <p className="text-[#6b7280] text-lg">
                  Parametry techniczne nie zostały jeszcze zdefiniowane dla tego
                  modelu.
                </p>
              </div>
            )}
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

                        {/* Description - rich text or plain text */}
                        {section.text.includes("<") ? (
                          <div
                            className="text-[#d0d8e6] text-lg md:text-xl leading-relaxed font-light prose-section"
                            dangerouslySetInnerHTML={{ __html: section.text }}
                          />
                        ) : (
                          <p className="text-[#d0d8e6] text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-light">
                            {section.text}
                          </p>
                        )}
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
                    <div className="max-w-4xl mx-auto text-center">
                      {/* Decorative accent line */}
                      <div className="flex items-center justify-center gap-4 mb-8">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#1b3caf]/60" />
                        <div className="w-2 h-2 rounded-full bg-[#1b3caf]" />
                        <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#1b3caf]/60" />
                      </div>

                      {/* Title - centered */}
                      <h3 className="text-4xl md:text-5xl font-bold text-white mb-8 tracking-tight">
                        {section.title}
                      </h3>

                      {/* Description - rich text or plain text, centered */}
                      {section.text.includes("<") ? (
                        <div
                          className="text-[#d0d8e6] text-lg md:text-xl leading-relaxed font-light prose-section mx-auto max-w-3xl"
                          dangerouslySetInnerHTML={{ __html: section.text }}
                        />
                      ) : (
                        <p className="text-[#d0d8e6] text-lg md:text-xl leading-relaxed whitespace-pre-wrap font-light mx-auto max-w-3xl">
                          {section.text}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ===== PRICE SUMMARY (when variants exist) ===== */}
        {hasVariants && totalPrice !== Number(model.price) && (
          <section className="py-8 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm max-w-md mx-auto">
                <h3 className="text-lg font-bold text-white mb-4">
                  Podsumowanie konfiguracji
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#8b92a9]">Cena bazowa</span>
                    <span className="text-white">
                      {formatPrice(Number(model.price))} PLN
                    </span>
                  </div>
                  {model.variantGroups?.map((group) => {
                    const selectedOptId = selectedVariants[group.id];
                    const opt = group.options.find(
                      (o) => o.id === selectedOptId,
                    );
                    if (!opt || (Number(opt.priceModifier) || 0) === 0)
                      return null;
                    return (
                      <div
                        key={group.id}
                        className="flex justify-between text-sm"
                      >
                        <span className="text-[#8b92a9]">{opt.name}</span>
                        <span className="text-amber-400">
                          + {formatPrice(Number(opt.priceModifier))} PLN
                        </span>
                      </div>
                    );
                  })}
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between items-end">
                    <span className="text-white font-semibold text-lg">
                      Razem
                    </span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf]">
                      {formatPrice(totalPrice)} PLN
                    </span>
                  </div>
                </div>
              </div>
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

        {/* Accessories Section */}
        {accessories.length > 0 && (
          <section className="py-16 border-t border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-white mb-2">
                Polecane produkty
              </h2>
              <p className="text-[#b0b0b0] mb-8">
                Sprawdź kompatybilne produkty
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {accessories.map((acc) => (
                  <Link
                    key={acc.id}
                    href={`/products/${acc.id}`}
                    className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-[#1b3caf]/40 transition-all duration-300 group block"
                  >
                    <div className="aspect-square bg-white/5 relative overflow-hidden">
                      {acc.imageUrl ? (
                        <img
                          src={acc.imageUrl}
                          alt={acc.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-[#6b7280]" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-white font-semibold text-lg mb-1">
                        {acc.name}
                      </h3>
                      {acc.description && (
                        <p className="text-[#b0b0b0] text-sm line-clamp-2 mb-3">
                          {acc.description}
                        </p>
                      )}
                      {acc.price && (
                        <p className="text-[#1b3caf] font-bold text-lg">
                          {formatPrice(Number(acc.price))} PLN
                        </p>
                      )}
                      <span className="text-[#0f9fdf] text-sm mt-2 inline-block group-hover:underline">
                        Zobacz szczegóły →
                      </span>
                    </div>
                  </Link>
                ))}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
                    <span className="text-xs text-[#8b92a9] mt-2">Dostępne od pon. do pt. 8:00–18:00</span>
                  </a>

                  {/* Email */}
                  <button
                    onClick={handleEmailClick}
                    className="group flex flex-col items-center p-6 bg-white/5 border border-white/10 rounded-xl hover:border-[#1b3caf]/50 hover:bg-white/10 transition duration-300 text-left"
                  >
                    <Mail className="w-8 h-8 text-[#1b3caf] mb-3 group-hover:scale-110 transition" />
                    <span className="text-sm text-[#8b92a9] mb-1">Napisz do nas</span>
                    <div className="text-lg font-semibold text-white truncate">info@rippa.pl</div>
                    <div className="text-xs text-[#8b92a9] mt-2">Wyślemy ofertę i warianty finansowania</div>
                  </button>
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

      <Footer />

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

      {/* Chat Widget removed from product page */}

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
                disabled={quoteSubmitting}
                className={`w-full bg-gradient-to-r from-[#1b3caf] to-[#0f9fdf] text-white font-bold py-3 rounded-lg transition-all duration-300 ${quoteSubmitting ? "opacity-60 cursor-not-allowed" : "hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105"}`}
              >
                {quoteSubmitting ? "Wysyłanie..." : "Wyślij zapytanie"}
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
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
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
