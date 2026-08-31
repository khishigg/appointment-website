import { createElement, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion as Motion, useReducedMotion } from 'framer-motion';
import {
    FiCalendar,
    FiCheck,
    FiChevronRight,
    FiClock,
    FiCopy,
    FiMapPin,
    FiPlus,
    FiRefreshCw,
    FiUser,
    FiX,
} from 'react-icons/fi';

import { getMyBookings } from '../api/myBookings';
import ResponsiveSheet from '../components/booking/ResponsiveSheet';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useAuthStore } from '../store/AuthStore';

const asList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const normalizeStatus = (value) => {
    const status = String(value || '').replace(/[\s_-]/g, '').toLowerCase();

    if (status === 'awaitingpayment') return 'pending';
    if (status === 'confirmed') return 'confirmed';
    if (status === 'completed') return 'completed';
    if (['cancelled', 'canceled', 'expired'].includes(status)) return 'cancelled';
    return 'pending';
};

const cleanText = (value) => String(value ?? '').trim();

const formatMoney = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '';
    return `${new Intl.NumberFormat('mn-MN').format(numeric)} ₮`;
};

const splitDateTime = (value) => {
    const [date = '', rawTime = ''] = String(value || '').split('T');
    return { date, time: rawTime.slice(0, 5) };
};

const getTimestamp = (value) => {
    const timestamp = Date.parse(value || '');
    return Number.isFinite(timestamp) ? timestamp : 0;
};

const normalizeBooking = (booking = {}) => {
    const bookingId = booking.bookingId ?? booking.BookingId ?? '';
    const aptDateTime = booking.aptDateTime ?? booking.AptDateTime ?? '';
    const { date, time } = splitDateTime(aptDateTime);
    const durationMinutes = booking.durationMinutes ?? booking.DurationMinutes;
    const createdAtRaw = booking.createdAt ?? booking.CreatedAt ?? '';

    return {
        id: bookingId,
        bookingId,
        clinicId: booking.clinicId ?? booking.ClinicId,
        clinicNum: booking.clinicNum ?? booking.ClinicNum,
        provNum: booking.provNum ?? booking.ProvNum,
        productId: booking.productId ?? booking.ProductId,
        clinicName: cleanText(booking.clinicName ?? booking.ClinicName),
        branchName: cleanText(booking.branchName ?? booking.BranchName),
        providerName: cleanText(booking.providerName ?? booking.ProviderName),
        serviceName: cleanText(booking.productName ?? booking.ProductName) || 'Үйлчилгээ',
        duration: Number.isFinite(Number(durationMinutes)) ? `${durationMinutes} мин` : '',
        price: formatMoney(booking.price ?? booking.Price),
        date,
        time,
        aptDateTime,
        sortTimestamp: getTimestamp(aptDateTime) || getTimestamp(createdAtRaw),
        status: normalizeStatus(booking.status ?? booking.Status),
        expiresAt: booking.expiresAt ?? booking.ExpiresAt ?? '',
    };
};

const STATUS_CONFIG = {
    pending: {
        label: 'Хүлээгдэж буй',
        dot: 'bg-info',
        chip: 'bg-info-surface text-info-text',
    },
    confirmed: {
        label: 'Баталгаажсан',
        dot: 'bg-success',
        chip: 'bg-success-surface text-success-text',
    },
    completed: {
        label: 'Дууссан',
        dot: 'bg-success',
        chip: 'bg-success-surface text-success-text',
    },
    cancelled: {
        label: 'Цуцлагдсан',
        dot: 'bg-danger',
        chip: 'bg-danger-surface text-danger-text',
    },
};

const getStatus = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';

    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day, 12);
    if (
        Number.isNaN(date.getTime())
        || date.getFullYear() !== year
        || date.getMonth() !== month - 1
        || date.getDate() !== day
    ) {
        return dateStr;
    }

    const dayNames = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
    const yearLabel = year === new Date().getFullYear() ? '' : `${year} оны `;
    return `${yearLabel}${month}-р сарын ${day} (${dayNames[date.getDay()]})`;
};

const formatDetailDateTime = (value) => {
    if (!value) return '';
    const { date, time } = splitDateTime(value);
    const dateLabel = formatFriendlyDate(date);
    return [dateLabel, time].filter(Boolean).join(' · ');
};

const getClinicLabel = (appointment) => {
    const labels = [appointment.clinicName, appointment.branchName]
        .filter(Boolean)
        .filter((value, index, values) => values.indexOf(value) === index);
    return labels.join(' · ');
};

const StatusBadge = ({ status }) => {
    const config = getStatus(status);
    return (
        <span className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-[11px] font-semibold leading-4 ${config.chip}`}>
            <span className={`h-1.5 w-1.5 rounded-pill ${config.dot}`} aria-hidden="true" />
            {config.label}
        </span>
    );
};

const AppointmentCard = ({ appointment, onOpen, reduceMotion }) => {
    const clinicLabel = getClinicLabel(appointment);

    return (
        <Motion.article
            initial={reduceMotion ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18 }}
        >
            <button
                type="button"
                onClick={() => onOpen(appointment)}
                className="group grid min-h-11 w-full grid-cols-[minmax(0,1fr)_1.25rem] items-center gap-3 rounded-panel border border-line bg-surface p-4 text-left transition-colors hover:border-faint hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-focus"
                aria-label={`${formatFriendlyDate(appointment.date)} ${appointment.time} цагийн захиалгын дэлгэрэнгүй`}
            >
                <span className="min-w-0">
                    <span className="flex min-w-0 items-start justify-between gap-2">
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-semibold leading-5 text-heading sm:text-base">
                                {formatFriendlyDate(appointment.date) || 'Огноо тодорхойгүй'}
                            </span>
                            <span className="mt-0.5 block text-xs leading-4 text-muted">
                                {[appointment.time, appointment.duration].filter(Boolean).join(' · ') || 'Цагийн мэдээлэл байхгүй'}
                            </span>
                        </span>
                        <StatusBadge status={appointment.status} />
                    </span>

                    <span className="mt-3 block truncate text-base font-semibold leading-5 text-ink">
                        {appointment.serviceName}
                    </span>
                    {clinicLabel ? (
                        <span className="mt-1 block truncate text-xs leading-4 text-muted">
                            {clinicLabel}
                        </span>
                    ) : null}
                </span>

                <FiChevronRight className="h-5 w-5 text-faint transition-transform group-hover:translate-x-0.5 group-hover:text-ink" aria-hidden="true" />
            </button>
        </Motion.article>
    );
};

const AppointmentSection = ({ id, title, appointments, onOpen, reduceMotion }) => {
    if (appointments.length === 0) return null;

    return (
        <section aria-labelledby={`appointments-${id}`}>
            <h2 id={`appointments-${id}`} className="mb-2.5 text-sm font-semibold text-muted">
                {title}
            </h2>
            <div className="flex flex-col gap-3">
                {appointments.map((appointment) => (
                    <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onOpen={onOpen}
                        reduceMotion={reduceMotion}
                    />
                ))}
            </div>
        </section>
    );
};

const DetailRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-3 border-b border-line-soft py-3 last:border-b-0">
            <span className="grid h-9 w-9 place-items-center rounded-control bg-canvas text-muted" aria-hidden="true">
                {createElement(icon, { className: 'h-4 w-4' })}
            </span>
            <span className="min-w-0">
                <span className="block text-xs leading-4 text-muted">{label}</span>
                <span className="mt-0.5 block break-words text-sm font-semibold leading-5 text-ink">{value}</span>
            </span>
        </div>
    );
};

const AppointmentDetails = ({ appointment, open, onClose, onRebook, mode }) => {
    const [copied, setCopied] = useState(false);
    if (!appointment) return null;

    const clinicLabel = getClinicLabel(appointment);
    const canRebook = ['completed', 'cancelled'].includes(appointment.status);
    const expiry = appointment.status === 'pending'
        ? formatDetailDateTime(appointment.expiresAt)
        : '';

    const copyBookingId = async () => {
        if (!appointment.bookingId) return;
        try {
            await navigator.clipboard.writeText(String(appointment.bookingId));
            setCopied(true);
        } catch {
            setCopied(false);
        }
    };

    const closeDetails = () => {
        setCopied(false);
        onClose();
    };

    return (
        <ResponsiveSheet
            mode={mode}
            open={open}
            onClose={closeDetails}
            label="Захиалгын дэлгэрэнгүй"
            className={mode === 'sheet' ? '!top-auto max-h-[85dvh] rounded-t-[24px]' : ''}
        >
            <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line-soft px-4 py-3 sm:px-5">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold leading-6 text-heading">Захиалгын дэлгэрэнгүй</h2>
                    <div className="mt-1"><StatusBadge status={appointment.status} /></div>
                </div>
                <button
                    type="button"
                    onClick={closeDetails}
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-control text-heading hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-focus"
                    aria-label="Хаах"
                >
                    <FiX className="h-5 w-5" aria-hidden="true" />
                </button>
            </header>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-2 sm:px-5">
                <DetailRow
                    icon={FiCalendar}
                    label="Огноо, цаг"
                    value={[formatFriendlyDate(appointment.date), appointment.time, appointment.duration].filter(Boolean).join(' · ')}
                />
                <DetailRow icon={FiCalendar} label="Үйлчилгээ" value={appointment.serviceName} />
                <DetailRow icon={FiMapPin} label="Эмнэлэг, салбар" value={clinicLabel} />
                <DetailRow icon={FiUser} label="Эмч" value={appointment.providerName} />
                <DetailRow icon={FiClock} label="Төлбөр" value={appointment.price} />
                <DetailRow icon={FiClock} label="Төлбөрийн хүчинтэй хугацаа" value={expiry} />

                {appointment.bookingId ? (
                    <div className="flex min-w-0 items-center justify-between gap-3 py-3">
                        <span className="min-w-0">
                            <span className="block text-xs leading-4 text-muted">Захиалгын дугаар</span>
                            <span className="mt-0.5 block truncate text-sm font-semibold leading-5 text-ink">
                                {appointment.bookingId}
                            </span>
                        </span>
                        <button
                            type="button"
                            onClick={copyBookingId}
                            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-control border border-line px-3 text-xs font-semibold text-heading hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-focus"
                        >
                            {copied ? <FiCheck className="h-4 w-4" aria-hidden="true" /> : <FiCopy className="h-4 w-4" aria-hidden="true" />}
                            {copied ? 'Хуулсан' : 'Хуулах'}
                        </button>
                    </div>
                ) : null}
            </div>

            {canRebook ? (
                <footer className="shrink-0 border-t border-line-soft bg-surface p-4 sm:p-5">
                    <button
                        type="button"
                        onClick={() => onRebook(appointment)}
                        className="booking-cta-primary inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold"
                    >
                        <FiRefreshCw className="h-4 w-4" aria-hidden="true" />
                        Дахин захиалах
                    </button>
                </footer>
            ) : null}
        </ResponsiveSheet>
    );
};

const LoadingState = () => (
    <div className="space-y-3" role="status" aria-live="polite" aria-label="Захиалгуудыг уншиж байна">
        {Array.from({ length: 3 }, (_, index) => (
            <div key={index} className="h-[124px] animate-pulse rounded-panel border border-line bg-surface motion-reduce:animate-none" />
        ))}
    </div>
);

const PageState = ({ title, action }) => (
    <div className="grid min-h-56 place-items-center rounded-panel border border-line bg-surface px-5 py-10 text-center">
        <div>
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-pill bg-canvas text-muted" aria-hidden="true">
                <FiCalendar className="h-6 w-6" />
            </span>
            <h2 className="mt-3 text-base font-semibold text-heading">{title}</h2>
            {action ? <div className="mt-4">{action}</div> : null}
        </div>
    </div>
);

export default function MyAppointmentsPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = useAuthStore((state) => state.token);
    const reduceMotion = useReducedMotion();
    const isTabletUp = useMediaQuery('(min-width: 768px)');
    const [appointments, setAppointments] = useState([]);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [isLoading, setIsLoading] = useState(Boolean(token));
    const [error, setError] = useState('');
    const [errorStatus, setErrorStatus] = useState(null);
    const [reloadKey, setReloadKey] = useState(0);

    useEffect(() => {
        if (!token) {
            setAppointments([]);
            setIsLoading(false);
            setError('');
            setErrorStatus(null);
            return undefined;
        }

        const controller = new AbortController();
        setIsLoading(true);
        setError('');
        setErrorStatus(null);

        getMyBookings({ token, signal: controller.signal })
            .then((data) => {
                setAppointments(
                    asList(data)
                        .map(normalizeBooking)
                        .filter((booking) => booking.bookingId)
                );
            })
            .catch((requestError) => {
                if (requestError.name === 'AbortError') return;
                setAppointments([]);
                setError(requestError.message || 'Захиалгын жагсаалт авахад алдаа гарлаа.');
                setErrorStatus(requestError.status || null);
            })
            .finally(() => {
                if (!controller.signal.aborted) setIsLoading(false);
            });

        return () => controller.abort();
    }, [token, reloadKey]);

    const groupedAppointments = useMemo(() => {
        const active = appointments
            .filter((appointment) => ['pending', 'confirmed'].includes(appointment.status))
            .sort((first, second) => (first.sortTimestamp || Number.POSITIVE_INFINITY) - (second.sortTimestamp || Number.POSITIVE_INFINITY));
        const history = appointments
            .filter((appointment) => ['completed', 'cancelled'].includes(appointment.status))
            .sort((first, second) => second.sortTimestamp - first.sortTimestamp);
        return { active, history };
    }, [appointments]);

    const handleRebook = (appointment) => {
        setSelectedAppointment(null);
        navigate(appointment.clinicId
            ? `/booking?clinicId=${encodeURIComponent(appointment.clinicId)}`
            : '/booking');
    };

    const loginAction = (
        <Link
            to="/login"
            state={{ from: location }}
            className="inline-flex min-h-11 items-center justify-center rounded-control bg-primary px-4 text-sm font-semibold text-primary-text hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus"
        >
            Нэвтрэх
        </Link>
    );

    let pageContent;
    if (isLoading) {
        pageContent = <LoadingState />;
    } else if (!token || errorStatus === 401) {
        pageContent = <PageState title="Захиалгаа харахын тулд нэвтэрнэ үү" action={loginAction} />;
    } else if (error) {
        pageContent = (
            <div className="rounded-panel border border-danger bg-danger-surface p-4 text-sm text-danger-text" role="alert">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <span>Захиалгын жагсаалтыг авч чадсангүй.</span>
                    <button
                        type="button"
                        onClick={() => setReloadKey((value) => value + 1)}
                        className="min-h-11 rounded-control border border-danger px-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-focus"
                    >
                        Дахин оролдох
                    </button>
                </div>
            </div>
        );
    } else if (appointments.length === 0) {
        pageContent = (
            <PageState
                title="Захиалга алга"
                action={(
                    <Link
                        to="/booking"
                        className="inline-flex min-h-11 items-center gap-2 rounded-control bg-primary px-4 text-sm font-semibold text-primary-text hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus"
                    >
                        <FiPlus className="h-4 w-4" aria-hidden="true" />
                        Цаг авах
                    </Link>
                )}
            />
        );
    } else {
        pageContent = (
            <div className="space-y-6">
                <AppointmentSection
                    id="active"
                    title="Идэвхтэй"
                    appointments={groupedAppointments.active}
                    onOpen={setSelectedAppointment}
                    reduceMotion={reduceMotion}
                />
                <AppointmentSection
                    id="history"
                    title="Өмнөх захиалга"
                    appointments={groupedAppointments.history}
                    onOpen={setSelectedAppointment}
                    reduceMotion={reduceMotion}
                />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-canvas px-4 pb-20 pt-[calc(var(--app-header-height)_+_1rem)] sm:px-6 sm:pt-[calc(var(--app-header-height)_+_1.5rem)]">
            <div className="mx-auto max-w-[960px]">
                <header className="mb-6 flex items-center justify-between gap-3">
                    <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">Захиалгын түүх</h1>
                    <Link
                        to="/booking"
                        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control bg-primary px-3.5 text-sm font-semibold text-primary-text shadow-xs hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-focus sm:px-4"
                    >
                        <FiPlus className="h-4 w-4" aria-hidden="true" />
                        Цаг авах
                    </Link>
                </header>

                {pageContent}
            </div>

            <AppointmentDetails
                appointment={selectedAppointment}
                open={Boolean(selectedAppointment)}
                onClose={() => setSelectedAppointment(null)}
                onRebook={handleRebook}
                mode={isTabletUp ? 'dialog' : 'sheet'}
            />
        </main>
    );
}
