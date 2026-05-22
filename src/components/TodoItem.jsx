import { useState } from "react";
import { useEffect } from "react";
import StatusMessage from "./StatusMessage";
import { validateText } from "../util/validation";

export default function TodoItem(props) {
    const [isEditingTodo, setEditingTodo] = useState(false);
    const [draftTitleTodo, setDraftTitleTodo] = useState("");

    const [error, setError] = useState("");
    const [status, setStatus] = useState(null);

    function cancelEdit() {
        setEditingTodo(false);
        setDraftTitleTodo(props.text);
        setStatus("");
        setError("");
    }

    function handleSubmitEditTodo(event) {
        event.preventDefault();
        const result = validateText(draftTitleTodo, props.maxLength);

        if (!result.valid) {
            setError(result.error);
            setStatus(true);
            setDraftTitleTodo(props.text);
        } else {
            setEditingTodo(false);
            setError("");
            props.onTodoEdit(props.listId, props.id, draftTitleTodo);
        }

    }
    function handleEditTodo() {
        setEditingTodo(true);
        setDraftTitleTodo(props.text);
    }
    function handleDeleteTodo() {
        console.log("sending upward: " + props.text);

        props.onTodoDelete(props.listId, props.id);
    }

    return <li className={isEditingTodo ? "input-form-wrapper" : "todo-wrapper"}>
        <StatusMessage text={error}/>
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
            <span className="todo-list-item"
                className={`todo-item-text ${props.completed ? "completed" : ""}`}
                onClick={() => props.onToggle(props.id)}>
                {props.text}
            </span>
        }

        {!isEditingTodo ? <div className="todo-actions">
            <button onClick={handleEditTodo}>
                ✎
            </button>
            <button onClick={handleDeleteTodo}>
                🗑️
            </button>
        </div> :
            <div></div>
        }

    </li>
}