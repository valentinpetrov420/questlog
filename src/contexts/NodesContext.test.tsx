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

        const restoredNode = result.current.flatNodes.find(node => node.id === parentResult.id);

        expect(restoredNode?.archived).toBe(false);
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
});