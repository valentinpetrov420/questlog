import { createContext, useState, useEffect, useContext, ReactNode } from "react";

type Theme = "darkMode" | "lightMode";

type ThemeContextValue = {
	theme: Theme,
	toggleDarkMode: () => void,
};

type ThemeProviderProps = {
	children: ReactNode;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem("theme");

    return saved === "lightMode" ? "lightMode" : "darkMode";
});

	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	function toggleDarkMode() {
		if (theme === "darkMode") {
			setTheme("lightMode");
		} else if (theme === "lightMode") {
			setTheme("darkMode");
		}
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleDarkMode }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used inside ThemeProvider");
	}

	return context;
}