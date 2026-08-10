import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/BookingStore';
import { useBookingLayout } from '../../hooks/useMediaQuery';
import {
    createAppointmentBooking,
    declineBookingIdentity,
    sendBookingEmailOtp,
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

/**
 * BookingDetails — захиалгын алхмуудын STATE эзэмшигч.
 *
 * Бүх breakpoint дээр ИЖИЛ байрлалд, ганц удаа mount хийгддэг; зөвхөн бүрхүүл
 * (ResponsiveSheet mode) солигдоно. Ингэснээр `step` зэрэг state хэзээ ч алдагдахгүй —
 * ялангуяа 409 алдааны дараа хэрэглэгч цагаа дахин сонгоод формдоо буцаж ирэхэд.
 *
 * Flow: 1) Үйлчилгээ → 2) Хувийн мэдээлэл → 3) Бүртгэлийн зөвшөөрөл →
 * 4) Баталгаажуулах суваг → 5) OTP → 6) Баталгаажилт
 */
export default function BookingDetails({
    products = null,
    isLoadingProducts = false,
    productError = '',
    onReloadLists,
}) {
    const navigate = useNavigate();
    const {
        isBookingDetailsOpen,
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
    const [canViewBookings, setCanViewBookings] = useState(false);
    const [isRegistrationPromptOpen, setIsRegistrationPromptOpen] = useState(false);
    const [isIdentityMethodPromptOpen, setIsIdentityMethodPromptOpen] = useState(false);
    const [isEmailOtpPromptOpen, setIsEmailOtpPromptOpen] = useState(false);

    // Admin горимд products prop-оор API-гийн үйлчилгээ ирнэ. Mock (non-admin) урсгалд
    // productId байхгүй тул захиалга илгээгдэхгүй — зөвхөн демо жагсаалт харагдана.
    const services = products ?? MOCK_SERVICES;

    // Validation
    const isPhoneValid = patientInfo.phone && /^[0-9]{8}$/.test(patientInfo.phone);
    // Салбар сонгох нь ЗААВАЛ биш — clinicNum тодорхойгүй бол payload-аас гарч,
    // сервер эмчийн салбарыг өөрөө нөхнө.
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patientInfo.email || '');
    const isEmailAcceptable = !patientInfo.email || isEmailValid;
    const canSubmit = Boolean(
        patientInfo.firstName &&
        patientInfo.lastName &&
        isPhoneValid &&
        isEmailAcceptable &&
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
        setCanViewBookings(false);
        setIsRegistrationPromptOpen(false);
        setIsIdentityMethodPromptOpen(false);
        setIsEmailOtpPromptOpen(false);
        setTimeout(() => {
            resetBooking();
        }, 500);
        navigate(destination);
    };

    const handleFinish = () => finishBookingFlow('/');

    const handleViewDetails = () => finishBookingFlow('/my-appointments');

    const createBookingSession = async () => {
        if (bookingSession) return bookingSession;

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
            });

            if (!response?.bookingId || !response?.bookingToken) {
                throw new Error('Захиалгын баталгаажуулалтын мэдээлэл олдсонгүй.');
            }

            const session = {
                bookingId: response.bookingId,
                bookingToken: response.bookingToken,
                draft: response,
            };
            setBookingSession(session);
            setCanViewBookings(false);
            return session;
        } catch (error) {
            if (error.status === 409) {
                setSubmitError('Энэ цаг дөнгөж сая захиалагдлаа. Өөр цаг сонгоно уу.');
                setNeedsNewTimeSlot(true);
                selectTimeSlot(null);
                refreshAvailability();
                setStep(2);
            } else if (error.status === 404) {
                setSubmitError('Эмч/салбар олдсонгүй. Жагсаалтыг шинэчилж байна.');
                onReloadLists?.();
                setStep(2);
            }
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcceptRegistration = () => {
        setIdentityError('');
        setIsRegistrationPromptOpen(false);
        setIsIdentityMethodPromptOpen(true);
    };

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
            setConfirmation({
                ...session.draft,
                ...response,
                bookingId: session.bookingId,
            });
            setCanViewBookings(false);
            refreshAvailability();
            setIsRegistrationPromptOpen(false);
            setIsIdentityMethodPromptOpen(false);
            setIsEmailOtpPromptOpen(false);
            setStep(6);
        } catch (error) {
            setIdentityError(error.message || 'Бүртгэлгүй үргэлжлүүлэхэд алдаа гарлаа.');
        } finally {
            setIsDecliningIdentity(false);
        }
    };

    const handleSelectEmailIdentity = async () => {
        if (isSubmitting || isSendingOtp) return;

        if (!isEmailValid) {
            setIdentityError('Gmail-ээр код авахын тулд хувийн мэдээлэл хэсэгт зөв имэйл хаяг оруулна уу.');
            return;
        }

        setIdentityError('');
        setOtpCode('');
        setOtpError('');

        try {
            const session = await createBookingSession();
            setIsRegistrationPromptOpen(false);
            setIsIdentityMethodPromptOpen(false);
            setIsEmailOtpPromptOpen(true);
            setStep(2);
            await sendEmailOtp(session);
        } catch (error) {
            setIdentityError(error.message || 'Захиалга үүсгэхэд алдаа гарлаа.');
        }
    };

    const handleBackToIdentityMethod = () => {
        setOtpCode('');
        setOtpError('');
        setIdentityError('');
        setStep(2);
        setIsEmailOtpPromptOpen(false);
        setIsIdentityMethodPromptOpen(true);
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

            useAuthStore.getState().loginWithToken(response?.token, patientInfo);
            setConfirmation({
                ...bookingSession.draft,
                ...response,
                bookingId: bookingSession.bookingId,
            });
            setCanViewBookings(true);
            refreshAvailability();
            setIsEmailOtpPromptOpen(false);
            setStep(6);
        } catch (error) {
            setOtpError(error.message || 'Баталгаажуулах код буруу байна.');
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const handleOtpChange = (value) => {
        const nextCode = value.replace(/\D/g, '').slice(0, 4);
        setOtpCode(nextCode);
        setOtpError('');

        if (nextCode.length === 4) {
            verifyEmailOtp(nextCode);
        }
    };

    const handleContinue = () => {
        if (step === 1 && selectedService) {
            setStep(2);
        } else if (step === 2 && canSubmit) {
            setSubmitError('');
            setNeedsNewTimeSlot(false);
            setIdentityError('');
            setIsIdentityMethodPromptOpen(false);
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

    const isPrimaryDisabled = step === 1
        ? !selectedService
        : (!canSubmit || isSubmitting);

    // Бүх breakpoint дээр overlay тул хаах/нээхийг ResponsiveSheet өөрөө
    // AnimatePresence-ээр зохицуулна — энд эрт return хийх шаардлагагүй.
    return (
        <ResponsiveSheet
            mode={mode}
            open={isBookingDetailsOpen}
            onClose={handleBack}
            // Илгээж байх үед болон баталгаажилтын дэлгэц дээр санамсаргүй хаалтаас хамгаална
            dismissible={!isRegistrationPromptOpen && !isIdentityMethodPromptOpen && !isEmailOtpPromptOpen && step < 3 && !isSubmitting && !isVerifyingOtp}
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
                isIdentityMethodPromptOpen={isIdentityMethodPromptOpen}
                isIdentityMethodPromptBusy={isSubmitting || isSendingOtp}
                isEmailOtpPromptOpen={isEmailOtpPromptOpen}
                onAcceptRegistration={handleAcceptRegistration}
                onDeclineRegistration={handleDeclineRegistration}
                onSelectEmailIdentity={handleSelectEmailIdentity}
                onBackToIdentityMethod={handleBackToIdentityMethod}
                canViewBookings={canViewBookings}
                onBack={handleBack}
                onContinue={handleContinue}
                isSubmitting={isSubmitting}
                isPrimaryDisabled={isPrimaryDisabled}
                slideVariants={SLIDE_VARIANTS}
            />
        </ResponsiveSheet>
    );
}
