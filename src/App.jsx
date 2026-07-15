import { useEffect, useState } from 'react'

import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import { siteName, maxLength } from "./constants/app.js";

import NavBar from './components/NavBar/NavBar.jsx';
import MainPage from './pages/MainPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DevPanel from './dev/DevPanel.jsx';

import { useTheme } from './contexts/ThemeContext.jsx';
import { useAuth } from './contexts/AuthContext.jsx';

import ProtectedRoute from './contexts/ProtectedRoute.jsx';
import PublicRoute from './contexts/PublicRoute.jsx';

import ListPage from './pages/ListPage.jsx';

import Dashboard from './pages/Dashboard.jsx';
import NodePage from './pages/NodePage.jsx';

export default function App() {
	const { user, logout, loginWithGoogle } = useAuth();
	const { theme } = useTheme();

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
							<Dashboard
								user={user}
								maxLength={maxLength}
								siteName={siteName}
							/>
						</ProtectedRoute>
					} />
					<Route path="/:nodeId" element={
						<NodePage />
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
			{import.meta.env.DEV && (
				<DevPanel userId={user?.uid} />
			)}
		</div>
	);
}