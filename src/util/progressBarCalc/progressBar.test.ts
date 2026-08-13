import { describe, test, expect } from 'vitest';
import progressBarCalc from "./progressBarCalc";

describe("progressBarCalc", () => {
    test("it returns null when there are no todos", () => {
        expect(progressBarCalc([])).toBe(null);
    });
    test("one total todo that is incomplete returns 0%", () => {
        expect(progressBarCalc([{
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },])).toBe(0);
    });
    test("two total todos, one completed, one uncompleted returns 50%", () => {
        expect(progressBarCalc([{
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        }])).toBe(50);
    });
    test("two completed todos return 100%", () => {
        expect(progressBarCalc([{
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        }])).toBe(100);
    });
    test("uneven (2:1) progress requires rounding", () => {
        expect(progressBarCalc([{
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        }])).toBe(67);
    });
    test("another uneven rounding case (2:3)", () => {
        expect(progressBarCalc([{
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        }])).toBe(40);
    });
    test("progress that rounds up (2:5)", () => {
        expect(progressBarCalc([{
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: true
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        {
            id: "1",
            parentId: null,
            order: 0,

            type: "todo" as const,

            isPublic: false,
            text: "1",
            ownerId: "1",
            pinned: false,
            createdAt: 1,
            updatedAt: 1,
            archived: false,

            completed: false
        },
        ])).toBe(29);
    })
});