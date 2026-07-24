import { useContext, createContext, useEffect, useState, useMemo, ReactNode } from "react";

import { type Node } from '../types/Node.ts';

import { formatError } from '../util/errorResponse/errorResponse.js';
import { validateText } from '../util/validation/validation.js';
import nestNodes from "../api/services/storage.ts";

import { useAuth } from './AuthContext.tsx';
import firestoreService from "../api/services/firestoreService.ts";

type ActionResult = {
    success: boolean,
    message?: string,
    code?: string,
}

type NodesContextValue = {
    nodes: Node[];
    flatNodes: Node[];
    setFlatNodes: React.Dispatch<React.SetStateAction<Node[]>>;

    nodesLoading: boolean;
    setNodesLoading: React.Dispatch<React.SetStateAction<boolean>>;

    sortMode: string;
    setSortMode: React.Dispatch<React.SetStateAction<string>>;


    handleCreateNode: (text: string, visibility: boolean) => Promise<ActionResult>;
    handleCreateChildNode: (text: string, parentId: string, type: Node["type"]) => Promise<ActionResult>;
    //todo: handle failures of optimistic updates somehow, like a rollback,
    // because they return a result payload with a message; do something with it

    //!window.confirm results are always silently undefined thru no fault of the code
    // optimistic updates also return undefined on success
    handleArchiveNode: (nodeId: string) => Promise<ActionResult | undefined>;
    handleRestoreNode: (nodeId: string) => Promise<ActionResult | undefined>;
    handleEditNodeText: (nodeId: string, newText: string) => Promise<ActionResult>;
    handlePin: (nodeId: string) => Promise<ActionResult | undefined>;
    handleVisibilityChange: (nodeId: string) => Promise<ActionResult>;
    handleDeleteNode: (nodeId: string) => Promise<ActionResult | undefined>;
    handleToggleChildNode: (nodeId: string) => Promise<ActionResult | undefined>;
};

type NodesProviderProps = {
    children: ReactNode;
};

export const NodesContext = createContext<NodesContextValue | null>(null);

export function NodesProvider({ children }: NodesProviderProps) {
    const [nodesLoading, setNodesLoading] = useState(true);

    const [flatNodes, setFlatNodes] = useState<Node[]>([]);
    const nodes = useMemo(() => {
        return nestNodes(flatNodes);
    }, [flatNodes]);

    const { user, authReady } = useAuth();

    const [sortMode, setSortMode] = useState(() => {
        return localStorage.getItem("sortmode") || "createdAt";
    });

    useEffect(() => {
        localStorage.setItem("sortmode", sortMode);
    }, [sortMode]);

    useEffect(() => {
        if (!authReady) {
            return;
        }
        if (!user) {
            setFlatNodes([]);
            setNodesLoading(false);
            return;
        }

        //todo: page mount is instant but loading lists is not
        // communicate loading state to the user =>
        // possibly [loadingState, setLoadingState] architecture with try {} finally {}
        // also loading is indistinguishable from no lists when the user is new as they both render as []

        // i think it is better to separate authReady gate from lists loading 
        // authReady (its in context now, dw about it) = nothing to valid to render yet, blank (dark mode themed) page
        // lists loading = skeleton shell
        // goal is user perceived progress, not actual speed

        // i saw that tiktok does this too, blank unstyled white Please wait page (= pre-theme) =>
        // skeleton boxes with a pulsing animation (= pre-content)

        firestoreService.nodes.getNodes(user.uid).then((nodes: Node[]) => {
            setFlatNodes(nodes);
        })
            .finally(() => {
                setNodesLoading(false);
            });
    }, [user, authReady]);

    async function handleCreateNode(text: string, visibility: boolean) {
        if (!user) {
            return {
                success: false,
                message: "authentication error"
            };
        }

        const result = validateText(text);

        if (!result.valid) {
            return {
                success: false,
                message: result.error
            };
        }

        try {
            const roots = flatNodes.filter(n => n.parentId === null);
            const order = roots.length;

            const id = await firestoreService.nodes.createNode(user.uid, {
                type: "page",
                text: result.value,
                isPublic: visibility,
                order,
            });

            setFlatNodes(prev => [
                ...prev,
                {
                    id,
                    type: "page",
                    text: result.value,
                    parentId: null,
                    ownerId: user.uid,
                    isPublic: visibility,
                    pinned: false,
                    archived: false,
                    completed: false,
                    order,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                }
            ]);

            console.log("created node: ", text);
            console.log("created node with visibility: " + visibility);

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to create node", "createNode");
        }
    }

    async function handleCreateChildNode(text: string, parentId: string, type: Node["type"]) {
        if (!user) {
            return {
                success: false,
                message: "authentication error"
            };
        }

        const result = validateText(text);

        if (!result.valid) {
            return {
                success: false,
                message: result.error
            };
        }

        try {
            const siblings = flatNodes.filter(n => n.parentId === parentId);
            const order = siblings.length;

            const id = await firestoreService.nodes.createNode(user.uid, {
                parentId,
                type,
                text: result.value,
                order,
            });


            setFlatNodes(prev => [
                ...prev,
                {
                    parentId,
                    order,
                    type,
                    text: result.value,
                    isPublic: false,
                    ownerId: user.uid,
                    completed: false,
                    id: id,
                    items: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    pinned: false,
                    archived: false,
                }
            ]);

            console.log("created node: ", text);

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to create node", "createChildNode") as ActionResult;
        }
    }

    async function handleArchiveNode(nodeId: string) {
        const confirmed = window.confirm("Archive this list?");

        if (!confirmed) {
            return;
        }

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        setFlatNodes(prev =>
            prev.map(node =>
                node.id === nodeId
                    ? { ...node, archived: true, updatedAt: Date.now() }
                    : node
            )
        );

        firestoreService.nodes.updateNodeOptimistic(nodeId, { archived: true })
    }
    async function handleRestoreNode(nodeId: string) {
        const confirmed = window.confirm("Restore this list?");

        if (!confirmed) {
            return;
        }

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        setFlatNodes(prev =>
            prev.map(node =>
                node.id === nodeId
                    ? { ...node, archived: false, updatedAt: Date.now() }
                    : node
            )
        );

        firestoreService.nodes.updateNodeOptimistic(nodeId, { archived: false })
    }
    async function handleEditNodeText(nodeId: string, newText: string) {
        console.log("received: " + newText);

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const result = validateText(newText);

        if (!result.valid) {
            return {
                success: false,
                message: result.error
            };
        }

        try {
            await firestoreService.nodes.updateNode(nodeId, { text: result.value })

            setFlatNodes(prev =>
                prev.map(node =>
                    node.id === nodeId
                        ? { ...node, text: result.value, updatedAt: Date.now() }
                        : node
                )
            );

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to edit title", "editNodeTitle");
        }

    }
    async function handlePin(nodeId: string) {
        console.log("pinned: " + nodeId);

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const targetNode = nodes.find(node => node.id === nodeId);

        if (!targetNode) {
            return {
                success: false,
                message: "Something went wrong"
            }
        };

        const newPinned = !targetNode.pinned;

        setFlatNodes(prev =>
            prev.map(node =>
                node.id === nodeId
                    ? { ...node, pinned: newPinned, updatedAt: Date.now() }
                    : node
            )
        );

        firestoreService.nodes.updateNodeOptimistic(nodeId, { pinned: newPinned });
    }
    async function handleVisibilityChange(nodeId: string) {
        console.log("new visibility on node: " + nodeId);

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const targetNode = flatNodes.find(node => node.id === nodeId);

        if (!targetNode) {
            return {
                success: false,
                message: "Something went wrong"
            }
        };

        const newVisibility = !targetNode.isPublic;

        try {
            await firestoreService.nodes.updateNode(nodeId, { isPublic: newVisibility });

            setFlatNodes(prev =>
                prev.map(node =>
                    node.id === nodeId
                        ? { ...node, isPublic: newVisibility, updatedAt: Date.now() }
                        : node
                )
            );

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to change visibility", "VisibilityChange");
        }

    }

    async function handleDeleteNode(nodeId: string) {
        const confirmed = window.confirm("Delete this node?");

        if (!confirmed) {
            return;
        }

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        try {
            if (!user) {
                return formatError("", "Failed to delete node", "deleteNode");
            }

            await firestoreService.nodes.deleteNode(nodeId, user.uid);

            const updatedState = flatNodes.filter(node => node.id !== nodeId);
            setFlatNodes(updatedState);

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to delete node", "deleteNode");
        }
    }

    async function handleToggleChildNode(nodeId: string) {
        console.log(nodeId);

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const item = flatNodes.find(i => i.id === nodeId);

        if (!item) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const newCompleted = !item.completed;
        console.log("old: " + item.completed)
        console.log("new: " + newCompleted)

        setFlatNodes(prev =>
            prev.map(node =>
                node.id === nodeId
                    ? { ...node, completed: newCompleted, updatedAt: Date.now() }
                    : node
            )
        );

        firestoreService.nodes.updateNodeOptimistic(nodeId, {
            completed: newCompleted
        });

        return;
    }


    return (
        <NodesContext.Provider
            value={{
                nodes, flatNodes, setFlatNodes,
                nodesLoading, setNodesLoading,

                sortMode, setSortMode,

                handleCreateNode,

                handleCreateChildNode,

                handleArchiveNode,
                handleRestoreNode,
                handleEditNodeText,
                handlePin,
                handleVisibilityChange,

                handleDeleteNode,

                handleToggleChildNode,
            }}
        >
            {children}
        </NodesContext.Provider>
    )


}

export function useNodes() {
    const context = useContext(NodesContext);

    if (!context) {
        throw new Error("useNodes must be used inside NodesProvider");
    }

    return context;
}