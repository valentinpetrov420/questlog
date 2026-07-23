import { maxLength } from "../../constants/app.ts";

type ValidationResult = {
    valid: false;
    error: string;
} | {
    valid: true;
    value: string;
};


export function normalizeText(text: string | undefined) {
    if (text === undefined || text === null) {
        return "";
    }
    return text.trim();
}

export function validateText(text: string | undefined): ValidationResult {
    const cleaned = normalizeText(text);

    if (!cleaned) {
        return {
            valid: false,
            error: "Field cannot be empty."
        };
    }

    if (cleaned.length > maxLength) {
        return {
            valid: false,
            error: `Cannot be longer than ${maxLength} symbols.`
        }
    }

    return {
        valid: true,
        value: cleaned
    }
}