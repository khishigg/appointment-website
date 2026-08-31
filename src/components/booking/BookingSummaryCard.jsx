import { parseLocalDateTime } from '../../api/appointments';
import genericDoctorImage from '../../assets/doctorImage.png';
import { formatProductDuration, formatProductPrice } from './productFormat';

/**
 * BookingSummaryCard — захиалгын дэлгэрэнгүй хураангуй.
 *
 * Хоёр газар ашиглагдана:
 *   1. Desktop-ийн баруун багана (сонгож буй үед)
 *   2. Баталгаажилтын дэлгэц (step 4) — `confirmation` дамжуулна
 *
 * ⚠️ Серверийн хариуны схем frontend-д тодорхойлогдоогүй тул `confirmation`-ийн талбар
 * бүрийг ХАМГААЛАЛТТАЙ уншиж, байхгүй бол store-ийн утга руу шилжинэ.
 *
 * Эмчийн DTO-д зураг ба мэргэшил БАЙХГҮЙ (normalizeProvider) — тиймээс DoctorSelector-тэй
 * ижил generic зураг ашиглаж, хуурмаг мэргэшил ОГТ харуулахгүй.
 */

// Сервер timezone тэмдэглэгээгүй орон нутгийн цаг буцаадаг тул мөрийг тэр хэвээр нь
// уншина (шилжилт гаргахгүй).
const splitConfirmationDateTime = (value) => {
    const parsed = parseLocalDateTime(value);
    if (!parsed) return null;

    const pad = (part) => String(part).padStart(2, '0');
    return {
        date: `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}`,
        time: `${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`,
    };
};

/**
 * Мэдээллийн блок — шошго ДЭЭР, утга доор, бүгд зүүн эгнээ (icon-гүй).
 *   `trailing` — мөрийн баруун талд (үйлчилгээний үнэ)
 *   `hint`     — доор нэмэлт мөр (хугацаа, эмнэлгийн нэр)
 */
const SummarySection = ({ label, value, trailing, hint }) => {
    if (!value) return null;

    return (
        <div className="border-t border-line-soft px-4 py-3 lg:px-3.5 lg:py-2.5">
            <div className="text-caption leading-tight text-muted">{label}</div>
            <div className="mt-0.5 flex items-baseline justify-between gap-3">
                <div className="min-w-0 text-body font-semibold leading-tight text-ink break-words">
                    {value}
                </div>
                {trailing ? (
                    <div className="shrink-0 text-body font-semibold leading-tight text-ink">
                        {trailing}
                    </div>
                ) : null}
            </div>
            {hint ? (
                <div className="mt-0.5 text-caption leading-tight text-muted break-words">{hint}</div>
            ) : null}
        </div>
    );
};

export default function BookingSummaryCard({
    selectedDoctor,
    selectedService,
    selectedTimeSlot,
    selectedBranch,
    selectedClinic,
    confirmation = null,
    className = '',
}) {
    const confirmedDateTime = splitConfirmationDateTime(confirmation?.aptDateTime);

    const dateText = confirmedDateTime?.date || selectedTimeSlot?.date || '';
    const timeText = confirmedDateTime?.time || selectedTimeSlot?.time || '';

    const serviceName = confirmation?.productName || selectedService?.name || '';
    // Үнэ баруун талд (trailing), хугацаа доор (hint) — тиймээс тусад нь.
    const servicePrice = formatProductPrice(confirmation?.price ?? selectedService?.price);
    const serviceDuration = formatProductDuration(
        confirmation?.durationMinutes ?? selectedService?.durationMinutes
    );

    const locationName = confirmation?.clinicName
        || selectedBranch?.name
        || selectedDoctor?.clinicName
        || '';
    // Салбарын нэр эмнэлгийн нэртэй ижил бол давхардуулж харуулахгүй.
    const locationHint = selectedClinic?.name && selectedClinic.name !== locationName
        ? selectedClinic.name
        : '';

    return (
        <aside
            className={`overflow-hidden rounded-card border border-line bg-surface [&_p]:mb-0 ${className}`}
            aria-label="Захиалгын мэдээлэл"
        >
            {/* ===== Hero: шошго + огноо/цаг том ===== */}
            <div className="bg-canvas px-4 py-3 lg:px-3 lg:py-2">
                <div className="text-body leading-tight text-muted">Захиалгын мэдээлэл</div>
                {confirmation?.aptNum ? (
                    <div className="text-caption leading-tight text-muted">#{confirmation.aptNum}</div>
                ) : null}
                {dateText ? (
                    <div className="mt-1 text-title leading-tight text-ink">{dateText}</div>
                ) : null}
                {timeText ? (
                    <div className="mt-0.5 text-title leading-tight text-ink">{timeText}</div>
                ) : null}
            </div>

            {/* ===== Эмч ===== */}
            {selectedDoctor?.name ? (
                <div className="flex items-center gap-1.5 border-t border-line-soft px-4 py-3 lg:px-2 lg:py-0.5">
                    <img
                        src={genericDoctorImage}
                        alt=""
                        aria-hidden="true"
                        className="h-11 w-11 shrink-0 rounded-pill border border-line object-cover lg:h-9 lg:w-9"
                    />
                    {/* Текстийн блок avatar-ын өндөртэй (36px) тэнцүү */}
                    <div className="min-w-0">
                        <div className="text-body font-semibold leading-tight text-ink break-words">
                            {selectedDoctor.name}
                        </div>
                        <div className="text-caption leading-tight text-muted">Эмч</div>
                    </div>
                </div>
            ) : null}

            {/* ===== Үйлчилгээ / Байршил ===== */}
            <SummarySection
                label="Үйлчилгээ"
                value={serviceName}
                trailing={servicePrice}
                hint={serviceDuration}
            />
            <SummarySection
                label="Байршил"
                value={locationName}
                hint={locationHint}
            />
        </aside>
    );
}
