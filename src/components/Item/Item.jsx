import { useState } from "react";
import { useEffect } from "react";
import StatusMessage from "../StatusMessage/StatusMessage.jsx";
import './Item.css';

export default function Item(props) {
    const [isEditingTodo, setEditingTodo] = useState(false);
    const [draftTitleTodo, setDraftTitleTodo] = useState("");

    const [pending, setPending] = useState(false);

    const [error, setError] = useState("");

    const disabled = pending || props.deletePending;

    const highlightedTodoId = props.highlightedTodoId;

    function cancelEdit() {
        setEditingTodo(false);
        setDraftTitleTodo(props.text);
        setError("");
    }
    async function handleSubmitEditTodo(event) {
        event.preventDefault();

        setPending(true);

        try {
            const response = await props.onTodoEdit(props.listId, props.id, draftTitleTodo);

            if (response.success) {
                setError("");
                setEditingTodo(false);
                setDraftTitleTodo("");
            } else {
                setError(response.message);
                setEditingTodo(true);
            }
        } finally {
            setPending(false);
        }
    }
    function handleEditTodo() {
        setEditingTodo(true);
        setDraftTitleTodo(props.text);
    }
    async function handleDeleteClick() {
        if (disabled) {
            return;
        }

        setPending(true);

        try {
            const response = await props.onTodoDelete(props.listId, props.id);

            if (response.success) {
                setError("");
            } else {
                setError(response.message);
            }
        } finally {
            setPending(false);
        }
    }


    return <li>
        <StatusMessage text={error} />
        <div className={isEditingTodo ? "input-form-wrapper" : "todo-wrapper"}>
            {isEditingTodo ? <form className="edit-todo-form" onSubmit={handleSubmitEditTodo}>
                <input autoFocus
                    disabled={disabled}
                    value={draftTitleTodo}
                    onChange={(event) => setDraftTitleTodo(event.target.value)}
                    onBlur={() => {
                        cancelEdit();
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            cancelEdit();
                        }
                    }}></input>
            </form>
                :
                <span className={`todo-item-text ${props.highlightedTodoId === props.id ? "highlighted" : ""}
                ${props.completed ? "completed" : ""}`}
                    onClick={() => {
                        if (disabled) {
                            return;
                        }

                        props.onToggle(props.id)
                    }}>
                    {props.text}
                </span>
            }

            {!isEditingTodo ? <div className="todo-actions">
                <button
                    disabled={disabled}
                    onMouseDown={(event) => {
                        if (disabled) {
                            return;
                        }

                        event.preventDefault();
                        handleEditTodo();
                    }}>
                    ✎
                </button>
                <button
                    disabled={disabled}
                    onClick={handleDeleteClick}>
                    🗑️
                </button>
            </div> :
                <div></div>
            }
        </div>
    </li>
}