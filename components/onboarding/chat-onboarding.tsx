"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  GraduationCap,
  Home,
  Loader2,
  SendHorizontal,
  Sparkles,
  Wrench,
} from "lucide-react";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
import { sendChatMessage, getOrCreateThread } from "@/lib/api/chat";
import {
  setLanguage as apiSetLanguage,
  setPersona as apiSetPersona,
  addCatalogItem as apiAddCatalogItem,
  completeOnboarding as apiCompleteOnboarding,
} from "@/lib/api/onboarding";
import SetupAnimation from "./setup-animation";

interface ChatOnboardingProps {
  onComplete: () => void;
}

interface OnboardingMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

type OnboardingStep =
  | "init"          // Creating thread + getting AI greeting
  | "language"      // AI asked language, show language buttons
  | "greeting"      // Language set, AI asked persona, show persona buttons
  | "selecting"     // User clicked persona, loading
  | "catalog"       // Persona set, show pipeline + catalog form
  | "submitting"    // Catalog submit in progress
  | "done";         // Complete, about to show animation

const LANGUAGES = [
  { id: "hinglish", label: "Hinglish", description: "Hindi + English mix", example: "Aapka kaam easy ho jayega!" },
  { id: "english", label: "English", description: "Pure English", example: "Your work just got easier!" },
  { id: "hindi", label: "Hindi", description: "शुद्ध हिंदी", example: "आपका काम आसान हो जाएगा!" },
] as const;

const PERSONAS = [
  { id: "interior_designer", label: "Interior Designer", icon: Home },
  { id: "photographer", label: "Photographer", icon: Camera },
  { id: "coach", label: "Coach / Consultant", icon: GraduationCap },
  { id: "other", label: "Other", icon: Wrench },
] as const;

const CATALOG_EXAMPLES: Record<string, { name: string; price: string }> = {
  interior_designer: { name: "Modular Kitchen", price: "250000" },
  photographer: { name: "Wedding Package", price: "35000" },
  coach: { name: "Monthly Package", price: "5000" },
  other: { name: "Service Package", price: "10000" },
};

export default function ChatOnboarding({ onComplete }: ChatOnboardingProps) {
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [threadId, setThreadId] = useState<number | null>(null);
  const [step, setStep] = useState<OnboardingStep>("init");
  const [showSetup, setShowSetup] = useState(false);

  // Step-based UI state
  const [pipelineStages, setPipelineStages] = useState<{ name: string; color: string }[]>([]);
  const [catalogName, setCatalogName] = useState("");
  const [catalogPrice, setCatalogPrice] = useState("");

  const bottomRef = useRef<HTMLDivElement>(null);
  const initCalledRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, step]);

  // Single init — create thread, send "hi", AI asks language
  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    const init = async () => {
      setIsLoading(true);
      try {
        const thread = await getOrCreateThread({
          context_type: "onboarding",
          context_id: null,
        });
        setThreadId(thread.thread_id);

        const response = await sendChatMessage({
          message: "hi",
          context_type: "onboarding",
          thread_id: thread.thread_id,
        });

        setMessages([{
          id: "msg_greeting",
          role: "assistant",
          content: response.reply,
        }]);
        setStep("language");
      } catch {
        setMessages([{
          id: "msg_error",
          role: "assistant",
          content: "Something went wrong. Please refresh and try again.",
        }]);
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, []);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, role, content },
    ]);
  };

  // Handle language selection
  const handleLanguageSelect = useCallback(
    async (languageId: string) => {
      if (isLoading || !threadId) return;

      const label = LANGUAGES.find((l) => l.id === languageId)?.label ?? languageId;
      setIsLoading(true);
      addMessage("user", label);

      try {
        // 1. Save language preference
        await apiSetLanguage(languageId);

        // 2. Tell AI — it will now respond in chosen language and ask persona
        const response = await sendChatMessage({
          message: `I chose ${label}`,
          context_type: "onboarding",
          thread_id: threadId,
        });
        addMessage("assistant", response.reply);
        setStep("greeting");
      } catch {
        addMessage("assistant", "Something went wrong. Please try again.");
        setStep("language");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, threadId]
  );

  // Handle persona selection
  const handlePersonaSelect = useCallback(
    async (personaId: string) => {
      if (isLoading || !threadId) return;

      const label = PERSONAS.find((p) => p.id === personaId)?.label ?? personaId;
      setStep("selecting");
      setIsLoading(true);
      addMessage("user", label);

      try {
        const personaResult = await apiSetPersona(personaId);
        setPipelineStages(personaResult.pipeline_stages);

        const response = await sendChatMessage({
          message: `I selected: ${label}`,
          context_type: "onboarding",
          thread_id: threadId,
        });
        addMessage("assistant", response.reply);

        const example = CATALOG_EXAMPLES[personaId] || CATALOG_EXAMPLES.other;
        setCatalogName(example.name);
        setCatalogPrice(example.price);
        setStep("catalog");
      } catch {
        addMessage("assistant", "Oops, something went wrong. Please try again.");
        setStep("greeting");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, threadId]
  );

  // Handle catalog item submission
  const handleCatalogSubmit = useCallback(async () => {
    if (!threadId || step !== "catalog") return;
    if (!catalogName.trim() || !catalogPrice) return;

    setStep("submitting");
    setIsLoading(true);
    addMessage("user", `${catalogName.trim()} — ₹${Number(catalogPrice).toLocaleString("en-IN")}`);

    try {
      await apiAddCatalogItem(catalogName.trim(), parseFloat(catalogPrice));
      await apiCompleteOnboarding("chat");

      const response = await sendChatMessage({
        message: `I added "${catalogName.trim()}" at ₹${catalogPrice}. Setup is complete now.`,
        context_type: "onboarding",
        thread_id: threadId,
      });
      addMessage("assistant", response.reply);
    } catch {
      await apiCompleteOnboarding("chat").catch(() => {});
      addMessage("assistant", "Item added! Aapka workspace ready hai.");
    }

    setStep("done");
    setIsLoading(false);
    setTimeout(() => setShowSetup(true), 1500);
  }, [threadId, step, catalogName, catalogPrice]);

  // Handle catalog skip
  const handleCatalogSkip = useCallback(async () => {
    if (!threadId || step !== "catalog") return;

    setStep("submitting");
    setIsLoading(true);
    addMessage("user", "Skip for now");

    try {
      await apiCompleteOnboarding("chat");
      const response = await sendChatMessage({
        message: "Skip. Complete the setup.",
        context_type: "onboarding",
        thread_id: threadId,
      });
      addMessage("assistant", response.reply);
    } catch {
      addMessage("assistant", "Sab set ho gaya! Aapka workspace ready hai.");
    }

    setStep("done");
    setIsLoading(false);
    setTimeout(() => setShowSetup(true), 1500);
  }, [threadId, step]);

  // Freeform text input
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading || !threadId) return;

      addMessage("user", text.trim());
      setInput("");
      setIsLoading(true);

      try {
        const response = await sendChatMessage({
          message: text.trim(),
          context_type: "onboarding",
          thread_id: threadId,
        });
        addMessage("assistant", response.reply);

        if (
          response.reply.toLowerCase().includes("sab set") ||
          response.reply.toLowerCase().includes("workspace ready")
        ) {
          setStep("done");
          setTimeout(() => setShowSetup(true), 1500);
        }
      } catch {
        addMessage("assistant", "Something went wrong. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, threadId]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSendMessage(input);
    }
  };

  if (showSetup) {
    return <SetupAnimation onComplete={onComplete} />;
  }

  return (
    <div className="flex h-dvh flex-col bg-zinc-50">
      {/* Header */}
      <div className="flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-semibold">SellnSettle</h1>
          <p className="text-xs text-zinc-500">Setting up your workspace</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs text-zinc-400">AI Active</span>
        </div>
      </div>

      {/* Messages + interactive blocks */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-lg space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-white border border-zinc-200 text-zinc-800 rounded-bl-md shadow-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <ChatMarkdown content={msg.content} />
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))}

          {/* ── Step-based interactive blocks ── */}

          {/* Language buttons — shown when step is "language" */}
          {step === "language" && !isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-col gap-2 max-w-[85%] w-full">
                {LANGUAGES.map(({ id, label, description, example }) => (
                  <button
                    key={id}
                    onClick={() => void handleLanguageSelect(id)}
                    className="w-full rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-semibold text-zinc-800">{label}</span>
                        <span className="ml-2 text-xs text-zinc-400">{description}</span>
                      </div>
                      {id === "hinglish" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-400 italic">&quot;{example}&quot;</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Persona buttons — shown when step is "greeting" */}
          {step === "greeting" && !isLoading && (
            <div className="flex justify-start">
              <div className="grid grid-cols-2 gap-2.5 max-w-[85%]">
                {PERSONAS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => void handlePersonaSelect(id)}
                    className="flex items-center gap-2.5 rounded-xl border-2 border-zinc-200 bg-white px-4 py-3 text-left transition-all hover:border-primary hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
                  >
                    <Icon className="h-5 w-5 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-700">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline preview — shown when step is "catalog" */}
          {step === "catalog" && pipelineStages.length > 0 && (
            <div className="flex justify-start">
              <div className="max-w-[90%] rounded-xl border border-zinc-200 bg-gradient-to-br from-white to-zinc-50 p-4 shadow-sm">
                <div className="mb-3 flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                    Pipeline Ready
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {pipelineStages.map((stage, index) => (
                    <div key={stage.name} className="flex items-center gap-1.5">
                      <span
                        className="rounded-full px-3 py-1.5 text-xs font-semibold text-white shadow-sm"
                        style={{ backgroundColor: stage.color }}
                      >
                        {stage.name}
                      </span>
                      {index < pipelineStages.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-zinc-300" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Catalog form — shown when step is "catalog" */}
          {step === "catalog" && !isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[90%] w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-sm space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Add your first item
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={catalogName}
                    onChange={(e) => setCatalogName(e.target.value)}
                    placeholder="Item or service name"
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-zinc-400 pl-1">₹</span>
                    <input
                      type="number"
                      value={catalogPrice}
                      onChange={(e) => setCatalogPrice(e.target.value)}
                      placeholder="Price"
                      className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => void handleCatalogSubmit()}
                    disabled={!catalogName.trim() || !catalogPrice}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                  >
                    Add & Continue
                  </button>
                  <button
                    onClick={() => void handleCatalogSkip()}
                    className="rounded-lg border border-zinc-200 px-4 py-2.5 text-sm text-zinc-500 hover:bg-zinc-50 transition-colors"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-zinc-200 bg-white px-4 py-2.5 text-sm text-zinc-500 shadow-sm">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your reply..."
            rows={1}
            disabled={isLoading || step === "done"}
            className="flex-1 resize-none rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-50"
          />
          <button
            onClick={() => void handleSendMessage(input)}
            disabled={isLoading || !input.trim() || step === "done"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            <SendHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
