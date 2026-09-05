import { describe, it, expect } from 'vitest';
import { beforeEach } from 'vitest'
import localStorageService from './localStorageService';
import type { Node } from '../../types/Node';

describe("localStorageService", () => {
    beforeEach(() => {
        localStorage.clear();
    })

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
        }
        )
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
        }
        )
    })

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
    })
});