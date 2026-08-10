import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiChevronDown, FiChevronUp, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { getMyBookings } from '../api/myBookings';
import { useAuthStore } from '../store/AuthStore';

// Backend response нь array эсвэл нийтлэг envelope хэлбэрээр ирсэн аль алиныг уншина.
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

const formatMoney = (value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '';
    return `${new Intl.NumberFormat('mn-MN').format(numeric)}₮`;
};

const formatDateTime = (value) => {
    if (!value) return '';
    const [date = '', time = ''] = String(value).split('T');
    return `${date}${time ? ` ${time.slice(0, 5)}` : ''}`.trim();
};

const normalizeBooking = (booking = {}) => {
    const bookingId = booking.bookingId ?? booking.BookingId ?? '';
    const aptDateTime = booking.aptDateTime ?? booking.AptDateTime ?? '';
    const [date = '', time = ''] = String(aptDateTime).split('T');
    const rawStatus = booking.status ?? booking.Status ?? '';
    const durationMinutes = booking.durationMinutes ?? booking.DurationMinutes;

    return {
        id: bookingId,
        bookingId,
        clinicId: booking.clinicId ?? booking.ClinicId,
        clinicNum: booking.clinicNum ?? booking.ClinicNum,
        provNum: booking.provNum ?? booking.ProvNum,
        productId: booking.productId ?? booking.ProductId,
        serviceName: booking.productName ?? booking.ProductName ?? 'Үйлчилгээний нэр бүртгэгдээгүй',
        duration: Number.isFinite(Number(durationMinutes)) ? `${durationMinutes} мин` : '',
        price: formatMoney(booking.price ?? booking.Price),
        date,
        time: time.slice(0, 5),
        status: normalizeStatus(rawStatus),
        rawStatus,
        expiresAt: formatDateTime(booking.expiresAt ?? booking.ExpiresAt),
        createdAt: formatDateTime(booking.createdAt ?? booking.CreatedAt),
    };
};

const FILTER_TABS = [
    { id: 'all', label: 'Бүгд' },
    { id: 'pending', label: 'Төлбөр хүлээгдэж буй' },
    { id: 'confirmed', label: 'Баталгаажсан' },
    { id: 'completed', label: 'Өнгөрсөн' },
    { id: 'cancelled', label: 'Цуцлагдсан' },
];

/**
 * Статусын харагдац — токен системийн feedback гурвалаар (өмнө нь түүхий
 * blue/emerald/rose палитр байсан тул booking урсгалтай зөрчилдөж байв).
 * Шошго нь БОГИНО — mobile-д pill 2 мөр болж хугарахаас сэргийлнэ.
 */
const STATUS_CONFIG = {
    pending: { label: 'Төлбөр хүлээгдэж байна', dot: 'bg-info', chip: 'bg-info-surface text-info-text' },
    confirmed: { label: 'Баталгаажсан', dot: 'bg-success', chip: 'bg-success-surface text-success-text' },
    completed: { label: 'Биелсэн', dot: 'bg-success', chip: 'bg-success-surface text-success-text' },
    cancelled: { label: 'Цуцлагдсан', dot: 'bg-danger', chip: 'bg-danger-surface text-danger-text' },
};

const getStatus = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.pending;

/** '2026-07-29' → '7-р сарын 29 (Лхагва)' */
const formatFriendlyDate = (dateStr) => {
    if (!dateStr) return '';
    try {
        const [year, month, day] = dateStr.split('-').map(Number);
        const dayNames = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];
        const dayOfWeek = dayNames[new Date(year, month - 1, day).getDay()];

        return `${month}-р сарын ${day} (${dayOfWeek})`;
    } catch {
        return dateStr;
    }
};

/** Дэлгэрэнгүй хэсгийн нэгж. `<p>` БИШ — Bootstrap `p{margin-bottom:1rem}` зайг гажуудуулдаг. */
const DetailCell = ({ label, value, hint }) => {
    if (!value) return null;

    return (
        <div className="min-w-0">
            <div className="text-caption text-muted">{label}</div>
            <div className="mt-0.5 text-body font-semibold leading-snug text-ink break-words">{value}</div>
            {hint ? (
                <div className="mt-0.5 text-caption leading-snug text-muted line-clamp-2">{hint}</div>
            ) : null}
        </div>
    );
};

const FilterTabs = ({ tabs, activeTab, onTabChange, appointments }) => (
    // relative + fade — mobile-д таб гүйдгийг илэрхийлнэ (өмнө нь `no-scrollbar`-аас
    // болж дохиогүй тасарч, эвдэрсэн мэт харагддаг байв).
    <div className="relative border-b border-line">
        <div
            role="tablist"
            aria-label="Захиалгын төлөв шүүлтүүр"
            className="flex items-center gap-1 overflow-x-auto pb-px"
        >
            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const count = tab.id === 'all'
                    ? appointments.length
                    : appointments.filter((a) => a.status === tab.id).length;

                return (
                    <button
                        key={tab.id}
                        role="tab"
                        id={`tab-${tab.id}`}
                        aria-selected={isActive}
                        aria-controls={`panel-${tab.id}`}
                        onClick={() => onTabChange(tab.id)}
                        className={`-mb-px flex flex-shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${isActive
                            ? 'border-selected-border text-ink'
                            : 'border-transparent text-muted hover:text-heading'
                            }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`rounded-pill px-2 py-0.5 text-caption font-bold ${isActive ? 'bg-primary text-primary-text' : 'bg-canvas text-muted'
                            }`}>
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
        <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-canvas to-transparent sm:hidden"
        />
    </div>
);

/**
 * Нэг захиалга — desktop дээр НЯГТ МӨР, mobile дээр компакт карт.
 *
 * Өмнө нь 2 баганат ~530px өндөр карт байсан тул дэлгэцэнд 2 л багтдаг байв. Түүх бол
 * хайж олох жагсаалт тул мөр болгосноор 5-6 захиалга зэрэг харагдана.
 * Хоёрдогч мэдээлэл (захиалгын дугаар, захиалсан огноо, хаяг, өвчтөн) дэлгэрэнгүйд шилжив.
 */
const AppointmentRow = ({ apt, onRebook }) => {
    const [expanded, setExpanded] = useState(false);
    const status = getStatus(apt.status);

    return (
        <Motion.article
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="rounded-card border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-overlay"
            aria-label={`Захиалга #${apt.bookingId}`}
        >
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-5">
                {/* Огноо + цаг — тэргүүлэх мэдээлэл */}
                <div className="lg:w-48 lg:flex-shrink-0">
                    <div className="text-body font-semibold leading-snug text-ink">
                        {formatFriendlyDate(apt.date)}
                    </div>
                    <div className="text-caption text-muted">
                        {apt.time}{apt.duration ? ` · ${apt.duration}` : ''}
                    </div>
                </div>

                {/* Provider дугаар + үйлчилгээ */}
                <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-2 sm:gap-4">
                    <div className="min-w-0">
                        <div className="truncate text-body font-semibold leading-snug text-ink">
                            {apt.provNum != null ? `Эмчийн дугаар: #${apt.provNum}` : 'Эмчийн мэдээлэл ирээгүй'}
                        </div>
                        <div className="truncate text-caption text-muted">
                            {apt.clinicNum != null ? `Салбарын дугаар: #${apt.clinicNum}` : ''}
                        </div>
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-body leading-snug text-ink">{apt.serviceName}</div>
                        <div className="text-caption text-muted">{apt.price}</div>
                    </div>
                </div>

                {/* Статус + статусаас хамаарсан үйлдэл */}
                <div className="flex flex-wrap items-center gap-2 lg:flex-shrink-0 lg:flex-nowrap">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill px-2.5 py-1 text-caption font-semibold ${status.chip}`}>
                        <span className={`h-1.5 w-1.5 rounded-pill ${status.dot}`} aria-hidden="true" />
                        {status.label}
                    </span>

                    <button
                        type="button"
                        onClick={() => onRebook(apt)}
                        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-control border border-line px-3 py-1.5 text-caption font-semibold text-heading transition-colors hover:bg-hover-surface"
                    >
                        <FiRefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                        Дахин захиалах
                    </button>

                    <button
                        type="button"
                        onClick={() => setExpanded(!expanded)}
                        aria-expanded={expanded}
                        aria-label={expanded ? 'Дэлгэрэнгүй хаах' : 'Дэлгэрэнгүй харах'}
                        className="rounded-control p-1.5 text-muted transition-colors hover:bg-hover-surface hover:text-ink"
                    >
                        {expanded
                            ? <FiChevronUp className="h-4 w-4" />
                            : <FiChevronDown className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <Motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 grid gap-3 border-t border-line-soft pt-3 sm:grid-cols-2 lg:grid-cols-4">
                            <DetailCell
                                label="Эмнэлэг / салбар"
                                value={`Clinic #${apt.clinicId}${apt.clinicNum != null ? ` · Салбар #${apt.clinicNum}` : ''}`}
                            />
                            <DetailCell
                                label="Үйлчилгээ"
                                value={apt.serviceName}
                                hint={apt.productId != null ? `Product #${apt.productId}` : ''}
                            />
                            <DetailCell label="Захиалгын дугаар" value={apt.bookingId} />
                            <DetailCell
                                label="Үүссэн / дуусах хугацаа"
                                value={apt.createdAt}
                                hint={apt.expiresAt ? `Хүчинтэй хугацаа: ${apt.expiresAt}` : ''}
                            />
                        </div>
                    </Motion.div>
                )}
            </AnimatePresence>
        </Motion.article>
    );
};

const EmptyState = ({ activeTab, filterLabel }) => (
    <Motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-card border border-line bg-surface p-10 text-center shadow-card"
    >
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-pill border border-line bg-canvas text-muted">
            <FiCalendar className="h-7 w-7" />
        </div>
        <div className="text-title text-ink">Захиалга олдсонгүй</div>
        <div className="mx-auto mb-5 mt-1 max-w-xs text-caption text-muted">
            Та одоогоор {activeTab !== 'all' ? `"${filterLabel}"` : ''} төлөвтэй цаг захиалаагүй байна.
        </div>
        <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2 text-caption font-semibold text-primary-text transition-colors hover:bg-primary-hover"
        >
            <FiPlus className="h-4 w-4" />
            <span>Цаг захиалах</span>
        </Link>
    </Motion.div>
);

const BookingListState = ({ title, description, onRetry, showBookingAction = false }) => (
    <div className="rounded-card border border-line bg-surface p-10 text-center shadow-card" role={onRetry ? 'alert' : undefined}>
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-pill border border-line bg-canvas text-muted">
            <FiCalendar className="h-7 w-7" />
        </div>
        <div className="text-title text-ink">{title}</div>
        <div className="mx-auto mt-1 max-w-md text-caption leading-5 text-muted">{description}</div>
        {onRetry ? (
            <button
                type="button"
                onClick={onRetry}
                className="mt-5 rounded-control bg-primary px-4 py-2 text-caption font-semibold text-primary-text transition-colors hover:bg-primary-hover"
            >
                Дахин оролдох
            </button>
        ) : showBookingAction ? (
            <Link
                to="/booking"
                className="mt-5 inline-flex items-center gap-2 rounded-control bg-primary px-4 py-2 text-caption font-semibold text-primary-text transition-colors hover:bg-primary-hover"
            >
                <FiPlus className="h-4 w-4" />
                Цаг захиалах
            </Link>
        ) : null}
    </div>
);

export default function MyAppointmentsPage() {
    const navigate = useNavigate();
    const token = useAuthStore((state) => state.token);
    const [appointments, setAppointments] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
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
                const nextAppointments = asList(data)
                    .map(normalizeBooking)
                    .filter((booking) => booking.bookingId)
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
                setAppointments(nextAppointments);
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

    const filteredAppointments = useMemo(() => {
        if (activeTab === 'all') return appointments;
        return appointments.filter((apt) => apt.status === activeTab);
    }, [appointments, activeTab]);

    const activeTabLabel = FILTER_TABS.find((t) => t.id === activeTab)?.label || '';

    // Дахин захиалахад эмнэлгийн КОНТЕКСТ дамжуулна — өмнө нь `/booking` руу хоосон
    // шилжиж, хэрэглэгч эмнэлгээ эхнээс нь дахин сонгох шаардлагатай болдог байв.
    const handleRebook = (apt) => {
        navigate(apt.clinicId ? `/booking?clinicId=${encodeURIComponent(apt.clinicId)}` : '/booking');
    };

    return (
        // Дээд зайг navbar-ын БОДИТ өндрөөс авна (MyNavbar `--app-header-height`-д бичдэг).
        // Магик тоо ашиглавал navbar-ын өндөр өөрчлөгдөхөд агуулга доогуур нь орно.
        <div className="min-h-screen bg-canvas px-4 pb-20 pt-[calc(var(--app-header-height)_+_1.5rem)] sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl space-y-6">
                <div className="flex flex-col justify-between gap-4 border-b border-line-soft pb-2 sm:flex-row sm:items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                Захиалгын түүх
                            </h1>
                            <span className="rounded-pill border border-line bg-surface px-2.5 py-1 text-caption font-semibold text-muted">
                                Нийт: {appointments.length}
                            </span>
                        </div>
                        <div className="mt-1 text-caption text-muted sm:text-sm">
                            Таны хийсэн цаг захиалгуудын жагсаалт ба дэлгэрэнгүй
                        </div>
                    </div>

                    <Link
                        to="/booking"
                        className="inline-flex items-center justify-center gap-2 self-start rounded-control bg-primary px-5 py-2.5 text-sm font-semibold text-primary-text shadow-card transition-colors hover:bg-primary-hover active:scale-[0.98] sm:self-auto"
                    >
                        <FiPlus className="h-4 w-4" />
                        <span>Шинэ цаг авах</span>
                    </Link>
                </div>

                {isLoading ? (
                    <BookingListState
                        title="Захиалгын жагсаалтыг уншиж байна"
                        description="Таны баталгаажуулсан захиалгуудыг серверээс авч байна."
                    />
                ) : !token ? (
                    <BookingListState
                        title="Захиалгаа баталгаажуулна уу"
                        description="Guest хэрэглэгчийн захиалгын жагсаалт нь и-мэйл OTP баталгаажуулалтын дараа харагдана."
                        showBookingAction
                    />
                ) : error ? (
                    <BookingListState
                        title="Захиалгын жагсаалт авч чадсангүй"
                        description={error}
                        onRetry={errorStatus === 401 ? undefined : () => setReloadKey((value) => value + 1)}
                        showBookingAction={errorStatus === 401}
                    />
                ) : (
                    <>
                        <FilterTabs
                            tabs={FILTER_TABS}
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            appointments={appointments}
                        />

                        <AnimatePresence mode="wait">
                            {filteredAppointments.length === 0 ? (
                                <EmptyState key="empty" activeTab={activeTab} filterLabel={activeTabLabel} />
                            ) : (
                                <div
                                    role="tabpanel"
                                    id={`panel-${activeTab}`}
                                    aria-labelledby={`tab-${activeTab}`}
                                    className="flex flex-col gap-3"
                                >
                                    {filteredAppointments.map((apt) => (
                                        <AppointmentRow
                                            key={apt.id}
                                            apt={apt}
                                            onRebook={handleRebook}
                                        />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </>
                )}
            </div>
        </div>
    );
}
