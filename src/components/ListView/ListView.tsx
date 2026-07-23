import List from "../List/List";
import './ListView.css';

import { Node } from "../../types/Node";

import firestoreService from "../../api/services/firestoreService";
import { useNodes } from "../../contexts/NodesContext";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import { rectSortingStrategy } from '@dnd-kit/sortable';
import { restrictToParentElement } from '@dnd-kit/modifiers';

type ListViewProps = {
    role: "sorted" | "pinned",
    lists: Node[],
    sortMode: string,
}

export default function ListView(props: ListViewProps) {
    const {
        setFlatNodes,

        setSortMode,
    } = useNodes();

    if (props.role === "pinned") {
        const pinnedLists = props.lists.filter(list => list.pinned && !list.archived);

        const allPinnedTodos = pinnedLists.flatMap(list => list.items ?? [])
        const firstUncompleted = allPinnedTodos.find(item => !item.completed)

        let highlightedTodoId = null;
        if (firstUncompleted) {
            highlightedTodoId = firstUncompleted.id;
        }

        return <div className="list-view">
            {pinnedLists.map(list => {
                return (
                    <List key={list.id}
                        id={list.id}
                        isPublic={list.isPublic}
                        pinned={list.pinned}
                        text={list.text}
                        isNodePage={false}
                        listItems={list.items ?? []}
                        isArchived={list.archived}
                        ownerId={list.ownerId}
                        highlightedTodoId={highlightedTodoId}
                    />)

            })}
        </div>
    } else {
        let sortedLists = props.lists.filter(list => !list.pinned && !list.archived);

        switch (props.sortMode) {
            case "createdAt":
                sortedLists = [...sortedLists].sort((a, b) => b.createdAt - a.createdAt);
                break;
            case "order":
                sortedLists = [...sortedLists].sort((a, b) => a.order - b.order);
                break;
            case "updatedAt":
                sortedLists = [...sortedLists].sort((a, b) => b.updatedAt - a.updatedAt);
                break;
            case "alphabetical":
                sortedLists = [...sortedLists].sort((a, b) => a.text.localeCompare(b.text));
                break;
            case "archived":
                sortedLists = props.lists.filter(list => list.archived);
                break;
        }

        function handleDragEnd(event: DragEndEvent) {
            const oldIndex = sortedLists.findIndex(list => list.id === event.active.id);
            const newIndex = sortedLists.findIndex(list => list.id === event.over?.id);

            const reordered = arrayMove(sortedLists, oldIndex, newIndex);

            const hasChanged = reordered.some((item, index) => item.id !== sortedLists[index]?.id);

            if (!hasChanged) {
                return;
            }

            reordered.forEach((list, index) => {
                firestoreService.nodes.updateNodeOptimistic(list.id, { order: index, updatedAt: Date.now() });
            });

            const reorderedWithOrder = reordered.map((list, index) => ({
                ...list,
                order: index
            }));

            setFlatNodes(prev => {
                const otherNodes = prev.filter(node => !reorderedWithOrder.find(reorderedNode => reorderedNode.id === node.id));
                return [...otherNodes, ...reorderedWithOrder];
            });

            setSortMode("order");
        }


        return <DndContext
            modifiers={[restrictToParentElement]}
            onDragEnd={handleDragEnd} >

            <SortableContext
                items={sortedLists.map(l => l.id)}
                strategy={rectSortingStrategy}
            >
                <div className="list-view">
                    {sortedLists.map(list => {
                        return (
                            <List key={list.id}
                                id={list.id}
                                text={list.text}
                                isNodePage={false}
                                pinned={list.pinned}
                                listItems={list.items ?? []}
                                isArchived={list.archived}
                                isPublic={list.isPublic}
                                ownerId={list.ownerId}
                            />)
                    })}
                </div>
            </SortableContext>
        </DndContext>
    }
}