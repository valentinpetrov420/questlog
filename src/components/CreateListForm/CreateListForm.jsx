import { useState } from "react"
import { validateText } from "../../util/validation.js";
import StatusMessage from "../StatusMessage/StatusMessage.jsx";
import { useEffect } from "react";
import "./CreateListForm.css";

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

    async function handleSubmit(event) {
        event.preventDefault();

        const result = validateText(title, props.maxLength);

        if (!result.valid) {
            setError(result.error);
            setStatus(true);
            return;
        }

        const response = await props.onCreateList(title);

        if (response.success) {
            setError("");
            setStatus(false);
            setTitle("");
        } else {
            setError(response.message);
            setStatus(true);
        }
    }

    return <form id="create-list-form" onSubmit={handleSubmit}>
        <h2>Add Quest</h2>
        <StatusMessage text={status ? error : ""} />
        <input value={title}
            onChange={(event) => { setTitle(event.target.value) }}
            placeholder="Enter Quest Name"></input>
        <button type="submit">Add New Quest</button>
    </form>
}