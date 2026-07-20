import { describe, test, expect, vi } from 'vitest';
import { FirebaseError } from 'firebase/app';
import { formatError } from '../errorResponse/errorResponse';

describe("formatError", () => {
    test("returns error code and fallback message for a FirebaseError", () => {
        const firebaseErr = new FirebaseError("permission-denied", "Missing or insufficient permissions.");
        const result = formatError(firebaseErr, "Failed to create node", "createNode");

        expect(result).toEqual({
            success: false,
            message: "Failed to create node",
            code: "permission-denied",
        });
    });

    test("returns fallback message without a code for a generic error", () => {
        const genericErr = new Error("Something unexpected broke");
        const result = formatError(genericErr, "Failed to create node", "createNode");

        expect(result).toEqual({
            success: false,
            message: "Failed to create node",
        });
    });

    test("firebase errors also use fallbackMessage over the firebase message", () => {
        const err = new FirebaseError("permission-denied", "Missing or insufficient permissions.");
        const result = formatError(err, "Failed to create node", "createNode");

        expect(result.message).toBe("Failed to create node");
    });
});