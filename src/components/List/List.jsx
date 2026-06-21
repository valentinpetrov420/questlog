import { useState } from "react";
import TodoItem from "../TodoItem/TodoItem.jsx"
import { validateText } from "../../util/validation";
import StatusMessage from "../StatusMessage/StatusMessage.jsx";
import { useEffect } from "react";
import './List.css';

export default function List(props) {
    const [value, setValue] = useState("");

    const [draftTitle, setDraftTitle] = useState("");
    const [isEditing, setEditing] = useState(false);

    const [deletePending, setDeletePending] = useState(false);
    const [addItemPending, setAddItemPending] = useState(false);
    const [titlePending, setTitlePending] = useState(false);

    const [addTodoStatus, setAddTodoStatus] = useState(null);
    const [titleStatus, setTitleStatus] = useState(null);

    const [error, setError] = useState("");

    useEffect(() => {
        if (!addTodoStatus) {
            return;
        };

        const timeout = setTimeout(() => {
            setAddTodoStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [addTodoStatus]);

    const isArchived = props.isArchived;
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

        setDraftTitle(props.title);
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
    function handlePin(event) {
        props.onListPin(props.id);
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
            } else {
                setError(response.message);
                setTitleStatus(true);
            }
        } finally {
            setDeletePending(false);
        }
    }

    return (
        <div className="list-component">
            {actions}
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
                : <h2 className="list-title">Title: <span onClick={handleEditTitle}>{props.title}<a>✎</a></span></h2>}
            <ul>
                {props.listItems.map(item => (
                    <TodoItem
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

            <form className="list-form" onSubmit={handleSubmit}>
                <div className="input-form-wrapper">
                    <StatusMessage text={addTodoStatus ? error : ""} />
                    <input
                        disabled={addItemPending || deletePending}
                        placeholder="New quest task..."
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                    />
                </div>
                <button
                    disabled={addItemPending || deletePending}
                    className="list-form-button" type="submit">
                    {addItemPending ? "Adding..." : "Add new quest"}
                </button>
            </form>
        </div>
    );
}