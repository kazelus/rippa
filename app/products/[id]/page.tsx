import { getModelById } from "@/lib/models";
import { notFound, redirect } from "next/navigation";
import { ProductClient } from "./ProductClient";
import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Footer } from "@/components/Footer";
import { Metadata } from "next";

const BASE_URL = "https://rippapolska.pl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const model = await getModelById(id);

  if (!model) {
    return { title: "Produkt nie znaleziony | Rippa Polska" };
  }

  const title = `${model.name} — Mini Koparka | Rippa Polska`;
  const description =
    model.heroDescription ||
    model.description ||
    `Kup ${model.name} w Rippa Polska. Autoryzowany dealer mini koparek w Polsce. Cena od ${Number(model.price).toLocaleString("pl-PL")} PLN.`;
  const imageUrl =
    model.images && model.images.length > 0 ? model.images[0].url : undefined;
  const productUrl = `${BASE_URL}/products/${model.slug || id}`;

  return {
    title,
    description,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title,
      description,
      url: productUrl,
      siteName: "Rippa Polska",
      locale: "pl_PL",
      type: "website",
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: model.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const model = await getModelById(id);

  if (!model) {
    notFound();
  }

  // 301 Redirect from UUID to new SEO slug
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  if (isUuid && model.slug) {
    redirect(`/products/${model.slug}`);
  }

  const productUrl = `${BASE_URL}/products/${model.slug || id}`;
  const imageUrl =
    model.images && model.images.length > 0 ? model.images[0].url : null;

  // Product JSON-LD — klucz do Google Rich Results (cena, dostępność)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: model.name,
    description:
      model.heroDescription ||
      model.description ||
      `Mini koparka ${model.name} — Rippa Polska`,
    url: productUrl,
    ...(imageUrl && {
      image: model.images.map((img) => img.url),
    }),
    brand: {
      "@type": "Brand",
      name: "Rippa",
    },
    manufacturer: {
      "@type": "Organization",
      name: "Rippa",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "PLN",
      price: String(model.price),
      availability: "https://schema.org/InStock",
      url: productUrl,
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
      seller: {
        "@type": "Organization",
        name: "Rippa Polska",
        url: BASE_URL,
      },
    },
  };

  // BreadcrumbList JSON-LD dla tego produktu
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Strona główna",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Katalog",
        item: `${BASE_URL}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: model.name,
        item: productUrl,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1419] via-[#1a1f2e] to-[#0f1419] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <UnifiedNavbar />
      <ProductClient initialModel={model} />
      <Footer />
    </div>
  );
}
