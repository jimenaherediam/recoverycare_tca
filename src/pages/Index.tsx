import { User, Bell, UtensilsCrossed, BookOpen, HeartHandshake, Plus, ArrowLeft, Clock } from "lucide-react";
import { useState } from "react";
import selfHugImg from "@/assets/self-hug.png";

const HomeTab = ({ onNavigate }: { onNavigate: (tab: TabId) => void }) => (
  <div className="h-screen flex flex-col items-center px-6 pt-6 pb-20 overflow-hidden"
    style={{
      background: "linear-gradient(180deg, hsl(45 100% 88%) 0%, hsl(320 60% 85%) 60%, hsl(263 50% 70%) 100%)",
    }}
  >
    {/* Top bar */}
    <div className="w-full flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center">
        <User className="w-4 h-4 text-primary" />
      </div>
      <Bell className="w-5 h-5 text-primary" />
    </div>

    <h1 className="text-xl font-bold text-foreground">Hola Andrea</h1>

    <img src={selfHugImg} alt="Autocuidado" width={130} height={130} className="my-2 opacity-80" />

    <p className="text-sm font-medium text-foreground/80">Bienvenid@ a</p>
    <h2 className="text-4xl font-extrabold text-primary leading-none text-center tracking-tight">
      Recovery<br />Care
    </h2>

    {/* Recovery tracker */}
    <div className="mt-3 mb-3 w-full rounded-2xl bg-card/60 backdrop-blur-sm py-2.5 px-4 text-center border border-border/50">
      <p className="text-xs text-muted-foreground font-medium">Tu recuperación</p>
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="text-3xl font-extrabold text-primary">Día 5</span>
        <span className="text-muted-foreground text-xs">de 14</span>
      </div>
    </div>

    {/* Action buttons */}
    <div className="w-full space-y-2.5 flex-shrink-0">
      <ActionButton icon={UtensilsCrossed} label="Ir a registro de comidas" onClick={() => onNavigate("food")} />
      <ActionButton icon={BookOpen} label="Mi historial" />
      <ActionButton icon={HeartHandshake} label="Ir a soporte terapéutico" />
    </div>
  </div>
);

const ActionButton = ({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) => (
  <button onClick={onClick} className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-3 px-6 text-primary-foreground font-semibold text-sm shadow-lg hover:opacity-90 transition-opacity">
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

/* ============ FOOD LOG SCREEN ============ */

type Meal = { id: number; name: string; time: string; type: string };

const mealTypes = ["Desayuno", "Almuerzo", "Comida", "Merienda", "Cena"] as const;

const FoodTab = ({ onBack }: { onBack: () => void }) => {
  const [meals, setMeals] = useState<Meal[]>([
    { id: 1, name: "Tostada integral con aguacate", time: "08:30", type: "Desayuno" },
    { id: 2, name: "Manzana", time: "11:00", type: "Almuerzo" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<string>(mealTypes[0]);

  const addMeal = () => {
    if (!newName.trim()) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMeals([...meals, { id: Date.now(), name: newName.trim(), time, type: newType }]);
    setNewName("");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen flex flex-col pb-20"
      style={{
        background: "linear-gradient(180deg, hsl(45 100% 92%) 0%, hsl(320 50% 92%) 100%)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card/70 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Registro de comidas</h1>
      </div>

      {/* Today summary */}
      <div className="mx-5 rounded-2xl bg-card/70 backdrop-blur-sm p-4 border border-border/50 mb-4">
        <p className="text-xs text-muted-foreground font-medium">Hoy</p>
        <p className="text-2xl font-extrabold text-primary">{meals.length} comidas</p>
      </div>

      {/* Meal list */}
      <div className="flex-1 px-5 space-y-2.5 overflow-y-auto">
        {meals.map((meal) => (
          <div key={meal.id} className="flex items-center gap-3 rounded-xl bg-card/80 p-3.5 border border-border/40">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
              <UtensilsCrossed className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-card-foreground truncate">{meal.name}</p>
              <p className="text-xs text-muted-foreground">{meal.type}</p>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs">{meal.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="px-5 py-4 space-y-3 bg-card/90 backdrop-blur-lg border-t border-border/50">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="¿Qué has comido?"
            className="w-full rounded-xl bg-muted/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/40"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {mealTypes.map((t) => (
              <button
                key={t}
                onClick={() => setNewType(t)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  newType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowForm(false)} className="flex-1 rounded-full py-2.5 text-sm font-semibold text-muted-foreground bg-muted/60">
              Cancelar
            </button>
            <button onClick={addMeal} className="flex-1 rounded-full py-2.5 text-sm font-semibold bg-primary text-primary-foreground shadow-lg">
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

/* ============ TABS & NAVIGATION ============ */

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
      {activeTab === "home" && <HomeTab onNavigate={setActiveTab} />}
      {activeTab === "food" && <FoodTab onBack={() => setActiveTab("home")} />}
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