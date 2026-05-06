import { User, MapPin, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const ProfileSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const { profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Sesión cerrada" });
    onOpenChange(false);
  };

  const nombre = profile?.nombre || "—";
  const localidad = profile?.localidad || "Sin especificar";
  const dni = profile?.dni || "—";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
        <SheetHeader className="p-4 pb-2 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" /> Mi perfil
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">{nombre}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {localidad}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Nombre</p>
              <p className="text-sm font-medium text-foreground">{nombre}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">DNI</p>
              <p className="text-sm font-medium text-foreground">{dni}</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Localidad</p>
              <p className="text-sm font-medium text-foreground">{localidad}</p>
            </div>
          </div>

          <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
