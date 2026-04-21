import { useEffect, useState } from "react";
import { ArrowLeft, UtensilsCrossed, Pill, Stethoscope, AlertTriangle } from "lucide-react";
import type { MealRecord } from "./MealFlow";
import { api, ApiError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type ServerHistory = {
  comidas: any[];
  citas: any[];
  alertas: any[];
};

const DiaryTab = ({
  onBack,
  mealRecords,
}: {
  onBack: () => void;
  mealRecords: MealRecord[];
}) => {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [history, setHistory] = useState<ServerHistory | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    api.dayHistory(selectedDate)
      .then((data) => { if (!cancel) setHistory(data); })
      .catch((e) => {
        if (cancel) return;
        const msg = e instanceof ApiError ? e.message : "Error cargando historial";
        toast({ title: "No se pudo cargar el historial", description: msg, variant: "destructive" });
        setHistory({ comidas: [], citas: [], alertas: [] });
      })
      .finally(() => { if (!cancel) setLoading(false); });
    return () => { cancel = true; };
  }, [selectedDate]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const dayNames = ["L", "M", "X", "J", "V", "S", "D"];
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

  const recoveryStartDate = new Date(today);
  recoveryStartDate.setDate(today.getDate() - 4);
  const isRecoveryDay = (day: number) => {
    const d = new Date(currentYear, currentMonth, day);
    return d >= recoveryStartDate && d <= today;
  };
  const hasDataForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return mealRecords.some((m) => m.date === dateStr) || isRecoveryDay(day);
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else setCurrentMonth(currentMonth - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else setCurrentMonth(currentMonth + 1);
  };

  const meals = history?.comidas ?? [];
  const citas = history?.citas ?? [];
  const alertas = history?.alertas ?? [];

  return (
    <div className="min-h-screen flex flex-col pb-20"
      style={{ background: "linear-gradient(180deg, hsl(45 100% 92%) 0%, hsl(320 50% 92%) 100%)" }}
    >
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card/70 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Mi historial</h1>
      </div>

      <div className="mx-5 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevMonth} className="text-primary font-bold text-lg px-2">‹</button>
          <span className="font-bold text-foreground">{monthNames[currentMonth]} {currentYear}</span>
          <button onClick={nextMonth} className="text-primary font-bold text-lg px-2">›</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {dayNames.map((d) => (
            <span key={d} className="text-[10px] font-semibold text-muted-foreground">{d}</span>
          ))}
          {Array.from({ length: adjustedFirstDay }).map((_, i) => (<div key={`empty-${i}`} />))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === today.toISOString().split("T")[0];
            const hasData = hasDataForDay(day);
            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateStr)}
                className={`relative w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center transition-colors ${
                  isSelected ? "bg-primary text-primary-foreground"
                  : isToday ? "bg-primary/20 text-primary font-bold"
                  : "text-foreground hover:bg-muted/50"
                }`}
              >
                {day}
                {hasData && !isSelected && (<span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-primary" />)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="px-5 space-y-3 flex-1">
        <h3 className="text-sm font-bold text-foreground">
          {selectedDate === today.toISOString().split("T")[0] ? "Hoy" : selectedDate}
        </h3>

        {loading && <p className="text-xs text-muted-foreground">Cargando…</p>}

        {!loading && meals.length > 0 ? meals.map((m: any) => (
          <div key={m.id_comida} className="rounded-xl bg-card/80 p-3 border border-border/40 space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                <UtensilsCrossed className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-card-foreground">{m.menu_descripcion || "Comida registrada"}</p>
                <p className="text-xs text-muted-foreground">{m.acompanado ? "Acompañado/a" : "Solo/a"}</p>
              </div>
            </div>
            {m.analisis?.resumen && (
              <p className="text-[11px] italic text-muted-foreground pl-12">"{m.analisis.resumen}"</p>
            )}
          </div>
        )) : !loading && (
          <div className="flex items-center gap-3 rounded-xl bg-card/60 p-3 border border-border/30">
            <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sin comidas registradas</p>
          </div>
        )}

        {citas.length > 0 ? citas.map((c: any) => (
          <div key={c.id_cita} className="flex items-center gap-3 rounded-xl bg-card/80 p-3 border border-border/40">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary" />
            </div>
            <p className="font-semibold text-sm text-card-foreground">
              {new Date(c.fecha).toLocaleString("es-ES")} {c.motivo ? `· ${c.motivo}` : ""}
            </p>
          </div>
        )) : !loading && (
          <div className="flex items-center gap-3 rounded-xl bg-card/60 p-3 border border-border/30">
            <Stethoscope className="w-4 h-4 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Sin citas médicas</p>
          </div>
        )}

        {alertas.length > 0 && alertas.map((a: any) => (
          <div key={a.id_alerta} className="flex items-center gap-3 rounded-xl bg-destructive/5 p-3 border border-destructive/20">
            <div className="w-9 h-9 rounded-lg bg-destructive/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="font-semibold text-xs text-foreground">{a.nivel} · {a.tipo_alerta}</p>
              <p className="text-[11px] text-muted-foreground">{a.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiaryTab;
