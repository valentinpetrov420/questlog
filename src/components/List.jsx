import { useState } from "react";
import TodoItem from "./TodoItem"

export default function List(props) {
    const [value, setValue] = useState("");
    const [draftTitle, setDraftTitle] = useState("");
    const [isEditing, setEditing] = useState(false);

    function handleSubmit(e) {
        e.preventDefault();

        //todo: add validation checks to onListItemAdd()
        props.onListItemAdd(value, props.id);
        setValue("");
    }

    //todo: change from <a> to <button>
    function handleEditTitle() {
        setDraftTitle(props.title);
        setEditing(true);
    }
    function handleSubmitEdit(event) {
        event.preventDefault();

        //todo: add confirm + validation
        console.log("sending upward: " + draftTitle)
        props.onListTitleChange(props.id, draftTitle);

        setEditing(false);
    }

    return (
        <div className="list-component">
            <div className="list-tools">
                <a onClick={props.onListDelete}>🗑️</a>
            </div>
            {isEditing ? <form onSubmit={handleSubmitEdit}> <h2 className="list-title-edit">Title:</h2> <input value={draftTitle} onChange={(event) => setDraftTitle(event.target.value)}></input></form> :
                        <h2 className="list-title">Title: <span>{props.title}</span><a onClick={handleEditTitle}>✎</a></h2>}
            <ul>
                {props.listItems.map(todo => (
                    <TodoItem
                        key={todo.id}
                        id={todo.id}
                        text={todo.text}
                        completed={todo.completed}
                        onToggle={props.onListItemToggle}
                    />
                ))}
            </ul>

            <form className="list-form" onSubmit={handleSubmit}>
                <input
                    placeholder="New quest task..."
                    value={value}
                    onChange={(event) => setValue(event.target.value)}
                />

                <button className="list-form-button" type="submit">
                    Add Quest Task
                </button>
            </form>
        </div>
    );
}