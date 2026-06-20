import { AUTH_STORAGE_KEY, useAuthStore } from '../store/AuthStore';

const DEFAULT_API_BASE_URL = 'https://localhost:7161';

export const clinicApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const getToken = () => {
    try {
        const auth = JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
        return auth?.token || null;
    } catch {
        return null;
    }
};

const getErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return data?.message || data?.error || data?.title;
    } catch {
        return null;
    }
};

const getStatusMessage = (status) => {
    switch (status) {
        case 400:
            return 'Огнооны муж эсвэл цагийн үргэлжлэх хугацаа буруу байна.';
        case 401:
            return 'Нэвтрэх эрхийн хугацаа дууссан байна.';
        case 403:
            return 'Admin эрх шаардлагатай байна.';
        case 404:
            return 'Эмнэлэг, салбар эсвэл эмч олдсонгүй.';
        case 500:
            return 'Эмнэлгийн мэдээллийн сантай холбогдоход алдаа гарлаа.';
        default:
            return null;
    }
};

const redirectToLogin = () => {
    useAuthStore.getState().logout();

    if (window.location.pathname !== '/login') {
        window.location.replace('/login');
    }
};

const parseApiDate = (value) => {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null;
    }

    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);

    if (
        date.getFullYear() !== year ||
        date.getMonth() !== month - 1 ||
        date.getDate() !== day
    ) {
        return null;
    }

    return date;
};

const validateAvailabilityQuery = ({ startDate, endDate, slotDuration }) => {
    const start = parseApiDate(startDate);
    const end = parseApiDate(endDate);
    const duration = Number(slotDuration);

    if (!start || !end) {
        throw new Error('Эхлэх болон дуусах огноо YYYY-MM-DD форматтай заавал байна.');
    }

    const dayRange = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (dayRange < 0 || dayRange > 6) {
        throw new Error('Сул цагийн хугацааны муж хамгийн ихдээ 7 хоног байна.');
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 480) {
        throw new Error('Цагийн үргэлжлэх хугацаа 1-480 минутын хооронд байна.');
    }

    return duration;
};

export async function clinicRequest(path, { signal } = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(new URL(path, clinicApiBaseUrl), {
            signal,
            cache: 'no-store',
            headers,
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.');
    }

    if (!response.ok) {
        const message = await getErrorMessage(response);
        const error = new Error(
            getStatusMessage(response.status) ||
            message ||
            `Мэдээлэл авахад алдаа гарлаа (${response.status}).`
        );
        error.status = response.status;

        if (response.status === 401) {
            redirectToLogin();
        }

        throw error;
    }

    return response.json();
}

export const getClinics = (options) =>
    clinicRequest('/api/clinics', options);

export const getClinic = (clinicId, options) =>
    clinicRequest(`/api/clinics/${encodeURIComponent(clinicId)}`, options);

export const getClinicBranches = (clinicId, options) =>
    clinicRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/branches`,
        options
    );

export const getBranchProviders = (clinicId, clinicNum, options) =>
    clinicRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/branches/${encodeURIComponent(clinicNum)}/providers`,
        options
    );

export const getProviderAvailability = (
    clinicId,
    clinicNum,
    provNum,
    { startDate, endDate, slotDuration = 30, signal } = {}
) => {
    const validatedDuration = validateAvailabilityQuery({
        startDate,
        endDate,
        slotDuration,
    });
    const query = new URLSearchParams({
        startDate,
        endDate,
        slotDuration: String(validatedDuration),
    });

    return clinicRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/branches/${encodeURIComponent(clinicNum)}/providers/${encodeURIComponent(provNum)}/availability?${query}`,
        { signal }
    );
};

export const resolveClinicAssetUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  return new URL(value, clinicApiBaseUrl).toString();
};