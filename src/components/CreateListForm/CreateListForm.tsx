import { useState } from "react"
import StatusMessage from "../StatusMessage/StatusMessage.js";
import { useEffect } from "react";
import "./CreateListForm.css";

import { useNodes } from "../../contexts/NodesContext.js";

export default function CreateListForm() {
    const {
        handleCreateNode, setSortMode,
    } = useNodes();

    const [title, setTitle] = useState("");
    const [draftVisibility, setDraftVisibility] = useState("private");

    const [pending, setPending] = useState(false);

    const [error, setError] = useState("");
    const [status, setStatus] = useState<boolean | null>(null);;

    useEffect(() => {
        if (!status) {
            return;
        };

        const timeout = setTimeout(() => {
            setStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [status]);

    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setPending(true);

        const isPublic = draftVisibility === "public";

        try {
            const error = await handleCreateNode(title, isPublic);

            if (error) {
                setError(error.message);
                setStatus(true);
                return;
            }

            setError("");
            setStatus(false);
            setTitle("");
            setSortMode("createdAt");
        } finally {
            setPending(false);
        }
    }

    return <form id="create-list-form" onSubmit={handleSubmit}>
        <h2>Add Quest</h2>
        <StatusMessage text={status ? error : ""} />
        <input value={title}
            disabled={pending}
            onChange={(event) => { setTitle(event.target.value) }}
            placeholder="Enter Quest Name"></input>
        <button type="submit"
            disabled={pending}>
            {pending ? "Creating..." : "Create new quest"}
        </button>
        <select className="visibility-dropdown"
            disabled={pending}
            value={draftVisibility}
            onChange={(event) => {
                setDraftVisibility(event.target.value);
            }}>
            <option value="private">Private</option>
            <option value="public">Public</option>
        </select>
    </form>
}