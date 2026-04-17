import { useState } from "react";
import { Home, Eye, EyeOff } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { dniToEmail } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Mode = "login" | "register";

const dniRegex = /^[0-9]{8}[A-Za-z]$/;

const loginSchema = z.object({
  nombre: z.string().trim().min(1, "Introduce tu nombre").max(80),
  dni: z.string().trim().regex(dniRegex, "DNI inválido (8 números + letra)"),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

const registerSchema = loginSchema.extend({
  codigoProfesional: z.string().trim().min(1, "Código requerido").max(50),
  repeatPassword: z.string(),
}).refine((d) => d.password === d.repeatPassword, {
  message: "Las contraseñas no coinciden",
  path: ["repeatPassword"],
});

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [nombre, setNombre] = useState("");
  const [dni, setDni] = useState("");
  const [codigoProfesional, setCodigoProfesional] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setNombre(""); setDni(""); setCodigoProfesional(""); setPassword(""); setRepeatPassword("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse({ nombre, dni, password });
        if (!parsed.success) {
          toast({ title: parsed.error.issues[0].message, variant: "destructive" });
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({
          email: dniToEmail(dni),
          password,
        });
        if (error) {
          toast({ title: "Credenciales incorrectas", description: error.message, variant: "destructive" });
          return;
        }
        toast({ title: `Bienvenid@ ${nombre}` });
      } else {
        const parsed = registerSchema.safeParse({ nombre, dni, codigoProfesional, password, repeatPassword });
        if (!parsed.success) {
          toast({ title: parsed.error.issues[0].message, variant: "destructive" });
          return;
        }
        const { error } = await supabase.auth.signUp({
          email: dniToEmail(dni),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              nombre,
              dni: dni.trim().toUpperCase(),
              codigo_profesional: codigoProfesional,
            },
          },
        });
        if (error) {
          toast({ title: "Error al registrarse", description: error.message, variant: "destructive" });
          return;
        }
        toast({ title: "Cuenta creada correctamente" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col px-7 pt-10 pb-8"
      style={{
        background: "linear-gradient(180deg, hsl(45 100% 88%) 0%, hsl(320 60% 85%) 60%, hsl(263 50% 70%) 100%)",
      }}
    >
      {mode === "register" && (
        <button
          onClick={() => { setMode("login"); reset(); }}
          className="self-start text-primary"
          aria-label="Volver al inicio de sesión"
        >
          <Home className="w-6 h-6" />
        </button>
      )}

      <h1 className="text-6xl font-extrabold text-primary leading-none text-center tracking-tight mt-6 mb-8">
        Recovery<br />Care
      </h1>

      <p className="text-sm font-semibold text-foreground/90 mb-5 uppercase tracking-wide">
        Introduce tu información personal
      </p>

      <form onSubmit={handleSubmit} className="space-y-5 flex-1">
        <FieldUnderline label="Nombre" value={nombre} onChange={setNombre} placeholder="Nombre" />
        <FieldUnderline label="DNI" value={dni} onChange={setDni} placeholder="DNI" />

        {mode === "register" && (
          <FieldUnderline
            label="Código dado por el profesional"
            value={codigoProfesional}
            onChange={setCodigoProfesional}
            placeholder="Código dado por el profesional"
          />
        )}

        <FieldUnderline
          label="Contraseña"
          value={password}
          onChange={setPassword}
          placeholder="Contraseña"
          type={showPwd ? "text" : "password"}
          rightIcon={
            <button type="button" onClick={() => setShowPwd(!showPwd)} className="text-muted-foreground">
              {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {mode === "register" && (
          <FieldUnderline
            label="Repite la contraseña"
            value={repeatPassword}
            onChange={setRepeatPassword}
            placeholder="Repite la contraseña"
            type={showPwd ? "text" : "password"}
          />
        )}

        <div className="pt-4 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg disabled:opacity-60"
          >
            {loading ? "Cargando..." : mode === "login" ? "Iniciar sesión" : "Registrarse"}
          </button>
          {mode === "login" ? (
            <button type="button" onClick={() => { setMode("register"); reset(); }} className="text-xs text-foreground/80">
              ¿Primera vez? <span className="underline">Regístrate aquí</span>
            </button>
          ) : (
            <button type="button" onClick={() => { setMode("login"); reset(); }} className="text-xs text-foreground/80">
              ¿Ya tienes cuenta? <span className="underline">Inicia sesión</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

const FieldUnderline = ({
  label, value, onChange, placeholder, type = "text", rightIcon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  rightIcon?: React.ReactNode;
}) => (
  <div>
    <label className="text-[11px] font-semibold text-foreground/80 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent border-b border-foreground/30 py-2 pr-8 text-foreground placeholder:text-foreground/40 focus:outline-none focus:border-primary"
      />
      {rightIcon && <div className="absolute right-1 top-1/2 -translate-y-1/2">{rightIcon}</div>}
    </div>
  </div>
);

export default Auth;
