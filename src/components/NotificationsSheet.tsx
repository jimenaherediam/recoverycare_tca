import { Bell, CalendarCheck, Pill, MessageCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

const mockNotifications = [
  { id: 1, icon: Pill, text: "Recuerda tomar tu antidepresivo", time: "Hace 1h", read: false },
  { id: 2, icon: CalendarCheck, text: "Cita médica mañana a las 10:00", time: "Hace 3h", read: false },
  { id: 3, icon: MessageCircle, text: "Tu terapeuta te ha enviado un mensaje", time: "Ayer", read: true },
  { id: 4, icon: Pill, text: "Medicación registrada correctamente", time: "Ayer", read: true },
];

const NotificationsSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent side="right" className="w-[85vw] max-w-sm p-0">
      <SheetHeader className="p-4 pb-2 border-b border-border/50">
        <SheetTitle className="flex items-center gap-2 text-base">
          <Bell className="w-4 h-4 text-primary" /> Notificaciones
        </SheetTitle>
      </SheetHeader>
      <div className="divide-y divide-border/40 overflow-y-auto max-h-[calc(100vh-4rem)]">
        {mockNotifications.map((n) => (
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
        ))}
      </div>
    </SheetContent>
  </Sheet>
);

export default NotificationsSheet;
