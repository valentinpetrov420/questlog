import firestoreService from "./firestoreService";
import { describe, it, expect, beforeEach } from 'vitest';

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

        console.log(nodes);

        expect(nodes.length).toEqual(0);
    })
});