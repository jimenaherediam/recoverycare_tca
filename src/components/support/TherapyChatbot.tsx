import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { streamChat, ApiError } from "@/lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const TherapyChatbot = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const firstName = profile?.nombre?.split(" ")[0] || "";
  const greeting = firstName
    ? `Hola ${firstName}, soy tu asistente de apoyo. Estoy aquí para escucharte y acompañarte. ¿Cómo te sientes hoy?`
    : "Hola, soy tu asistente de apoyo. Estoy aquí para escucharte. ¿Cómo te sientes hoy?";

  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: greeting }]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const send = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    let assistantStarted = false;

    try {
      for await (const chunk of streamChat(next)) {
        assistantSoFar += chunk;
        if (!assistantStarted) {
          assistantStarted = true;
          setMessages((prev) => [...prev, { role: "assistant", content: assistantSoFar }]);
        } else {
          setMessages((prev) => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m)));
        }
      }
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo conectar con el asistente.";
      toast({ title: "Error", description: msg, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-background to-muted/30">
      <div className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-border/50 bg-card/60 backdrop-blur-sm">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <div>
          <h1 className="text-base font-bold text-foreground">Asistente de apoyo</h1>
          <p className="text-[11px] text-muted-foreground">Disponible 24/7 · No sustituye a un profesional</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-24">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-card border border-border/60 text-foreground rounded-bl-md"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/60 px-3.5 py-2.5 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-14 left-0 right-0 max-w-md mx-auto px-4 py-3 bg-card/80 backdrop-blur-lg border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Escribe tu mensaje..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-full bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            onClick={send}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapyChatbot;
