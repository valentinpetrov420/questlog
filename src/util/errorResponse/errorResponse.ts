import { FirebaseError } from "firebase/app";

type ActionError = {
    message: string,
    code?: string,
}

export function formatError(error: unknown, fallbackMessage: string, label: string): ActionError {
    console.error(`[${label}]`, error);

    if (error instanceof FirebaseError) {
        return {
            message: fallbackMessage,
            code: error.code,
        };
    } else {
        return {
            message: fallbackMessage,
        };
    }
}