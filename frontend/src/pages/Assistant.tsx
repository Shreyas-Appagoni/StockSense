import React, { useState, useRef, useEffect } from "react";
import { apiService } from "../services/api";
import {
  Sparkles,
  Send,
  Bot,
  User,
  AlertCircle,
  RotateCcw,
  Wrench,
} from "lucide-react";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  toolCalls?: Array<{ tool: string; args?: any }>;
}

export const Assistant: React.FC = () => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your **StockSense AI Assistant**, powered by NVIDIA Nemotron. I can inspect real-time inventory balances, track stock movements across locations, analyze reorder thresholds, and check pending operations.\n\nHow can I help you manage your warehouse today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const examplePrompts = [
    "Which products are low on stock?",
    "How much inventory do we have?",
    "Why did Steel Rod stock change?",
    "What's pending today?",
    "Show recent transfers",
    "What needs attention?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setErrorMessage(null);
    setInputMessage("");

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      // Build history for backend
      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await apiService.sendAiChat(text, history);

      const assistantMsg: MessageItem = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: res.message,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        toolCalls: res.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setErrorMessage(
        err.message || "Failed to communicate with the StockSense AI Assistant."
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "Conversation history cleared. Ready for your next inventory analysis question!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorMessage(null);
  };

  // Helper to format assistant response with basic markdown (bold, lists, code, tables)
  const renderMessageContent = (content: string) => {
    const lines = content.split("\n");
    return (
      <div className="space-y-1.5 text-xs leading-relaxed">
        {lines.map((line, idx) => {
          if (!line.trim()) {
            return <div key={idx} className="h-1" />;
          }

          // Simple bold formatting replacement
          const formatted = line.replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
          );

          if (line.startsWith("- ") || line.startsWith("* ")) {
            return (
              <li
                key={idx}
                className="ml-3 list-disc"
                dangerouslySetInnerHTML={{ __html: formatted.slice(2) }}
              />
            );
          }

          if (line.startsWith("#")) {
            return (
              <p
                key={idx}
                className="font-bold text-slate-900 mt-2 text-sm"
                dangerouslySetInnerHTML={{ __html: formatted.replace(/^#+\s*/, "") }}
              />
            );
          }

          return (
            <p
              key={idx}
              dangerouslySetInnerHTML={{ __html: formatted }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900">
                AI Inventory Assistant
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 rounded-full font-mono">
                Nemotron-3-Ultra
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Natural-language inventory queries executing approved read-only tools against PostgreSQL
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearHistory}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Example Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 text-xs">
        <span className="font-semibold text-slate-400 whitespace-nowrap text-[11px]">
          Suggested queries:
        </span>
        {examplePrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-600 border border-slate-200 rounded-full transition-colors whitespace-nowrap text-[11px] font-medium disabled:opacity-50 shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-600 font-bold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Chat Messages Feed */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-2xs p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-3.5 space-y-2 ${
                  isUser
                    ? "bg-indigo-600 text-white shadow-2xs"
                    : "bg-slate-50 border border-slate-200 text-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-4 border-b border-black/5 pb-1">
                  <span className={`text-[10px] font-bold ${isUser ? "text-indigo-100" : "text-slate-500"}`}>
                    {isUser ? "You" : "StockSense AI"}
                  </span>
                  <span className={`text-[10px] ${isUser ? "text-indigo-200" : "text-slate-400"}`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Message Body */}
                {isUser ? (
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  renderMessageContent(msg.content)
                )}

                {/* Display invoked backend tools if any */}
                {!isUser && msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Wrench className="h-2.5 w-2.5" /> Tools used:
                    </span>
                    {msg.toolCalls.map((tc, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-indigo-50 border border-indigo-100 text-indigo-700"
                        title={tc.args ? JSON.stringify(tc.args) : undefined}
                      >
                        {tc.tool}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
                <span className="font-semibold text-indigo-700">
                  Querying NVIDIA Nemotron & inspecting live inventory data...
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Evaluating read-only tools and calculating database metrics.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about stock levels, low-stock items, product movements, or pending operations..."
            disabled={isLoading}
            className="flex-1 px-3.5 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 text-slate-800 disabled:opacity-50"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-40 shrink-0"
          >
            <Send className="h-3.5 w-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
