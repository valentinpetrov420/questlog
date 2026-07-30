import { Outlet } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";

import NavBar from "./components/NavBar/NavBar";
import SideBar from "./components/SideBar/SideBar";

import { siteName } from "./constants/app";

import './AppLayout.css';

export default function AppLayout() {
    const { user, logout, loginWithGoogle } = useAuth();

    return (
        <>
            <header className="top-header">
                <NavBar
                    siteName={siteName}
                    user={user}
                    logout={logout}
                    loginWithGoogle={loginWithGoogle}
                />
            </header>

            <div className="layout">
                <SideBar 
                    user={user}/>
                <div className="content">
                    <Outlet />
                </div>
            </div>
        </>
    );
}