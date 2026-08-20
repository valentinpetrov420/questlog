import { useContext, createContext, useEffect, useState, type ReactNode, } from "react";

import { onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle, logout } from "../api/services/authService.ts";

import { type User } from "firebase/auth";
import { auth } from "../api/firebase";

export type AppUser =
	| User
	| {
		uid: "guest";
		displayName: "Guest";
		photoURL: null;
	};

type AuthContextValue = {
	user: AppUser | null;
	authReady: boolean;

	loginWithGoogle: typeof loginWithGoogle;
	continueAsGuest: () => void;

	logoutUser: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
	children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
	const [user, setUser] = useState<AppUser | null>(null);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u: User | null) => {
			setUser(u);
			setAuthReady(true);
		});

		return unsub;
	}, []);

	const continueAsGuest = () => {
		setUser({
			uid: "guest",
			displayName: "Guest",
			photoURL: null,
		});
		localStorage.setItem("guest-mode", "true");
		setAuthReady(true);
	};

	const logoutUser = async () => {
		if (user?.uid === "guest") {
			setUser(null);
			return;
		}

		await logout();
	}

	return (
		<AuthContext.Provider
			value={
				{ user, authReady, logoutUser, loginWithGoogle, continueAsGuest }
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