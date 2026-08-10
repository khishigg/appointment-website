import { clinicRequest } from './clinics';
import { bookAppointment } from './appointments';

// Booking identity endpoints keep the bookingToken in the request body while
// clinicRequest supplies the AppointmentApp bearer token and its one-time refresh.
const bookingIdentityRequest = (path, body, { signal } = {}) =>
    clinicRequest(path, {
        method: 'POST',
        body,
        preferServerMessage: true,
        signal,
    });

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
