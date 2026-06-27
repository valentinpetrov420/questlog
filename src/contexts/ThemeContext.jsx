import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

export function ThemeProvider({children}){
	const [theme, setTheme] = useState(() => {
		return localStorage.getItem("theme") || "darkMode";
	});

    useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

    function toggleDarkMode() {
		if (theme === "darkMode") {
			setTheme("lightMode");
		} else if (theme === "lightMode") {
			setTheme("darkMode")
		}
	}

    return (
        <ThemeContext.Provider value={{ theme, toggleDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
  return useContext(ThemeContext);
}