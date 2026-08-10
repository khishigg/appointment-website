import { clinicApiBaseUrl } from './clinics';

const getErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return data?.message || data?.error || data?.title || null;
    } catch {
        return null;
    }
};

export async function getMyBookings({ token, signal } = {}) {
    if (!token) {
        const error = new Error('Захиалгын мэдээлэл харах баталгаажуулалт хийгдээгүй байна.');
        error.status = 401;
        throw error;
    }

    let response;

    try {
        response = await fetch(new URL('/api/my-bookings', clinicApiBaseUrl), {
            method: 'GET',
            signal,
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.');
    }

    if (!response.ok) {
        const fallback = response.status === 401
            ? 'Захиалгын мэдээлэл харах эрх хүчингүй болсон байна.'
            : `Захиалгын жагсаалт авахад алдаа гарлаа (${response.status}).`;
        const error = new Error((await getErrorMessage(response)) || fallback);
        error.status = response.status;
        throw error;
    }

    return response.json();
}
