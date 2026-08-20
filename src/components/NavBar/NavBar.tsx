import './NavBar.css';

import { useNavigate } from "react-router-dom";
import { type AppUser } from '../../contexts/AuthContext';
type NavBarProps = {
    siteName: string;
    menuOpen: boolean;
    toggleMenu: () => void;
    user: AppUser | null,
}

export default function NavBar(props: NavBarProps) {

    const navigate = useNavigate();

    function handleGoHome() {
        if (!props.user) {
            return;
        }

        navigate("/");
    }

    return <nav>
        <button className="wrapped-nav-button" onClick={handleGoHome}>{props.siteName}</button>
        <div className="nav-container">
            <button
                className="nav-menu-toggle"
                onClick={props.toggleMenu}>
                {props.menuOpen ? "X" : "☰"}
            </button>
        </div>
    </nav>
}