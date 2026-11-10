import { createContext, useContext, useState, ReactNode } from "react";

interface AuthUser {
  email: string;
  name: string;
  role: "admin" | "hr";
}

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Hardcoded credentials for frontend simulation
const MOCK_USERS = [
  { email: "admin@company.com", password: "Admin@123", name: "HR Admin", role: "admin" as const },
  { email: "hr@company.com", password: "Hr@123456", name: "HR Manager", role: "hr" as const },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("hrms_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (email: string, password: string): boolean => {
    const found = MOCK_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (found) {
      const authUser = { email: found.email, name: found.name, role: found.role };
      setUser(authUser);
      sessionStorage.setItem("hrms_user", JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("hrms_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
