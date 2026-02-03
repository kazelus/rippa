"use client";

import Link from "next/link";
import React from "react";

export default function AdminTile({
  href,
  title,
  children,
}: {
  href: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="block">
      <div className="bg-[#1a1f2e] hover:bg-[#232a3a] hover:scale-105 transition rounded-xl p-6 flex flex-col items-center shadow border border-[#1b3caf]/30 cursor-pointer h-full">
        <div className="w-12 h-12 mb-3 flex items-center justify-center text-white">
          {children}
        </div>
        <span className="font-bold text-white text-lg text-center">
          {title}
        </span>
      </div>
    </Link>
  );
}
