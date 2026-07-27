import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBookingStore } from '../../store/BookingStore';
import { useBookingLayout } from '../../hooks/useMediaQuery';
import { bookAppointment } from '../../api/appointments';
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
 * Flow: 1) Үйлчилгээ → 2) Хувийн мэдээлэл + submit → 4) Баталгаажилт
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
    const mode = layout === 'desktop' ? 'inline' : layout === 'tablet' ? 'dialog' : 'sheet';

    // Local state for current step
    const [step, setStep] = useState(1); // 1: Service, 2: Patient Info, 4: Confirmation
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [needsNewTimeSlot, setNeedsNewTimeSlot] = useState(false);
    const [confirmation, setConfirmation] = useState(null);

    // Admin горимд products prop-оор API-гийн үйлчилгээ ирнэ. Mock (non-admin) урсгалд
    // productId байхгүй тул захиалга илгээгдэхгүй — зөвхөн демо жагсаалт харагдана.
    const services = products ?? MOCK_SERVICES;

    // Validation
    const isPhoneValid = patientInfo.phone && /^[0-9]{8}$/.test(patientInfo.phone);
    // Салбар сонгох нь ЗААВАЛ биш — clinicNum тодорхойгүй бол payload-аас гарч,
    // сервер эмчийн салбарыг өөрөө нөхнө.
    const canSubmit = Boolean(
        patientInfo.firstName &&
        patientInfo.lastName &&
        isPhoneValid &&
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
    const handleFinish = () => {
        closeBookingDetails();
        setStep(1);
        setConfirmation(null);
        setSubmitError('');
        setNeedsNewTimeSlot(false);
        setTimeout(() => {
            resetBooking();
        }, 500);
        navigate('/');
    };

    const handleViewDetails = () => {
        handleFinish();
        navigate('/my-appointments');
    };

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) return;

        setIsSubmitting(true);
        setSubmitError('');
        setNeedsNewTimeSlot(false);

        try {
            const response = await bookAppointment({
                clinicId: selectedClinic?.id,
                doctor: selectedDoctor,
                branch: selectedBranch,
                timeSlot: selectedTimeSlot,
                service: selectedService,
                patientInfo,
            });

            setConfirmation(response);
            refreshAvailability();
            setStep(4);
        } catch (error) {
            // Формын өгөгдлийг ЯМАР Ч алдааны үед арилгахгүй.
            if (error.status === 409) {
                setSubmitError('Энэ цаг дөнгөж сая захиалагдлаа. Өөр цаг сонгоно уу.');
                setNeedsNewTimeSlot(true);
                selectTimeSlot(null);
                refreshAvailability();
            } else if (error.status === 404) {
                setSubmitError('Эмч/салбар олдсонгүй. Жагсаалтыг шинэчилж байна.');
                onReloadLists?.();
            } else {
                setSubmitError(error.message || 'Захиалга үүсгэхэд алдаа гарлаа.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleContinue = () => {
        if (step === 1 && selectedService) {
            setStep(2);
        } else if (step === 2) {
            handleSubmit();
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

    // Desktop дээр рэйл нь хаагдах анимацгүй — хаалттай бол огт рендэрлэхгүй.
    // (sheet/dialog-д ResponsiveSheet өөрөө AnimatePresence-ээр гаралтыг зохицуулна.)
    if (mode === 'inline' && !isBookingDetailsOpen) return null;

    return (
        <ResponsiveSheet
            mode={mode}
            open={isBookingDetailsOpen}
            onClose={handleBack}
            // Илгээж байх үед болон баталгаажилтын дэлгэц дээр санамсаргүй хаалтаас хамгаална
            dismissible={step !== 4 && !isSubmitting}
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
                submitError={submitError}
                needsNewTimeSlot={needsNewTimeSlot}
                onPickAnotherTimeSlot={handlePickAnotherTimeSlot}
                confirmation={confirmation}
                onFinish={handleFinish}
                onViewDetails={handleViewDetails}
                onBack={handleBack}
                onContinue={handleContinue}
                isSubmitting={isSubmitting}
                isPrimaryDisabled={isPrimaryDisabled}
                slideVariants={SLIDE_VARIANTS}
            />
        </ResponsiveSheet>
    );
}
