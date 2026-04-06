"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, User, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import Link from "next/link";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const suggestedPrompts = [
  "Find me a warm beach trip under $500",
  "Cheapest weekend getaway from YEG",
  "Best time to fly to Europe this summer",
  "Compare flights to Tokyo vs Seoul",
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiUsage, setAiUsage] = useState<{
    messages_used: number;
    messages_limit: number;
    model: string;
  } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sub = useSubscription();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const isFree = sub.tier === "free";
  const isPremium = sub.tier === "premium";

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMessage: ChatMessage = { role: "user", content: text.trim() };
    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages,
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.upgrade) {
        setMessages([
          ...history,
          {
            role: "assistant",
            content:
              "The AI Travel Advisor is available on Pro and Premium plans. Upgrade to start chatting about your next trip!",
          },
        ]);
      } else if (res.status === 429 && data.limit_reached) {
        setMessages([
          ...history,
          {
            role: "assistant",
            content: `You've used all ${data.limit} AI messages for today. Your limit resets at midnight UTC. ${
              data.tier === "pro"
                ? "Upgrade to Premium for 50 messages/day with our best AI model."
                : ""
            }`,
          },
        ]);
      } else if (!res.ok) {
        setMessages([
          ...history,
          {
            role: "assistant",
            content: data.error || "Something went wrong. Please try again.",
          },
        ]);
      } else {
        setMessages([
          ...history,
          { role: "assistant", content: data.response },
        ]);
        if (data.usage) {
          setAiUsage(data.usage);
        }
      }
    } catch {
      setMessages([
        ...history,
        {
          role: "assistant",
          content: "Network error. Please check your connection and try again.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // Free tier gate
  if (isFree) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center px-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 mb-6">
          <Lock className="size-8 text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          AI Travel Advisor
        </h1>
        <p className="text-muted-foreground max-w-md mb-8">
          Chat with AI to find the perfect trip. Get personalized flight
          recommendations, destination ideas, and booking tips.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/pricing">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white min-h-[44px] px-6">
              Upgrade to Pro — 15 messages/day
            </Button>
          </Link>
        </div>
        <div className="mt-6 text-xs text-muted-foreground space-y-1">
          <p>
            <strong className="text-slate-400">Pro:</strong> 15 messages/day
            (GPT-4o mini — fast responses)
          </p>
          <p>
            <strong className="text-amber-400">Premium:</strong> 50
            messages/day (GPT-4o — smarter, more detailed)
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Sparkles className="size-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                AI Travel Advisor
              </h1>
              <p className="text-sm text-muted-foreground">
                Tell me what you&apos;re looking for
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {aiUsage && (
              <Badge
                variant="outline"
                className="text-xs border-slate-700 text-slate-400"
              >
                {aiUsage.messages_used}/{aiUsage.messages_limit} messages
              </Badge>
            )}
            <Badge
              className={
                isPremium
                  ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  : "bg-blue-500/15 text-blue-400 border border-blue-500/30"
              }
            >
              {isPremium ? "GPT-4o" : "GPT-4o mini"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Sparkles className="size-12 text-blue-400/40 mb-4" />
            <h2 className="text-lg font-semibold text-slate-300 mb-2">
              What kind of trip are you looking for?
            </h2>
            <p className="text-sm text-muted-foreground max-w-md mb-8">
              I can help you find cheap flights, suggest destinations, compare
              routes, and give travel tips.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex items-start gap-2.5 max-w-[85%] md:max-w-[70%] ${
                msg.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <div
                className={`flex items-center justify-center size-7 rounded-full shrink-0 ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-500 to-indigo-600"
                    : "bg-slate-700"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="size-3.5 text-white" />
                ) : (
                  <Sparkles className="size-3.5 text-blue-400" />
                )}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                    : "bg-slate-800/80 border border-slate-700/50 text-slate-200"
                }`}
              >
                <div style={{ whiteSpace: "pre-wrap" }}>{msg.content}</div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-start gap-2.5">
              <div className="flex items-center justify-center size-7 rounded-full bg-slate-700 shrink-0">
                <Sparkles className="size-3.5 text-blue-400" />
              </div>
              <div className="rounded-2xl px-4 py-3 bg-slate-800/80 border border-slate-700/50">
                <div className="flex gap-1.5">
                  <span
                    className="size-2 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="size-2 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="size-2 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 pb-3">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => sendMessage(prompt)}
              className="rounded-full border border-slate-700 bg-slate-800/60 px-3.5 py-2 text-xs font-medium text-slate-300 hover:border-blue-500/40 hover:bg-slate-800 hover:text-blue-400 transition-all min-h-[44px]"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 border-t border-slate-800 pt-4"
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about flights, destinations, or travel tips..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30 min-h-[44px]"
          disabled={loading}
        />
        <Button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl min-h-[44px] min-w-[44px] px-4 shadow-md shadow-blue-500/15"
        >
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  );
}
