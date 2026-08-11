import { clearAppToken, getAppToken } from './appToken';

export const clinicApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

const getErrorPayload = async (response) => {
    try {
        return await response.json();
    } catch {
        return null;
    }
};

const getErrorMessage = (data) => {
    const message = data?.message || data?.error || data?.title;
    if (message) return message;

    const errors = data?.errors;
    if (Array.isArray(errors)) {
        const messages = errors
            .map((item) => item?.description || item?.message || (typeof item === 'string' ? item : ''))
            .filter(Boolean);
        return messages.length ? messages.join(' ') : null;
    }

    if (errors && typeof errors === 'object') {
        const messages = Object.values(errors)
            .flatMap((item) => Array.isArray(item) ? item : [item])
            .map((item) => typeof item === 'string' ? item : item?.description || item?.message || '')
            .filter(Boolean);
        return messages.length ? messages.join(' ') : null;
    }

    return null;
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
        accessToken,
    } = {}
) {
    const sendRequest = async (token) =>
        fetch(new URL(path, clinicApiBaseUrl), {
            signal,
            method,
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        });

    let response;

    try {
        response = await sendRequest(accessToken || await getAppToken());

        // A User JWT belongs to the signed-in guest and must never trigger an
        // AppointmentApp-token refresh. The normal public clinic calls retain
        // their one-time application-token refresh.
        if (!accessToken && response.status === 401) {
            clearAppToken();
            response = await sendRequest(await getAppToken());
        }
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.');
    }

    if (!response.ok) {
        const data = await getErrorPayload(response);
        const message = getErrorMessage(data);
        // Захиалга үүсгэх зэрэг дуудлагад сервер яг ямар шалтгаанаар татгалзсаныг
        // ({ message }) шууд харуулах нь чухал тул статусын ерөнхий текстээс дээгүүр тавина.
        const error = new Error(
            (preferServerMessage
                ? message || getStatusMessage(response.status)
                : getStatusMessage(response.status) || message) ||
            `Мэдээлэл авахад алдаа гарлаа (${response.status}).`
        );
        error.status = response.status;
        error.code = data?.code;
        error.errors = data?.errors;

        // A second 401 has already refreshed the AppToken once. Do not log out
        // the current user because their session is unrelated to this token.
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
export const createAppointment = (clinicId, payload, { signal, accessToken } = {}) =>
    clinicRequest(`/api/clinics/${encodeURIComponent(clinicId)}/appointments`, {
        method: 'POST',
        body: payload,
        preferServerMessage: true,
        signal,
        accessToken,
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
