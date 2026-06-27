import { useState, useEffect } from "react";
import './NavBar.css';
import PatchNotesModal from "../PatchNotesModal/PatchNotesModal";

import { useNavigate } from "react-router-dom";

export default function NavBar(props) {
    const [patchnotes, setPatchnotes] = useState([]);
    const [patchnotesOpen, setPatchnotesOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetch("././changelog.json")
        .then((res) => res.json())
        .then((data) => {

            setPatchnotes(data);
            localStorage.setItem("changelog", JSON.stringify(data));
        });
    }, []);

    function togglePatchnotes() {
        if (patchnotesOpen) {
            setPatchnotesOpen(false);
        } else if (!patchnotesOpen) {
            setPatchnotesOpen(true);
        }
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
        <h1>{props.siteName}</h1>
        <div className="nav-container">
            <div className={`nav-links ${menuOpen ? "opened" : "closed"}`}>
                <button id="patchnotes-toggle" className="wrapped-nav-button" onClick={togglePatchnotes}>Patch Notes</button>
                <button id="dark-mode-toggle" className="wrapped-nav-button" onClick={props.toggleDarkMode}>🌘 Dark Mode</button>
                {props.user ?
                    <div id="user-info">
                        <div id="user-nav-wrapper">
                            <div className='user-photo-container'>
                                <img src={props.user.photoURL} alt="pfp"></img>
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
            onClose={() => setPatchnotesOpen(false)}
            patchnotes={patchnotes}
        />
    </nav>
}