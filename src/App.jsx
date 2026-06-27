import { useEffect, useState } from 'react'

import { Routes, Route, Navigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom';

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import firestoreService from './api/services/firestoreService.js';

import { onAuthStateChanged } from "firebase/auth";
import { loginWithGoogle, logout } from "./api/services/authService";
import { auth, db } from "./api/firebase";

import NavBar from './components/NavBar/NavBar.jsx';

import DevPanel from "./dev/DevPanel.jsx";
import { formatError } from './util/errorResponse.js';
import { validateText } from './util/validation.js';

import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';


export default function App() {
	const [user, setUser] = useState(null);
	const [authReady, setAuthReady] = useState(false);

	const [theme, setTheme] = useState(() => {
		return localStorage.getItem("theme") || "darkMode";
	});

	const maxLength = 50;
	const siteName = "QuestLog";

	useEffect(() => {
		localStorage.setItem("theme", theme);
	}, [theme]);

	useEffect(() => {
		const unsub = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setAuthReady(true);
		});

		return unsub;
	}, []);

	function toggleDarkMode() {
		if (theme === "darkMode") {
			setTheme("lightMode");
		} else if (theme === "lightMode") {
			setTheme("darkMode")
		}
	}

	return (
		<div id="app" data-theme={theme}>
			<div id="page-container">
				<header id="top-header">
					<NavBar siteName={siteName}

						theme={theme}
						toggleDarkMode={toggleDarkMode}

						user={user}
						logout={logout}
						loginWithGoogle={loginWithGoogle}
					/>
				</header>
				{!authReady ? (
					<div>Loading...</div>
				) : (
					<Routes>
						<Route path="/"
							element={user
								? <MainPage user={user} maxLength={maxLength} siteName={siteName} />
								: <Navigate to="/login" replace />
							}
						/>
						<Route path="/login" element={<LoginPage loginWithGoogle={loginWithGoogle} />} />
					</Routes>
				)}
			</div>
		</div>

	);
}