import Item from "../Item/Item.js"
import { Node } from "../../types/Node.js";
import StatusMessage from "../StatusMessage/StatusMessage.js";
import { useEffect, useRef, useState } from "react";
import './List.css';
import { Link, useNavigate } from "react-router-dom";
import firestoreService from "../../api/services/firestoreService.js";

import { useAuth } from "../../contexts/AuthContext.js";
import { useNodes } from "../../contexts/NodesContext.js";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ListProps = {
    isNodePage: boolean,

    key: string
    id: string,
    text: string,
    pinned: boolean,
    listItems?: Node[],
    isArchived: boolean,
    isPublic: boolean,
    ownerId: string,
    highlightedTodoId?: string | null,
}

export default function List(props: ListProps) {
    const { attributes, setNodeRef, transform, transition, listeners } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const {
        setFlatNodes,

        handleCreateChildNode,

        handleArchiveNode,
        handleRestoreNode,
        handleEditNodeText,
        handlePin,
        handleVisibilityChange,

        handleDeleteNode,

    } = useNodes();

    const [value, setValue] = useState("");

    const [draftTitle, setDraftTitle] = useState("");
    const [isEditing, setEditing] = useState(false);

    const [deletePending, setDeletePending] = useState(false);

    const [addItemPending, setAddItemPending] = useState(false);

    const [titlePending, setTitlePending] = useState(false);

    const [visbilityPending, setVisibilityPending] = useState(false);

    const [addTodoStatus, setAddTodoStatus] = useState<boolean | null>(null);
    const [titleStatus, setTitleStatus] = useState<boolean | null>(null);

    const [error, setError] = useState("");

    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!addTodoStatus) {
            return;
        };

        const timeout = setTimeout(() => {
            setAddTodoStatus(null);
        }, 3000);

        return () => clearTimeout(timeout);
    }, [addTodoStatus]);

    const disabled = addItemPending || deletePending;

    const inputRef = useRef<HTMLInputElement>(null);
    const wasDisabled = useRef(false);

    useEffect(() => {
        if (wasDisabled.current && !disabled) {
            inputRef.current?.focus();
        }
        wasDisabled.current = disabled;
    }, [disabled]);

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

    const [itemMenuOpen, setItemMenuOpen] = useState(false);

    const itemPopoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!itemMenuOpen) return;

        function handleClickOutside(event: MouseEvent) {
            if (itemPopoverRef.current && !itemPopoverRef.current.contains(event.target as Element)) {
                setItemMenuOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [itemMenuOpen]);

    const isArchived = props.isArchived;
    const isPublic = props.isPublic;
    const isOwner = user?.uid === props.ownerId;

    function cancelEdit() {
        setEditing(false);
        setDraftTitle(props.text);
        setTitleStatus(null);
    }
    async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (deletePending) {
            return;
        }

        setAddItemPending(true);

        try {
            const error = await handleCreateChildNode(value, props.id, "todo");

            if (error) {
                setError(error.message);
                setAddTodoStatus(true);
                return;
            }

            setError("");
            setAddTodoStatus(false);
            setValue("");
        } finally {
            setAddItemPending(false);
        }
    }
    function handleEditTitle() {
        if (deletePending) {
            return;
        }

        setDraftTitle(props.text);
        setEditing(true);
    }
    async function handleSubmitEdit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault();

        if (deletePending) {
            return;
        }

        setTitlePending(true);

        try {
            const error = await handleEditNodeText(props.id, draftTitle);

            if (error) {
                setError(error.message);
                setTitleStatus(true);
                return;
            }

            setEditing(false);
            setError("");
            setTitleStatus(false);
        } finally {
            setTitlePending(false);
        }
    }
    async function handleDeleteClick() {
        if (deletePending) {
            return;
        }

        setMenuOpen(false);
        setDeletePending(true);

        try {
            const error = await handleDeleteNode(props.id);

            if (error) {
                setError(error.message);
                setTitleStatus(true);

            }

            setError("");
            setTitleStatus(false);

            if (props.isNodePage) {
                navigate("/");
            }

        } finally {
            setDeletePending(false);
        }
    }
    function handleCopyLink() {
        navigator.clipboard.writeText(window.location.href);

        setMenuOpen(false);
    }
    function handleRestoreClick() {
        handleRestoreNode(props.id);

        setMenuOpen(false);
    }
    function handleArchiveClick() {
        handleArchiveNode(props.id);

        setMenuOpen(false);
    }
    function handlePinClick() {
        handlePin(props.id);

        setMenuOpen(false);
    }
    async function handleCreateSeparatorClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        if (deletePending) {
            return;
        }

        setAddItemPending(true);

        try {
            const error = await handleCreateChildNode("separator", props.id, "separator");

            if (error) {
                setError(error.message);
                setAddTodoStatus(true);
                return;
            }

            setError("");
            setAddTodoStatus(false);
            setValue("");
        } finally {
            setAddItemPending(false);
        }
    }
    async function handleVisibility() {
        console.log(props.isPublic);
        if (deletePending) {
            return;
        }

        setVisibilityPending(true);
        setMenuOpen(false);
        const error = await handleVisibilityChange(props.id);

        if (error) {
            setError(error.message);
            setTitleStatus(true);
            return;
        }
        setError("");
        setTitleStatus(false);
        setVisibilityPending(false);

    }
    function handleDragEnd(event: DragEndEvent) {
        if (!props.listItems) {
            return;
        }
        const oldIndex = props.listItems.findIndex(item => item.id === event.active.id);
        const newIndex = props.listItems.findIndex(item => item.id === event.over?.id);

        const reordered = arrayMove(props.listItems, oldIndex, newIndex);

        const hasChanged = reordered.some((item, index) => {
            if (props.listItems) {
                return item.id !== props.listItems[index]?.id
            }
        });

        if (!hasChanged) {
            return;
        }

        reordered.forEach((item, index) => {
            firestoreService.nodes.updateNodeOptimistic(item.id, { order: index, updatedAt: Date.now() });
        });

        const reorderedWithOrder = reordered.map((item, index) => ({
            ...item,
            order: index
        }));

        setFlatNodes(prev => {
            const otherNodes = prev.filter(node => !reorderedWithOrder.find(reorderedNode => reorderedNode.id === node.id));
            return [...otherNodes, ...reorderedWithOrder];
        });
    }

    return (
        <div className="list-component" ref={setNodeRef} style={style} {...attributes}>
            {isOwner ? <div className="list-actions">
                <div className="list-popover-wrapper" ref={popoverRef}>
                    <button
                        disabled={disabled}
                        onClick={() => setMenuOpen(!menuOpen)}>⋯</button>
                    {menuOpen && (
                        <div className="list-popover">
                            {isOwner && !isArchived ? <button onClick={handleArchiveClick}>Archive</button> : ""}
                            {isOwner && isArchived ? <button onClick={handleRestoreClick}>Restore</button> : ""}
                            {isOwner ? !props.isNodePage && <button onClick={handlePinClick}>Pin</button> : ""}
                            {isOwner ? props.isNodePage && <button disabled={visbilityPending} onClick={handleVisibility}>{isPublic ? "Change to Private" : "Change to Public"}</button> : ""}
                            {isOwner ? <button onClick={handleDeleteClick}>Delete</button> : ""}
                            {props.isNodePage ? <button onClick={handleCopyLink}>Copy link</button> : ""}
                        </div>
                    )}
                </div>
                {!props.isNodePage && !props.pinned ? <span className="drag-button" {...listeners}>⠿</span> : ""}
                <div className="fake-actions-space"></div>
            </div> : ""}
            <StatusMessage text={titleStatus ? error : ""} />
            {isEditing ? <form className="edit-list-title" onSubmit={handleSubmitEdit}>
                <h2 className="list-title-edit">
                    <span className="title-label">Title:</span>
                    <div className="input-form-wrapper">
                        <input autoFocus
                            disabled={titlePending}
                            value={draftTitle}
                            onChange={(event) => setDraftTitle(event.target.value)}
                            onBlur={() => {
                                cancelEdit();
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Escape") {
                                    cancelEdit();
                                }
                            }}>

                        </input>
                    </div>
                </h2>
            </form>
                : <h2 className="list-title">Title: {isOwner ? <span onClick={handleEditTitle}>{props.text}<a>✎</a></span> : <p>{props.text}</p>} </h2>}
            <DndContext onDragEnd={handleDragEnd}>
                <SortableContext
                    items={(props.listItems ?? []).map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <ul>
                        {!props.isNodePage ? <Link to={`/${props.id}`}>Details</Link> : ""}
                        {(props.listItems ?? []).map(item => (
                            <Item isOwner={isOwner}

                                deletePending={deletePending}

                                type={item.type}
                                key={item.id}
                                id={item.id}
                                text={item.text}
                                completed={item.completed}
                                highlightedTodoId={props.highlightedTodoId ?? null}
                            />
                        ))}
                    </ul>
                </SortableContext>
            </DndContext>
            {isOwner ?
                <form className="list-form" onSubmit={handleSubmit}>
                    <div className="item-options-popover-wrapper" ref={itemPopoverRef}>
                        <button
                            className="item-create-options"
                            disabled={disabled}
                            type="button"
                            onClick={() => setItemMenuOpen(!itemMenuOpen)}>+</button>
                        {itemMenuOpen && (
                            <div className="item-options-popover">
                                {isOwner ? <button disabled={disabled} onClick={handleCreateSeparatorClick}>Add Separator</button> : ""}
                            </div>
                        )}
                    </div>
                    <div className="input-form-wrapper">
                        <StatusMessage text={addTodoStatus ? error : ""} />
                        <input
                            ref={inputRef}
                            disabled={disabled}
                            placeholder={disabled ? "Please wait..." : "New quest task..."}
                            value={value}
                            onChange={(event) => setValue(event.target.value)}
                        />
                    </div>
                    <button
                        disabled={disabled}
                        className="list-form-button" type="submit">
                        {addItemPending ? "Adding..." : "Add new quest"}
                    </button>
                </form>
                : ""
            }
        </div>
    );
}