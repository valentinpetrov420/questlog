import { useContext, createContext, useEffect, useState } from "react";

import { siteName, maxLength } from "../constants/app.js";
import { formatError } from '../util/errorResponse.js';
import { validateText } from '../util/validation.js';

import { useAuth } from './AuthContext.jsx';
import firestoreService from "../api/services/firestoreService.js";

export const NodesContext = createContext();

export function NodesProvider({ children }) {
    const [nodesLoading, setNodesLoading] = useState(true);
    const [nodes, setNodes] = useState([]);

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
            setNodes([]);
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
            setNodes(nodes);
        })
            .finally(() => {
                setNodesLoading(false);
            });
    }, [user, authReady]);

    async function handleCreateNode(title, visibility) {
        if (!user) {
            return;
        }

        console.log("created node: ", title);
        console.log("created node with visibility: " + visibility);

        const result = validateText(title, maxLength);

        if (!result.valid) {
            return {
                success: false,
                message: result.error
            };
        }

        try {
            const id = await firestoreService.nodes.createNode(user.uid, {
                type: "page",
                title: result.value,
                isPublic: visibility
            });

            setNodes(prev => [
                ...prev,
                {
                    type: "page",
                    title: result.value,
                    isPublic: visibility,
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

            setNodes(prev => prev.map(node => node.id === parentId ? {
                ...node,
                items: [...node.items, {
                    type: "todo",
                    text: result.value,
                    isPublic: false,
                    ownerId: user.uid,
                    parentId,
                    id: id,
                    children: [],
                    createdAt: Date.now(),
                    updatedAt: Date.now(),
                    pinned: false,
                    archived: false,
                }]
            } : node
            ));

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to create node", "createChildNode");
        }
    }

    async function handleArchiveNode(nodeId) {
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

        setNodes(prev =>
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

        setNodes(prev =>
            prev.map(node =>
                node.id === nodeId
                    ? { ...node, archived: false, updatedAt: Date.now() }
                    : node
            )
        );

        firestoreService.nodes.updateNodeOptimistic(nodeId, { archived: false })
    }
    async function handleEditNodeTitle(nodeId, newTitle){
        console.log("received: " + newTitle);

		if (!nodeId) {
			return {
				success: false,
				message: "Missing nodeId"
			};
		}

		const result = validateText(newTitle, maxLength);

		if (!result.valid) {
			return {
				success: false,
				message: result.error
			};
		}

		try {
			await firestoreService.nodes.updateNode(nodeId, { title: result.value })

			setNodes(prev =>
				prev.map(node =>
					node.id === nodeId
						? { ...node, title: result.value, updatedAt: Date.now() }
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

    async function handleDeleteNode(nodeId) {
        const confirmed = window.confirm("Delete this list?");

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
            await firestoreService.nodes.deleteNode(nodeId);


            //todo: this wont work for nested nodes because 
            // its the same function for both parents and children
            const updatedState = nodes.filter(node => node.id !== nodeId);
            setNodes(updatedState);

            return {
                success: true
            };
        } catch (error) {
            return formatError(error, "Failed to delete node", "deleteNode");
        }
    }


    return (
        <NodesContext.Provider
            value={{
                nodes, setNodes,
                nodesLoading, setNodesLoading,

                sortMode, setSortMode,

                handleCreateNode,

                handleCreateChildNode,

                handleArchiveNode,
                handleRestoreNode,
                handleEditNodeTitle,

                handleDeleteNode,
            }}
        >
            {children}
        </NodesContext.Provider>
    )


}


export function useNodes() {
    return useContext(NodesContext);
}