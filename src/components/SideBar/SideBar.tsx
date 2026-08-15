import { useNavigate, Link, useParams } from "react-router-dom";
import { useState, useEffect, useRef, SetStateAction } from "react";

import { User } from "firebase/auth";

import './SideBar.css';
import { useNodes } from "../../contexts/NodesContext";
import { useTheme } from "../../contexts/ThemeContext";

import PatchNotesModal from "../PatchNotesModal/PatchNotesModal";
import PopOver from "../PopOver/PopOver";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";
import StatusMessage from "../StatusMessage/StatusMessage";

type SideBarProps = {
    user: User | null;
    logout: () => void;
    loginWithGoogle: () => void;

    setMenuOpen: React.Dispatch<SetStateAction<boolean>>;
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

    const [searchValue, setSearchValue] = useState("");

    const {
        flatNodes,

        handleCreateNode,

        handleArchiveNode,
        handleRestoreNode,
        handleVisibilityChange,

        handleDeleteNode,

    } = useNodes();

    const [newPagePending, setNewPagePending] = useState(false);
    const [newPageStatus, setNewPageStatus] = useState(false);

    const [error, setError] = useState("");

    const [deletePendingIds, setDeletePendingIds] = useState<Set<string>>(new Set());
    const [visibilityPendingIds, setVisibilityPendingIds] = useState<Set<string>>(new Set());

    const [sortMode, setSortMode] = useState(() => {
        return localStorage.getItem("sidebar-sortmode") || "createdAt";
    });

    useEffect(() => {
        localStorage.setItem("sidebar-sortmode", sortMode);
    }, [sortMode]);

    const isArchivedView = sortMode === 'archived';

    const activeLists = flatNodes.filter(list => list.parentId === null && !list.archived)
    const archivedLists = flatNodes.filter(list => list.parentId === null && list.archived);

    const baseLists = isArchivedView ? archivedLists : activeLists;

    const visibleLists = baseLists.filter(list =>
        list.text.toLowerCase().includes(searchValue.toLowerCase())
    );

    const sortedLists = isArchivedView
        ? visibleLists
        : [...visibleLists].sort((a, b) => {
            if (sortMode === 'createdAt') return b.createdAt - a.createdAt;
            if (sortMode === 'updatedAt') return b.updatedAt - a.updatedAt;
            return a.text.localeCompare(b.text);
        });

    useEffect(() => {
        fetch('/patchnotes.json')
            .then((res) => res.json())
            .then((data) => {

                setPatchnotes(data);
                localStorage.setItem("changelog", JSON.stringify(data));
            }).catch((err) => console.error("Failed to load patchnotes: ", err));
    }, []);

    const navigate = useNavigate();
    const { nodeId } = useParams();

    function handleGoHome() {
        if (!props.user) {
            navigate('/login')
        }

        navigate("/");
        props.setMenuOpen(prev => !prev);
    }

    function handleGoAbout() {
        navigate("/about");
        props.setMenuOpen(prev => !prev);
    }

    function togglePatchnotes() {
        setPatchnotesOpen(prev => !prev);
    }

    function closePatchnotes() {
        setPatchnotesOpen(false);
    }

    const inputRef = useRef<HTMLInputElement>(null);
    function cancelSearch() {
        setSearchValue("");
        inputRef.current?.blur();
    }

    async function handleNewPage() {
        setNewPagePending(true);

        try {
            const result = await handleCreateNode("New Page", false);

            if (result.error) {
                setError(result.error.message);
                setNewPageStatus(true);
                return;
            }

            setError("");
            setNewPageStatus(false);

            navigate(`/${result.id}`, {
                state: { newParentId: result.id }
            });
            props.setMenuOpen(prev => !prev);
        } finally {
            setNewPagePending(false);
        }
    }

    async function handleDeleteClick(id: string) {
        setDeletePendingIds(prev => new Set(prev).add(id));
        try {
            const error = await handleDeleteNode(id);
            if (error) {
                //todo: console log is temporary, should be StatusMessage
                console.log(error.message);
            }

            if (nodeId === id) {
                navigate('/');
            }

        } finally {
            setDeletePendingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }

    async function handleVisibilityClick(id: string) {
        setVisibilityPendingIds(prev => new Set(prev).add(id));
        try {
            const error = await handleVisibilityChange(id);
            if (error) {
                //todo: console log is temporary, should be StatusMessage
                console.log(error.message);
            }
        } finally {
            setVisibilityPendingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    }

    function handleArchiveClick(id: string) {
        handleArchiveNode(id);
    }

    function handleRestoreClick(id: string) {
        handleRestoreNode(id);
    }

    function handleCopyLink(id: string) {
        const url = `${window.location.origin}/${id}`;
        navigator.clipboard.writeText(url);
    }

    async function handleLogout() {
        await props.logout();
        navigate("/login");
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
            <button className="wrapped-nav-button" onClick={handleGoAbout}>About</button>
            <button className="wrapped-nav-button" onClick={togglePatchnotes}>Patch Notes</button>
            <button className="wrapped-nav-button" onClick={toggleDarkMode}>🌘 Dark Mode</button>
        </div>
        {props.user ?
            <div className="sidebar-lists">
                <div className="sidebar-lists-options">
                    <div className="sidebar-search-wrapper">
                        <input type="text"
                            value={searchValue}
                            ref={inputRef}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    cancelSearch();
                                }
                            }}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder="Search lists..." />
                        {searchValue ? (
                            <button className="wrapped-nav-button"
                                onMouseDown={(event) => {
                                    event.preventDefault();
                                }}
                                onClick={() => cancelSearch()}>X</button>
                        ) : ""}
                    </div>
                </div>
                <div className="sidebar-list-items">

                    <select value={sortMode} onChange={(event) => {
                        setSortMode(event.target.value);
                    }}>
                        <option value="createdAt">Newest</option>
                        <option value="updatedAt">Last updated</option>
                        <option value="alphabetical">Alphabetical</option>
                        <option value="archived">Archived only</option>
                    </select>
                    {newPageStatus && <StatusMessage text={error}></StatusMessage>}
                    <button className="wrapped-nav-button sidebar-new-page"
                        disabled={newPagePending}
                        onClick={handleNewPage}>+ New Page</button>

                    <div className="sidebar-lists-container">
                        <ul>
                            {sortedLists.map(list => (
                                <li key={list.id}>
                                    <Link to={`/${list.id}`}>{list.text}</Link>
                                    <PopOver
                                        type="actions"
                                        align="right"
                                        disabled={deletePendingIds.has(list.id)}>
                                        {!list.archived ? <button onClick={() => handleArchiveClick(list.id)}>Archive</button> : ""}
                                        {list.archived ? <button onClick={() => handleRestoreClick(list.id)}>Restore</button> : ""}
                                        <button disabled={visibilityPendingIds.has(list.id)} onClick={() => handleVisibilityClick(list.id)}>{list.isPublic ? "Change to Private" : "Change to Public"}</button>
                                        <button onClick={() => handleDeleteClick(list.id)}>Delete</button>
                                        {list.isPublic ? <button disabled={visibilityPendingIds.has(list.id)} onClick={() => handleCopyLink(list.id)}>Copy link</button> : ""}
                                    </PopOver>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div> : ""}
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
            : <GoogleSignInButton />
        }
    </div>
}