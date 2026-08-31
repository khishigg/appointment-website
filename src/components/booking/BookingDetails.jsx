import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/BookingStore';
import { useBookingLayout } from '../../hooks/useMediaQuery';
import {
    createAppointmentBooking,
    createBookingQPayInvoice,
    declineBookingIdentity,
    getBookingQPayStatus,
    sendBookingEmailOtp,
    setupBookingPassword,
    verifyBookingEmailOtp,
} from '../../api/appointmentBookings';
import { useAuthStore } from '../../store/AuthStore';
import ResponsiveSheet from './ResponsiveSheet';
import BookingDetailsPanel from './BookingDetailsPanel';

const MOCK_SERVICES = [
    { id: 'lombo', name: 'Ломбо', description: 'Шүд цэвэрлэгээ, оношлогоо' },
    { id: 'shud-awah', name: 'Шүд авахуулах', description: 'Шүд авах эмчилгээ' },
];

// Компонентоос ГАДНА — рендэр бүрт шинэ объект үүсгэвэл framer-motion дэмий сэргээнэ.
const SLIDE_VARIANTS = {
    enter: { opacity: 0, y: -30 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 30 },
};

const QPAY_RECOVERY_KEY = 'ashid_qpay_pending_booking';
const POLLING_INTERVAL_MS = 5_000;
const POLLING_STATES = new Set(['creating', 'open', 'paidPendingConfirmation']);
const TERMINAL_PAYMENT_STATES = new Set(['confirmed', 'expired', 'failed', 'createUnknown']);

const normalizeStatus = (value) => String(value || '').replace(/[\s_-]/g, '').toLowerCase();

const getBookingStatus = (value = {}) =>
    value.bookingStatus ?? value.BookingStatus ?? value.status ?? value.Status ?? '';

const normalizeInvoice = (value = {}, previous = null) => {
    const nextUrls = value.urls ?? value.Urls;
    const nextQrImage = value.qrImage ?? value.QrImage;

    return {
        invoiceId: value.invoiceId ?? value.InvoiceId ?? previous?.invoiceId ?? '',
        bookingStatus: getBookingStatus(value) || previous?.bookingStatus || '',
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

const classifyPaymentState = (invoice, httpStatus) => {
    const invoiceStatus = normalizeStatus(invoice?.invoiceStatus);
    const bookingStatus = normalizeStatus(invoice?.bookingStatus);

    if (bookingStatus === 'confirmed') return 'confirmed';
    if (invoiceStatus === 'cancelled' || bookingStatus === 'expired') return 'expired';
    if (invoiceStatus === 'createunknown') return 'createUnknown';
    if (invoiceStatus === 'failed') return 'failed';
    if (httpStatus === 202 || invoiceStatus === 'creating') return 'creating';
    if (invoiceStatus === 'paid' && bookingStatus === 'paid') return 'paidPendingConfirmation';
    if (invoiceStatus === 'open' && bookingStatus === 'awaitingpayment') return 'open';
    return 'failed';
};

const getPaymentErrorMessage = (error) => {
    if (error?.status === 401 || error?.status === 403) {
        return 'Төлбөрийн мэдээлэлд хандах эрх хүрэлцэхгүй байна.';
    }
    if (error?.status === 404) {
        return 'Захиалга олдсонгүй эсвэл төлбөрийн хандалт тохирохгүй байна.';
    }
    if (error?.status === 409) {
        return error.message || 'QPay төлбөр үүсгэх боломжгүй байна.';
    }
    return error?.message || 'Төлбөрийн мэдээлэл авахад алдаа гарлаа.';
};

const clearPaymentRecovery = () => {
    try {
        sessionStorage.removeItem(QPAY_RECOVERY_KEY);
    } catch {
        // Storage access may be blocked; in-memory payment flow still works.
    }
};

const getPasswordSetupErrorMessage = (error) => {
    const errors = error?.errors;

    if (Array.isArray(errors)) {
        const messages = errors
            .map((item) => item?.description || item?.message || (typeof item === 'string' ? item : ''))
            .filter(Boolean);

        if (messages.length) return messages.join(' ');
    }

    if (errors && typeof errors === 'object') {
        const messages = Object.values(errors)
            .flatMap((item) => Array.isArray(item) ? item : [item])
            .map((item) => typeof item === 'string' ? item : item?.description || item?.message || '')
            .filter(Boolean);

        if (messages.length) return messages.join(' ');
    }

    return error?.message || 'Нууц үг үүсгэхэд алдаа гарлаа.';
};


export default function BookingDetails({
    products = null,
    isLoadingProducts = false,
    productError = '',
    onReloadLists,
}) {
    const navigate = useNavigate();
    const {
        isBookingDetailsOpen,
        openBookingDetails,
        closeBookingDetails,
        openTimeSlotModal,
        selectedClinic,
        selectedBranch,
        selectedDoctor,
        selectedTimeSlot,
        selectTimeSlot,
        selectedService,
        selectService,
        patientInfo,
        setPatientInfo,
        resetBooking,
        refreshAvailability,
    } = useBookingStore();
    const layout = useBookingLayout();
    const { token: userToken, isAuthenticated, role } = useAuthStore();
    // Desktop дээр рэйлийн 380px панель биш — 960px төвлөрсөн цонх (2 багана багтаана).
    const mode = layout === 'desktop' ? 'wide' : layout === 'tablet' ? 'dialog' : 'sheet';

    // Local state for current step
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [needsNewTimeSlot, setNeedsNewTimeSlot] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [bookingSession, setBookingSession] = useState(null);
    const [otpCode, setOtpCode] = useState('');
    const [otpDestination, setOtpDestination] = useState('');
    const [otpExpiresAt, setOtpExpiresAt] = useState('');
    const [otpError, setOtpError] = useState('');
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const [identityError, setIdentityError] = useState('');
    const [isDecliningIdentity, setIsDecliningIdentity] = useState(false);
    const [isRegistrationPromptOpen, setIsRegistrationPromptOpen] = useState(false);
    const [isEmailOtpPromptOpen, setIsEmailOtpPromptOpen] = useState(false);
    const [isPasswordSetupPromptOpen, setIsPasswordSetupPromptOpen] = useState(false);
    const [passwordSetup, setPasswordSetup] = useState(null);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSetupError, setPasswordSetupError] = useState('');
    const [isSettingPassword, setIsSettingPassword] = useState(false);
    const [allowAccountInfo, setAllowAccountInfo] = useState(true);
    const [paymentState, setPaymentState] = useState('idle');
    const [invoice, setInvoice] = useState(null);
    const [paymentError, setPaymentError] = useState('');
    const [isCheckingPayment, setIsCheckingPayment] = useState(false);
    const [activePaymentMethod, setActivePaymentMethod] = useState(null);
    const [isCancelPaymentPromptOpen, setIsCancelPaymentPromptOpen] = useState(false);
    const invoiceCreationRef = useRef(false);
    const paymentRequestRef = useRef(null);
    const paymentSessionRef = useRef(null);
    const invoiceRef = useRef(null);
    const isCheckingPaymentRef = useRef(false);
    const recoveryAttemptRef = useRef('');


    const services = products ?? MOCK_SERVICES;

    // Validation
    const isPhoneValid = patientInfo.phone && /^[0-9]{8}$/.test(patientInfo.phone);
    // Салбар сонгох нь ЗААВАЛ биш — clinicNum тодорхойгүй бол payload-аас гарч,
    // сервер эмчийн салбарыг өөрөө нөхнө.
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientInfo.email || '');

    const hasUserAccount = isAuthenticated && String(role || '').toLowerCase() === 'user' && Boolean(userToken);
    const canUseAccountInfo = allowAccountInfo && hasUserAccount;
    const isClinicBookingEnabled = selectedClinic?.bookingEnabled !== false;
    const canSubmit = Boolean(
        isClinicBookingEnabled &&
        (canUseAccountInfo || (
            patientInfo.firstName &&
            patientInfo.lastName &&
            isPhoneValid &&
            isEmailValid
        )) &&
        selectedService?.productId != null &&
        selectedTimeSlot?.rawSlot
    );

    const handleBack = () => {
        if (step === 2) {
            setSubmitError('');
            setNeedsNewTimeSlot(false);
            setStep(1);
        } else {
            closeBookingDetails();
            setStep(1);
            setSubmitError('');
            setNeedsNewTimeSlot(false);
        }
    };

    const handleServiceSelect = (service) => {
        selectService(service);
    };

    // 409-ийн дараа: формын өгөгдлийг хадгалж, зөвхөн цагийг дахин сонгуулна.
    // step 2 хэвээр үлдэх тул шинэ цаг сонгомогц хэрэглэгч формдоо буцаж ирнэ.
    const handlePickAnotherTimeSlot = () => {
        setSubmitError('');
        setNeedsNewTimeSlot(false);
        closeBookingDetails();
        openTimeSlotModal();
    };

    // Баталгаажилтын дэлгэцээс гарахад локал алхмыг эхлэлд нь буцаана — эс тэгвэл
    // дараагийн захиалга хуучин баталгаажилтын дэлгэцээр нээгдэнэ.
    const finishBookingFlow = (destination) => {
        paymentRequestRef.current?.abort();
        clearPaymentRecovery();
        closeBookingDetails();
        setStep(1);
        setConfirmation(null);
        setSubmitError('');
        setNeedsNewTimeSlot(false);
        setBookingSession(null);
        setOtpCode('');
        setOtpDestination('');
        setOtpExpiresAt('');
        setOtpError('');
        setIdentityError('');
        setIsDecliningIdentity(false);
        setIsRegistrationPromptOpen(false);
        setIsEmailOtpPromptOpen(false);
        setIsPasswordSetupPromptOpen(false);
        setPasswordSetup(null);
        setPassword('');
        setConfirmPassword('');
        setPasswordSetupError('');
        setIsSettingPassword(false);
        setAllowAccountInfo(true);
        setPaymentState('idle');
        setInvoice(null);
        setPaymentError('');
        setIsCheckingPayment(false);
        setActivePaymentMethod(null);
        setIsCancelPaymentPromptOpen(false);
        invoiceCreationRef.current = false;
        paymentSessionRef.current = null;
        invoiceRef.current = null;
        isCheckingPaymentRef.current = false;
        setTimeout(() => {
            resetBooking();
        }, 500);
        navigate(destination);
    };

    const handleFinish = () => finishBookingFlow('/');

    const handleViewDetails = () => finishBookingFlow('/my-appointments');

    const createBookingSession = async () => {
        if (bookingSession) return bookingSession;

        if (!isClinicBookingEnabled) {
            const error = new Error('Энэ эмнэлэг одоогоор онлайн цаг захиалга авахгүй байна.');
            error.code = 'BOOKING_DISABLED';
            throw error;
        }

        setIsSubmitting(true);
        setSubmitError('');
        setNeedsNewTimeSlot(false);

        try {
            const response = await createAppointmentBooking({
                clinicId: selectedClinic?.id,
                doctor: selectedDoctor,
                branch: selectedBranch,
                timeSlot: selectedTimeSlot,
                service: selectedService,
                patientInfo,
                useAccountInfo: canUseAccountInfo,
                saveAccountInfo: hasUserAccount && !allowAccountInfo,
                accessToken: hasUserAccount ? userToken : undefined,
            });

            if (!response?.bookingId || (!hasUserAccount && !response?.bookingToken)) {
                throw new Error('Захиалгын баталгаажуулалтын мэдээлэл олдсонгүй.');
            }

            const session = {
                clinicId: selectedClinic?.id,
                bookingId: response.bookingId,
                bookingToken: response.bookingToken,
                draft: response,
            };
            setBookingSession(session);
            return session;
        } catch (error) {
            if (error.status === 409) {
                if (error.code !== 'SLOT_UNAVAILABLE') {
                    setSubmitError(error.message || 'Захиалга үүсгэх боломжгүй байна.');
                    setStep(2);
                } else {
                setSubmitError('Энэ цаг дөнгөж сая захиалагдлаа. Өөр цаг сонгоно уу.');
                setNeedsNewTimeSlot(true);
                selectTimeSlot(null);
                refreshAvailability();
                setStep(2);
                }
            } else if (error.status === 404) {
                setSubmitError('Эмч/салбар олдсонгүй. Жагсаалтыг шинэчилж байна.');
                onReloadLists?.();
                setSubmitError(error.message || 'Эмнэлэг, салбар эсвэл эмч олдсонгүй.');
                setStep(2);
            }
            if (error.code === 'ACCOUNT_INFO_INCOMPLETE') {
                setAllowAccountInfo(false);
                setSubmitError('Your account personal information is incomplete. Please enter it once below.');
                setIsRegistrationPromptOpen(false);
                setIsEmailOtpPromptOpen(false);
                setStep(2);
            }
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const getPaymentRequestOptions = useCallback((session) => {
        const auth = useAuthStore.getState();
        const isUser = auth.isAuthenticated && normalizeStatus(auth.role) === 'user' && Boolean(auth.token);

        return {
            clinicId: session.clinicId,
            bookingId: session.bookingId,
            accessToken: isUser ? auth.token : undefined,
            bookingToken: isUser ? undefined : session.bookingToken,
        };
    }, []);

    const persistPaymentRecovery = useCallback((session, paymentInvoice = null) => {
        if (!session?.clinicId || !session?.bookingId) return;

        const auth = useAuthStore.getState();
        const isUser = auth.isAuthenticated && normalizeStatus(auth.role) === 'user' && Boolean(auth.token);
        const recovery = {
            clinicId: session.clinicId,
            bookingId: session.bookingId,
            invoiceExpiresAt: paymentInvoice?.invoiceExpiresAt || '',
            ...(isUser || !session.bookingToken ? {} : { bookingToken: session.bookingToken }),
        };

        try {
            sessionStorage.setItem(QPAY_RECOVERY_KEY, JSON.stringify(recovery));
        } catch {
            // Storage access may be blocked; the active in-memory flow still works.
        }
    }, []);

    const applyInvoiceResponse = useCallback((data, httpStatus, session) => {
        const nextInvoice = normalizeInvoice(data || {}, invoiceRef.current);
        const nextState = classifyPaymentState(nextInvoice, httpStatus);
        invoiceRef.current = nextInvoice;
        setInvoice(nextInvoice);

        setPaymentState(nextState);
        setPaymentError(
            nextState === 'failed'
                ? nextInvoice.errorMessage || 'QPay invoice амжилтгүй боллоо.'
                : nextState === 'createUnknown'
                    ? nextInvoice.errorMessage || 'Invoice-ийн үр дүн тодорхойгүй байна. Дахин invoice үүсгэхгүйгээр эмнэлэгтэй холбогдоно уу.'
                    : nextState === 'expired'
                        ? 'Invoice-ийн хүчинтэй хугацаа дууссан байна.'
                        : ''
        );

        setConfirmation((current) => ({
            ...(current || session?.draft || {}),
            ...(data || {}),
            bookingId: session?.bookingId,
        }));

        if (nextState === 'confirmed') {
            setActivePaymentMethod(null);
            setIsCancelPaymentPromptOpen(false);
            clearPaymentRecovery();
            refreshAvailability();
            setStep(6);
        } else if (TERMINAL_PAYMENT_STATES.has(nextState)) {
            clearPaymentRecovery();
        } else {
            persistPaymentRecovery(session, nextInvoice);
        }

        return nextState;
    }, [persistPaymentRecovery, refreshAvailability]);

    const checkPaymentStatus = useCallback(async (sessionOverride) => {
        const session = sessionOverride || paymentSessionRef.current;
        if (!session || isCheckingPaymentRef.current) return;

        isCheckingPaymentRef.current = true;
        setIsCheckingPayment(true);
        setPaymentError('');
        paymentRequestRef.current?.abort();
        const controller = new AbortController();
        paymentRequestRef.current = controller;

        try {
            const response = await getBookingQPayStatus({
                ...getPaymentRequestOptions(session),
                signal: controller.signal,
            });
            applyInvoiceResponse(response?.data, response?.status, session);
        } catch (error) {
            if (error.name === 'AbortError') return;

            setPaymentError(getPaymentErrorMessage(error));
            if ([401, 403, 404, 409].includes(error.status)) {
                setPaymentState('failed');
                clearPaymentRecovery();
            }
        } finally {
            if (paymentRequestRef.current === controller) {
                paymentRequestRef.current = null;
            }
            isCheckingPaymentRef.current = false;
            setIsCheckingPayment(false);
        }
    }, [applyInvoiceResponse, getPaymentRequestOptions]);

    const startPaymentInvoice = useCallback(async (session) => {
        if (!session || invoiceCreationRef.current) return;

        invoiceCreationRef.current = true;
        paymentSessionRef.current = session;
        setBookingSession(session);
        setStep(5);
        setPaymentState('creating');
        setPaymentError('');
        setActivePaymentMethod(null);
        persistPaymentRecovery(session);

        paymentRequestRef.current?.abort();
        const controller = new AbortController();
        paymentRequestRef.current = controller;

        try {
            const response = await createBookingQPayInvoice({
                ...getPaymentRequestOptions(session),
                signal: controller.signal,
            });
            const nextState = applyInvoiceResponse(response?.data, response?.status, session);

            if (POLLING_STATES.has(nextState)) {
                void checkPaymentStatus(session);
            }
        } catch (error) {
            if (error.name === 'AbortError') return;

            const errorInvoiceStatus = normalizeStatus(error.data?.invoiceStatus ?? error.data?.InvoiceStatus);
            if (errorInvoiceStatus === 'failed' || errorInvoiceStatus === 'createunknown') {
                applyInvoiceResponse(error.data, error.status, session);
                return;
            }

            const isUnknown = normalizeStatus(error.code) === 'createunknown';
            setPaymentState(isUnknown ? 'createUnknown' : 'failed');
            setPaymentError(
                isUnknown
                    ? 'Invoice үүссэн эсэх тодорхойгүй байна. Дахин invoice үүсгэхгүйгээр эмнэлэгтэй холбогдоно уу.'
                    : getPaymentErrorMessage(error)
            );
            clearPaymentRecovery();
        } finally {
            if (paymentRequestRef.current === controller) {
                paymentRequestRef.current = null;
            }
        }
    }, [applyInvoiceResponse, checkPaymentStatus, getPaymentRequestOptions, persistPaymentRecovery]);

    const continueAfterIdentity = useCallback(async (session, response) => {
        const merged = {
            ...(session?.draft || {}),
            ...(response || {}),
            bookingId: session?.bookingId,
        };
        const paymentAmount = Number(merged.paymentAmount ?? merged.PaymentAmount);
        const bookingStatus = normalizeStatus(getBookingStatus(merged));

        setConfirmation(merged);
        refreshAvailability();
        setIsRegistrationPromptOpen(false);
        setIsEmailOtpPromptOpen(false);
        setIsPasswordSetupPromptOpen(false);

        if (!Number.isFinite(paymentAmount) || paymentAmount < 0) {
            setStep(5);
            setPaymentState('failed');
            setPaymentError('Booking response хүчинтэй paymentAmount агуулаагүй байна.');
            return;
        }

        if (paymentAmount === 0) {
            if (bookingStatus !== 'confirmed') {
                setStep(5);
                setPaymentState('failed');
                setPaymentError('Төлбөргүй захиалга Confirmed төлөвт шилжээгүй байна.');
                return;
            }

            clearPaymentRecovery();
            setPaymentState('confirmed');
            setStep(6);
            return;
        }

        const paymentSession = {
            ...session,
            clinicId: session?.clinicId ?? selectedClinic?.id,
            draft: merged,
        };
        await startPaymentInvoice(paymentSession);
    }, [refreshAvailability, selectedClinic?.id, startPaymentInvoice]);

    const handleDeclineRegistration = async () => {
        if (isDecliningIdentity || isSubmitting) return;

        setIsDecliningIdentity(true);
        setIdentityError('');

        try {
            const session = await createBookingSession();
            const response = await declineBookingIdentity({
                clinicId: selectedClinic?.id,
                bookingId: session.bookingId,
                bookingToken: session.bookingToken,
            });
            await continueAfterIdentity(session, response);
        } catch (error) {
            setIdentityError(error.message || 'Бүртгэлгүй үргэлжлүүлэхэд алдаа гарлаа.');
        } finally {
            setIsDecliningIdentity(false);
        }
    };

    // Mobile-ийн registration sheet-ээс ГАДУУР дарвал зөвхөн prompt-ийг хаана.
    // `handleDeclineRegistration`-ийг энд ашиглаж БОЛОХГҮЙ: тэр нь BE рүү хүсэлт
    // явуулж, бүртгэлгүй захиалгыг баталгаажуулдаг тусдаа үйлдэл юм.
    const handleDismissRegistrationPrompt = () => {
        if (layout !== 'mobile' || isDecliningIdentity || isSubmitting) return;

        setIdentityError('');
        setIsRegistrationPromptOpen(false);
        setStep(2);
    };

    const handleAcceptRegistration = async () => {
        if (isSubmitting || isSendingOtp) return;

        if (!canUseAccountInfo && !isEmailValid) {
            setIdentityError('Gmail-ээр код авахын тулд хувийн мэдээлэл хэсэгт зөв имэйл хаяг оруулна уу.');
            return;
        }

        setIdentityError('');
        setOtpCode('');
        setOtpError('');

        try {
            const session = await createBookingSession();
            setIsRegistrationPromptOpen(false);
            setIsEmailOtpPromptOpen(true);
            setStep(2);
            await sendEmailOtp(session);
        } catch (error) {
            setIdentityError(error.message || 'Захиалга үүсгэхэд алдаа гарлаа.');
        }
    };

    const handleBackToRegistrationPrompt = () => {
        setOtpCode('');
        setOtpError('');
        setIdentityError('');
        setStep(2);
        setIsEmailOtpPromptOpen(false);
        setIsRegistrationPromptOpen(true);
    };

    const sendEmailOtp = async (session) => {
        if (!session) return;

        setIsSendingOtp(true);
        setOtpError('');

        try {
            const response = await sendBookingEmailOtp({
                clinicId: selectedClinic?.id,
                bookingId: session.bookingId,
                bookingToken: session.bookingToken,
            });
            setOtpDestination(response?.destination || patientInfo.email);
            setOtpExpiresAt(response?.expiresAt || '');
        } catch (error) {
            setOtpError(error.message || 'Код илгээхэд алдаа гарлаа.');
        } finally {
            setIsSendingOtp(false);
        }
    };

    const verifyEmailOtp = async (code) => {
        if (!bookingSession || code.length !== 4 || isVerifyingOtp) return;

        setIsVerifyingOtp(true);
        setOtpError('');

        try {
            const response = await verifyBookingEmailOtp({
                clinicId: selectedClinic?.id,
                bookingId: bookingSession.bookingId,
                bookingToken: bookingSession.bookingToken,
                code,
            });

            if (response?.requiresPasswordSetup) {
                if (!response?.passwordSetupToken) {
                    throw new Error('Нууц үг үүсгэх мэдээлэл олдсонгүй. Кодыг дахин илгээнэ үү.');
                }

                setPasswordSetup({
                    token: response.passwordSetupToken,
                    expiresAt: response.expiresAt || '',
                    verifiedIdentity: otpDestination || patientInfo.email || '',
                });
                setPassword('');
                setConfirmPassword('');
                setPasswordSetupError('');
                setIsEmailOtpPromptOpen(false);
                setIsPasswordSetupPromptOpen(true);
                setStep(2);
                return;
            }

            if (!response?.token) {
                throw new Error('Баталгаажуулалтын хариу дутуу байна. Кодыг дахин илгээнэ үү.');
            }

            useAuthStore.getState().loginWithToken(response.token, patientInfo);
            await continueAfterIdentity(bookingSession, response);
        } catch (error) {
            setOtpError(error.message || 'Баталгаажуулах код буруу байна.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handlePasswordSetupSubmit = async (event) => {
        event.preventDefault();

        if (isSettingPassword) return;

        if (!password || !confirmPassword) {
            setPasswordSetupError('Нууц үгээ хоёр талбарт оруулна уу.');
            return;
        }

        if (password !== confirmPassword) {
            setPasswordSetupError('Нууц үг давталттайгаа тохирохгүй байна.');
            return;
        }

        if (!bookingSession || !passwordSetup?.token) {
            setPasswordSetupError('Нууц үг үүсгэх хугацаа дууссан байна. Кодыг дахин илгээнэ үү.');
            return;
        }

        setIsSettingPassword(true);
        setPasswordSetupError('');

        try {
            const response = await setupBookingPassword({
                clinicId: selectedClinic?.id,
                bookingId: bookingSession.bookingId,
                bookingToken: bookingSession.bookingToken,
                passwordSetupToken: passwordSetup.token,
                password,
                confirmPassword,
            });

            if (!response?.token) {
                throw new Error('Нууц үг үүсгэсэн хариу дутуу байна. Дахин оролдоно уу.');
            }

            useAuthStore.getState().loginWithToken(response.token, patientInfo);
            setPassword('');
            setConfirmPassword('');
            setPasswordSetup(null);
            await continueAfterIdentity(bookingSession, response);
        } catch (error) {
            setPasswordSetupError(getPasswordSetupErrorMessage(error));
        } finally {
            setIsSettingPassword(false);
        }
    };

    const handleBackFromPasswordSetup = () => {
        setPassword('');
        setConfirmPassword('');
        setPasswordSetupError('');
        setPasswordSetup(null);
        setIsPasswordSetupPromptOpen(false);
        setIsRegistrationPromptOpen(true);
        setStep(2);
    };

    const handleOtpChange = (value) => {
        const nextCode = value.replace(/\D/g, '').slice(0, 4);
        setOtpCode(nextCode);
        setOtpError('');

        if (nextCode.length === 4) {
            verifyEmailOtp(nextCode);
        }
    };

    const startAccountInfoBooking = async () => {
        try {
            const session = await createBookingSession();

            // Login хийсэн User-г BE аль хэдийн баталгаажсан гэж буцаавал
            // registration consent болон Gmail OTP-г алгасаад confirmation харуулна.
            if (session.draft?.requiresIdentityVerification === false) {
                await continueAfterIdentity(session, session.draft);
                return;
            }

            setIdentityError('');
            setIsRegistrationPromptOpen(true);
        } catch (error) {
            if (error?.code === 'ACCOUNT_INFO_INCOMPLETE') return;

            setSubmitError(error?.message || 'Захиалга үүсгэхэд алдаа гарлаа.');
            setStep(2);
        }
    };

    const handleContinue = () => {
        if (step === 1 && selectedService) {
            if (canUseAccountInfo) {
                void startAccountInfoBooking();
                return;
            }

            setStep(2);
        } else if (step === 2 && canSubmit) {
            if (hasUserAccount && !allowAccountInfo) {
                void startAccountInfoBooking();
                return;
            }

            setSubmitError('');
            setNeedsNewTimeSlot(false);
            setIdentityError('');
            setIsEmailOtpPromptOpen(false);
            setIsRegistrationPromptOpen(true);
        }
    };

    const handleInputChange = (field, value) => {
        // Phone number: only allow digits, max 8 chars
        if (field === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 8);
        }
        setPatientInfo({ [field]: value });
    };

    const handleOpenBankApps = useCallback(() => {
        setActivePaymentMethod('banks');
    }, []);

    const handleOpenQr = useCallback(() => {
        setActivePaymentMethod('qr');
    }, []);

    const handleClosePaymentMethod = useCallback(() => {
        setActivePaymentMethod(null);
    }, []);

    const handleRequestCancelPayment = useCallback(() => {
        setIsCancelPaymentPromptOpen(true);
    }, []);

    const handleContinuePayment = useCallback(() => {
        setIsCancelPaymentPromptOpen(false);
    }, []);

    useEffect(() => {
        if (!POLLING_STATES.has(paymentState) || isCheckingPayment) return undefined;

        const timeoutId = window.setTimeout(() => {
            if (document.visibilityState === 'visible') {
                void checkPaymentStatus();
            }
        }, POLLING_INTERVAL_MS);

        return () => window.clearTimeout(timeoutId);
    }, [checkPaymentStatus, isCheckingPayment, paymentState]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === 'visible' &&
                POLLING_STATES.has(paymentState) &&
                !isCheckingPaymentRef.current
            ) {
                void checkPaymentStatus();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [checkPaymentStatus, paymentState]);

    useEffect(() => {
        const clinicId = selectedClinic?.id;
        if (!clinicId || recoveryAttemptRef.current === String(clinicId)) return;
        recoveryAttemptRef.current = String(clinicId);

        let recovery;
        try {
            recovery = JSON.parse(sessionStorage.getItem(QPAY_RECOVERY_KEY) || 'null');
        } catch {
            clearPaymentRecovery();
            return;
        }

        if (!recovery || String(recovery.clinicId) !== String(clinicId) || !recovery.bookingId) {
            return;
        }

        const expiryMs = Date.parse(recovery.invoiceExpiresAt || '');
        if (Number.isFinite(expiryMs) && expiryMs <= Date.now()) {
            clearPaymentRecovery();
            return;
        }

        const session = {
            clinicId: recovery.clinicId,
            bookingId: recovery.bookingId,
            bookingToken: recovery.bookingToken,
            draft: { bookingId: recovery.bookingId },
        };
        const recoveredInvoice = normalizeInvoice({
            invoiceExpiresAt: recovery.invoiceExpiresAt,
            bookingStatus: 'AwaitingPayment',
            invoiceStatus: 'Creating',
        });

        invoiceCreationRef.current = true;
        paymentSessionRef.current = session;
        invoiceRef.current = recoveredInvoice;
        setBookingSession(session);
        setInvoice(recoveredInvoice);
        setPaymentState('creating');
        setPaymentError('');
        setStep(5);
        openBookingDetails();
        void checkPaymentStatus(session);
    }, [checkPaymentStatus, openBookingDetails, selectedClinic?.id]);

    useEffect(() => () => {
        paymentRequestRef.current?.abort();
    }, []);

    const isPrimaryDisabled = step === 1
        ? (!selectedService || isSubmitting)
        : (!canSubmit || isSubmitting);

    // Бүх breakpoint дээр overlay тул хаах/нээхийг ResponsiveSheet өөрөө
    // AnimatePresence-ээр зохицуулна — энд эрт return хийх шаардлагагүй.
    return (
        <ResponsiveSheet
            mode={mode}
            open={isBookingDetailsOpen}
            focusTrapPaused={isRegistrationPromptOpen || isEmailOtpPromptOpen || isPasswordSetupPromptOpen}
            onClose={handleBack}
            // Илгээж байх үед болон баталгаажилтын дэлгэц дээр санамсаргүй хаалтаас хамгаална
            dismissible={!isRegistrationPromptOpen && !isEmailOtpPromptOpen && !isPasswordSetupPromptOpen && step < 3 && !isSubmitting && !isVerifyingOtp && !isSettingPassword}
            label="Захиалгын дэлгэрэнгүй"
        >
            <BookingDetailsPanel
                step={step}
                services={services}
                isLoadingProducts={isLoadingProducts}
                productError={productError}
                onReloadLists={onReloadLists}
                selectedService={selectedService}
                selectedDoctor={selectedDoctor}
                selectedTimeSlot={selectedTimeSlot}
                selectedBranch={selectedBranch}
                selectedClinic={selectedClinic}
                handleServiceSelect={handleServiceSelect}
                patientInfo={patientInfo}
                showPersonalInfoForm={!canUseAccountInfo}
                handleInputChange={handleInputChange}
                isPhoneValid={isPhoneValid}
                isEmailValid={isEmailValid}
                submitError={submitError}
                needsNewTimeSlot={needsNewTimeSlot}
                onPickAnotherTimeSlot={handlePickAnotherTimeSlot}
                confirmation={confirmation}
                onFinish={handleFinish}
                onViewDetails={handleViewDetails}
                otpCode={otpCode}
                otpDestination={otpDestination}
                otpExpiresAt={otpExpiresAt}
                otpError={otpError}
                isSendingOtp={isSendingOtp}
                isVerifyingOtp={isVerifyingOtp}
                onOtpChange={handleOtpChange}
                onResendOtp={() => sendEmailOtp(bookingSession)}
                identityError={identityError}
                isRegistrationPromptOpen={isRegistrationPromptOpen}
                isRegistrationPromptBusy={isDecliningIdentity || isSubmitting}
                isEmailOtpPromptOpen={isEmailOtpPromptOpen}
                isPasswordSetupPromptOpen={isPasswordSetupPromptOpen}
                passwordSetupIdentity={passwordSetup?.verifiedIdentity || ''}
                password={password}
                confirmPassword={confirmPassword}
                passwordSetupError={passwordSetupError}
                isSettingPassword={isSettingPassword}
                onAcceptRegistration={handleAcceptRegistration}
                onDeclineRegistration={handleDeclineRegistration}
                onDismissRegistration={handleDismissRegistrationPrompt}
                isRegistrationBackdropDismissible={layout === 'mobile'}
                isIdentityPromptDesktop={layout === 'desktop'}
                onBackToRegistrationPrompt={handleBackToRegistrationPrompt}
                onPasswordChange={setPassword}
                onConfirmPasswordChange={setConfirmPassword}
                onPasswordSetupSubmit={handlePasswordSetupSubmit}
                onBackFromPasswordSetup={handleBackFromPasswordSetup}
                onBack={handleBack}
                onContinue={handleContinue}
                isSubmitting={isSubmitting}
                isPrimaryDisabled={isPrimaryDisabled}
                paymentState={paymentState}
                invoice={invoice}
                paymentError={paymentError}
                isCheckingPayment={isCheckingPayment}
                activePaymentMethod={activePaymentMethod}
                isCancelPaymentPromptOpen={isCancelPaymentPromptOpen}
                onCheckPayment={() => checkPaymentStatus()}
                onOpenBankApps={handleOpenBankApps}
                onOpenQr={handleOpenQr}
                onCancelPayment={handleRequestCancelPayment}
                onContinuePayment={handleContinuePayment}
                onConfirmCancelPayment={handleFinish}
                onClosePaymentMethod={handleClosePaymentMethod}
                slideVariants={SLIDE_VARIANTS}
            />
        </ResponsiveSheet>
    );
}
