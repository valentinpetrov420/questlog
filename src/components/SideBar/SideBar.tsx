import { useNavigate, Link } from "react-router-dom";

import { User } from "firebase/auth";

import './SideBar.css';
import { useNodes } from "../../contexts/NodesContext";

type SideBarProps = {
    user: User | null;
}

export default function SideBar(props: SideBarProps) {
    const {
        flatNodes,
    } = useNodes();

    const navigate = useNavigate();

    function handleGoHome() {
        if (!props.user) {
            return;
        }

        navigate("/");
    }

    return <div className="sidebar-wrapper">
        <div className="sidebar-options">
            <button className="wrapped-nav-button" onClick={handleGoHome}>Dashboard</button>
        </div>
        <div className="sidebar-navigation">

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
                <div className="">
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
    </div>
}