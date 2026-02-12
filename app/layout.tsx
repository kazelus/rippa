import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "./providers";
import "./globals.css";

import ChatWidgetLoader from "@/components/ChatWidgetLoader";
import CookieBanner from "@/components/CookieBanner";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rippa Polska — Mini Koparki, Maszyny Budowlane",
  description:
    "Rippa Polska — mini koparki, maszyny budowlane, sprzedaż, serwis, części. Najlepsze ceny, szybka dostawa, profesjonalne doradztwo.",
  openGraph: {
    title: "Rippa Polska — Mini Koparki, Maszyny Budowlane",
    description:
      "Mini koparki, maszyny budowlane, sprzedaż, serwis, części. Najlepsze ceny, szybka dostawa, profesjonalne doradztwo.",
    url: "https://rippapolska.pl",
    siteName: "Rippa Polska",
    images: [
      {
        url: "https://rippapolska.pl/logo.png",
        width: 1200,
        height: 630,
        alt: "Rippa Polska logo",
      },
    ],
    locale: "pl_PL",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="keywords" content="mini koparki, maszyny budowlane, rippa, sprzedaż, serwis, części" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="pl_PL" />
        <meta property="og:site_name" content="Rippa Polska" />
        <link rel="canonical" href="https://rippapolska.pl" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content="Rippa Polska" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        <script type="application/ld+json" suppressHydrationWarning>{`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Rippa Polska",
            "url": "https://rippapolska.pl",
            "logo": "https://rippapolska.pl/logo.png",
            "contactPoint": [{
              "@type": "ContactPoint",
              "telephone": "+48-123-456-789",
              "contactType": "customer service",
              "areaServed": "PL",
              "availableLanguage": ["Polish", "English"]
            }]
          }
        `}</script>
      </head>
      <body className={`${poppins.variable}`}>
        <AuthProvider>
          {/* Preconnect to S3 if configured to speed up image delivery */}
          {process.env.S3_BUCKET && process.env.S3_REGION && (
            <>
              <link
                rel="preconnect"
                href={`https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com`}
              />
              <link
                rel="preconnect"
                href={`https://s3.${process.env.S3_REGION}.amazonaws.com`}
              />
            </>
          )}
          {children}
          {/* Pokazuj ChatWidget tylko poza panelem admina, także na stronie głównej i kategorii */}
          <ChatWidgetLoader />
          <CookieBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
