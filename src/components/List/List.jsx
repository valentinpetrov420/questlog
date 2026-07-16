import { useState } from "react";
import Item from "../Item/Item.jsx"
import { validateText } from "../../util/validation";
import StatusMessage from "../StatusMessage/StatusMessage.jsx";
import { useEffect, useRef } from "react";
import './List.css';
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function List(props) {
    const [value, setValue] = useState("");

    const [draftTitle, setDraftTitle] = useState("");
    const [isEditing, setEditing] = useState(false);

    const [deletePending, setDeletePending] = useState(false);

    const [addItemPending, setAddItemPending] = useState(false);

    const [titlePending, setTitlePending] = useState(false);
    const [visibilityPending, setVisibilityPending] = useState(false);

    const [addTodoStatus, setAddTodoStatus] = useState(null);
    const [titleStatus, setTitleStatus] = useState(null);

    const [error, setError] = useState("");

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!addTodoStatus) {
            return;
        };

        const timeout = setTimeout(() => {
            setAddTodoStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [addTodoStatus]);

    const disabled = addItemPending || deletePending;

    const inputRef = useRef(null);
    const wasDisabled = useRef(false);
    
    useEffect(() => {
        if (wasDisabled.current && !disabled) {
            inputRef.current?.focus();
        }
        wasDisabled.current = disabled;
    }, [disabled]);

    const isArchived = props.isArchived;
    const isOwner = user?.uid === props.ownerId;
    const actions = isArchived ?
        (<div className="list-actions">
            <button
                disabled={deletePending}
                onClick={() => props.onListRestore(props.id)}>🔃</button>
            <button
                disabled={deletePending}
                onClick={handleDeleteClick}>🗑️</button>
        </div>)
        : (<div className="list-actions">
            <button
                disabled={deletePending}
                onClick={() => props.onListArchive(props.id)}>🗑️</button>
            <button
                disabled={deletePending}
                onClick={() => props.onListPin(props.id)}>📌</button>
        </div>);

    function cancelEdit() {
        setEditing(false);
        setDraftTitle(props.title);
        setTitleStatus(null);
    }
    async function handleSubmit(e) {
        e.preventDefault();

        if (deletePending) {
            return;
        }

        setAddItemPending(true);

        try {
            const response = await props.onListItemAdd(value, props.id);

            if (response.success) {
                setError("");
                setAddTodoStatus(false);
                setValue("");
            } else {
                setError(response.message);
                setAddTodoStatus(true);
            }
        } finally {
            setAddItemPending(false);
        }
    }
    function handleEditTitle() {
        if (deletePending) {
            return;
        }

        setDraftTitle(props.text);
        setEditing(true);
    }
    async function handleSubmitEdit(event) {
        event.preventDefault();

        if (deletePending) {
            return;
        }

        setTitlePending(true);

        try {
            const response = await props.onListTitleChange(props.id, draftTitle);

            if (response.success) {
                setEditing(false);
                setError("");
                setTitleStatus(false);
            } else {
                setError(response.message);
                setTitleStatus(true);
            }
        } finally {
            setTitlePending(false);
        }
    }
    async function handleDeleteClick() {
        if (deletePending) {
            return;
        }

        setDeletePending(true);

        try {
            const response = await props.onListDelete();

            if (response.success) {
                setError("");
                setTitleStatus(false);

                if (props.isNodePage) {
                    navigate("/");
                }

            } else {
                setError(response.message);
                setTitleStatus(true);
            }
        } finally {
            setDeletePending(false);
        }
    }
    async function handleVisibilityChange() {
        console.log(props.isPublic);
        if (deletePending) {
            return;
        }

        try {
            setVisibilityPending(true);

            const response = await props.onListVisibilityChange(props.id);

            if (response.success) {
                setError("");
                setTitleStatus(false);
            } else {
                setError(response.message);
                setTitleStatus(true);
            }
        } finally {
            setVisibilityPending(false);
        }
    }

    return (
        <div className="list-component">
            {isOwner ? actions : ""}
            <StatusMessage text={titleStatus ? error : ""} />
            {isEditing ? <form className="edit-list-title" onSubmit={handleSubmitEdit}>
                <h2 className="list-title-edit">Title:</h2>
                <div className="input-form-wrapper">
                    <input autoFocus
                        disabled={titlePending}
                        value={draftTitle}
                        onChange={(event) => setDraftTitle(event.target.value)}
                        onBlur={() => {
                            cancelEdit();
                        }}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                cancelEdit();
                            }
                        }}>

                    </input>
                </div>
            </form>
                : <h2 className="list-title">Title: {isOwner ? <span onClick={handleEditTitle}>{props.text}<a>✎</a></span> : <p>{props.text}</p>} </h2>}
            {props.isNodePage && isOwner ?
                <select className="visibility-dropdown"
                    disabled={visibilityPending || deletePending}
                    value={props.isPublic ? "public" : "private"}
                    onChange={handleVisibilityChange}>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                </select>
                : ""}

            <ul>
                {!props.isNodePage ? <Link to={`/${props.id}`}>Details</Link> : ""}
                {(props.listItems ?? []).map(item => (
                    <Item isOwner={isOwner}

                        deletePending={deletePending}

                        key={item.id}
                        listId={props.id}
                        id={item.id}
                        text={item.text}
                        completed={item.completed}
                        highlightedTodoId={props.highlightedTodoId}
                        onToggle={props.onListItemToggle}
                        onTodoEdit={props.onListItemEdit}
                        onTodoDelete={props.onListItemDelete}
                        maxLength={props.maxLength}
                    />
                ))}
            </ul>
            {isOwner ?
                <form className="list-form" onSubmit={handleSubmit}>
                    <div className="input-form-wrapper">
                        <StatusMessage text={addTodoStatus ? error : ""} />
                        <input
                            ref={inputRef}
                            disabled={disabled}
                            placeholder={disabled ? "Please wait..." : "New quest task..."}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                        />
                    </div>
                    <button
                        disabled={disabled}
                        className="list-form-button" type="submit">
                        {addItemPending ? "Adding..." : "Add new quest"}
                    </button>
                </form>
                : ""
            }
        </div>
    );
}