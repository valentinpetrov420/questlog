import { FirebaseError } from "firebase/app";

export function formatError(error, fallbackMessage, label) {
    console.error(`[${label}]`, error);

    if (error instanceof FirebaseError) {
        return {
            success: false,
            message: fallbackMessage,
            code: error.code,
        };
    } else {
        return {
            success: false,
            message: fallbackMessage,
        };
    }
}