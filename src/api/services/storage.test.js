import { describe, test, expect } from 'vitest';
import nestNodes from './storage';

describe("nestNodes", () => {
    test("returns empty array for empty input", () => {
        expect(nestNodes([])).toEqual([]);
    });

    test("returns a root node with empty items when it has no children", () => {
        const flatNodes = [{ id: "1", parentId: null, order: 0 }];
        const result = nestNodes(flatNodes);
        expect(result).toEqual([{ id: "1", parentId: null, order: 0, items: [] }]);
    });

    test("nests a child under its matching root", () => {
        const flatNodes = [
            { id: "1", parentId: null, order: 0 },
            { id: "2", parentId: "1", order: 0 },
        ];

        const result = nestNodes(flatNodes);
        expect(result[0].items).toEqual([{ id: "2", parentId: "1", order: 0 }]);
    });

    test("parentless children are left out", () => {
        const flatNodes = [
            { id: "1", parentId: null, order: 0 },
            { id: "2", parentId: "45", order: 0 },
        ];

        const result = nestNodes(flatNodes);
        expect(result).toEqual([{ id: "1", parentId: null, order: 0, items: [] }]);
    });

    test("returns a separate entry for each root node", () => {
        const flatNodes = [
            { id: "1", parentId: null, order: 0 },
            { id: "45", parentId: null, order: 1 },
        ];

        const result = nestNodes(flatNodes);
        expect(result.map(r => r.id)).toEqual(["1", "45"]);
    });

    test("assigns children to the correct parent, not a sibling root", () => {
        const flatNodes = [
            { id: "1", parentId: null, order: 0 },
            { id: "2", parentId: "1", order: 0 },
            { id: "45", parentId: null, order: 1 },
            { id: "67", parentId: "45", order: 0 },
        ];

        const result = nestNodes(flatNodes);
        expect(result[0].items).toEqual([{ id: "2", parentId: "1", order: 0 }]);
        expect(result[1].items).toEqual([{ id: "67", parentId: "45", order: 0 }]);
    });

    test("sorts children by order within a parent", () => {
        const flatNodes = [
            { id: "1", parentId: null, order: 0 },
            { id: "2", parentId: "1", order: 1 },
            { id: "42069", parentId: "1", order: 0 },
        ];
        
        const result = nestNodes(flatNodes);
        expect(result[0].items).toEqual([
            { id: "42069", parentId: "1", order: 0 },
            { id: "2", parentId: "1", order: 1 },
        ]);
    });
});