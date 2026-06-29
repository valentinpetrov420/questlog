import { useEffect, useState } from 'react'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import NavBar from './components/NavBar/NavBar.jsx';
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

import { useTheme } from './contexts/ThemeContext.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

export default function App() {
	const { user, authReady, logout, loginWithGoogle } = useAuth();
	const { theme } = useTheme();

	const maxLength = 50;
	const siteName = "QuestLog";

	return (
		<div id="app" data-theme={theme}>
			<div id="page-container">
				<header id="top-header">
					<NavBar siteName={siteName}
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