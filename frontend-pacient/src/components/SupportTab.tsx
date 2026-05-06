import { useState } from "react";
import { ArrowLeft, BookOpen, Phone, MessageCircle, Mail, Video, ChevronRight } from "lucide-react";
import EducationalContent from "./support/EducationalContent";
import ProfessionalContact from "./support/ProfessionalContact";
import TherapyChatbot from "./support/TherapyChatbot";

type Section = "menu" | "education" | "contact" | "chatbot";

const SupportTab = ({ onBack }: { onBack: () => void }) => {
  const [section, setSection] = useState<Section>("menu");

  if (section === "education") return <EducationalContent onBack={() => setSection("menu")} />;
  if (section === "contact") return <ProfessionalContact onBack={() => setSection("menu")} />;
  if (section === "chatbot") return <TherapyChatbot onBack={() => setSection("menu")} />;

  const items = [
    {
      id: "education" as const,
      icon: BookOpen,
      title: "Contenido educativo",
      desc: "Aprende sobre TCA y ansiedad",
    },
    {
      id: "contact" as const,
      icon: Phone,
      title: "Contactar profesional",
      desc: "Habla con tu equipo médico",
    },
    {
      id: "chatbot" as const,
      icon: MessageCircle,
      title: "Asistente de apoyo",
      desc: "Chatbot disponible 24/7",
    },
  ];

  return (
    <div className="min-h-screen pb-20 px-5 pt-6 bg-gradient-to-b from-background to-muted/30">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Soporte terapéutico</h1>
      </div>

      <p className="text-sm text-muted-foreground mb-5">
        Recursos y acompañamiento para tu proceso de recuperación.
      </p>

      <div className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 shadow-sm hover:bg-accent/40 transition-colors text-left"
            >
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SupportTab;
