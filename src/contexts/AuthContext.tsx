import { useContext, createContext, useEffect, useState, type ReactNode, } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle, logout } from "../api/services/authService.ts";

import { type User } from "firebase/auth";
import { auth } from "../api/firebase";

type AuthContextValue = {
  user: User | null;
  authReady: boolean;
  loginWithGoogle: typeof loginWithGoogle;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u: User | null) => {
            setUser(u);
            setAuthReady(true);
        });

        return unsub;
    }, []);

    return (
        <AuthContext.Provider
            value={
                {user, authReady, logout, loginWithGoogle}
            }>
                {children}
            </AuthContext.Provider>
        )
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}