export function normalizeUrl(input: string): string | null {
    const trimmed = input.trim();
    if (!trimmed) {
        return null;
    }

    const withProtocol = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
        const url = new URL(withProtocol);
        return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
    } catch {
        return null;
    }
}