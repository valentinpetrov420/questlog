import { describe, test, expect } from 'vitest';
import { validateText } from './validation';
import { maxLength } from '../../constants/app';

describe("validateText", () => {
    test("returns normal value under normal circumstances", () => {
        const result = validateText("text ");
        expect(result.valid).toBe(true);
        expect(result.value).toBe("text")
    });

    test("returns invalid for empty input", () => {
        const result = validateText("");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Field cannot be empty.");
    });
    test("returns invalid for whitespace only input", () => {
        const result = validateText("      ");
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Field cannot be empty.");
    });

    test("returns invalid for text longer than global maxLength", () => {
        const result = validateText("a".repeat(maxLength + 1));
        expect(result.valid).toBe(false);
        expect(result.error).toBe(`Cannot be longer than ${maxLength} symbols.`);
    });
    test("returns valid for text exactly at maxLength", () => {
        const result = validateText("a".repeat(maxLength));
        expect(result.valid).toBe(true);
    });

    test("returns invalid for undefined input", () => {
        const result = validateText(undefined);
        expect(result.valid).toBe(false);
        expect(result.error).toBe("Field cannot be empty.");
    });
});