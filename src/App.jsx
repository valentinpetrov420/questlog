import { useEffect, useState } from 'react'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import NavBar from './components/NavBar/NavBar.jsx';
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

import { useTheme } from './contexts/ThemeContext.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import ProtectedRoute from './contexts/ProtectedRoute.jsx';
import PublicRoute from './contexts/PublicRoute.jsx';

export default function App() {
	const { user, logout, loginWithGoogle } = useAuth();
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
				<Routes>
					<Route path="/" element={
						<ProtectedRoute>
							<MainPage
								user={user}
								maxLength={maxLength}
								siteName={siteName}
							/>
						</ProtectedRoute>
					} />
					<Route path="/login" element={
						<PublicRoute>
							<LoginPage
								loginWithGoogle={loginWithGoogle}
							/>
						</PublicRoute>
					} />
				</Routes>
			</div>
		</div>
	);
}