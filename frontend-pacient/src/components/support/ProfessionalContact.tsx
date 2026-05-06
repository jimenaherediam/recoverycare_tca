import { ArrowLeft, Phone, Mail, Video, MessageSquare, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const professionals = [
  {
    name: "Dra. Laura Méndez",
    role: "Psiquiatra de referencia",
    phone: "+34 911 234 567",
    email: "lmendez@recoverycare.es",
    initials: "LM",
  },
  {
    name: "Carlos Ruiz",
    role: "Psicólogo clínico",
    phone: "+34 911 234 568",
    email: "cruiz@recoverycare.es",
    initials: "CR",
  },
  {
    name: "Ana Torres",
    role: "Nutricionista",
    phone: "+34 911 234 569",
    email: "atorres@recoverycare.es",
    initials: "AT",
  },
];

const ProfessionalContact = ({ onBack }: { onBack: () => void }) => {
  const { toast } = useToast();

  const handleAction = (label: string, value: string) => {
    toast({ title: label, description: value });
  };

  return (
    <div className="min-h-screen pb-20 px-5 pt-6 bg-gradient-to-b from-background to-muted/30">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Contactar profesional</h1>
      </div>

      <div className="mb-4 p-4 rounded-2xl bg-destructive/10 border border-destructive/30 flex gap-3">
        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-foreground">¿Es una urgencia?</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Llama al <a href="tel:112" className="font-bold text-destructive">112</a> o al teléfono de la esperanza{" "}
            <a href="tel:717003717" className="font-bold text-destructive">717 003 717</a>.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {professionals.map((p) => (
          <div key={p.name} className="rounded-2xl bg-card border border-border/60 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center font-bold text-primary text-sm">
                {p.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.role}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <a
                href={`tel:${p.phone}`}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Llamar</span>
              </a>
              <a
                href={`mailto:${p.email}`}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Email</span>
              </a>
              <button
                onClick={() => handleAction("Videollamada", `Solicitud enviada a ${p.name}`)}
                className="flex flex-col items-center gap-1 py-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span className="text-[10px] font-semibold">Vídeo</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => handleAction("Mensaje al equipo", "Tu equipo te responderá en menos de 24h")}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity"
      >
        <MessageSquare className="w-4 h-4" />
        Enviar mensaje al equipo
      </button>
    </div>
  );
};

export default ProfessionalContact;
