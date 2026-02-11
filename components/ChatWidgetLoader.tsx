"use client";

import dynamic from "next/dynamic";

const ChatWidgetClient = dynamic(() => import("../app/ChatWidgetClient"), {
  ssr: false,
});

export default function ChatWidgetLoader() {
  return <ChatWidgetClient />;
}
