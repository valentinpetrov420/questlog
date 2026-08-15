import { Outlet } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "./contexts/AuthContext";

import NavBar from "./components/NavBar/NavBar";
import SideBar from "./components/SideBar/SideBar";

import { siteName } from "./constants/app";

import './AppLayout.css';

export default function AppLayout() {
    const { user, logout, loginWithGoogle } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <>
            <header className="top-header">
                <NavBar
                    siteName={siteName}
                    user={user}
                    menuOpen={menuOpen}
                    toggleMenu={() => setMenuOpen(prev => !prev)}
                />
            </header>

            <div className="layout">
                <SideBar
                    menuOpen={menuOpen}
                    setMenuOpen={setMenuOpen}
                    user={user}
                    logout={logout}
                    loginWithGoogle={loginWithGoogle} />
                <div className="content">
                    <Outlet />
                </div>
            </div>
        </>
    );
}