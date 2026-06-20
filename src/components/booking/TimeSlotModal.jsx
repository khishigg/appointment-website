import React, { useRef, useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FiX, FiLoader } from 'react-icons/fi';
import { useBookingStore } from '../../store/BookingStore';
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

/**
 * TimeSlotModal - Zocdoc-style detailed availability selector
 */
export default function TimeSlotModal() {
    const {
        isTimeSlotModalOpen,
        closeTimeSlotModal,
        selectedDoctor,
        selectedTimeSlot,
        selectTimeSlot,
        initialScrollDate,
        openBookingDetails,
    } = useBookingStore();

    const dateRefs = useRef({});

    const [availabilityData, setAvailabilityData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [availabilityError, setAvailabilityError] = useState('');
    const [availabilityQueryKey, setAvailabilityQueryKey] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const availabilityRequestId = useRef(0);
    const selectedDate = normalizeSelectedDate(initialScrollDate);
    const doctorProvNum = resolveDoctorProvNum(selectedDoctor);
    const isClinicProvider = Boolean(
        selectedDoctor?.clinicId != null &&
        selectedDoctor?.clinicNum != null
    );
    const endDate = isClinicProvider
        ? formatApiDate(addDays(new Date(`${selectedDate}T00:00:00`), 6))
        : selectedDate;
    const activeAvailabilityKey = isTimeSlotModalOpen && selectedDoctor
        ? [
            selectedDoctor.clinicId ?? '',
            selectedDoctor.clinicNum ?? '',
            doctorProvNum ?? '',
            selectedDate,
            endDate,
        ].join(':')
        : '';
    const isFreshAvailability = availabilityQueryKey === activeAvailabilityKey;

    useEffect(() => {
        const requestId = ++availabilityRequestId.current;

        if (!isTimeSlotModalOpen || !selectedDoctor) {
            setAvailabilityData([]);
            setIsLoading(false);
            setAvailabilityError('');
            setAvailabilityQueryKey('');
            return;
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
                    doctor: selectedDoctor,
                    doctorProvNum,
                    startDate: selectedDate,
                    endDate,
                    slotDuration: 30,
                    signal: controller.signal,
                });

                const weekDays = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
                
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
                    
                    let dayLabel = weekDays[d.getDay()];
                    if (isToday) dayLabel = 'Өнөөдөр';
                    else if (isTomorrow) dayLabel = 'Маргааш';
                    
                    const month = d.getMonth() + 1;
                    const dayOfMonth = d.getDate();
                    
                    const dayHeader = `${dayLabel}, ${month}-р сарын ${dayOfMonth}`;

                    newAvailabilityData.push({
                        day: dayHeader,
                        fullDate: dateStr,
                        slots: slotDetails,
                        noAppts: slotDetails.length === 0
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
        doctorProvNum,
        endDate,
        isTimeSlotModalOpen,
        reloadKey,
        selectedDate,
        selectedDoctor,
    ]);

    const categorizeSlots = (slots) => {
        const groups = { morning: [], afternoon: [], evening: [] };
        slots.forEach(slot => {
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

    const scrollToDate = (day) => {
        const element = dateRefs.current[day];
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Effect to handle initial scroll when modal opens from DoctorSelector
    useEffect(() => {
        if (isTimeSlotModalOpen && initialScrollDate && isFreshAvailability && availabilityData.length > 0) {
            const timer = setTimeout(() => {
                const dateNum = initialScrollDate.match(/\d+/)?.[0];
                if (dateNum) {
                    const targetSection = availabilityData.find(d => d.day.includes(`сарын ${dateNum}`));
                    if (targetSection) {
                        scrollToDate(targetSection.day);
                    }
                }
            }, 100); // Slightly longer for the modal animation to settle
            return () => clearTimeout(timer);
        }
    }, [isTimeSlotModalOpen, initialScrollDate, availabilityData, isFreshAvailability]);

    if (!selectedDoctor) return null;

    const visibleAvailabilityData = isFreshAvailability ? availabilityData : [];
    const showAvailabilityLoading = isLoading || (isTimeSlotModalOpen && !isFreshAvailability);
    const hasAvailableSlots = visibleAvailabilityData.some(
        (section) => section.slots.length > 0
    );

    return (
        <AnimatePresence>
            {isTimeSlotModalOpen && (
                <div className="fixed inset-0 z-[9999]">
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeTimeSlotModal}
                        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
                    />

                    <Motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 220 }}
                        className="absolute inset-x-0 bottom-0 top-0 bg-white shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="px-8 py-2 border-b border-gray-50 flex items-center bg-white z-20">
                            <button
                                onClick={closeTimeSlotModal}
                                className="p-2 -ml-2 text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <FiX className="w-7 h-7" />
                            </button>
                            <h2 className="text-xl mt-2 font-bold text-gray-700 ml-4">Цаг захиалах</h2>
                        </div>

                        {/* Horizontal Date Navigation */}
                        <div className="sticky top-0 bg-white border-b border-gray-100 z-30 px-2 py-2">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {visibleAvailabilityData.map((section, idx) => {
                                    // Extract short date label (e.g., "2-5", "2-6", "2-19~22")
                                    const monthMatch = section.day.match(/(\d+)-р сарын (\d+)/);
                                    let shortLabel = monthMatch
                                        ? `${monthMatch[1]}-${monthMatch[2]}`
                                        : section.day.split(',')[0]?.trim() || section.day;

                                    // Special handling for ranges like "2-р сарын 19 - Ням, 2-р сарын 22"
                                    if (section.noAppts && section.day.includes(' - ')) {
                                        const matches = [...section.day.matchAll(/(\d+)-р сарын (\d+)/g)];
                                        if (matches.length >= 2) {
                                            shortLabel = `${matches[0][1]}-${matches[0][2]}~${matches[1][2]}`;
                                        }
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => scrollToDate(section.day)}
                                            className={`
                                                px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                                ${section.noAppts
                                                    ? 'bg-gray-100 text-gray-400'
                                                    : 'bg-white text-gray-900 border border-gray-900  hover:bg-gray-50 active:scale-95'}
                                            `}
                                        >
                                            {shortLabel}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                            <div className="max-w-2xl mx-auto py-4 px-0">
                                {showAvailabilityLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                        <FiLoader className="w-8 h-8 animate-spin mb-4 text-gray-900" />
                                        <p className="text-sm font-medium">Сул цагуудыг шалгаж байна...</p>
                                    </div>
                                ) : availabilityError ? (
                                    <div className="booking-data-state booking-data-state--error" role="alert">
                                        <span>{availabilityError}</span>
                                        <button
                                            type="button"
                                            onClick={() => setReloadKey((value) => value + 1)}
                                        >
                                            Дахин оролдох
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                    {!hasAvailableSlots && (
                                        <div className="px-4 sm:px-8">
                                            <div className="py-8 border border-dashed border-gray-100 rounded-3xl bg-gray-50/20 flex flex-col items-center justify-center opacity-70">
                                                <p className="text-[14px] text-gray-400 font-medium italic">
                                                    Сонгосон хугацаанд сул цаг байхгүй.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                    {hasAvailableSlots && visibleAvailabilityData.map((section, idx) => {
                                        const groups = categorizeSlots(section.slots);

                                        return (
                                            <div
                                                key={idx}
                                                ref={el => dateRefs.current[section.day] = el}
                                                className="relative px-4 sm:px-8 scroll-mt-4"
                                            >
                                                {/* Date Label */}
                                                <div className="sticky top-0 bg-white py-1.5 z-10 mb-1 border-b border-gray-50">
                                                    <h4 className="text-[14px] font-bold text-gray-800 tracking-tight">
                                                        {section.day}
                                                    </h4>
                                                </div>

                                                {section.noAppts ? (
                                                    <div className="py-8 border border-dashed border-gray-100 rounded-3xl bg-gray-50/20 flex flex-col items-center justify-center opacity-60">
                                                        <p className="text-[14px] text-gray-400 font-medium italic">Боломжит цаг байхгүй</p>
                                                    </div>
                                                ) : (
                                                    <div className="pl-2 mb-4 space-y-3">
                                                        {groups.morning.length > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <span className="text-[10px] font-medium tracking-wide uppercase">Өглөө</span>
                                                                    <div className="h-px bg-gray-100 flex-1" />
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-1.5">
                                                                    {groups.morning.map((slot, sIdx) => (
                                                                        <TimeButton key={sIdx} slot={slot} day={section.day} apiDate={section.fullDate} isSelected={selectedTimeSlot?.time === slot.time && selectedTimeSlot?.apiDate === section.fullDate} selectTimeSlot={selectTimeSlot} closeTimeSlotModal={closeTimeSlotModal} openBookingDetails={openBookingDetails} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {groups.afternoon.length > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <span className="text-[10px] font-medium tracking-wide uppercase">Өдөр</span>
                                                                    <div className="h-px bg-gray-100 flex-1" />
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-1.5">
                                                                    {groups.afternoon.map((slot, sIdx) => (
                                                                        <TimeButton key={sIdx} slot={slot} day={section.day} apiDate={section.fullDate} isSelected={selectedTimeSlot?.time === slot.time && selectedTimeSlot?.apiDate === section.fullDate} selectTimeSlot={selectTimeSlot} closeTimeSlotModal={closeTimeSlotModal} openBookingDetails={openBookingDetails} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {groups.evening.length > 0 && (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2 opacity-50">
                                                                    <span className="text-[10px] font-medium tracking-wide uppercase">Орой</span>
                                                                    <div className="h-px bg-gray-100 flex-1" />
                                                                </div>
                                                                <div className="grid grid-cols-4 gap-1.5">
                                                                    {groups.evening.map((slot, sIdx) => (
                                                                        <TimeButton key={sIdx} slot={slot} day={section.day} apiDate={section.fullDate} isSelected={selectedTimeSlot?.time === slot.time && selectedTimeSlot?.apiDate === section.fullDate} selectTimeSlot={selectTimeSlot} closeTimeSlotModal={closeTimeSlotModal} openBookingDetails={openBookingDetails} />
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
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
                    </Motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function TimeButton({
    slot,
    day,
    apiDate,
    isSelected,
    selectTimeSlot,
    closeTimeSlotModal,
    openBookingDetails,
}) {
    const handleClick = () => {
        selectTimeSlot({
            time: slot.time,
            date: day,
            apiDate,
            operatoryNum: slot.operatoryNum ?? null,
            opName: slot.opName ?? '',
            rawSlot: slot.rawSlot ?? null,
        });
        closeTimeSlotModal();
        openBookingDetails();
    };

    return (
        <button
            onClick={handleClick}
            className={`
                py-2 text-[14px] font-semibold rounded-lg transition-all duration-300
                ${isSelected
                    ? 'bg-gray-900 text-white shadow-lg scale-[1.05] z-10'
                    : 'bg-[#FFF200] text-gray-900 hover:brightness-95 active:scale-95 shadow-sm border border-black/5'}
            `}
        >
            {slot.time}
        </button>
    );
}
