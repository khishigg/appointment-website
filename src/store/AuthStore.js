import { create } from 'zustand';
import { loginRequest } from '../api/auth';

export const AUTH_STORAGE_KEY = 'ashid_auth';

export const readStoredAuth = () => {
    try {
        const stored =
            localStorage.getItem(AUTH_STORAGE_KEY) ||
            sessionStorage.getItem(AUTH_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const writeStoredAuth = ({ token, user, role }, rememberMe) => {
    clearStoredAuth();
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user, role }));
};

const clearStoredAuth = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
};

const decodeJwtPayload = (token) => {
    try {
        const [, payload] = token.split('.');
        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(
            normalized.length + ((4 - (normalized.length % 4)) % 4),
            '='
        );
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
};

export const getRoleFromToken = (token) => {
    const payload = token ? decodeJwtPayload(token) : null;
    const role =
        payload?.role ??
        payload?.Role ??
        payload?.roles ??
        payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    return Array.isArray(role) ? role[0] || null : role || null;
};

export const isAdminRole = (role) =>
    typeof role === 'string' && role.toLowerCase() === 'admin';

const normalizeUser = (user, username, role) => {
    const fullName = [user?.lName, user?.fName].filter(Boolean).join(' ').trim();

    return {
        ...user,
        username,
        role,
        name: fullName || user?.tenantName || username,
    };
};

const rawStoredAuth = readStoredAuth();
const storedPayload = rawStoredAuth?.token
    ? decodeJwtPayload(rawStoredAuth.token)
    : null;
const isStoredTokenExpired =
    typeof storedPayload?.exp === 'number' &&
    storedPayload.exp * 1000 <= Date.now();

if (isStoredTokenExpired) {
    clearStoredAuth();
}

const storedAuth = isStoredTokenExpired ? null : rawStoredAuth;
const storedRole =
    storedAuth?.role ||
    storedAuth?.user?.role ||
    getRoleFromToken(storedAuth?.token);

export const useAuthStore = create((set) => ({
    token: storedAuth?.token || null,
    user: storedAuth?.user || null,
    role: storedRole || null,
    isAuthenticated: Boolean(storedAuth?.token),

    login: async (username, password, rememberMe = true) => {
        try {
            const data = await loginRequest({ username, password });
            const role = getRoleFromToken(data.token);
            const user = normalizeUser(data.user, username, role);

            writeStoredAuth({ token: data.token, user, role }, rememberMe);
            set({
                token: data.token,
                user,
                role,
                isAuthenticated: true,
            });

            return { success: true, role };
        } catch (error) {
            clearStoredAuth();
            set({ token: null, user: null, role: null, isAuthenticated: false });
            return {
                success: false,
                error: error.message || 'Нэвтрэх нэр эсвэл нууц үг буруу байна.',
            };
        }
    },

    loginWithToken: (token, patientInfo = {}) => {
        if (!token) {
            throw new Error('Нэвтрэх token олдсонгүй.');
        }

        const role = getRoleFromToken(token);
        const fullName = [patientInfo.lastName, patientInfo.firstName]
            .filter(Boolean)
            .join(' ')
            .trim();
        const user = {
            username: patientInfo.email || patientInfo.phone || 'Хэрэглэгч',
            name: fullName || patientInfo.email || 'Хэрэглэгч',
            role,
        };

        writeStoredAuth({ token, user, role }, true);
        set({ token, user, role, isAuthenticated: true });

        return { success: true, role };
    },

    logout: () => {
        clearStoredAuth();
        set({ token: null, user: null, role: null, isAuthenticated: false });
    },
}));
