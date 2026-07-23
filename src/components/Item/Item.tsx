import { useRef, useState, useEffect } from "react";
import StatusMessage from "../StatusMessage/StatusMessage.js";
import './Item.css';

import { useNodes } from "../../contexts/NodesContext.js";

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ItemProps = {
    id: string;
    text: string;
    completed: boolean;
    isOwner: boolean;
    deletePending: boolean;
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
    } = useNodes();

    const [isEditingTodo, setEditingTodo] = useState(false);
    const [draftTitleTodo, setDraftTitleTodo] = useState("");

    const [pending, setPending] = useState(false);

    const [error, setError] = useState("");

    const disabled = pending || props.deletePending;

    const highlightedTodoId = props.highlightedTodoId;

    const [menuOpen, setMenuOpen] = useState(false);

    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (popoverRef.current && !popoverRef.current.contains(event.target as Element)) {
                setMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    function cancelEdit() {
        setEditingTodo(false);
        setDraftTitleTodo(props.text);
        setError("");
    }
    async function handleSubmitEditTodo(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        setPending(true);

        try {
            const response = await handleEditNodeText(props.id, draftTitleTodo);

            if (response.success) {
                setError("");
                setEditingTodo(false);
                setDraftTitleTodo("");
            } else {
                setError(response.message);
                setEditingTodo(true);
            }
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
            const response = await handleDeleteNode(props.id);

            if (response.success) {
                setError("");
            } else {
                setError(response.message);
            }
        } finally {
            setPending(false);
        }
    }
    async function handleToggleClick() {
        if (!props.isOwner) {
            return;
        }
        handleToggleChildNode(props.id);
    }

    return <li ref={setNodeRef} style={style} {...attributes}>
        <StatusMessage text={error} />
        <div className={isEditingTodo ? "edit-form-wrapper" : "todo-wrapper"}>
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
                    autoFocus
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

                <span className={`todo-item-text ${highlightedTodoId === props.id ? "highlighted" : ""}
                ${props.completed ? "completed" : ""}`}
                    onClick={handleEditTodo}>
                    {props.text}
                </span>
            }

            {!isEditingTodo && props.isOwner ? <div className="todo-actions">
                <div className="item-popover-wrapper" ref={popoverRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
                    {menuOpen && (
                        <div className="item-popover">
                            <button onClick={handleDeleteClick}>Delete</button>
                        </div>
                    )}
                </div>
            </div> :
                <div></div>
            }
        </div>
    </li>
}