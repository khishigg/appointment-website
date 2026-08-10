const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const clientId = import.meta.env.VITE_APPOINTMENT_CLIENT_ID;
const clientSecret = import.meta.env.VITE_APPOINTMENT_CLIENT_SECRET;

const REFRESH_SKEW_MS = 60_000;

let cachedToken = null;
let expiresAt = 0;
let pendingRequest = null;

const isUsable = () =>
    Boolean(cachedToken) && Date.now() < expiresAt - REFRESH_SKEW_MS;

const getErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return data?.message || data?.error || data?.title || null;
    } catch {
        return null;
    }
};

const requireConfiguration = () => {
    if (!apiBaseUrl || !clientId || !clientSecret) {
        throw new Error(
            'AppToken тохиргоо дутуу байна. VITE_API_BASE_URL, VITE_APPOINTMENT_CLIENT_ID, VITE_APPOINTMENT_CLIENT_SECRET утгуудыг шалгана уу.'
        );
    }
};

export const clearAppToken = () => {
    cachedToken = null;
    expiresAt = 0;
};

export async function getAppToken() {
    if (isUsable()) return cachedToken;
    if (pendingRequest) return pendingRequest;

    requireConfiguration();

    pendingRequest = (async () => {
        let response;

        try {
            response = await fetch(new URL('/api/auth/app-token', apiBaseUrl), {
                method: 'POST',
                cache: 'no-store',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId, clientSecret }),
            });
        } catch {
            throw new Error('AppToken авах сервертэй холбогдож чадсангүй. Дахин оролдоно уу.');
        }

        if (!response.ok) {
            throw new Error(
                (await getErrorMessage(response)) ||
                `AppToken авах хүсэлт амжилтгүй боллоо (${response.status}).`
            );
        }

        const data = await response.json();
        const token = typeof data?.token === 'string' ? data.token.trim() : '';
        const expiresIn = Number(data?.expiresIn);

        if (!token || !Number.isFinite(expiresIn) || expiresIn <= 0) {
            throw new Error('AppToken response хүчинтэй token эсвэл expiresIn агуулаагүй байна.');
        }

        cachedToken = token;
        expiresAt = Date.now() + expiresIn * 1000;
        return cachedToken;
    })();

    try {
        return await pendingRequest;
    } finally {
        pendingRequest = null;
    }
}
