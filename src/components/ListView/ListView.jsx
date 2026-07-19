import List from "../List/List";
import './ListView.css';

import firestoreService from "../../api/services/firestoreService";
import { useNodes } from "../../contexts/NodesContext";

import { DndContext } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { arrayMove } from '@dnd-kit/sortable';

export default function ListView(props) {
    const {
        setFlatNodes, 

        setSortMode,
    } = useNodes();

    if (props.role === "pinned") {
        const pinnedLists = props.lists.filter(list => list.pinned && !list.archived);

        const allPinnedTodos = pinnedLists.flatMap(list => list.items)
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
                        pinned={list.pinned}
                        text={list.text}
                        listItems={list.items}
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
                //todo: child nodes being changed dont update parent updatedAt, only parent changes do
                sortedLists = [...sortedLists].sort((a, b) => b.updatedAt - a.updatedAt);
                break;
            case "alphabetical":
                sortedLists = [...sortedLists].sort((a, b) => a.text.localeCompare(b.text));
                break;
            case "archived":
                sortedLists = props.lists.filter(list => list.archived);
                break;
        }

        function handleDragEnd(event) {
            console.log(event);

            const oldIndex = sortedLists.findIndex(list => list.id === event.active.id);
            const newIndex = sortedLists.findIndex(list => list.id === event.over?.id);

            const reordered = arrayMove(sortedLists, oldIndex, newIndex);

            reordered.forEach((list, index) => {
                firestoreService.nodes.updateNodeOptimistic(list.id, { order: index });
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


        return <DndContext onDragEnd={handleDragEnd}>
            <SortableContext
                items={sortedLists.map(l => l.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="list-view">
                    {sortedLists.map(list => {
                        return (
                            <List key={list.id}
                                id={list.id}
                                text={list.text}
                                pinned={list.pinned}
                                listItems={list.items}
                                isArchived={list.archived}
                                ownerId={list.ownerId}
                            />)
                    })}
                </div>
            </SortableContext>
        </DndContext>
    }
}