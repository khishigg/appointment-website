const DEFAULT_API_BASE_URL = 'https://localhost:7161';

export const authApiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const DEFAULT_LOGIN_ERROR = 'Нэвтрэх нэр эсвэл нууц үг буруу байна.';

const getErrorMessage = async (res) => {
    try {
        const data = await res.json();
        return data?.message || data?.error || DEFAULT_LOGIN_ERROR;
    } catch {
        return DEFAULT_LOGIN_ERROR;
    }
};

export async function loginRequest({ username, password }) {
    const res = await fetch(new URL('/api/Auth/login', authApiBaseUrl), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            Username: username,
            password,
        }),
    });

    if (!res.ok) {
        throw new Error(await getErrorMessage(res));
    }

    return res.json();
}
