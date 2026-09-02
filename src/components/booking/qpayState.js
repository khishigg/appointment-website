export const normalizeQPayStatus = (value) =>
    String(value || '').replace(/[\s_-]/g, '').toLowerCase();

export const getQPayBookingStatus = (value = {}) =>
    value.bookingStatus ?? value.BookingStatus ?? value.status ?? value.Status ?? '';

export const normalizeQPayInvoice = (value = {}, previous = null) => {
    const nextUrls = value.urls ?? value.Urls;
    const nextQrImage = value.qrImage ?? value.QrImage;

    return {
        invoiceId: value.invoiceId ?? value.InvoiceId ?? previous?.invoiceId ?? '',
        bookingStatus: getQPayBookingStatus(value) || previous?.bookingStatus || '',
        invoiceStatus: value.invoiceStatus ?? value.InvoiceStatus ?? previous?.invoiceStatus ?? '',
        amount: value.amount ?? value.Amount ?? previous?.amount ?? null,
        currency: value.currency ?? value.Currency ?? previous?.currency ?? 'MNT',
        qrCode: value.qrCode ?? value.QrCode ?? previous?.qrCode ?? '',
        qrImage: nextQrImage || previous?.qrImage || '',
        urls: Array.isArray(nextUrls) && nextUrls.length > 0
            ? nextUrls
            : previous?.urls || [],
        invoiceExpiresAt:
            value.invoiceExpiresAt ??
            value.InvoiceExpiresAt ??
            previous?.invoiceExpiresAt ??
            '',
        errorCode: value.errorCode ?? value.ErrorCode ?? null,
        errorMessage: value.errorMessage ?? value.ErrorMessage ?? null,
    };
};

export const classifyQPayState = (invoice, httpStatus) => {
    const invoiceStatus = normalizeQPayStatus(invoice?.invoiceStatus);
    const bookingStatus = normalizeQPayStatus(invoice?.bookingStatus);

    if (bookingStatus === 'confirmed') return 'confirmed';
    if (invoiceStatus === 'cancelled' || bookingStatus === 'cancelled') return 'cancelled';
    if (invoiceStatus === 'expired' || bookingStatus === 'expired') return 'expired';
    if (invoiceStatus === 'cancelunknown') return 'cancelUnknown';
    if (invoiceStatus === 'cancelpending') return 'cancelPending';
    if (invoiceStatus === 'createunknown') return 'createUnknown';
    if (invoiceStatus === 'failed') return 'failed';
    if (invoiceStatus === 'paid' || bookingStatus === 'paid') return 'paidPendingConfirmation';
    if (httpStatus === 202 || invoiceStatus === 'creating') return 'creating';
    if (invoiceStatus === 'open' && bookingStatus === 'awaitingpayment') return 'open';
    return 'failed';
};

export const isQPayInvoiceCancellable = (invoice) =>
    normalizeQPayStatus(invoice?.bookingStatus) === 'awaitingpayment' &&
    normalizeQPayStatus(invoice?.invoiceStatus) === 'open';

export const QPAY_POLLING_STATES = new Set([
    'creating',
    'open',
    'paidPendingConfirmation',
    'cancelUnknown',
    'cancelPending',
]);

export const QPAY_CANCELLATION_PROCESSING_STATES = new Set([
    'cancelUnknown',
    'cancelPending',
]);

export const QPAY_TERMINAL_STATES = new Set([
    'confirmed',
    'cancelled',
    'expired',
    'failed',
    'createUnknown',
]);
