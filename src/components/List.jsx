import { useState } from "react";
import TodoItem from "./TodoItem"
import { validateText } from "../util/validation";
import StatusMessage from "./StatusMessage";
import { useEffect } from "react";

export default function List(props) {
    const [value, setValue] = useState("");
    const [draftTitle, setDraftTitle] = useState("");
    const [isEditing, setEditing] = useState(false);

    const [addTodoStatus, setAddTodoStatus] = useState(null);
    const [titleStatus, setTitleStatus] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!titleStatus) {
            return;
        };

        const timeout = setTimeout(() => {
            setTitleStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [titleStatus]);

    useEffect(() => {
        if (!addTodoStatus) {
            return;
        };

        const timeout = setTimeout(() => {
            setAddTodoStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [addTodoStatus]);

    function handleSubmit(e) {
        e.preventDefault();

        const result = validateText(value, props.maxLength)

        if (!result.valid) {
            setError(result.error);
            setAddTodoStatus(true);
            return;
        }

        setError("");
        props.onListItemAdd(value, props.id);
        setValue("");
    }

    function handleEditTitle() {
        setDraftTitle(props.title);
        setEditing(true);
    }
    function handleSubmitEdit(event) {
        event.preventDefault();

        const result = validateText(draftTitle, props.maxLength)

        if (!result.valid) {
            setError(result.error);
            setTitleStatus(true);
            return;
        }

        setError("");
        props.onListTitleChange(props.id, draftTitle);
        setEditing(false);
    }

    return (
        <div className="list-component">
            <div className="list-tools">
                <button onClick={props.onListDelete}>🗑️</button>
            </div>
            {isEditing ? <form className="edit-list-title" onSubmit={handleSubmitEdit}>
                <h2 className="list-title-edit">Title:</h2>
                <div className="input-form-wrapper">
                    {titleStatus && <StatusMessage type="error" text={error} />}
                    <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)}></input>
                </div>
            </form>
                : <h2 className="list-title">Title: <span onClick={handleEditTitle}>{props.title}<a>✎</a></span></h2>}
            <ul>
                {props.listItems.map(todo => (
                    <TodoItem
                        key={todo.id}
                        listId={props.id}
                        id={todo.id}
                        text={todo.text}
                        completed={todo.completed}
                        onToggle={props.onListItemToggle}
                        onTodoEdit={props.onListItemEdit}
                        onTodoDelete={props.onListItemDelete}
                        maxLength={props.maxLength}
                    />
                ))}
            </ul>

            <form className="list-form" onSubmit={handleSubmit}>
                <div className="input-form-wrapper">
                    {addTodoStatus && <StatusMessage type="error" text={error} />}
                    <input
                        placeholder="New quest task..."
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                    />
                </div>
                <button className="list-form-button" type="submit">
                    Add Quest Task
                </button>
            </form>
        </div>
    );
}