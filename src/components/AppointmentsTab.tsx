import { useEffect, useState } from "react";
import { ArrowLeft, Stethoscope, Calendar } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

type Cita = {
  id_cita: number;
  fecha: string;
  motivo: string | null;
  id_paciente: number;
  id_profesional: number;
};

const AppointmentsTab = ({ onBack }: { onBack: () => void }) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.appointments()
      .then((data) => setCitas(data))
      .catch((e) => {
        const msg = e instanceof ApiError ? e.message : "Error cargando citas";
        toast({ 
          title: "No se pudieron cargar las citas", 
          description: msg, 
          variant: "destructive" 
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const upcoming = citas.filter(c => new Date(c.fecha) >= now);
  const past = citas.filter(c => new Date(c.fecha) < now);

  return (
    <div className="min-h-screen flex flex-col pb-20"
      style={{ background: "linear-gradient(180deg, hsl(45 100% 92%) 0%, hsl(320 50% 92%) 100%)" }}
    >
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full bg-card/70 flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-primary" />
        </button>
        <h1 className="text-xl font-bold text-foreground">Mis citas</h1>
      </div>

      <div className="px-5 space-y-4 flex-1">
        {loading && <p className="text-xs text-muted-foreground">Cargando…</p>}

        {!loading && upcoming.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">Próximas citas</h3>
            {upcoming.map((c) => (
              <div key={c.id_cita} className="rounded-xl bg-card/80 p-4 border border-border/40">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/15 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-card-foreground">
                      {new Date(c.fecha).toLocaleDateString("es-ES", { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(c.fecha).toLocaleTimeString("es-ES", { 
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                    {c.motivo && (
                      <p className="text-sm text-foreground mt-2">{c.motivo}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && past.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-foreground">Citas pasadas</h3>
            {past.slice(0, 5).map((c) => (
              <div key={c.id_cita} className="rounded-xl bg-card/60 p-3 border border-border/30 opacity-60">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.fecha).toLocaleDateString("es-ES")} · {c.motivo || "Sin motivo"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && citas.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="w-12 h-12 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No tienes citas programadas</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsTab;