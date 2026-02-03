"use client";

import { UnifiedNavbar } from "@/components/UnifiedNavbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { ProductStory } from "@/components/ProductStory";
import { Models } from "@/components/Models";
import { Applications } from "@/components/Applications";
import { Stats } from "@/components/Stats";
import { Service } from "@/components/Service";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <UnifiedNavbar />
      <Hero />
      <Features />
      <ProductStory />
      <Models />
      <Applications />
      <Stats />
      <Service />
      <Footer />
    </>
  );
}
