export function normalizeText(text){
    return text.trim();
}

export function validateText(text, maxLength){
    const cleaned = normalizeText(text);

    if (!cleaned){
        return {
            valid: false,
            error: "Field cannot be empty."
        };
    } 

    if (cleaned.length > maxLength){
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