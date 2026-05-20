import { useState } from "react"
import { validateText } from "../util/validation";
import StatusMessage from "./StatusMessage";
import { useEffect } from "react";

export default function CreateListForm(props) {
    const [title, setTitle] = useState("");

    const [error, setError] = useState("");
    const [status, setStatus] = useState(null);

    useEffect(() => {
        if (!status){ 
            return;
        };

        const timeout = setTimeout(() => {
            setStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [status]);

    function handleSubmit(event) {
        event.preventDefault();

        const result = validateText(title, props.maxLength);

        if (!result.valid) {
            setError(result.error);
            setStatus(true);
            return;
        }

        setError("");
        props.onCreateList(title);
        setTitle("");
    }

    return <form id="create-list-form" onSubmit={handleSubmit}>
        <h2>Add Quest</h2>
        {status && <StatusMessage type="error" text={error} />}
        <input value={title}
            onChange={(event) => { setTitle(event.target.value) }}
            placeholder="Enter Quest Name"></input>
        <button type="submit">Add New Quest</button>
    </form>
}