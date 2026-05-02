import { useEffect, useState } from "react";
import { Bell, CalendarCheck, Pill, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  icon: any;
  text: string;
  time: string;
  read: boolean;
};

const NotificationsSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setLoading(true);
      // Cargar citas próximas (próximas 48 horas)
      api.appointments()
        .then((citas) => {
          const now = new Date();
          const soon = citas
            .filter(c => {
              const citaDate = new Date(c.fecha);
              const diffHours = (citaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
              return diffHours > 0 && diffHours <= 48;
            })
            .map(c => ({
              id: `cita-${c.id_cita}`,
              icon: CalendarCheck,
              text: `Cita médica${c.motivo ? `: ${c.motivo}` : ''}`,
              time: new Date(c.fecha).toLocaleString("es-ES", {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              }),
              read: false,
            }));
          setNotifications(soon);
        })
        .catch(() => {
          setNotifications([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
        <SheetHeader className="p-4 pb-2 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-primary" /> Notificaciones
          </SheetTitle>
        </SheetHeader>
        <div className="divide-y divide-border/40 overflow-y-auto max-h-[calc(100vh-4rem)]">
          {loading ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">Cargando...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No hay notificaciones nuevas</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className={`flex items-start gap-3 p-4 ${!n.read ? "bg-primary/5" : ""}`}>
                <div className="mt-0.5 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <n.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsSheet;