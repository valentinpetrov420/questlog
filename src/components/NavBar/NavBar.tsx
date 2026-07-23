import { useState, useEffect } from "react";
import './NavBar.css';
import PatchNotesModal from "../PatchNotesModal/PatchNotesModal.js";

import { useTheme } from '../../contexts/ThemeContext';

import { useNavigate } from "react-router-dom";
import { User } from "firebase/auth";

type NavBarProps = {
    siteName: string,
    user: User,
    logout: () => void,
    loginWithGoogle: () => void
}


type PatchNote = {
    date: Date,
    message: string,
}

export default function NavBar(props: NavBarProps) {
    const [patchnotes, setPatchnotes] = useState<PatchNote[]>([]);
    const [patchnotesOpen, setPatchnotesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const { toggleDarkMode } = useTheme();

    const navigate = useNavigate();

    useEffect(() => {
        fetch('/patchnotes.json')
            .then((res) => res.json())
            .then((data) => {

                setPatchnotes(data);
                localStorage.setItem("changelog", JSON.stringify(data));
            }).catch((err) => console.error("Failed to load patchnotes: ", err));
    }, []);

    function handleGoHome() {
        if (!props.user) {
            return;
        }

        navigate("/");
    }
    function togglePatchnotes() {
        setPatchnotesOpen(prev => !prev);
    }

    function closePatchnotes() {
        setPatchnotesOpen(false);
    }

    async function handleLogout() {
        await props.logout();
        navigate("/login");
    }
    async function handleLogin() {
        await props.loginWithGoogle();
        navigate("/");
    }

    return <nav>
        <button className="wrapped-nav-button" onClick={handleGoHome}>{props.siteName}</button>
        <div className="nav-container">
            <div className={`nav-links ${menuOpen ? "opened" : "closed"}`}>
                <button id="patchnotes-toggle" className="wrapped-nav-button" onClick={togglePatchnotes}>Patch Notes</button>
                <button id="dark-mode-toggle" className="wrapped-nav-button" onClick={toggleDarkMode}>🌘 Dark Mode</button>
                {props.user ?
                    <div id="user-info">
                        <div id="user-nav-wrapper">
                            <div className='user-photo-container'>
                                {props.user.photoURL && (
                                    <img src={props.user.photoURL} alt="pfp" />
                                )}
                            </div>
                            <p className='user-name'>
                                {props.user.displayName}
                            </p>
                        </div>
                        <button className="login-button wrapped-nav-button" onClick={handleLogout}>Logout</button>
                    </div>
                    : <button className="login-button wrapped-nav-button" onClick={handleLogin}>Sign in</button>
                }
            </div>
            <button
                className="nav-menu-toggle"
                onClick={() => setMenuOpen(prev => !prev)}>
                {menuOpen ? "X" : "☰"}
            </button>
        </div>
        <PatchNotesModal
            open={patchnotesOpen}
            onClose={closePatchnotes}
            patchnotes={patchnotes}
        />
    </nav>
}