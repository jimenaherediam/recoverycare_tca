import { useState } from "react";
import { User, MapPin, Lock, LogOut, Eye, EyeOff } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const ProfileSheet = ({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) => {
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSavePassword = () => {
    if (newPassword.length < 6) {
      toast({ title: "La contraseña debe tener al menos 6 caracteres", variant: "destructive" });
      return;
    }
    toast({ title: "Contraseña actualizada correctamente" });
    setChangingPassword(false);
    setNewPassword("");
  };

  const handleLogout = () => {
    toast({ title: "Sesión cerrada" });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-[85vw] max-w-sm p-0">
        <SheetHeader className="p-4 pb-2 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2 text-base">
            <User className="w-4 h-4 text-primary" /> Mi perfil
          </SheetTitle>
        </SheetHeader>

        <div className="p-4 space-y-5">
          {/* Avatar + name */}
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div>
              <p className="font-bold text-foreground">Andrea García López</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" /> Madrid, España
              </p>
            </div>
          </div>

          {/* Info fields */}
          <div className="space-y-3">
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Nombre</p>
              <p className="text-sm font-medium text-foreground">Andrea</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Apellidos</p>
              <p className="text-sm font-medium text-foreground">García López</p>
            </div>
            <div className="rounded-xl bg-muted/40 p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Localidad</p>
              <p className="text-sm font-medium text-foreground">Madrid, España</p>
            </div>
          </div>

          {/* Change password */}
          {!changingPassword ? (
            <Button variant="outline" className="w-full gap-2" onClick={() => setChangingPassword(true)}>
              <Lock className="w-4 h-4" /> Cambiar contraseña
            </Button>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Nueva contraseña</p>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSavePassword} className="flex-1">Guardar</Button>
                <Button size="sm" variant="ghost" onClick={() => { setChangingPassword(false); setNewPassword(""); }} className="flex-1">Cancelar</Button>
              </div>
            </div>
          )}

          {/* Logout */}
          <Button variant="destructive" className="w-full gap-2" onClick={handleLogout}>
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ProfileSheet;
