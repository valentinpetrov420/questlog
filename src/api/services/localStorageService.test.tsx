import { describe, it, expect, beforeEach } from 'vitest';
import localStorageService from './localStorageService';
import type { Node } from '../../types/Node';

describe("localStorageService", () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it("createNode creates a new node", async () => {
        const id = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });

        const nodes = JSON.parse(localStorage.getItem("guestNodes")!) as Node[];

        const currentNode = nodes.find(node => node.id === id);

        expect(currentNode).toMatchObject({
            id,
            type: "todo",
            parentId: null,
            text: "test",
            isPublic: false,
            order: 0,
        });
    });

    it("getNode returns correct node by id", async () => {
        await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });

        const id = await localStorageService.nodes.createNode("test",
            {
                type: "page",
                parentId: null,
                text: "test2",
                isPublic: false,
                order: 0
            });

        const node = await localStorageService.nodes.getNode(id);

        expect(node).toMatchObject({
            id,
            type: "page",
            text: "test2",
            order: 0,
        });
    });
    it("getNode returns null if id isn't found", async () => {
        const node = await localStorageService.nodes.getNode("123");

        expect(node).toBeNull();
    });

    it("getNodes returns all stored nodes", async () => {
        await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });
        await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "test2",
                isPublic: false,
                order: 0
            });
        const nodes = await localStorageService.nodes.getNodes();

        expect(nodes.length).toEqual(2);
    });
    it("getNodes returns empty array if theres no nodes", async () => {
        const nodes = await localStorageService.nodes.getNodes();

        expect(nodes).toEqual([]);
    });

    it("updateNode updates the correct node properly", async () => {
        const id = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.updateNode(id, { text: "updated" } as Node);

        const node = await localStorageService.nodes.getNode(id);

        expect(node).toMatchObject({
            text: "updated",
        });
    });
    it("updateNode ignores illegal data and passes legal data", async () => {
        const id = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.updateNode(id, { text: "updated", ownerId: "newuser" } as Node);

        const node = await localStorageService.nodes.getNode(id);

        expect(node).toMatchObject({
            text: "updated",
            ownerId: "test"
        });
    });

    it("resetTasks resets all tasks properly", async () => {
        const parentId = await localStorageService.nodes.createNode("test",
            {
                type: "page",
                parentId: null,
                text: "test",
                isPublic: false,
                order: 0
            });
        const id = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: parentId,
                text: "test1",
                isPublic: false,
                order: 0
            });

        const id2 = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: parentId,
                text: "test2",
                isPublic: false,
                order: 0
            });
        const id3 = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: parentId,
                text: "test3",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.updateNode(id, { completed: true });
        await localStorageService.nodes.updateNode(id2, { completed: true });
        await localStorageService.nodes.updateNode(id3, { completed: true });

        const allNodes = await localStorageService.nodes.getNodes();

        const completedTasks = allNodes.filter(node => node.parentId === parentId && node.completed === true);
        const completedTasksIds = new Set(completedTasks.map(node => node.id));

        await localStorageService.nodes.resetTasks(completedTasksIds);

        const resetNodes = await localStorageService.nodes.getNodes();

        const resetTasks = resetNodes.filter(node => completedTasksIds.has(node.id));

        expect(resetTasks.every(task => task.completed === false)).toBe(true);
    });

    it("reorder correctly updates order property of nodes in the provided array", async () => {
        const parentId = await localStorageService.nodes.createNode(
            "test",
            {
                type: "page",
                parentId: null,
                text: "parent",
                isPublic: false,
                order: 0
            }
        );

        const id1 = await localStorageService.nodes.createNode(
            "test",
            {
                type: "todo",
                parentId,
                text: "#1",
                isPublic: false,
                order: 0
            }
        );

        const id2 = await localStorageService.nodes.createNode(
            "test",
            {
                type: "todo",
                parentId,
                text: "#2",
                isPublic: false,
                order: 1
            }
        );

        const id3 = await localStorageService.nodes.createNode(
            "test",
            {
                type: "todo",
                parentId,
                text: "#3",
                isPublic: false,
                order: 2
            }
        );

        const nodes = await localStorageService.nodes.getNodes();

        const node1 = nodes.find(node => node.id === id1)!;
        const node2 = nodes.find(node => node.id === id2)!;
        const node3 = nodes.find(node => node.id === id3)!;

        await localStorageService.nodes.reorder([
            node3,
            node1,
            node2
        ]);

        const updatedNodes = await localStorageService.nodes.getNodes();

        expect(updatedNodes.find(node => node.id === id3)?.order).toBe(0);
        expect(updatedNodes.find(node => node.id === id1)?.order).toBe(1);
        expect(updatedNodes.find(node => node.id === id2)?.order).toBe(2);
    });

    it("deleteNode deletes the specified node by id", async () => {
        const id = await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "#1",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "#2",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.deleteNode(id, "test");

        const deletedNode = await localStorageService.nodes.getNode(id);

        expect(deletedNode).toBeNull();
    });

    it("__clearStorage clears storage", async () => {
        await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "#1",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.createNode("test",
            {
                type: "todo",
                parentId: null,
                text: "#2",
                isPublic: false,
                order: 0
            });

        await localStorageService.nodes.__clearLocalNodes();

        const nodes = await localStorageService.nodes.getNodes();

        expect(nodes).toEqual([]);
    });
});