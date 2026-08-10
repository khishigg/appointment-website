import { clinicApiBaseUrl } from './clinics';
import { bookAppointment } from './appointments';

const getErrorMessage = async (response) => {
    try {
        const data = await response.json();
        return data?.message || data?.error || data?.title || null;
    } catch {
        return null;
    }
};

const bookingIdentityRequest = async (path, body, { signal } = {}) => {
    let response;

    try {
        response = await fetch(new URL(path, clinicApiBaseUrl), {
            method: 'POST',
            signal,
            cache: 'no-store',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch (error) {
        if (error.name === 'AbortError') throw error;
        throw new Error('Сервертэй холбогдож чадсангүй. Дахин оролдоно уу.');
    }

    if (!response.ok) {
        const error = new Error(
            (await getErrorMessage(response)) ||
            `Баталгаажуулалтын хүсэлт амжилтгүй боллоо (${response.status}).`
        );
        error.status = response.status;
        throw error;
    }

    return response.json();
};

export const createAppointmentBooking = (options) => bookAppointment(options);

export const sendBookingEmailOtp = ({ clinicId, bookingId, bookingToken, signal }) =>
    bookingIdentityRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/appointment-bookings/${encodeURIComponent(bookingId)}/identity/email/send`,
        { bookingToken },
        { signal }
    );

export const verifyBookingEmailOtp = ({ clinicId, bookingId, bookingToken, code, signal }) =>
    bookingIdentityRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/appointment-bookings/${encodeURIComponent(bookingId)}/identity/email/verify`,
        { bookingToken, code },
        { signal }
    );

export const declineBookingIdentity = ({ clinicId, bookingId, bookingToken, signal }) =>
    bookingIdentityRequest(
        `/api/clinics/${encodeURIComponent(clinicId)}/appointment-bookings/${encodeURIComponent(bookingId)}/identity/decline`,
        { bookingToken },
        { signal }
    );
