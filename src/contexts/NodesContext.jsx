import { useContext, createContext, useEffect, useState, useMemo } from "react";

import { siteName, maxLength } from "../constants/app.js";
import { formatError } from '../util/errorResponse.js';
import { validateText } from '../util/validation.js';
import nestNodes from "../api/services/storage.js";

import { useAuth } from './AuthContext.jsx';
import firestoreService from "../api/services/firestoreService.js";


export const NodesContext = createContext();

export function NodesProvider({ children }) {
    const [nodesLoading, setNodesLoading] = useState(true);

    const [flatNodes, setFlatNodes] = useState([]);
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

        firestoreService.nodes.getNodes(user.uid).then((nodes) => {
            setFlatNodes(nodes);
        })
            .finally(() => {
                setNodesLoading(false);
            });
    }, [user, authReady]);

    async function handleCreateNode(text, visibility) {
        if (!user) {
            return;
        }

        console.log("created node: ", text);
        console.log("created node with visibility: " + visibility);

        const result = validateText(text, maxLength);

        if (!result.valid) {
            return {
                success: false,
                message: result.error
            };
        }

        try {
            const id = await firestoreService.nodes.createNode(user.uid, {
                type: "page",
                text: result.value,
                isPublic: visibility
            });

            setFlatNodes(prev => [
                ...prev,
                {
                    parentId: null,
                    type: "page",
                    text: result.value,
                    isPublic: visibility,
                    ownerId: user.uid,
                    id: id,
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    pinned: false,
                    archived: false,
                }
            ]);

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to create node", "createNode");
        }
    }

    async function handleCreateChildNode(text, parentId) {
        if (!user) {
            return;
        }

        console.log("created node: ", text);

        const result = validateText(text, maxLength);

        if (!result.valid) {
            return {
                success: false,
                message: result.error
            };
        }

        try {
            const id = await firestoreService.nodes.createNode(user.uid, {
                parentId,
                type: "todo",
                text: result.value,
            });

            setFlatNodes(prev => [
                ...prev,
                {
                    parentId,
                    type: "todo",
                    text: result.value,
                    isPublic: false,
                    ownerId: user.uid,
                    id: id,
                    children: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    pinned: false,
                    archived: false,
                }
            ]);

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to create node", "createChildNode");
        }
    }

    async function handleArchiveNode(nodeId) {
        //todo: archived lists should be forced set to private
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
    async function handleRestoreNode(nodeId) {
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
    async function handleEditNodeText(nodeId, newText) {
        console.log("received: " + newText);

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const result = validateText(newText, maxLength);

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
    async function handlePin(nodeId) {
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
    async function handleVisibilityChange(nodeId) {
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
            return formatError(error, "Failed to change visibility", "handleVisibilityChange");
        }

    }

    async function handleDeleteNode(nodeId) {
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

    function handleToggleChildNode(nodeId) {
        console.log(nodeId);

        if (!nodeId) {
            return {
                success: false,
                message: "Missing nodeId"
            };
        }

        const item = flatNodes.find(i => i.id === nodeId);

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

        firestoreService.nodes.updateNode(nodeId, { completed: newCompleted });
    }


    return (
        <NodesContext.Provider
            value={{
                nodes, flatNodes,
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
    return useContext(NodesContext);
}