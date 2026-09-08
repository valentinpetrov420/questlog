import firestoreService from "./firestoreService";
import { describe, it, expect } from 'vitest';

describe("FirestoreService", () => {
    it("creates and retrieves a node", async () => {
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
});