import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";

import { User } from "firebase/auth";

import './SideBar.css';
import { useNodes } from "../../contexts/NodesContext";
import { useTheme } from "../../contexts/ThemeContext";

import PatchNotesModal from "../PatchNotesModal/PatchNotesModal";

type SideBarProps = {
    user: User | null;
    logout: () => void;
    loginWithGoogle: () => void;
    menuOpen: boolean;
}

type PatchNote = {
    date: Date,
    message: string,
}

export default function SideBar(props: SideBarProps) {

    const [patchnotes, setPatchnotes] = useState<PatchNote[]>([]);
    const [patchnotesOpen, setPatchnotesOpen] = useState(false);

    const { toggleDarkMode } = useTheme();

    const {
        flatNodes,
    } = useNodes();

    useEffect(() => {
        fetch('/patchnotes.json')
            .then((res) => res.json())
            .then((data) => {

                setPatchnotes(data);
                localStorage.setItem("changelog", JSON.stringify(data));
            }).catch((err) => console.error("Failed to load patchnotes: ", err));
    }, []);

    const navigate = useNavigate();

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


    return <div className={`sidebar-wrapper ${props.menuOpen ? "open" : ""}`}>
        <PatchNotesModal
            open={patchnotesOpen}
            onClose={closePatchnotes}
            patchnotes={patchnotes}
        />
        <div className="sidebar-options">
        </div>
        <div className="sidebar-navigation">
            <button className="wrapped-nav-button" onClick={handleGoHome}>Dashboard</button>
            <button className="wrapped-nav-button" onClick={togglePatchnotes}>Patch Notes</button>
            <button className="wrapped-nav-button" onClick={toggleDarkMode}>🌘 Dark Mode</button>
        </div>
        <div className="sidebar-lists">
            <div className="sidebar-lists-options">
                <div className="">
                    <input type="text" value="" placeholder="Search lists..." />
                </div>
            </div>
            <div className="sidebar-list-items">
                <select>
                    <option value="Newest">Newest</option>
                </select>
                <div className="sidebar-lists-container">
                    <ul>
                        {flatNodes
                            .filter(list => list.parentId === null && !list.archived)
                            .map(list => (
                                <li key={list.id}>
                                    <Link to={`/${list.id}`}>
                                        {list.text}
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>
        {props.user ?
            <div className="sidebar-user-info">
                <div className="sidebar-user-wrapper">
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
}