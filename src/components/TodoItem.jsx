import { useState } from "react";

export default function TodoItem(props) {
    const [isEditingTodo, setEditingTodo] = useState(false);
    const [draftTitleTodo, setDraftTitleTodo] = useState("");

    function handleSubmitEditTodo() {
        setEditingTodo(false);

        //todo: add validation checks
        console.log("sending upward: " + draftTitleTodo);
        props.onTodoEdit(props.listId, props.id, draftTitleTodo);
    }
    function handleEditTodo() {
        setEditingTodo(true);
        setDraftTitleTodo(props.text);
    }
    function handleDeleteTodo() {

    }

    return <li className="todo-wrapper">
        {isEditingTodo ? <form className="edit-todo-form" onSubmit={handleSubmitEditTodo}><input value={draftTitleTodo} onChange={(event) => setDraftTitleTodo(event.target.value)}></input></form> :
            <span className="todo-list-item"
                className={`todo-item-text ${props.completed ? "completed" : ""}`}
                onClick={() => props.onToggle(props.id)}>
                {props.text}
            </span>
        }

        <div className="todo-actions">
            <button onClick={handleEditTodo}>
                ✎
            </button>
            <button onClick={handleDeleteTodo}>
                🗑️
            </button>
        </div>
    </li>
}