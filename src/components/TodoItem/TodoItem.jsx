import { useState } from "react";
import { useEffect } from "react";
import StatusMessage from "../StatusMessage/StatusMessage.jsx";
import { validateText } from "../../util/validation.js";
import './TodoItem.css';

export default function TodoItem(props) {
    const [isEditingTodo, setEditingTodo] = useState(false);
    const [draftTitleTodo, setDraftTitleTodo] = useState("");

    const [error, setError] = useState("");

    const highlightedTodoId = props.highlightedTodoId;

    function cancelEdit() {
        setEditingTodo(false);
        setDraftTitleTodo(props.text);
        setError("");
    }
    async function handleSubmitEditTodo(event) {
        event.preventDefault();

        const result = validateText(draftTitleTodo, props.maxLength);

        if (!result.valid) {
            setError(result.error);
            setEditingTodo(true);
            return;
        }

        const response = await props.onTodoEdit(props.listId, props.id, draftTitleTodo);

        if (response.success) {
            setError("");
            setEditingTodo(false);
            setDraftTitleTodo("");
        } else {
            setError(response.message);
            setEditingTodo(true);
        }

    }
    function handleEditTodo() {
        setEditingTodo(true);
        setDraftTitleTodo(props.text);
    }
    async function handleDeleteClick() {
        const response = await props.onTodoDelete(props.listId, props.id);

        if (response.success) {
            setError("");
        } else {
            setError(response.message);
        }
    }
    

    return <li>
        <StatusMessage text={error} />
        <div className={isEditingTodo ? "input-form-wrapper" : "todo-wrapper"}>
            {isEditingTodo ? <form className="edit-todo-form" onSubmit={handleSubmitEditTodo}>
                <input autoFocus
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
                <span className={`todo-item-text ${props.highlightedTodoId === props.id ? "highlighted" : ""
                    }
                ${props.completed ? "completed" : ""}`}
                    onClick={() => props.onToggle(props.id)}>
                    {props.text}
                </span>
            }

            {!isEditingTodo ? <div className="todo-actions">
                <button onMouseDown={(event) => {
                    event.preventDefault();
                    handleEditTodo();
                }}>
                    ✎
                </button>
                <button onClick={handleDeleteClick}>
                    🗑️
                </button>
            </div> :
                <div></div>
            }
        </div>
    </li>
}