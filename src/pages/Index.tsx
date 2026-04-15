import { User, Bell, UtensilsCrossed, BookOpen, HeartHandshake } from "lucide-react";
import { useState } from "react";
import selfHugImg from "@/assets/self-hug.png";

const HomeTab = () => (
  <div className="min-h-screen flex flex-col items-center px-6 pt-10 pb-8"
    style={{
      background: "linear-gradient(180deg, hsl(45 100% 88%) 0%, hsl(320 60% 85%) 60%, hsl(263 50% 70%) 100%)",
    }}
  >
    {/* Top bar */}
    <div className="w-full flex items-center justify-between mb-6">
      <div className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center">
        <User className="w-5 h-5 text-primary" />
      </div>
      <Bell className="w-6 h-6 text-primary" />
    </div>

    {/* Greeting */}
    <h1 className="text-2xl font-bold text-foreground">Hola Andrea</h1>

    {/* Illustration */}
    <img
      src={selfHugImg}
      alt="Abrazo de autocuidado"
      width={200}
      height={200}
      className="my-4 opacity-80"
    />

    {/* Welcome */}
    <p className="text-lg font-medium text-foreground/80 mb-1">Bienvenid@ a</p>
    <h2 className="text-5xl font-extrabold text-primary leading-tight text-center tracking-tight">
      Recovery<br />Care
    </h2>

    {/* Recovery day tracker */}
    <div className="mt-6 mb-6 w-full rounded-2xl bg-card/60 backdrop-blur-sm p-4 text-center border border-border/50">
      <p className="text-sm text-muted-foreground font-medium">Tu recuperación</p>
      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-4xl font-extrabold text-primary">Día 5</span>
        <span className="text-muted-foreground text-sm">de 14</span>
      </div>
    </div>

    {/* Action buttons */}
    <div className="w-full space-y-3">
      <ActionButton icon={UtensilsCrossed} label="Ir a registro de comidas" />
      <ActionButton icon={BookOpen} label="Mi historial" />
      <ActionButton icon={HeartHandshake} label="Ir a soporte terapéutico" />
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label }: { icon: any; label: string }) => (
  <button className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3.5 px-6 text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity">
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const tabs = [
  { id: "home", label: "Inicio" },
  { id: "food", label: "Comidas" },
  { id: "diary", label: "Diario" },
  { id: "meds", label: "Medicación" },
  { id: "support", label: "Soporte" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const PlaceholderTab = ({ name }: { name: string }) => (
  <div className="flex items-center justify-center h-[80vh]">
    <p className="text-muted-foreground text-lg">{name}</p>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");

  return (
    <div className="min-h-screen max-w-md mx-auto relative">
      {activeTab === "home" && <HomeTab />}
      {activeTab === "food" && <PlaceholderTab name="Registro de Comidas" />}
      {activeTab === "diary" && <PlaceholderTab name="Mi Diario" />}
      {activeTab === "meds" && <PlaceholderTab name="Medicación" />}
      {activeTab === "support" && <PlaceholderTab name="Soporte Terapéutico" />}

      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t border-border/50">
        <div className="max-w-md mx-auto flex justify-around py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))]">
          {tabs.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors text-[10px] font-semibold ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full mb-0.5 ${active ? "bg-primary" : "bg-transparent"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Index;