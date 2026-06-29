import { useContext, createContext, useEffect, useState } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle, logout } from "../api/services/authService";
import { auth, db } from "../api/firebase";

export const AuthContext = createContext();

export function AuthProvider({children}) {
    const [user, setUser] = useState(null);
    const [authReady, setAuthReady] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
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

export function useAuth(){
    return useContext(AuthContext);
}