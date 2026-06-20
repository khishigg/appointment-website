import { getProviderAvailability } from './clinics';

const DEFAULT_API_BASE_URL = 'https://localhost:7161';
const DEFAULT_SLOT_DURATION = 30;

export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;

const getStoredAuth = () => {
    try {
        const stored = localStorage.getItem('ashid_auth');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

const getJwtPayload = (token) => {
    try {
        const [, payload] = token.split('.');
        const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(atob(normalizedPayload));
    } catch {
        return null;
    }
};

export const getAuthenticatedProvNum = () => {
    const auth = getStoredAuth();
    const tokenPayload = auth?.token ? getJwtPayload(auth.token) : null;

    return (
        tokenPayload?.ProvNum ??
        tokenPayload?.provNum ??
        tokenPayload?.ProviderNum ??
        tokenPayload?.providerNum ??
        auth?.user?.ProvNum ??
        auth?.user?.provNum ??
        auth?.user?.ProviderNum ??
        auth?.user?.providerNum ??
        null
    );
};

const buildAuthHeaders = () => {
    const auth = getStoredAuth();
    const token = auth?.token;
    const tokenPayload = token ? getJwtPayload(token) : null;
    const tenantId = tokenPayload?.TenantId || import.meta.env.VITE_TENANT_ID || '1';
    const headers = {
        'X-Tenant-Id': tenantId,
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

export const formatApiDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

export const addDays = (date, days) => {
    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + days);
    return nextDate;
};

const getDoctorProvNum = ({ doctor, doctorProvNum, provNum }) => {
    return (
        doctorProvNum ??
        provNum ??
        doctor?.provNum ??
        doctor?.ProvNum ??
        doctor?.providerNum ??
        doctor?.ProviderNum ??
        getAuthenticatedProvNum() ??
        null
    );
};

export const resolveDoctorProvNum = (doctor) => getDoctorProvNum({ doctor });

const getClinicId = ({ doctor, clinicId }) =>
    clinicId ?? doctor?.clinicId ?? doctor?.ClinicId ?? null;

const getClinicNum = ({ doctor, clinicNum }) =>
    clinicNum ?? doctor?.clinicNum ?? doctor?.ClinicNum ?? null;

const buildAvailableAppointmentsUrl = ({ doctor, doctorProvNum, provNum, startDate, endDate, slotDuration }) => {
    const url = new URL('/api/Appointments/available', apiBaseUrl);
    const providerNum = getDoctorProvNum({ doctor, doctorProvNum, provNum });

    url.searchParams.set('startDate', startDate);
    url.searchParams.set('endDate', endDate);
    url.searchParams.set('slotDuration', slotDuration ?? DEFAULT_SLOT_DURATION);

    if (providerNum === undefined || providerNum === null || providerNum === '') {
        throw new Error('Doctor or authenticated user ProvNum is required for available appointments.');
    }

    url.searchParams.set('provNum', String(providerNum));

    return url.toString();
};

const normalizeAvailableResponse = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const getOperatorySlots = (operatory) => {
    return operatory?.slots || operatory?.Slots || [];
};

const parseSlotDate = (slot) => {
    if (slot instanceof Date) return Number.isNaN(slot.getTime()) ? null : slot;
    if (typeof slot !== 'string') return null;

    const nativeDate = new Date(slot);
    if (!Number.isNaN(nativeDate.getTime())) return nativeDate;

    const match = slot.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/);
    if (!match) return null;

    const [, year, month, day, hour, minute, second = '0'] = match;
    return new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second)
    );
};

const formatSlotTime = (date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

const createDateRange = (startDate, endDate) => {
    const days = [];
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);

    for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        days.push(formatApiDate(date));
    }

    return days;
};

export async function getAvailableAppointments({
    doctor,
    doctorProvNum,
    provNum,
    clinicId,
    clinicNum,
    startDate = formatApiDate(new Date()),
    endDate = formatApiDate(addDays(new Date(), 6)),
    slotDuration = DEFAULT_SLOT_DURATION,
    signal,
} = {}) {
    const providerNum = getDoctorProvNum({ doctor, doctorProvNum, provNum });
    const selectedClinicId = getClinicId({ doctor, clinicId });
    const selectedClinicNum = getClinicNum({ doctor, clinicNum });

    if (selectedClinicId != null && selectedClinicNum != null) {
        if (providerNum === undefined || providerNum === null || providerNum === '') {
            throw new Error('Сул цаг шалгах эмчийн provNum олдсонгүй.');
        }

        const data = await getProviderAvailability(
            selectedClinicId,
            selectedClinicNum,
            providerNum,
            { startDate, endDate, slotDuration, signal }
        );
        return normalizeAvailableResponse(data);
    }

    const res = await fetch(
        buildAvailableAppointmentsUrl({ doctor, doctorProvNum, provNum, startDate, endDate, slotDuration }),
        { 
            signal,
            cache: 'no-store',
            headers: buildAuthHeaders(),
        }
    );

    if (!res.ok) {
        let message = `Available appointments request failed with ${res.status}`;

        try {
            const errorData = await res.json();
            message = errorData?.message || errorData?.error || message;
        } catch {
            // Keep the status-based message when the backend does not return JSON.
        }

        throw new Error(message);
    }

    return normalizeAvailableResponse(await res.json());
}

export const fetchAvailableAppointments = getAvailableAppointments;

export async function getDoctorFreeTimeSlots({
    doctor,
    doctorProvNum,
    provNum,
    clinicId,
    clinicNum,
    startDate = formatApiDate(new Date()),
    endDate = formatApiDate(addDays(new Date(), 6)),
    slotDuration = DEFAULT_SLOT_DURATION,
    signal,
} = {}) {
    const slotsByDate = new Map(createDateRange(startDate, endDate).map((date) => [date, new Map()]));
    const response = await getAvailableAppointments({
        doctor,
        doctorProvNum,
        provNum,
        clinicId,
        clinicNum,
        startDate,
        endDate,
        slotDuration,
        signal,
    });

    response.forEach((operatory) => {
        getOperatorySlots(operatory).forEach((slot) => {
            const slotDate = parseSlotDate(slot);
            if (!slotDate) return;

            const date = formatApiDate(slotDate);
            const time = formatSlotTime(slotDate);

            if (!slotsByDate.has(date)) {
                slotsByDate.set(date, new Map());
            }

            if (!slotsByDate.get(date).has(time)) {
                slotsByDate.get(date).set(time, {
                    time,
                    operatoryNum: operatory.operatoryNum || operatory.OperatoryNum,
                    opName: operatory.opName || operatory.OpName,
                    rawSlot: slot,
                });
            }
        });
    });

    return Array.from(slotsByDate.entries()).map(([date, slots]) => {
        const sortedSlots = Array.from(slots.values()).sort((a, b) => a.time.localeCompare(b.time));

        return {
            date,
            slots: sortedSlots.map((slot) => slot.time),
            slotDetails: sortedSlots,
            availableCount: sortedSlots.length,
        };
    });
}
