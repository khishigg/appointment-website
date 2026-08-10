import { AUTH_STORAGE_KEY, useAuthStore } from '../store/AuthStore';

export const clinicApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const getToken = () => {
    try {
        const stored =
            localStorage.getItem(AUTH_STORAGE_KEY) ||
            sessionStorage.getItem(AUTH_STORAGE_KEY);
        const auth = JSON.parse(stored || 'null');
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
        case 409:
            return 'Энэ цаг дөнгөж сая захиалагдлаа.';
        case 500:
            return 'Эмнэлгийн мэдээллийн сантай холбогдоход алдаа гарлаа.';
        default:
            return null;
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

export async function clinicRequest(
    path,
    {
        signal,
        method = 'GET',
        body,
        preferServerMessage = false,
    } = {}
) {
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
            method,
            cache: 'no-store',
            headers,
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.');
    }

    if (!response.ok) {
        const message = await getErrorMessage(response);
        // Захиалга үүсгэх зэрэг дуудлагад сервер яг ямар шалтгаанаар татгалзсаныг
        // ({ message }) шууд харуулах нь чухал тул статусын ерөнхий текстээс дээгүүр тавина.
        const error = new Error(
            (preferServerMessage
                ? message || getStatusMessage(response.status)
                : getStatusMessage(response.status) || message) ||
            `Мэдээлэл авахад алдаа гарлаа (${response.status}).`
        );
        error.status = response.status;

        // Хугацаа дууссан session-ийг Guest төлөвт буцаана, гэхдээ одоогийн route-оос
        // хэзээ ч гаргахгүй. Guest-ийн 401 дээр logout нь no-op байна.
        if (response.status === 401) {
            useAuthStore.getState().logout();
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

export const getClinicProviders = (clinicId, options) =>
    clinicRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/providers`,
        options
    );

export const getClinicProducts = (clinicId, options) =>
    clinicRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/products`,
        options
    );

// Захиалга үүсгэх. payload-ыг дуудагч тал (buildAppointmentPayload) угсарна —
// clinicNum байхгүй үед тэр талбар payload-д ОГТ орохгүй.
export const createAppointment = (clinicId, payload, { signal } = {}) =>
    clinicRequest(`/api/clinics/${encodeURIComponent(clinicId)}/appointments`, {
        method: 'POST',
        body: payload,
        preferServerMessage: true,
        signal,
    });

const buildAvailabilityQuery = ({ clinicNum, startDate, endDate, slotDuration = 30 }) => {
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

    // Салбар сонгосон үед л clinicNum нэмнэ. 0 нь бодит утга тул үлдээнэ;
    // зөвхөн утга байхгүй (null/undefined/'') үед салбаргүй горимд ордог.
    if (clinicNum !== null && clinicNum !== undefined && clinicNum !== '') {
        query.set('clinicNum', String(clinicNum));
    }

    return query;
};

export const getProviderAvailability = (clinicId, provNum, { signal, ...query } = {}) =>
    clinicRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/providers/${encodeURIComponent(provNum)}/availability?${buildAvailabilityQuery(query)}`,
        { signal }
    );

export const resolveClinicAssetUrl = (value) => {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;

  return new URL(value, clinicApiBaseUrl).toString();
};
