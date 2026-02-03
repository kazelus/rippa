import React, { useEffect, useState } from "react";

interface ChatSession {
  id: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  messages: {
    id: string;
    content: string;
    sender: string;
    createdAt: string;
  }[];
}

const AdminChatPage = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selected, setSelected] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/admin/chat")
      .then((res) => res.json())
      .then(setSessions);
  }, []);

  useEffect(() => {
    if (selected) {
      fetch(`/api/admin/chat/messages?sessionId=${selected.id}`)
        .then((res) => res.json())
        .then(setMessages);
    }
  }, [selected]);

  return (
    <div className="flex h-[80vh]">
      <div className="w-1/3 border-r overflow-y-auto">
        <h2 className="p-4 font-bold text-lg">Rozmowy</h2>
        {sessions.map((s) => (
          <div
            key={s.id}
            className={`p-4 border-b cursor-pointer hover:bg-gray-100 ${selected?.id === s.id ? "bg-gray-100" : ""}`}
            onClick={() => setSelected(s)}
          >
            <div className="font-semibold">{s.phone || "Gość"}</div>
            <div className="text-xs text-gray-500">
              {new Date(s.updatedAt).toLocaleString()}
            </div>
            <div className="text-sm mt-1 line-clamp-1">
              {s.messages[0]?.content}
            </div>
          </div>
        ))}
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b font-bold text-lg">Wiadomości</div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`mb-2 text-sm ${msg.sender === "user" ? "text-right" : "text-left"}`}
            >
              <span
                className={`inline-block px-3 py-2 rounded-lg ${msg.sender === "user" ? "bg-[#1b3caf] text-white" : "bg-gray-200 text-gray-800"}`}
              >
                {msg.content}
              </span>
              <span className="block text-xs text-gray-400 mt-1">
                {new Date(msg.createdAt).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminChatPage;
