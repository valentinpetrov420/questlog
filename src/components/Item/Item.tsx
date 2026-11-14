import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import StatusMessage from "../StatusMessage/StatusMessage.js";
import PopOver from "../PopOver/PopOver.js";
import './Item.css';

import { useNodes } from "../../contexts/NodesContext.js";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ItemProps = {
    id: string;
    text: string;
    completed: boolean;

    newNodeId: string | null;

    type: "todo" | "page" | "separator" | "heading";
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

        handleDeleteNode,

        handleToggleChildNode,

        handlePromoteTodo,
    } = useNodes();

    const [isEditingTodo, setEditingTodo] = useState(props.newNodeId !== null);
    const [draftTitleTodo, setDraftTitleTodo] = useState(props.newNodeId ? props.text : "");

    const [pending, setPending] = useState(false);

    const [error, setError] = useState("");

    const disabled = pending || props.deletePending || props.resetPending || !props.isOwner;

    const highlightedTodoId = props.highlightedTodoId;

    const inputRef = useRef<HTMLInputElement>(null);

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
        return <li ref={setNodeRef} style={style} {...attributes}>
            <StatusMessage text={error} />
            <div className={isEditingTodo ? "edit-form-wrapper" : "item-wrapper heading"}>
                {props.isOwner ? <span className="drag-button" {...listeners}>⠿</span> : ""}
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
        return <li ref={setNodeRef} style={style} {...attributes}>
            <div className="item-wrapper page">
                {props.isOwner && <span className="drag-button" {...listeners}>⠿</span>}
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
        return <li ref={setNodeRef} style={style} {...attributes}>
            <div className="item-wrapper separator">
                {props.isOwner && <span className="drag-button" {...listeners}>⠿</span>}
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

    //props.type === "todo" 
    return <li ref={setNodeRef} style={style} {...attributes}>
        <StatusMessage text={error} />
        <div className={isEditingTodo ? "edit-form-wrapper" : "item-wrapper"}>
            {props.isOwner ? <span className="drag-button" {...listeners}>⠿</span> : ""}
            <input
                className="item-checkbox"
                type="checkbox"
                checked={props.completed}
                onChange={handleToggleClick}
                disabled={disabled}
            />
            {isEditingTodo ? <form className="edit-todo-form" onSubmit={handleSubmitEditTodo}>
                <input className="edit-item-input"
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