import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from "./providers";
import "./globals.css";

import ChatWidgetClient from "./ChatWidgetClient";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Rippa Polska - Mini-koparki klasy premium",
  description:
    "Profesjonalne mini-koparki do zastosowań przemysłowych. Niezawodność, precyzja i serwis w Polsce.",
  lang: "pl",
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
          {children}
          {/* Pokazuj ChatWidget tylko poza panelem admina, także na stronie głównej i kategorii */}
          <ChatWidgetClient />
        </AuthProvider>
      </body>
    </html>
  );
}
