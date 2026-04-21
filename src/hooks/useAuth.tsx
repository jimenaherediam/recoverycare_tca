import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, auth as authStorage, ApiUser } from "@/lib/api";

export type Profile = {
  id: number;
  nombre: string;
  dni: string;
  localidad: string | null;
  codigo_profesional: string | null;
};

type AuthContextType = {
  user: ApiUser | null;
  profile: Profile | null;
  loading: boolean;
  login: (dni: string, password: string) => Promise<void>;
  register: (payload: { nombre: string; dni: string; password: string; codigo_profesional?: string; localidad?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toProfile = (u: ApiUser | null): Profile | null =>
  u ? {
    id: u.id,
    nombre: u.nombre,
    dni: u.dni || "",
    localidad: u.localidad ?? null,
    codigo_profesional: u.codigo_profesional ?? null,
  } : null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cached = authStorage.getUser();
    if (cached && authStorage.getToken()) {
      setUser(cached);
      // refrescar en background; si falla (token caducado), cerrar sesión
      api.me().then((u) => {
        setUser(u);
        authStorage.set(authStorage.getToken()!, u);
      }).catch(() => {
        authStorage.clear();
        setUser(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (dni: string, password: string) => {
    const { access_token, user } = await api.login(dni, password);
    authStorage.set(access_token, user);
    setUser(user);
  };

  const register = async (payload: { nombre: string; dni: string; password: string; codigo_profesional?: string; localidad?: string }) => {
    const { access_token, user } = await api.register(payload);
    authStorage.set(access_token, user);
    setUser(user);
  };

  const signOut = async () => {
    authStorage.clear();
    setUser(null);
  };

  const refreshProfile = async () => {
    const u = await api.me();
    setUser(u);
    const t = authStorage.getToken();
    if (t) authStorage.set(t, u);
  };

  return (
    <AuthContext.Provider value={{ user, profile: toProfile(user), loading, login, register, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
