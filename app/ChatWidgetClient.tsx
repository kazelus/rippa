// ChatWidgetClient.tsx
"use client";
import ChatWidget from "@/components/ChatWidget";

export default function ChatWidgetClient() {
  if (
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin")
  ) {
    return null;
  }
  return <ChatWidget phone="+48787148016" />;
}
