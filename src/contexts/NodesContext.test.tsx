import { describe, it, expect, beforeEach, vi } from "vitest";
import {
    renderHook,
    //act, 
    waitFor
} from "@testing-library/react";
import { ReactNode } from "react";

import {
    NodesProvider,
    useNodes,
} from "./NodesContext";

import { useAuth } from "./AuthContext";
import { maxLength } from "../constants/app";

import firestoreService from "../api/services/firestoreService";
//import localStorageService from "../api/services/localStorageService";

import type { Node } from "../types/Node";


vi.mock("./AuthContext", () => ({ useAuth: vi.fn() }));

vi.mock("../api/services/firestoreService", () => ({
    default: {
        nodes: {
            getNodes: vi.fn(),
            createNode: vi.fn(),
            updateNode: vi.fn(),
            updateNodeOptimistic: vi.fn(),
            deleteNode: vi.fn(),
            resetTasks: vi.fn(),
        },
    },
}));

vi.mock("../api/services/localStorageService", () => ({
    default: {
        nodes: {
            getNodes: vi.fn(),
            createNode: vi.fn(),
            updateNode: vi.fn(),
            updateNodeOptimistic: vi.fn(),
            deleteNode: vi.fn(),
            resetTasks: vi.fn(),
        },
    },
}));


function wrapper({ children }: { children: ReactNode }) {
    return (
        <NodesProvider>
            {children}
        </NodesProvider>
    );
}

const testNode = {
    id: "node-1",
    type: "page",
    parentId: null,
    text: "test",
    ownerId: "test",
    isPublic: false,
    pinned: false,
    archived: false,
    completed: false,
    order: 0,
    createdAt: 1000,
    updatedAt: 1000,
};

describe("NodesContext", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        localStorage.clear();

        vi.mocked(useAuth).mockReturnValue({
            user: {
                uid: "test",
            },
            authReady: true,
        } as ReturnType<typeof useAuth>);

        vi.mocked(firestoreService.nodes.getNodes).mockResolvedValue([testNode] as Node[]);
    });

    it("loads nodes for an authenticated user", async () => {

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        expect(result.current.flatNodes).toEqual([testNode]);
    });

    it("authenticated handleCreateNode returns id on success and updates flatNodes", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const id = await result.current.handleCreateNode("test", false);
        const id2 = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(3);
        });

        expect(id).toBeDefined();
        expect(id2).toBeDefined();
        expect(result.current.flatNodes.length).toBe(3);
    });
    it("authenticated handleCreateNode returns an error message on failure, doesn't update flatNodes", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const createResult = await result.current.handleCreateNode("", false);

        const createResult2 = await result.current.handleCreateNode("2".repeat(maxLength + 1), false);

        expect(createResult).toEqual({
            error: {
                message: "Field cannot be empty."
            }
        });
        expect(createResult2).toEqual({
            error: {
                message: `Cannot be longer than ${maxLength} symbols.`
            }
        });
        expect(result.current.flatNodes.length).toBe(1);
    });

    it("authenticated handleCreateChildNode returns id on success and updates flatNodes", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")
            .mockResolvedValueOnce("child-id");

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const parentId = await result.current.handleCreateNode("test", false);
        const childId = await result.current.handleCreateChildNode("test", parentId.id!, "todo");

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(3);
        });

        expect(parentId).toBeDefined();
        expect(childId).toBeDefined();

        const childNodeResult = result.current.flatNodes.find(node => node.id === childId.id);

        expect(childNodeResult?.parentId).toBe(parentId.id);
        expect(childNodeResult?.text).toEqual("test");
        expect(childNodeResult?.type).toEqual("todo");
    });
    it("authenticated handleCreateChildNode returns an error message on failure, doesn't update flatNodes", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const parentId = await result.current.handleCreateNode("test", false);
        const childCreateResult = await result.current.handleCreateChildNode("", parentId.id!, "todo");
        const childCreateResult2 = await result.current.handleCreateChildNode("2".repeat(maxLength + 1), parentId.id!, "todo");

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        expect(childCreateResult).toEqual({
            error: {
                message: "Field cannot be empty."
            }
        });

        expect(childCreateResult2).toEqual({
            error: {
                message: `Cannot be longer than ${maxLength} symbols.`
            }
        });

        expect(result.current.flatNodes.length).toBe(2);

        expect(firestoreService.nodes.createNode).toHaveBeenCalledTimes(1);
    });
    it("authenticated handleCreateChildNode returns error message on missing parentId", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("child-id");

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const childCreateResult = await result.current.handleCreateChildNode("test", undefined!, "todo");

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(1);
        });

        expect(childCreateResult).toEqual({
            error: {
                message: "missing parentId"
            }
        });
    });

    it("authenticated handleArchiveNode correctly updates flatNodes if window confirm is accepted", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")

        vi.spyOn(window, "confirm").mockReturnValue(true);

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const parentResult = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        await result.current.handleArchiveNode(parentResult.id!);

        await waitFor(() => {
            const archivedNode = result.current.flatNodes.find(
                node => node.id === parentResult.id
            );

            expect(archivedNode?.archived).toBe(true);
        });
    });
    it("authenticated handleArchiveNode doesn't update flatNodes if window confirm is declined", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")

        vi.spyOn(window, "confirm").mockReturnValue(false);

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const parentResult = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        await result.current.handleArchiveNode(parentResult.id!);

        const archivedNode = result.current.flatNodes.find(node => node.id === parentResult.id);

        expect(firestoreService.nodes.updateNodeOptimistic).not.toHaveBeenCalled();
        expect(archivedNode?.archived).toBe(false);
    });

    it("authenticated handleRestoreNode correctly updates flatNodes if window confirm is accepted", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")

        vi.spyOn(window, "confirm").mockReturnValueOnce(true).mockReturnValueOnce(true);

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const parentResult = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        await result.current.handleArchiveNode(parentResult.id!);

        await waitFor(() => {
            const archivedNode = result.current.flatNodes.find(
                node => node.id === parentResult.id
            );

            expect(archivedNode?.archived).toBe(true);
        });

        await result.current.handleRestoreNode(parentResult.id!);

        await waitFor(() => {
            expect(firestoreService.nodes.updateNodeOptimistic)
                .toHaveBeenCalledWith(parentResult.id, { archived: false });
        });

        await waitFor(() => {
            const restoredNode = result.current.flatNodes.find(
                node => node.id === parentResult.id
            );

            expect(restoredNode?.archived).toBe(false);
        });
    });
    it("authenticated handleRestoreNode doesn't update flatNodes if window confirm is declined", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")

        vi.spyOn(window, "confirm").mockReturnValueOnce(true).mockReturnValueOnce(false);

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const parentResult = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        await result.current.handleArchiveNode(parentResult.id!);

        await waitFor(() => {
            const archivedNode = result.current.flatNodes.find(
                node => node.id === parentResult.id
            );

            expect(archivedNode?.archived).toBe(true);
        });

        await result.current.handleRestoreNode(parentResult.id!);

        await waitFor(() => {
            const archivedNode = result.current.flatNodes.find(
                node => node.id === parentResult.id
            );

            expect(archivedNode?.archived).toBe(true);
        });

        expect(firestoreService.nodes.updateNodeOptimistic).toHaveBeenCalledTimes(1);
    });

    it("authenticated handleEditNodeText correctly updates flatNodes", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const createResult = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        await result.current.handleEditNodeText(createResult.id!, "new");

        await waitFor(() => {
            const renamedNode = result.current.flatNodes.find(
                node => node.id === createResult.id
            );

            expect(renamedNode?.text).toBe("new");
        });
    });
    it("authenticated handleEditNodeText returns error for invalid text and doesn't update flatNodes and doesn't call service", async () => {
        vi.mocked(firestoreService.nodes.createNode)
            .mockResolvedValueOnce("parent-id")
            .mockResolvedValueOnce("child-id")
            .mockResolvedValueOnce("child-id-2");

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const createResult = await result.current.handleCreateNode("test", false);
        const childResult = await result.current.handleCreateChildNode("#1", createResult.id!, "todo");
        const child2Result = await result.current.handleCreateChildNode("#2", createResult.id!, "todo");

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(4);
        });

        const editResult = await result.current.handleEditNodeText(childResult.id!, "");
        const editResult2 = await result.current.handleEditNodeText(child2Result.id!, "2".repeat(maxLength + 1));

        expect(editResult?.message).toBe("Field cannot be empty.");
        expect(editResult2?.message).toBe(`Cannot be longer than ${maxLength} symbols.`);
        expect(firestoreService.nodes.updateNode).not.toHaveBeenCalled();

        const editedNode = result.current.flatNodes.find(node => node.id === childResult.id);
        const editedNode2 = result.current.flatNodes.find(node => node.id === child2Result.id);

        expect(editedNode?.text).toBe("#1");
        expect(editedNode2?.text).toBe("#2");
    });
    it("authenticated handleEditNodeText returns error when id is invalid", async () => {
        //vi.mocked(firestoreService.nodes.createNode)
        //    .mockResolvedValueOnce("parent-id");

        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const createResult = await result.current.handleCreateNode("test", false);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(2);
        });

        const editResult = await result.current.handleEditNodeText(createResult.id!, "new");

        expect(editResult?.message).toBe("Missing nodeId");
    });

    it("authenticated handlePin correctly updates flatNodes", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const testNode = result.current.flatNodes.find(node => node.id === "node-1");

        await result.current.handlePin(testNode?.id!);

        await waitFor(() => {
            const pinnedNode = result.current.flatNodes.find(node => node.id === "node-1");

            expect(pinnedNode?.pinned).toBe(true);
        });

        await result.current.handlePin(testNode?.id!);

        await waitFor(() => {
            const pinnedNode = result.current.flatNodes.find(node => node.id === "node-1");

            expect(pinnedNode?.pinned).toBe(false);
        });
    });
    it("authenticated handlePin returns error message object if id is missng and doesn't send a service call", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const pinResult = await result.current.handlePin("");

        expect(pinResult?.message).toBe("Missing nodeId");
        expect(firestoreService.nodes.updateNodeOptimistic).not.toHaveBeenCalled();
    });

    it("authenticated handleChangeVisibility correctly updates flatNodes", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const testNode = result.current.flatNodes.find(node => node.id === "node-1");

        await result.current.handleVisibilityChange(testNode?.id!);

        await waitFor(() => {
            const publicNode = result.current.flatNodes.find(node => node.id === "node-1");

            expect(publicNode?.isPublic).toBe(true);
        });

        await result.current.handleVisibilityChange(testNode?.id!);

        await waitFor(() => {
            const privateNode = result.current.flatNodes.find(node => node.id === "node-1");

            expect(privateNode?.isPublic).toBe(false);
        });
    });
    it("authenticated handleChangeVisibility returns error message object if id is missng and doesn't send a service call", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const publicResult = await result.current.handleVisibilityChange("");

        expect(publicResult?.message).toBe("Missing nodeId");
        expect(firestoreService.nodes.updateNodeOptimistic).not.toHaveBeenCalled();
    });
    //todo: maybe a separate describe for guest user behavior

    it("authenticated handleDeleteNode correctly updates flatNodes if window confirm is accepted", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        vi.spyOn(window, "confirm").mockReturnValue(true);

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const testNode = result.current.flatNodes.find(node => node.id === "node-1");

        await result.current.handleDeleteNode(testNode?.id!);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(0);
        });
    });
    it("authenticated handleDeleteNode doesn't flatNodes if window confirm is declined", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        vi.spyOn(window, "confirm").mockReturnValue(false);

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const testNode = result.current.flatNodes.find(node => node.id === "node-1");

        await result.current.handleDeleteNode(testNode?.id!);

        await waitFor(() => {
            expect(result.current.flatNodes.length).toBe(1);
            expect(firestoreService.nodes.deleteNode).not.toHaveBeenCalled();
        });
    });
    it("authenticated handleDeleteNode returns error message object if id is missing", async () => {
        const { result } = renderHook(() => useNodes(), { wrapper });

        vi.spyOn(window, "confirm").mockReturnValue(true);

        await waitFor(() => {
            expect(result.current.nodesLoading).toBe(false);
        });

        const deleteResult = await result.current.handleDeleteNode("");

        expect(deleteResult?.message).toBe("Missing nodeId");
    });
});