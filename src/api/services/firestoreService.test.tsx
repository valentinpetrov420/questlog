import firestoreService from "./firestoreService";
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { Node } from "../../types/Node";

import {
    collection,
    getDocs,
    deleteDoc
} from "firebase/firestore";

import { db } from "../firebase";

beforeEach(async () => {
    const snapshot = await getDocs(collection(db, "nodes"));

    await Promise.all(snapshot.docs.map(document => deleteDoc(document.ref)));
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe("FirestoreService", () => {
    it("createNode creates a new node", async () => {
        const ownerId = "test";

        const nodeId = await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: null,
            text: "test",
            isPublic: false,
            order: 0,
        });

        const node = await firestoreService.nodes.getNode(nodeId);

        expect(node).not.toBeNull();
        expect(node?.id).toBe(nodeId);
        expect(node?.ownerId).toBe(ownerId);
        expect(node?.text).toBe("test");
        expect(node?.type).toBe("page");
    });

    it("getNode returns correct node by id", async () => {
        const ownerId = "test";

        const parentId = await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: null,
            text: "test",
            isPublic: false,
            order: 0,
        });

        const nodeId = await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: parentId,
            text: "#1",
            isPublic: false,
            order: 0,
        });

        const node = await firestoreService.nodes.getNode(nodeId);

        expect(node).not.toBeNull();
        expect(node?.id).toBe(nodeId);
        expect(node?.parentId).toBe(parentId);
        expect(node?.ownerId).toBe(ownerId);
        expect(node?.text).toBe("#1");
        expect(node?.type).toBe("page");
    });
    it("getNode returns null if document doesn't exist", async () => {
        const node = await firestoreService.nodes.getNode("does-not-exist");

        expect(node).toBeNull();
    });

    it("getNodes returns all nodes", async () => {
        const ownerId = "test";

        const parentId = await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: null,
            text: "test",
            isPublic: false,
            order: 0,
        });

        await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: parentId,
            text: "#1",
            isPublic: false,
            order: 0,
        });

        const nodes = await firestoreService.nodes.getNodes(ownerId);

        expect(nodes.length).toEqual(2);
    });
    it("getNodes returns empty array if no data", async () => {
        const ownerId = "test";
        const nodes = await firestoreService.nodes.getNodes(ownerId);

        expect(nodes.length).toEqual(0);
    });

    it("updateNode updates the correct node properly", async () => {
        const ownerId = "test";

        const nodeId = await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: null,
            text: "test",
            isPublic: false,
            order: 0,
        });

        await firestoreService.nodes.updateNode(nodeId, { text: "updated" });

        const node = await firestoreService.nodes.getNode(nodeId);

        expect(node).toMatchObject({
            text: "updated",
        });
    });
    it("updateNode updates the updatedAt property", async () => {
        const nodeId = await firestoreService.nodes.createNode("test", {
            text: "test",
        });

        vi.spyOn(Date, "now").mockReturnValue(999999);

        await firestoreService.nodes.updateNode(nodeId, {
            text: "updated"
        });

        const updatedNode = await firestoreService.nodes.getNode(nodeId);

        expect(updatedNode?.updatedAt).toBe(999999);
    });
    it("updateNode ignores illegal data and passes legal data", async () => {
        const ownerId = "test";

        const id = await firestoreService.nodes.createNode(ownerId,
            {
                type: "todo",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });

        await firestoreService.nodes.updateNode(id, { text: "updated", ownerId: "newuser" } as Node);

        const updatedNode = await firestoreService.nodes.getNode(id);

        expect(updatedNode?.ownerId).toBe("test");
    });

    it("resetTasks resets all tasks properly", async () => {
        const ownerId = "test";

        const parentId = await firestoreService.nodes.createNode(ownerId, {
            type: "page",
            parentId: null,
            text: "test",
            isPublic: false,
            order: 0,
        });

        const id = await firestoreService.nodes.createNode(ownerId, {
            type: "todo",
            parentId: parentId,
            text: "#1",
            isPublic: false,
            order: 0,
        });
        const id2 = await firestoreService.nodes.createNode(ownerId, {
            type: "todo",
            parentId: parentId,
            text: "#2",
            isPublic: false,
            order: 0,
        });
        const id3 = await firestoreService.nodes.createNode(ownerId, {
            type: "todo",
            parentId: parentId,
            text: "#3",
            isPublic: false,
            order: 0,
        });

        await firestoreService.nodes.updateNode(id, {completed: true});
        await firestoreService.nodes.updateNode(id2, {completed: true});
        await firestoreService.nodes.updateNode(id3, {completed: true});

        const allNodes = await firestoreService.nodes.getNodes(ownerId);

        const completedTasks = allNodes.filter(node => node.parentId === parentId && node.completed === true);
        const completedTasksIds = new Set(completedTasks.map(node => node.id));

        await firestoreService.nodes.resetTasks(completedTasksIds);

        const resetNodes = await firestoreService.nodes.getNodes(ownerId);

        const resetTasks = resetNodes.filter(node => completedTasksIds.has(node.id));

        expect(resetTasks.every(task => task.completed === false)).toBe(true);
    });
});