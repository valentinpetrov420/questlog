import { useState } from "react"
import StatusMessage from "./StatusMessage";

export default function CreateListForm(props) {
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState({});

    function handleSubmit(event) {
        event.preventDefault();

        const inputValue = title;

        if (!inputValue.trim()) {
            setStatus({
                type: "error",
                text: "Text field cannot be empty."
            })
            return;
        } else if (inputValue.trim().length > props.maxLength) {
            setStatus({
                type: "error",
                text: `Cannot be more than ${props.maxLength} symbols long.`
            })
            return;
        } else {
            props.onCreateList(title);
            setStatus({
                type: "success",
                text: "Success."
            })
            setTitle("");
        }
    }

    return <form id="create-list-form" onSubmit={handleSubmit}>
        <h2>Add Quest</h2>
        <StatusMessage type={status.type} text={status.text}></StatusMessage>
        <input value={title}
            onChange={(event) => { setTitle(event.target.value) }}
            placeholder="Enter Quest Name"></input>
        <button type="submit">Add New Quest</button>
    </form>
}