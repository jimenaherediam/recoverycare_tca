import { useState } from "react";
import HomeTab from "@/components/HomeTab";
import MealFlow, { type MealRecord } from "@/components/MealFlow";
import DiaryTab from "@/components/DiaryTab";
import SupportTab from "@/components/SupportTab";

const tabs = [
  { id: "home", label: "Inicio" },
  { id: "diary", label: "Diario" },
  { id: "support", label: "Soporte" },
] as const;

export type TabId = (typeof tabs)[number]["id"] | "meal-flow";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("home");
  const [mealRecords, setMealRecords] = useState<MealRecord[]>([]);

  const handleMealComplete = (record: MealRecord) => {
    setMealRecords((prev) => [...prev, record]);
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative">
      {activeTab === "home" && <HomeTab onNavigate={setActiveTab} />}
      {activeTab === "meal-flow" && (
        <MealFlow onBack={() => setActiveTab("home")} onComplete={handleMealComplete} />
      )}
      {activeTab === "diary" && (
        <DiaryTab onBack={() => setActiveTab("home")} mealRecords={mealRecords} />
      )}
      {activeTab === "support" && <SupportTab onBack={() => setActiveTab("home")} />}

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
