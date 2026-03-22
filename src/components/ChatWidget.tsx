"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Pershendetje! 👋 Jam asistenti virtual i Korean Cars. Si mund t'ju ndihmoj? Mund te pyes per:\n\n• Cmimet e veturave\n• Proceduren e importit\n• Garancine dhe inspektimin\n• Cdo gje tjeter rreth veturave koreane",
};

// Simple AI responses based on keywords
function getAutoResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("cmim") || lower.includes("pris") || lower.includes("kush") || lower.includes("sa")) {
    return "Cmimet tona fillojne nga 5,000€ per vetura te perdorura. Te gjitha cmimet perfshijne 10% marzhen tone te sherbimit. Per nje cmim te sakte, ju lutem zgjidhni veturen qe ju intereson dhe na kontaktoni permes WhatsApp.";
  }

  if (lower.includes("import") || lower.includes("dokument") || lower.includes("dogana")) {
    return "Procesi i importit perfshin:\n\n1. Zgjedhjen e vetures nga katalogu yne\n2. Pagesen e parapagimit (30%)\n3. Transportin detar nga Korea (3-5 jave)\n4. Zhdoganimin dhe regjistrimin\n\nNe e menaxhojme te gjithe procesin per ju!";
  }

  if (lower.includes("garanc") || lower.includes("sigur")) {
    return "Shumica e veturave tona vijne me garanci origjinale te prodhuesit. Gjithashtu, veturat e inspektuara kane kaluar kontrollin teknik te Encar Korea. Per sigurimin, ne ju ndihmojme me gjetjen e ofertave me te mira.";
  }

  if (lower.includes("transport") || lower.includes("dergim") || lower.includes("derges")) {
    return "Transporti behet me anije nga Korea ne portin me te afert. Koha e transportit eshte zakonisht 3-5 jave. Ne e menaxhojme te gjithe logjistiken per ju.";
  }

  if (lower.includes("hyundai") || lower.includes("kia") || lower.includes("genesis")) {
    return "Kemi nje zgjedhje te gjere te veturave Hyundai, Kia dhe Genesis. Shikoni katalogun tone per te gjitha modelet e disponueshme. Per keshilla specifike, na kontaktoni ne WhatsApp!";
  }

  if (lower.includes("pershendet") || lower.includes("tungjatj") || lower.includes("hello") || lower.includes("hi")) {
    return "Pershendetje! Si mund t'ju ndihmoj sot? Jam ketu per t'ju ndihmuar me cdo pyetje rreth veturave koreane.";
  }

  if (lower.includes("faleminderit") || lower.includes("falemnderit") || lower.includes("rrofsh")) {
    return "Ju faleminderit! Nese keni pyetje te tjera, mos hezitoni te pyesni. Per bisede me te detajuar, na shkruani ne WhatsApp!";
  }

  return "Faleminderit per pyetjen! Per pergjigje me te detajuara, ju rekomandoj te na kontaktoni drejtperdrejt:\n\n📱 WhatsApp: +383 44 123 456\n📸 Instagram: @koreancars\n\nEkipi yne do t'ju pergjigjet brenda 24 oreve!";
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking delay
    setTimeout(() => {
      const response = getAutoResponse(userMessage.content);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <>
      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col max-h-[70vh] animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-lg">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold">Korean Cars AI</h3>
                <span className="text-xs text-blue-200 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>
                  Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white/10 rounded-lg p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-br-md"
                      : "bg-gray-100 text-gray-800 rounded-bl-md"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Shkruani mesazhin tuaj..."
                className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white p-2.5 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat toggle button (separate from contact buttons) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 ${
          isOpen ? "bg-gray-700" : "bg-blue-600 animate-pulse-slow"
        }`}
      >
        {isOpen ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" />
          </svg>
        )}
      </button>
    </>
  );
}
