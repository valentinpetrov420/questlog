import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import StatusMessage from "../StatusMessage/StatusMessage.js";
import PopOver from "../PopOver/PopOver.js";
import './Item.css';

import { useNodes } from "../../contexts/NodesContext.js";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { normalizeUrl } from "../../util/normalizeUrl/normalizeUrl.js";

type ItemProps = {
    id: string;
    text: string;

    url?: string;
    completed: boolean;

    newNodeId: string | null;

    type: "todo" | "page" | "separator" | "heading" | "link";
    isOwner: boolean;

    deletePending: boolean;
    resetPending: boolean;

    highlightedTodoId: string | null;
}

export default function Item(props: ItemProps) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const {
        handleEditNodeText,
        handleEditNodeUrl,

        handleDeleteNode,

        handleToggleChildNode,

        handlePromoteTodo,
    } = useNodes();

    const isNew = props.newNodeId === props.id;
    const [isEditingTodo, setEditingTodo] = useState(isNew);
    const [draftTitleTodo, setDraftTitleTodo] = useState(isNew ? props.text : "");

    const [editingField, setEditingField] = useState<"text" | "url" | null>(null);
    const [draft, setDraft] = useState("");

    const [pending, setPending] = useState(false);

    const [error, setError] = useState("");

    const disabled = pending || props.deletePending || props.resetPending || !props.isOwner;

    const highlightedTodoId = props.highlightedTodoId;

    const inputRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        if (isEditingTodo || editingField) {
            inputRef.current?.focus();
        }
    }, [isEditingTodo, editingField]);

    function cancelEdit() {
        setEditingTodo(false);
        setDraftTitleTodo(props.text);
        setError("");
    }
    async function handleSubmitEditTodo(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setPending(true);

        try {
            const error = await handleEditNodeText(props.id, draftTitleTodo);

            if (error) {
                setError(error.message);
                setEditingTodo(true);
                return;
            }

            setError("");
            setEditingTodo(false);
            setDraftTitleTodo("");
        } finally {
            setPending(false);
        }
    }
    function handleEditTodo() {
        if (disabled) {
            return;
        }

        if (!props.isOwner) {
            return;
        }
        setEditingTodo(true);
        setDraftTitleTodo(props.text);
    }
    function handleEditLinkText() {
        setDraft(props.text);
        setEditingField("text");
    }
    function handleEditLinkUrl() {
        setDraft(props.url ?? "");
        setEditingField("url");
    }
    function cancelLinkEdit() {
        setEditingField(null);
        setDraft("");
    }
    async function handleSubmitLinkEdit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (editingField === "text") {
            const error = await handleEditNodeText(props.id, draft);
            if (error) {
                setError(error.message);
                return;
            }
        } else if (editingField === "url") {
            const normalized = normalizeUrl(draft);
            if (!normalized) {
                setError("Enter a valid http or https URL");
                return;
            }
            const error = await handleEditNodeUrl(props.id, draft);
            if (error) {
                setError(error.message);
                return;
            }
        }

        setError("");
        cancelLinkEdit();
    }
    async function handleDeleteClick() {
        if (disabled) {
            return;
        }

        if (!props.isOwner) {
            return;
        }

        setPending(true);

        try {
            const error = await handleDeleteNode(props.id);

            if (error) {
                setError(error.message);
                return;

            }
            setError("");
        } finally {
            setPending(false);
        }
    }
    async function handleToggleClick() {
        if (!props.isOwner) {
            return;
        }
        if (disabled) {
            return;
        }
        handleToggleChildNode(props.id);
    }
    async function handlePromoteToPageClick() {
        if (!props.isOwner) {
            return;
        }
        if (disabled) {
            return;
        }

        setPending(true);

        try {

            const error = await handlePromoteTodo(props.id);

            if (error) {
                setError(error.message);
                return;
            }
            setError("");
        } finally {
            setPending(false);
        }
    }

    if (props.type === "heading") {
        return <li ref={setNodeRef} style={style}>
            <StatusMessage text={error} />
            <div className={isEditingTodo ? "edit-form-wrapper" : "item-wrapper heading"}>
                {props.isOwner ? <button
                    type="button"
                    className="drag-button"
                    aria-label="Reorder item"
                    {...listeners}
                    {...attributes}
                >⠿</button> : ""}
                {isEditingTodo ? <form className="edit-todo-form" onSubmit={handleSubmitEditTodo}>
                    <input className="edit-item-input heading"
                        ref={inputRef}
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
                    <button className="heading-item" onClick={handleEditTodo}>{props.text}</button>
                }

                {!isEditingTodo && props.isOwner ? <div className="todo-actions">
                    <div className="item-popover-wrapper">
                        <PopOver
                            type="actions"
                            align="right"
                            disabled={disabled}>
                            <button onClick={handleDeleteClick}>Delete</button>
                        </PopOver>
                    </div>
                </div> :
                    <div></div>
                }
            </div>
        </li>
    }

    if (props.type === "page") {
        return <li ref={setNodeRef} style={style}>
            <div className="item-wrapper page">
                {props.isOwner && <button
                    type="button"
                    className="drag-button"
                    aria-label="Reorder item"
                    {...listeners}
                    {...attributes}
                >⠿</button>}
                <Link className="todo-item-text" to={`/${props.id}`}>{props.text}</Link>
                {!isEditingTodo && props.isOwner ? <div className="todo-actions">
                    <div className="item-popover-wrapper">
                        <PopOver
                            type="actions"
                            align="right"
                            disabled={disabled}>
                            <button onClick={handleDeleteClick}>Delete</button>
                        </PopOver>
                    </div>
                </div> :
                    <div></div>}
            </div>
        </li>
    }

    if (props.type === "separator") {
        return <li ref={setNodeRef} style={style}>
            <div className="item-wrapper separator">
                {props.isOwner && <button
                    type="button"
                    className="drag-button"
                    aria-label="Reorder item"
                    {...listeners}
                    {...attributes}
                >⠿</button>}
                <hr className="separator-hr" />
                {!isEditingTodo && props.isOwner ? <div className="todo-actions">
                    <div className="item-popover-wrapper">
                        <PopOver
                            type="actions"
                            align="right"
                            disabled={disabled}>
                            <button onClick={handleDeleteClick}>Delete</button>
                        </PopOver>
                    </div>
                </div> :
                    <div></div>
                }
            </div>
        </li>
    }

    if (props.type === "link") {
        const safeUrl = props.url ? normalizeUrl(props.url) : null;
        const isEditingLink = editingField !== null;

        return <li ref={setNodeRef} style={style}>
            <StatusMessage text={error} />
            <div className={isEditingLink ? "edit-form-wrapper" : "item-wrapper page"}>
                {props.isOwner ? <button
                    type="button"
                    className="drag-button"
                    aria-label="Reorder item"
                    {...listeners}
                    {...attributes}
                >⠿</button> : ""}

                {isEditingLink ? (
                    <form className="edit-todo-form" onSubmit={handleSubmitLinkEdit}>
                        <input className="edit-item-input"
                            ref={inputRef}
                            disabled={disabled}
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onBlur={() => {
                                cancelLinkEdit();
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    cancelLinkEdit();
                                }
                            }}></input>
                    </form>
                ) : safeUrl ? (
                    <a className="todo-item-text" href={safeUrl} target="_blank" rel="noopener noreferrer">
                        {props.text}
                    </a>
                ) : (
                    <span className="todo-item-text">{props.text}</span>
                )}

                {!isEditingLink && props.isOwner ? (
                    <div className="todo-actions">
                        <div className="item-popover-wrapper">
                            <PopOver type="actions" align="right" disabled={disabled}>
                                <button onClick={handleEditLinkText}>Edit Link Text</button>
                                <button onClick={handleEditLinkUrl}>Edit Link Url</button>
                                <button onClick={handleDeleteClick}>Delete</button>
                            </PopOver>
                        </div>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
        </li>
    }

    //props.type === "todo" 
    return <li ref={setNodeRef} style={style} >
        <StatusMessage text={error} />
        <div className={isEditingTodo ? "edit-form-wrapper" : "item-wrapper"}>
            {props.isOwner ? <button
                type="button"
                className="drag-button"
                aria-label="Reorder item"
                {...listeners}
                {...attributes}
            >⠿</button> : ""}
            <input
                className="item-checkbox"
                type="checkbox"
                checked={props.completed}
                onChange={handleToggleClick}
                disabled={disabled}
            />
            {isEditingTodo ? <form className="edit-todo-form" onSubmit={handleSubmitEditTodo}>
                <input className="edit-item-input"
                    ref={inputRef}
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

                <button className={`todo-item-text ${highlightedTodoId === props.id ? "highlighted" : ""}
                ${props.completed ? "completed" : ""}`}
                    onClick={handleEditTodo}>
                    {props.text}
                </button>
            }

            {!isEditingTodo && props.isOwner ? <div className="todo-actions">
                <div className="item-popover-wrapper">
                    <PopOver
                        type="actions"
                        align="right"
                        disabled={disabled}>
                        <button onClick={handleDeleteClick}>Delete</button>
                        <button onClick={handlePromoteToPageClick}>Promote to Page</button>
                    </PopOver>
                </div>
            </div> :
                <div></div>
            }
        </div>
    </li>
}