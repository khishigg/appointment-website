import { useEffect, useRef, useState } from 'react';
import { FiLoader } from 'react-icons/fi';

import {
    addDays,
    formatApiDate,
    getDoctorFreeTimeSlots,
    resolveDoctorProvNum,
} from '../../api/appointments';

const MONTH_SHORT_NAMES = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
};

const WEEK_DAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

const normalizeSelectedDate = (dateValue) => {
    if (dateValue instanceof Date && !Number.isNaN(dateValue.getTime())) {
        return formatApiDate(dateValue);
    }

    if (typeof dateValue !== 'string' || !dateValue.trim()) {
        return formatApiDate(new Date());
    }

    const value = dateValue.trim();
    const isoMatch = value.match(/\d{4}-\d{2}-\d{2}/);
    if (isoMatch) {
        return isoMatch[0];
    }

    const monthDayMatch = value.match(/\b([A-Za-z]{3,})\s+(\d{1,2})\b/);
    if (monthDayMatch) {
        const month = MONTH_SHORT_NAMES[monthDayMatch[1].slice(0, 3).toLowerCase()];
        const day = Number(monthDayMatch[2]);

        if (month !== undefined && Number.isInteger(day)) {
            const date = new Date();
            date.setMonth(month, day);
            return formatApiDate(date);
        }
    }

    const mongolianMonthDayMatch = value.match(/(\d{1,2})-р сарын (\d{1,2})/);
    if (mongolianMonthDayMatch) {
        const month = Number(mongolianMonthDayMatch[1]);
        const day = Number(mongolianMonthDayMatch[2]);

        if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const date = new Date();
            date.setMonth(month - 1, day);
            return formatApiDate(date);
        }
    }

    const parsedDate = new Date(value);
    return Number.isNaN(parsedDate.getTime()) ? formatApiDate(new Date()) : formatApiDate(parsedDate);
};

const categorizeSlots = (slots) => {
    const groups = { morning: [], afternoon: [], evening: [] };
    slots.forEach((slot) => {
        const time = slot.time;
        const hour = parseInt(time.split(':')[0]);
        if (hour < 12 && !time.includes('12:')) {
            groups.morning.push(slot);
        } else if (hour >= 12 && hour < 17) {
            groups.afternoon.push(slot);
        } else {
            groups.evening.push(slot);
        }
    });
    return groups;
};

// variant-аас хамаарсан харагдац. Рэйл (inline) нь ~380px тул слот цөөн баганатай.
const VARIANT_STYLES = {
    overlay: {
        content: 'max-w-2xl mx-auto py-4 px-0',
        section: 'px-4 sm:px-8',
        slotGrid: 'grid grid-cols-4 md:grid-cols-6 gap-1.5',
    },
    inline: {
        content: 'w-full py-3 px-0',
        section: 'px-3',
        slotGrid: 'grid grid-cols-3 xl:grid-cols-4 gap-1.5',
    },
};

/**
 * TimeSlotPanel — цаг сонголтын АГУУЛГА (bottom sheet / dialog / рэйл бүгдэд ижил).
 *
 * Bookings store-ыг ШУУД дуудахгүй: сонголтоо `onSelectSlot`-оор дээшээ мэдэгдэнэ.
 * Учир нь бүрхүүл бүр өөр зан төлөвтэй — overlay нь өөрийгөө хааж дараагийнхыг нээдэг,
 * харин desktop рэйл нь `closeTimeSlotModal` дуудвал `initialScrollDate` цэвэрлэгдэж
 * буруу төлөв рүү унана.
 *
 * Fetch нь `doctor`-оор хаалттай (өмнө `isTimeSlotModalOpen` байсан) — панель зөвхөн
 * харагдах ёстой үедээ mount хийгддэг тул "нээлттэй эсэх" шалгалт бүрхүүлийн үүрэг.
 */
export default function TimeSlotPanel({
    doctor,
    initialDate,
    refreshKey = 0,
    selectedTimeSlot,
    onSelectSlot,
    variant = 'overlay',
}) {
    const styles = VARIANT_STYLES[variant] ?? VARIANT_STYLES.overlay;
    const dateRefs = useRef({});

    const [availabilityData, setAvailabilityData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');
    const [availabilityQueryKey, setAvailabilityQueryKey] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const availabilityRequestId = useRef(0);

    const selectedDate = normalizeSelectedDate(initialDate);
    const doctorProvNum = resolveDoctorProvNum(doctor);
    const isClinicProvider = doctor?.clinicId != null;
    const endDate = isClinicProvider
        ? formatApiDate(addDays(new Date(`${selectedDate}T00:00:00`), 6))
        : selectedDate;
    const activeAvailabilityKey = doctor
        ? [
            doctor.clinicId ?? '',
            doctor.clinicNum ?? '',
            doctorProvNum ?? '',
            selectedDate,
            endDate,
        ].join(':')
        : '';
    const isFreshAvailability = availabilityQueryKey === activeAvailabilityKey;

    useEffect(() => {
        const requestId = ++availabilityRequestId.current;

        if (!doctor) {
            setAvailabilityData([]);
            setIsLoading(false);
            setAvailabilityError('');
            setAvailabilityQueryKey('');
            return undefined;
        }

        const controller = new AbortController();

        if (!doctorProvNum) {
            setAvailabilityData([]);
            setAvailabilityError('Сул цаг шалгах эмчийн provNum олдсонгүй.');
            setAvailabilityQueryKey(activeAvailabilityKey);
            setIsLoading(false);
            return () => controller.abort();
        }

        const fetchAvailability = async () => {
            setAvailabilityData([]);
            setAvailabilityError('');
            setAvailabilityQueryKey('');
            setIsLoading(true);
            try {
                const freeTimeDays = await getDoctorFreeTimeSlots({
                    doctor,
                    doctorProvNum,
                    startDate: selectedDate,
                    endDate,
                    slotDuration: 30,
                    signal: controller.signal,
                });

                const newAvailabilityData = [];

                for (let i = 0; i < freeTimeDays.length; i++) {
                    const freeDay = freeTimeDays[i];
                    const slotDetails = Array.isArray(freeDay.slotDetails)
                        ? freeDay.slotDetails
                        : (freeDay.slots || []).map((time) => ({ time }));
                    const d = new Date(`${freeDay.date}T00:00:00`);
                    const today = new Date();
                    const tomorrow = new Date(today);
                    tomorrow.setDate(today.getDate() + 1);

                    const dateStr = freeDay.date;
                    const isToday = dateStr === formatApiDate(today);
                    const isTomorrow = dateStr === formatApiDate(tomorrow);

                    let dayLabel = WEEK_DAYS[d.getDay()];
                    if (isToday) dayLabel = 'Өнөөдөр';
                    else if (isTomorrow) dayLabel = 'Маргааш';

                    const month = d.getMonth() + 1;
                    const dayOfMonth = d.getDate();

                    newAvailabilityData.push({
                        day: `${dayLabel}, ${month}-р сарын ${dayOfMonth}`,
                        fullDate: dateStr,
                        slots: slotDetails,
                        noAppts: slotDetails.length === 0,
                    });
                }

                if (requestId !== availabilityRequestId.current) return;
                setAvailabilityData(newAvailabilityData);
                setAvailabilityQueryKey(activeAvailabilityKey);
            } catch (error) {
                if (error.name === 'AbortError') return;
                if (requestId !== availabilityRequestId.current) return;
                setAvailabilityData([]);
                setAvailabilityError(error.message || 'Сул цаг авахад алдаа гарлаа.');
                setAvailabilityQueryKey(activeAvailabilityKey);
            } finally {
                if (
                    !controller.signal.aborted &&
                    requestId === availabilityRequestId.current
                ) {
                    setIsLoading(false);
                }
            }
        };

        fetchAvailability();
        return () => controller.abort();
    }, [
        activeAvailabilityKey,
        doctor,
        doctorProvNum,
        endDate,
        refreshKey,
        reloadKey,
        selectedDate,
    ]);

    const scrollToDate = (day) => {
        dateRefs.current[day]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // DoctorSelector-оос тодорхой өдөр дээр нээхэд тухайн хэсэг рүү гүйлгэнэ
    useEffect(() => {
        if (!initialDate || !isFreshAvailability || availabilityData.length === 0) return undefined;

        const timer = setTimeout(() => {
            const dateNum = String(initialDate).match(/\d+/)?.[0];
            if (!dateNum) return;
            const targetSection = availabilityData.find((d) => d.day.includes(`сарын ${dateNum}`));
            if (targetSection) scrollToDate(targetSection.day);
        }, 100); // анимац тогтохыг хүлээнэ

        return () => clearTimeout(timer);
    }, [initialDate, availabilityData, isFreshAvailability]);

    if (!doctor) return null;

    const visibleAvailabilityData = isFreshAvailability ? availabilityData : [];
    const showAvailabilityLoading = isLoading || !isFreshAvailability;
    const hasAvailableSlots = visibleAvailabilityData.some((section) => section.slots.length > 0);

    return (
        <>
            {/* Өдрийн хэвтээ навигаци */}
            <div className="sticky top-0 z-30 border-b border-line-soft bg-surface px-2 py-2">
                <div className="flex gap-2 overflow-x-auto max-md:no-scrollbar">
                    {visibleAvailabilityData.map((section, idx) => {
                        const monthMatch = section.day.match(/(\d+)-р сарын (\d+)/);
                        let shortLabel = monthMatch
                            ? `${monthMatch[1]}-${monthMatch[2]}`
                            : section.day.split(',')[0]?.trim() || section.day;

                        // "2-р сарын 19 - Ням, 2-р сарын 22" хэлбэрийн муж
                        if (section.noAppts && section.day.includes(' - ')) {
                            const matches = [...section.day.matchAll(/(\d+)-р сарын (\d+)/g)];
                            if (matches.length >= 2) {
                                shortLabel = `${matches[0][1]}-${matches[0][2]}~${matches[1][2]}`;
                            }
                        }

                        return (
                            <button
                                key={idx}
                                type="button"
                                onClick={() => scrollToDate(section.day)}
                                className={`
                                    whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all
                                    ${section.noAppts
                                        ? 'bg-canvas text-faint'
                                        : 'border border-selected-border bg-surface text-ink hover:bg-hover-surface active:scale-95'}
                                `}
                            >
                                {shortLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Гүйдэг агуулга */}
            <div className="flex-1 overflow-y-auto max-md:no-scrollbar scroll-smooth">
                <div className={styles.content}>
                    {showAvailabilityLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-faint">
                            <FiLoader className="mb-4 h-8 w-8 animate-spin text-ink" />
                            <p className="text-sm font-medium">Сул цагуудыг шалгаж байна...</p>
                        </div>
                    ) : availabilityError ? (
                        <div className="booking-data-state booking-data-state--error" role="alert">
                            <span>{availabilityError}</span>
                            <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
                                Дахин оролдох
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {!hasAvailableSlots ? (
                                <div className={styles.section}>
                                    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-soft bg-canvas/20 py-8 opacity-70">
                                        <p className="text-body font-medium italic text-faint">
                                            Сонгосон хугацаанд сул цаг байхгүй.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            {hasAvailableSlots && visibleAvailabilityData.map((section, idx) => {
                                const groups = categorizeSlots(section.slots);

                                return (
                                    <div
                                        key={idx}
                                        ref={(el) => { dateRefs.current[section.day] = el; }}
                                        className={`relative scroll-mt-4 ${styles.section}`}
                                    >
                                        <div className="sticky top-0 z-10 mb-1 border-b border-line-soft bg-surface py-1.5">
                                            <h4 className="text-body font-bold tracking-tight text-heading">
                                                {section.day}
                                            </h4>
                                        </div>

                                        {section.noAppts ? (
                                            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-line-soft bg-canvas/20 py-8 opacity-60">
                                                <p className="text-body font-medium italic text-faint">
                                                    Боломжит цаг байхгүй
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="mb-4 space-y-3 pl-2">
                                                {SLOT_GROUPS.map(({ key, label }) => (
                                                    <SlotGroup
                                                        key={key}
                                                        label={label}
                                                        slots={groups[key]}
                                                        day={section.day}
                                                        apiDate={section.fullDate}
                                                        gridClass={styles.slotGrid}
                                                        selectedTimeSlot={selectedTimeSlot}
                                                        onSelectSlot={onSelectSlot}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="h-24" />
            </div>
        </>
    );
}

const SLOT_GROUPS = [
    { key: 'morning', label: 'Өглөө' },
    { key: 'afternoon', label: 'Өдөр' },
    { key: 'evening', label: 'Орой' },
];

function SlotGroup({ label, slots, day, apiDate, gridClass, selectedTimeSlot, onSelectSlot }) {
    if (!slots || slots.length === 0) return null;

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 opacity-50">
                <span className="text-label font-medium uppercase tracking-wide">{label}</span>
                <div className="h-px flex-1 bg-canvas" />
            </div>
            <div className={gridClass}>
                {slots.map((slot, idx) => (
                    <TimeButton
                        key={idx}
                        slot={slot}
                        day={day}
                        apiDate={apiDate}
                        isSelected={
                            selectedTimeSlot?.time === slot.time &&
                            selectedTimeSlot?.apiDate === apiDate
                        }
                        onSelectSlot={onSelectSlot}
                    />
                ))}
            </div>
        </div>
    );
}

function TimeButton({ slot, day, apiDate, isSelected, onSelectSlot }) {
    const handleClick = () => {
        onSelectSlot?.({
            time: slot.time,
            date: day,
            apiDate,
            operatoryNum: slot.operatoryNum ?? null,
            opName: slot.opName ?? '',
            rawSlot: slot.rawSlot ?? null,
        });
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`
                rounded-lg py-2 text-body font-semibold transition-all duration-300
                ${isSelected
                    ? 'z-10 scale-[1.05] bg-primary text-primary-text shadow-lg'
                    : 'border border-black/5 bg-availability text-ink shadow-sm hover:bg-availability-hover active:scale-95'}
            `}
        >
            {slot.time}
        </button>
    );
}
