export const networkStress = {
    delayMs: 0,
};

export async function __devDelay() {
    if (!import.meta.env.DEV) {
        return;
    }

    if (networkStress.delayMs <= 0) {
        return;
    }

    await new Promise(resolve =>
        setTimeout(resolve, networkStress.delayMs)
    );
}