import { describe, test, expect } from 'vitest';
import { normalizeUrl } from './normalizeUrl';

describe("normalizeUrl", () => {
    test("example.com gets https://", () => {
        const result = normalizeUrl("example.com");

        expect(result).toBe("https://example.com/");
    });

    test("javascript:alert(1) is null", () => {
        const result = normalizeUrl("javascript:alert(1)");

        expect(result).toBe(null);
    });

    test("https://example.com/page is unchanged", () => {
        const result = normalizeUrl("https://example.com/page");

        expect(result).toBe("https://example.com/page");
    });
});