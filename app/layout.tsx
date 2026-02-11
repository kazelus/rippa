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
  title: "Rippa Polska - Mini-koparki klasy premium",
  description:
    "Profesjonalne mini-koparki do zastosowań przemysłowych. Niezawodność, precyzja i serwis w Polsce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
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
