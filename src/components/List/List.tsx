import Item from "../Item/Item.js"
import { Node } from "../../types/Node.js";
import StatusMessage from "../StatusMessage/StatusMessage.js";
import PopOver from "../PopOver/PopOver.js";
import { useEffect, useRef, useState } from "react";
import './List.css';
import { Link, useNavigate } from "react-router-dom";
import firestoreService from "../../api/services/firestoreService.js";

import { useAuth } from "../../contexts/AuthContext.js";
import { useNodes } from "../../contexts/NodesContext.js";
import progressBarCalc from "../../util/progressBarCalc/progressBarCalc.js";

import {
    DndContext, DragEndEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";

import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProgressBar from "../ProgressBar/ProgressBar.js";

type ListProps = {
    isNodePage: boolean,
    newParentId?: string,

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
        handleResetTasks,

        handleDeleteNode,

    } = useNodes();

    const todos = props.listItems?.filter(item => item.type === 'todo') ?? [];
    const progress = progressBarCalc(todos);

    const [value, setValue] = useState("");

    const [draftTitle, setDraftTitle] = useState("");
    const [isEditing, setEditing] = useState(false);

    const [deletePending, setDeletePending] = useState(false);

    const [resetPending, setResetPending] = useState(false);

    const hasCompletedTodoItems = props.listItems?.some(node => node.type === "todo" && node.completed === true);

    const [addItemPending, setAddItemPending] = useState(false);

    const [titlePending, setTitlePending] = useState(false);

    const [visibilityPending, setVisibilityPending] = useState(false);

    const [addTodoStatus, setAddTodoStatus] = useState<boolean | null>(null);
    const [titleStatus, setTitleStatus] = useState<boolean | null>(null);

    const [error, setError] = useState("");

    const [shouldFocusTitle, setShouldFocusTitle] = useState(props.id === props.newParentId);
    const titleInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (shouldFocusTitle) {
            setDraftTitle(props.text);
            setEditing(true);
        }
    }, [shouldFocusTitle, props.text]);

    useEffect(() => {
        if (isEditing && shouldFocusTitle) {
            titleInputRef.current?.focus();
            titleInputRef.current?.select();
            setShouldFocusTitle(false);
        }
    }, [isEditing, shouldFocusTitle]);

    const [newNodeId, setNewNodeId] = useState<string | null>(null);

    const { user } = useAuth();
    const isGuest = user?.uid === "guest";
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

    const [shouldFocusNewTodo, setShouldFocusNewTodo] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const wasDisabled = useRef(false);

    useEffect(() => {
        if (wasDisabled.current && !disabled && shouldFocusNewTodo) {
            inputRef.current?.focus();
            setShouldFocusNewTodo(false);
        }
        wasDisabled.current = disabled;
    }, [disabled, shouldFocusNewTodo]);

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
            setShouldFocusNewTodo(true);

            const result = await handleCreateChildNode(value, props.id, "todo");

            if (result.error) {
                setError(result.error.message);
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

        setDeletePending(true);

        try {
            const error = await handleDeleteNode(props.id);

            if (error) {
                setError(error.message);
                setTitleStatus(true);
                return;
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
    }
    function handleRestoreClick() {
        handleRestoreNode(props.id);
    }
    function handleArchiveClick() {
        handleArchiveNode(props.id);
    }
    function handlePinClick() {
        handlePin(props.id);
    }
    async function handleCreateSeparatorClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        if (deletePending) {
            return;
        }

        setAddItemPending(true);

        try {
            const result = await handleCreateChildNode("separator", props.id, "separator");

            if (result.error) {
                setError(result.error.message);
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
    async function handleCreateHeadingClick(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();

        if (deletePending) {
            return;
        }

        setAddItemPending(true);

        try {
            const result = await handleCreateChildNode("New Heading", props.id, "heading");

            if (result.error) {
                setError(result.error.message);
                setAddTodoStatus(true);
                return;
            }

            if (result.id) {
                setNewNodeId(result.id);
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
    async function handleResetClick() {
        if (resetPending || deletePending || addItemPending) {
            return;
        }

        setResetPending(true);

        try {
            const error = await handleResetTasks(props.id);

            if (error) {
                setError(error.message);
                setTitleStatus(true);
                return;
            }

            setError("");
            setTitleStatus(false);
        } finally {
            setResetPending(false);
        }
    }

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    function handleDragEnd(event: DragEndEvent) {

        if (event.over === null) {
            return;
        }

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
            {progress !== null ? <ProgressBar percent={progress}></ProgressBar> : ""}
            {isOwner ? <div className="list-actions">
                <PopOver
                    type="actions"
                    align="left"
                    disabled={disabled}>
                    {isOwner && !isArchived ? <button onClick={handleArchiveClick}>Archive</button> : ""}
                    {isOwner && isArchived ? <button onClick={handleRestoreClick}>Restore</button> : ""}
                    {isOwner ? !props.isNodePage && <button onClick={handlePinClick}>Pin</button> : ""}
                    {!isGuest && isOwner ? props.isNodePage && <button disabled={visibilityPending || isGuest} onClick={handleVisibility}>{isPublic ? "Change to Private" : "Change to Public"}</button> : ""}
                    {isOwner ? <button onClick={handleDeleteClick}>Delete</button> : ""}
                    {!isGuest && props.isNodePage ? <button onClick={handleCopyLink}>Copy link</button> : ""}
                </PopOver>
                {!props.isNodePage && !props.pinned ? <span className="drag-button" {...listeners}>⠿</span> : ""}
                {isOwner && hasCompletedTodoItems 
                ? <button className="item-create-options" 
                disabled={resetPending || deletePending || addItemPending} onClick={handleResetClick}>Reset</button> 
                : <div className="fake-actions-space"></div>}
            </div> : ""}
            <StatusMessage text={titleStatus ? error : ""} />
            {isEditing ? <form className="edit-list-title" onSubmit={handleSubmitEdit}>
                <h2 className="list-title-edit">
                    <span className="title-label">Title:</span>
                    <div className="input-form-wrapper">
                        <input
                            ref={titleInputRef}
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
            <DndContext sensors={sensors}
                onDragEnd={handleDragEnd}>
                <SortableContext
                    items={(props.listItems ?? []).map(i => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <ul>
                        {!props.isNodePage ? <Link to={`/${props.id}`}>Details</Link> : ""}
                        {(props.listItems ?? []).map(item => (
                            <Item isOwner={isOwner}

                                resetPending={resetPending}
                                deletePending={deletePending}

                                autoFocus={item.id === newNodeId}

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
                    <PopOver
                        type="create"
                        align="left"
                        disabled={disabled}>
                        {isOwner ? <button disabled={disabled} onClick={handleCreateSeparatorClick}>Add Separator</button> : ""}
                        {isOwner ? <button disabled={disabled} onClick={handleCreateHeadingClick}>Add Heading</button> : ""}
                    </PopOver>
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