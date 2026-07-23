import { Routes, Route } from 'react-router-dom'

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import { siteName } from "./constants/app.js";

import NavBar from './components/NavBar/NavBar.js';
import LoginPage from './pages/LoginPage/LoginPage.js';

import Dashboard from './pages/Dashboard/Dashboard.js';
import NodePage from './pages/NodePage/NodePage.js';

import DevPanel from './dev/DevPanel.js';

import { useTheme } from './contexts/ThemeContext.js';
import { useAuth } from './contexts/AuthContext.js';

import ProtectedRoute from './contexts/ProtectedRoute.js';
import PublicRoute from './contexts/PublicRoute.js';


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
							<Dashboard/>
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