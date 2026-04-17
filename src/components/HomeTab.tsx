import { useState } from "react";
import { User, Bell, UtensilsCrossed, BookOpen, HeartHandshake } from "lucide-react";
import abrazoImg from "@/assets/abrazo.png";
import ActionButton from "./ActionButton";
import NotificationsSheet from "./NotificationsSheet";
import ProfileSheet from "./ProfileSheet";
import { useAuth } from "@/hooks/useAuth";
import type { TabId } from "@/pages/Index";

const HomeTab = ({ onNavigate }: { onNavigate: (tab: TabId) => void }) => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { profile } = useAuth();
  const firstName = profile?.nombre?.split(" ")[0] || "";

  return (
    <div className="h-screen flex flex-col items-center px-6 pt-6 pb-20 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(45 100% 88%) 0%, hsl(320 60% 85%) 60%, hsl(263 50% 70%) 100%)",
      }}
    >
      <div className="w-full flex items-center justify-between mb-3">
        <button onClick={() => setProfileOpen(true)} className="w-9 h-9 rounded-full border-2 border-primary flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </button>
        <button onClick={() => setNotifOpen(true)} className="relative">
          <Bell className="w-5 h-5 text-primary" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-destructive rounded-full border-2 border-background" />
        </button>
      </div>

      <h1 className="text-xl font-bold text-foreground">Hola {firstName}</h1>

      <img src={abrazoImg} alt="Abrazo de autocuidado" width={150} height={130} className="my-2 opacity-90 object-contain" />

      <p className="text-sm font-medium text-foreground/80">Bienvenid@ a</p>
      <h2 className="text-4xl font-extrabold text-primary leading-none text-center tracking-tight">
        Recovery<br />Care
      </h2>

      <div className="mt-3 mb-3 w-full rounded-2xl bg-card/60 backdrop-blur-sm py-2.5 px-4 text-center border border-border/50">
        <p className="text-xs text-muted-foreground font-medium">Tu recuperación</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-3xl font-extrabold text-primary">Día 5</span>
          <span className="text-muted-foreground text-xs">de 14</span>
        </div>
      </div>

      <div className="w-full space-y-2.5 flex-shrink-0">
        <ActionButton icon={UtensilsCrossed} label="Voy a comer" onClick={() => onNavigate("meal-flow")} />
        <ActionButton icon={BookOpen} label="Mi historial" onClick={() => onNavigate("diary")} />
        <ActionButton icon={HeartHandshake} label="Ir a soporte terapéutico" onClick={() => onNavigate("support")} />
      </div>

      <NotificationsSheet open={notifOpen} onOpenChange={setNotifOpen} />
      <ProfileSheet open={profileOpen} onOpenChange={setProfileOpen} />
    </div>
  );
};

export default HomeTab;
