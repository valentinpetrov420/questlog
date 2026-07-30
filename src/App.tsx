import { Routes, Route } from 'react-router-dom'

import './App.css'

//import { loadLists, saveLists } from './api/services/storage.js';

import LoginPage from './pages/LoginPage/LoginPage.js';

import Dashboard from './pages/Dashboard/Dashboard.js';
import NodePage from './pages/NodePage/NodePage.js';

import DevPanel from './dev/DevPanel.js';

import { useTheme } from './contexts/ThemeContext.js';
import { useAuth } from './contexts/AuthContext.js';

import ProtectedRoute from './contexts/ProtectedRoute.js';
import PublicRoute from './contexts/PublicRoute.js';
import AppLayout from './AppLayout.js';


export default function App() {
	const { loginWithGoogle, user } = useAuth();
	const { theme } = useTheme();

	return (
		<div id="app" data-theme={theme}>
			<main className="page-container">

				<Routes>
					<Route path="/login" element={
						<PublicRoute>
							<LoginPage
								loginWithGoogle={loginWithGoogle}
							/>
						</PublicRoute>
					} />
					<Route element={<AppLayout />}>
						<Route path="/" element={
							<ProtectedRoute>
								<Dashboard />
							</ProtectedRoute>
						} />
						<Route path="/:nodeId" element={
							<NodePage />
						} />
					</Route>


				</Routes>
			</main>
			{import.meta.env.DEV && (
				<DevPanel userId={user?.uid} />
			)}
		</div>
	);
}