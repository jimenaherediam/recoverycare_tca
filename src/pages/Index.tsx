import { Heart, ClipboardList, MessageCircle, CalendarDays, User } from "lucide-react";
import { useState } from "react";

const tabs = [
  { id: "home", label: "Inicio", icon: Heart },
  { id: "symptoms", label: "Síntomas", icon: ClipboardList },
  { id: "messages", label: "Mensajes", icon: MessageCircle },
  { id: "calendar", label: "Citas", icon: CalendarDays },
  { id: "profile", label: "Perfil", icon: User },
] as const;

type TabId = (typeof tabs)[number]["id"];

const HomeTab = () => (
  <div className="px-5 pt-6 pb-24 space-y-6">
    <div>
      <p className="text-muted-foreground text-sm">Buenos días 👋</p>
      <h1 className="text-2xl font-bold text-foreground">María García</h1>
    </div>

    <div className="rounded-2xl bg-primary p-5 text-primary-foreground space-y-2">
      <p className="text-sm font-medium opacity-90">Tu recuperación</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-4xl font-bold">Día 5</p>
          <p className="text-sm opacity-80">de 14 estimados</p>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-primary-foreground/30 flex items-center justify-center">
          <span className="text-lg font-bold">36%</span>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Acciones pendientes</h2>
      <div className="space-y-2">
        {[
          { title: "Registrar síntomas diarios", time: "Hoy, antes de las 20:00", urgent: true },
          { title: "Tomar medicación", time: "14:00 - Ibuprofeno 600mg", urgent: false },
          { title: "Ejercicios de rehabilitación", time: "Serie 2 de 3", urgent: false },
        ].map((task) => (
          <div key={task.title} className="flex items-center gap-3 rounded-xl bg-card p-4 shadow-sm border border-border">
            <div className={`w-2 h-2 rounded-full ${task.urgent ? "bg-accent" : "bg-primary"}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-card-foreground text-sm">{task.title}</p>
              <p className="text-muted-foreground text-xs">{task.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Próxima cita</h2>
      <div className="rounded-xl bg-card p-4 shadow-sm border border-border flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
          <CalendarDays className="w-6 h-6 text-secondary-foreground" />
        </div>
        <div>
          <p className="font-medium text-card-foreground text-sm">Dr. López - Revisión</p>
          <p className="text-muted-foreground text-xs">Lunes 21 Abr · 10:30</p>
        </div>
      </div>
    </div>
  </div>
);

const PlaceholderTab = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-[60vh]">
    <p className="text-muted-foreground text-lg">{name}</p>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <div className="min-h-screen max-w-md mx-auto relative bg-background">
      {activeTab === "home" && <HomeTab />}
      {activeTab === "symptoms" && <PlaceholderTab name="Registro de Síntomas" />}
      {activeTab === "messages" && <PlaceholderTab name="Mensajes" />}
      {activeTab === "calendar" && <PlaceholderTab name="Citas" />}
      {activeTab === "profile" && <PlaceholderTab name="Perfil" />}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border safe-area-pb">
        <div className="max-w-md mx-auto flex justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;