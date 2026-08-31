import { useEffect, useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCalendar,
    FiChevronRight,
    FiCheckCircle,
    FiClipboard,
    FiClock,
    FiCreditCard,
    FiExternalLink,
    FiGrid,
    FiHome,
    FiRefreshCw,
    FiUser,
    FiX,
} from 'react-icons/fi';

const formatAmount = (amount, currency = 'MNT') => {
    const numeric = Number(amount);
    if (!Number.isFinite(numeric)) return '';
    if (!currency || currency.toUpperCase() === 'MNT') {
        return `${new Intl.NumberFormat('mn-MN', { maximumFractionDigits: 0 }).format(numeric)} ₮`;
    }
    try {
        return new Intl.NumberFormat('mn-MN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(numeric);
    } catch {
        return `${new Intl.NumberFormat('mn-MN').format(numeric)} ${currency}`;
    }
};

const formatExpiry = (value) => {
    const date = new Date(value || '');
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('mn-MN', {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
    }).format(date);
};

const getRemainingSeconds = (value) => {
    const expiryMs = Date.parse(value || '');
    if (!Number.isFinite(expiryMs)) return null;
    return Math.max(0, Math.ceil((expiryMs - Date.now()) / 1000));
};

const formatRemainingTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '';
    const minutes = Math.floor(seconds / 60);
    const remainder = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
};

const useInvoiceCountdown = (expiresAt) => {
    const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(expiresAt));
    useEffect(() => {
        setRemainingSeconds(getRemainingSeconds(expiresAt));
        if (!expiresAt) return undefined;
        const intervalId = window.setInterval(() => setRemainingSeconds(getRemainingSeconds(expiresAt)), 1_000);
        return () => window.clearInterval(intervalId);
    }, [expiresAt]);
    return remainingSeconds;
};

const getQrImageSource = (value) => {
    const image = typeof value === 'string' ? value.trim() : '';
    if (!image) return '';
    return image.startsWith('data:') ? image : `data:image/png;base64,${image}`;
};

const isSafeBankLink = (value) => {
    if (typeof value !== 'string') return false;
    const link = value.trim();
    if (!/^[a-z][a-z0-9+.-]*:/i.test(link)) return false;
    return !/^(javascript|data|blob):/i.test(link);
};

const BANK_DISPLAY_NAMES = {
    'ard app': 'Ард Апп',
    'arig bank': 'Ариг банк',
    'bogd bank': 'Богд банк',
    'capitron bank': 'Капитрон банк',
    'chinggis khaan bank': 'Чингис Хаан банк',
    'chinggis khan bank': 'Чингис Хаан банк',
    'khan bank': 'ХААН Банк',
    'khaan bank': 'ХААН Банк',
    khanbank: 'ХААН Банк',
    'state bank': 'Төрийн банк',
    statebank: 'Төрийн банк',
    'golomt bank': 'Голомт банк',
    golomtbank: 'Голомт банк',
    xacbank: 'ХасБанк',
    'xac bank': 'ХасБанк',
    tdb: 'Худалдаа хөгжлийн банк',
    'tdb online': 'Худалдаа хөгжлийн банк',
    'trade and development bank': 'Худалдаа хөгжлийн банк',
    transbank: 'Тээвэр хөгжлийн банк',
    'trans bank': 'Тээвэр хөгжлийн банк',
    'national investment bank': 'Үндэсний хөрөнгө оруулалтын банк',
    nibank: 'Үндэсний хөрөнгө оруулалтын банк',
    'happy pay': 'Хэппи Пэй',
    happypay: 'Хэппи Пэй',
    hipay: 'ХайПэй',
    'hi pay': 'ХайПэй',
    socialpay: 'СошиалПэй',
    'social pay': 'СошиалПэй',
    monpay: 'МонПэй',
    'mon pay': 'МонПэй',
    'most money': 'Мост Мони',
    storepay: 'СторПэй',
    pocket: 'Покет',
    mbank: 'М банк',
    'm bank': 'М банк',
};

const normalizeBankName = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ');

const normalizeComparableText = (value) => String(value || '')
    .trim()
    .toLocaleLowerCase('mn-MN')
    .replace(/[^\p{L}\p{N}]+/gu, '');

const getBankDisplayName = (value, fallback) => {
    const original = String(value || '').trim();
    return BANK_DISPLAY_NAMES[normalizeBankName(original)] || original || fallback;
};

const splitDateTime = (value) => {
    if (!value) return { date: '', time: '' };
    const [date = '', time = ''] = String(value).split('T');
    return { date, time: time.slice(0, 5) };
};

const MONGOLIAN_WEEKDAYS = ['Ням', 'Даваа', 'Мягмар', 'Лхагва', 'Пүрэв', 'Баасан', 'Бямба'];

const formatBookingDate = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return '';

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const slashMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    const parts = isoMatch
        ? { year: Number(isoMatch[1]), month: Number(isoMatch[2]), day: Number(isoMatch[3]) }
        : slashMatch
            ? { year: Number(slashMatch[3]), month: Number(slashMatch[1]), day: Number(slashMatch[2]) }
            : null;

    if (!parts) return raw.replace(/\s*\([^)]*\)\s*$/, '');

    const date = new Date(parts.year, parts.month - 1, parts.day, 12);
    if (
        Number.isNaN(date.getTime())
        || date.getFullYear() !== parts.year
        || date.getMonth() !== parts.month - 1
        || date.getDate() !== parts.day
    ) {
        return raw.replace(/\s*\([^)]*\)\s*$/, '');
    }

    const pad = (part) => String(part).padStart(2, '0');
    return `${parts.year}.${pad(parts.month)}.${pad(parts.day)} (${MONGOLIAN_WEEKDAYS[date.getDay()]})`;
};

const CompactBookingSummary = ({ confirmation, selectedClinic, selectedBranch, selectedDoctor, selectedService, selectedTimeSlot }) => {
    const confirmedDateTime = splitDateTime(confirmation?.aptDateTime);
    const date = confirmedDateTime.date || selectedTimeSlot?.apiDate || selectedTimeSlot?.date || '';
    const time = confirmedDateTime.time || selectedTimeSlot?.time || '';
    const branchName = confirmation?.clinicName || selectedBranch?.name || selectedClinic?.name || '';
    const clinicName = selectedClinic?.name && selectedClinic.name !== branchName ? selectedClinic.name : '';
    const doctorName = selectedDoctor?.name || '';
    const serviceName = confirmation?.productName || selectedService?.name || '';

    return (
        <section className="qpay-payment__booking" aria-label="Төлөх захиалгын мэдээлэл">
            <h3 className="qpay-payment__section-title">Захиалгын мэдээлэл</h3>
            <div className="qpay-payment__booking-item">
                <span className="qpay-payment__booking-icon" aria-hidden="true"><FiHome /></span>
                <span className="qpay-payment__booking-copy">
                    <strong title={branchName}>{branchName || '—'}</strong>
                    {clinicName ? <span title={clinicName}>{clinicName}</span> : null}
                </span>
            </div>
            <div className="qpay-payment__booking-item">
                <span className="qpay-payment__booking-icon" aria-hidden="true"><FiUser /></span>
                <span className="qpay-payment__booking-copy">
                    <strong title={doctorName}>{doctorName || '—'}</strong>
                    <span>Эмч</span>
                </span>
            </div>
            {serviceName ? (
                <div className="qpay-payment__booking-item qpay-payment__booking-service">
                    <span className="qpay-payment__booking-icon" aria-hidden="true"><FiClipboard /></span>
                    <span className="qpay-payment__booking-copy">
                        <strong title={serviceName}>{serviceName}</strong>
                        <span>Үйлчилгээ</span>
                    </span>
                </div>
            ) : null}
            <div className="qpay-payment__date-row">
                <span><FiCalendar aria-hidden="true" /> <span title={formatBookingDate(date)}>{formatBookingDate(date) || '—'}</span></span>
                <span><FiClock aria-hidden="true" /> <span>{time || '—'}</span></span>
            </div>
        </section>
    );
};

const InvoiceExpiry = ({ expiresAt }) => {
    const remainingSeconds = useInvoiceCountdown(expiresAt);
    const expiry = formatExpiry(expiresAt);
    if (!expiry) return null;
    return (
        <div className="qpay-qr__expiry">
            <span>
                <FiClock aria-hidden="true" />
                <span>Хүчинтэй: <time dateTime={expiresAt}>{expiry}</time></span>
            </span>
            {remainingSeconds !== null ? <span>Үлдсэн: {formatRemainingTime(remainingSeconds)}</span> : null}
        </div>
    );
};

const PaymentStatusCard = ({ paymentState, isChecking, error, hideIdle = false }) => {
    if (error || ['failed', 'expired', 'createUnknown'].includes(paymentState)) {
        return (
            <div className="qpay-payment__status qpay-payment__status--error" role="alert">
                <span className="qpay-payment__status-icon" aria-hidden="true"><FiAlertCircle /></span>
                <span className="qpay-payment__status-copy">
                    <strong>{paymentState === 'expired' ? 'Төлбөрийн хугацаа дууссан' : 'Төлбөрийн төлөвт алдаа гарлаа'}</strong>
                    <span>{paymentState === 'expired' ? 'Дахин invoice үүсгэхийн тулд эмнэлэгтэй холбогдоно уу.' : 'Төлөвөө дахин шалгах эсвэл эмнэлэгтэй холбогдоно уу.'}</span>
                </span>
            </div>
        );
    }
    if (paymentState === 'paidPendingConfirmation') {
        return (
            <div className="qpay-payment__status qpay-payment__status--success" role="status" aria-live="polite">
                <span className="qpay-payment__status-icon" aria-hidden="true"><FiCheckCircle /></span>
                <span className="qpay-payment__status-copy"><strong>Төлбөр баталгаажлаа</strong><span>Таны цагийг эмнэлгийн системд үүсгэж байна.</span></span>
            </div>
        );
    }
    if (hideIdle || isChecking) return null;
    return (
        <div className="qpay-payment__status" role="status" aria-live="polite">
            <span className="qpay-payment__status-icon" aria-hidden="true"><FiRefreshCw className={isChecking ? 'animate-spin' : ''} /></span>
            <span className="qpay-payment__status-copy">
                {isChecking ? <strong>Төлбөрийн төлөв шалгаж байна</strong> : null}
            </span>
        </div>
    );
};

const CheckPaymentButton = ({ isChecking, onCheck, primary = false }) => (
    <button
        type="button"
        onClick={onCheck}
        disabled={isChecking}
        aria-busy={isChecking || undefined}
        aria-label={isChecking ? 'Төлбөрийн төлөв шалгаж байна' : 'Төлбөр шалгах'}
        className={`qpay-payment__check-button ${primary ? 'qpay-payment__check-button--primary' : ''}`}
    >
        <span className="inline-flex items-center justify-center gap-2">
            <FiRefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} aria-hidden="true" />
            Төлбөр шалгах
        </span>
    </button>
);

const PaymentHeader = ({ title, description, onBack, headingRef, className = '' }) => (
    <header className={`qpay-payment__header ${className}`}>
        <div className="qpay-payment__topbar">
            {onBack ? <button type="button" onClick={onBack} aria-label="Буцах" className="qpay-payment__back-button"><FiArrowLeft aria-hidden="true" /></button> : <span aria-hidden="true" />}
            <h2 ref={headingRef} tabIndex={headingRef ? -1 : undefined}>{title}</h2>
            <span aria-hidden="true" />
        </div>
        {description ? <p>{description}</p> : null}
    </header>
);

const BankAppsPage = ({ urls, onBack, headingRef }) => (
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden">
        <PaymentHeader title="Банкны апп сонгох" onBack={onBack} headingRef={headingRef} />
        {urls.length > 0 ? (
            <div className="grid w-full min-w-0 max-w-full gap-2.5 md:grid-cols-2">
                {urls.map((item, index) => {
                    const href = isSafeBankLink(item?.link) ? item.link.trim() : '';
                    const originalName = String(item?.name || '').trim();
                    const name = getBankDisplayName(originalName, `Банк ${index + 1}`);
                    const description = String(item?.description || '').trim();
                    const showDescription = description
                        && normalizeComparableText(description) !== normalizeComparableText(name);
                    return (
                        <a
                            key={`${originalName || name}-${item?.link || index}`}
                            href={href || undefined}
                            aria-disabled={!href}
                            className={`flex min-h-[64px] w-full min-w-0 max-w-full items-center gap-2.5 overflow-hidden rounded-panel border border-line bg-surface px-3 py-2.5 text-left shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-focus ${href ? 'hover:border-selected-border hover:bg-hover-surface active:scale-[0.99]' : 'cursor-not-allowed opacity-50'}`}
                        >
                            {item?.logo ? <img src={item.logo} alt="" className="h-8 w-8 shrink-0 rounded-lg object-contain" /> : (
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-canvas text-muted"><FiCreditCard className="h-4 w-4" aria-hidden="true" /></span>
                            )}
                            <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold leading-4 text-ink" title={name}>{name}</span>
                                {showDescription ? <span className="block truncate text-[11px] leading-4 text-muted" title={description}>{description}</span> : null}
                            </span>
                            <FiExternalLink className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden="true" />
                        </a>
                    );
                })}
            </div>
        ) : (
            <div className="w-full min-w-0 max-w-full rounded-card border border-line bg-canvas p-6 text-center">
                <FiAlertCircle className="mx-auto h-8 w-8 text-muted" aria-hidden="true" />
                <h3 className="mt-3 font-semibold text-ink">Банкны жагсаалт ирсэнгүй</h3>
            </div>
        )}
    </div>
);

export default function QPayPaymentStep({
    view,
    paymentState,
    invoice,
    error,
    isChecking,
    confirmation,
    selectedClinic,
    selectedBranch,
    selectedDoctor,
    selectedService,
    selectedTimeSlot,
    onCheck,
    onOpenBanks,
    onOpenQr,
    onBackToPayment,
    onCancel,
}) {
    const isPreparing = paymentState === 'creating';
    const amount = formatAmount(invoice?.amount, invoice?.currency);
    const isTerminalError = ['expired', 'failed', 'createUnknown'].includes(paymentState);
    const bankTriggerRef = useRef(null);
    const bankHeadingRef = useRef(null);
    const previousViewRef = useRef(view);

    useEffect(() => {
        if (view === 'banks') bankHeadingRef.current?.focus();
        else if (previousViewRef.current === 'banks') bankTriggerRef.current?.focus();
        previousViewRef.current = view;
    }, [view]);

    if (view === 'banks') {
        return <BankAppsPage urls={Array.isArray(invoice?.urls) ? invoice.urls : []} onBack={onBackToPayment} headingRef={bankHeadingRef} />;
    }

    const summary = (
        <CompactBookingSummary confirmation={confirmation} selectedClinic={selectedClinic} selectedBranch={selectedBranch} selectedDoctor={selectedDoctor} selectedService={selectedService} selectedTimeSlot={selectedTimeSlot} />
    );

    if (isPreparing) {
        return (
            <div className="qpay-payment qpay-payment--preparing" aria-label="Төлбөрийн мэдээлэл бэлдэж байна">
                <PaymentHeader title="Захиаллага баталгаажуулах" onBack={onCancel} className="qpay-payment__header--left" />
                <div className="qpay-payment__preparing" role="status" aria-live="polite">
                    <FiRefreshCw aria-hidden="true" className="animate-spin" />
                    <h3>Төлбөрийн мэдээлэл бэлдэж байна</h3>
                    <p>QPay invoice үүсгэж байна. Түр хүлээнэ үү.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="qpay-payment qpay-payment--checkout" aria-label="Төлбөрийн сонголт">
            <PaymentHeader title="Захиаллага баталгаажуулах" onBack={onCancel} className="qpay-payment__header--left" />
            <div className="qpay-payment__layout">
                <section className="qpay-payment__amount" aria-label="Төлөх дүн">
                    <h3 className="qpay-payment__section-title">Урьдчилгаа төлбөр</h3>
                    <div className="qpay-payment__amount-value">{amount || '—'}</div>
                    <div className="qpay-payment__total-row">
                        <span>Үйлчилгээний нийт үнэ</span>
                        <strong>{formatAmount(confirmation?.price ?? selectedService?.price, invoice?.currency) || '—'}</strong>
                    </div>
                </section>
                {summary}
                <div className="qpay-payment__controls">
                    {!isTerminalError ? (
                        <section className="qpay-payment__methods" aria-labelledby="qpay-payment-methods-title">
                            <h3 id="qpay-payment-methods-title" className="qpay-payment__section-title">Төлбөрийн арга</h3>
                            <div className="qpay-payment__method-list">
                                <button ref={bankTriggerRef} type="button" onClick={onOpenBanks} disabled={paymentState === 'paidPendingConfirmation'} className="qpay-payment__method">
                                    <span className="qpay-payment__method-icon qpay-payment__method-icon--bank" aria-hidden="true"><FiCreditCard /></span>
                                    <span className="qpay-payment__method-copy"><strong>Банкны апп-аар төлөх</strong><span>Банкны апп сонгож үргэлжлүүлэх</span></span>
                                    <FiChevronRight className="qpay-payment__method-arrow" aria-hidden="true" />
                                </button>
                                <button type="button" onClick={onOpenQr} disabled={paymentState === 'paidPendingConfirmation'} className="qpay-payment__method">
                                    <span className="qpay-payment__method-icon qpay-payment__method-icon--qr" aria-hidden="true"><FiGrid /></span>
                                    <span className="qpay-payment__method-copy"><strong>QR-аар төлөх</strong><span>QR код уншуулж төлөх</span></span>
                                    <FiChevronRight className="qpay-payment__method-arrow" aria-hidden="true" />
                                </button>
                            </div>
                        </section>
                    ) : null}
                    <PaymentStatusCard paymentState={paymentState} isChecking={isChecking} error={error} hideIdle />
                    {!['confirmed', 'expired'].includes(paymentState) ? (
                        <div className="qpay-payment__actions">
                            <CheckPaymentButton isChecking={isChecking} onCheck={onCheck} primary />
                            <button type="button" onClick={onCancel} className="qpay-payment__cancel-button">Цуцлах</button>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

const PaymentPrompt = ({ id, title, description, onClose, children, variant = 'default', footer }) => {
    const panelRef = useRef(null);
    const isQr = variant === 'qr';
    useEffect(() => {
        if (isQr) {
            const panel = panelRef.current;
            const previousFocus = document.activeElement;
            const focusable = () => Array.from(panel.querySelectorAll(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
            )).filter((element) => element.getClientRects().length > 0);
            const focusFirst = () => (focusable()[0] || panel).focus({ preventScroll: true });
            const handleQrKeyDown = (event) => {
                if (event.key === 'Escape') {
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    onClose();
                } else if (event.key === 'Tab') {
                    // Capture before the parent booking dialog's keyboard trap.
                    event.preventDefault();
                    event.stopImmediatePropagation();
                    const items = focusable();
                    const index = items.indexOf(document.activeElement);
                    const next = index < 0 ? (event.shiftKey ? items.length - 1 : 0)
                        : (index + (event.shiftKey ? -1 : 1) + items.length) % items.length;
                    (items[next] || panel).focus({ preventScroll: true });
                }
            };
            const handleFocus = (event) => {
                if (!panel.contains(event.target)) focusFirst();
            };
            focusFirst();
            document.addEventListener('keydown', handleQrKeyDown, true);
            document.addEventListener('focusin', handleFocus, true);
            return () => {
                document.removeEventListener('keydown', handleQrKeyDown, true);
                document.removeEventListener('focusin', handleFocus, true);
                // Do not steal focus from a newly opened bank/success screen.
                if (previousFocus?.isConnected && (panel.contains(document.activeElement) || document.activeElement === document.body)) {
                    previousFocus.focus({ preventScroll: true });
                }
            };
        }
        const handleKeyDown = (event) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            onClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        panelRef.current?.focus();
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isQr, onClose]);

    if (isQr) {
        return (
            <div className="qpay-qr-overlay" onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
                <Motion.section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="qpay-qr">
                    <header className="qpay-qr__header">
                        <h3 id={`${id}-title`}>{title}</h3>
                        <button type="button" onClick={onClose} className="qpay-qr__close" aria-label="QR цонхыг хаах"><FiX aria-hidden="true" /></button>
                    </header>
                    <div className="qpay-qr__content">{children}</div>
                    <footer className="qpay-qr__footer">{footer}</footer>
                </Motion.section>
            </div>
        );
    }

    return (
        <div className="absolute inset-0 z-[60] flex items-end bg-black/45 backdrop-blur-[2px] sm:items-center sm:justify-center sm:p-6" onClick={onClose}>
            <Motion.section ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={description ? `${id}-description` : undefined} initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.98 }} className="max-h-[88vh] w-full overflow-y-auto rounded-t-[30px] border border-line-soft bg-surface px-5 pb-8 pt-4 shadow-modal outline-none sm:max-w-lg sm:rounded-panel sm:p-6" onClick={(event) => event.stopPropagation()}>
                <button type="button" onClick={onClose} className="inline-flex min-h-11 items-center gap-2 rounded-control px-2 text-sm font-semibold text-heading hover:bg-hover-surface focus:outline-none focus:ring-2 focus:ring-focus"><FiArrowLeft className="h-4 w-4" aria-hidden="true" />Буцах</button>
                <h3 id={`${id}-title`} className="mt-3 text-xl font-semibold leading-tight text-ink sm:text-2xl">{title}</h3>
                {description ? <p id={`${id}-description`} className="mt-3 text-sm leading-5 text-muted">{description}</p> : null}
                <div className="mt-6">{children}</div>
            </Motion.section>
        </div>
    );
};

export const QPayQrPrompt = ({ invoice, paymentState, isChecking, onCheck, onOpenBanks, onClose }) => {
    const source = getQrImageSource(invoice?.qrImage);
    const amount = formatAmount(invoice?.amount, invoice?.currency);
    const [failedSource, setFailedSource] = useState(null);
    const isPaid = ['paidPendingConfirmation', 'confirmed'].includes(paymentState);
    const isTerminal = ['expired', 'failed', 'createUnknown'].includes(paymentState);
    const isCreating = paymentState === 'creating';
    const isFeedback = isPaid || isTerminal || isCreating;
    const hasQr = Boolean(source) && source !== failedSource && !isFeedback;
    const missingQr = !hasQr && !isFeedback;
    const description = isFeedback ? '' : 'Банкны апп-аар QR кодыг уншуулна уу.';
    const footer = missingQr ? (
        <button type="button" onClick={onOpenBanks} className="booking-cta-primary qpay-qr__alternative">Банкны апп-аар төлөх</button>
    ) : paymentState === 'expired' || paymentState === 'confirmed' ? (
        <button type="button" onClick={onClose} className="qpay-payment__cancel-button">Хаах</button>
    ) : <CheckPaymentButton isChecking={isChecking || isCreating} onCheck={onCheck} primary />;

    return (
        <PaymentPrompt id="qpay-qr" title="QR-аар төлөх" description={description} onClose={onClose} variant="qr" footer={footer}>
            {description ? <p id="qpay-qr-description" className="qpay-qr__instruction">{description}</p> : null}
            <div className="qpay-qr__amount"><span>Урьдчилгаа төлбөр</span><strong>{amount || '—'}</strong></div>
            {hasQr ? (
                <div className="qpay-qr__image-frame">
                    <img key={source} src={source} alt="QPay төлбөрийн QR" className="qpay-qr__image" onError={() => setFailedSource(source)} />
                </div>
            ) : (
                <div className="qpay-qr__feedback">
                    {isPaid || isTerminal ? <PaymentStatusCard paymentState={isPaid ? 'paidPendingConfirmation' : paymentState} /> : (
                        <div className={missingQr ? 'qpay-qr__image-error' : 'qpay-qr__creating'} role={missingQr ? 'alert' : 'status'}>
                            {missingQr ? <FiAlertCircle aria-hidden="true" /> : <FiRefreshCw aria-hidden="true" className="animate-spin" />}
                            <p>{missingQr ? 'QR үүсгэх явцад алдаа гарлаа. Та өөр аргаар оролдоно уу.' : 'Төлбөрийн мэдээлэл бэлдэж байна.'}</p>
                        </div>
                    )}
                </div>
            )}
            {!isFeedback ? <InvoiceExpiry expiresAt={invoice?.invoiceExpiresAt} /> : null}
        </PaymentPrompt>
    );
};

export const QPayCancelPrompt = ({ onContinue, onConfirm }) => (
    <PaymentPrompt id="qpay-cancel" title="Төлбөрийн урсгалыг цуцлах уу?" description="Захиалга сервер дээр шууд цуцлагдахгүй, хүчинтэй хугацаа дуусахад автоматаар дуусна." onClose={onContinue}>
        <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" onClick={onContinue} className="booking-cta-primary min-h-12 rounded-control px-4 py-2.5 text-sm leading-5 font-semibold">Үргэлжлүүлэн төлөх</button>
            <button type="button" onClick={onConfirm} className="min-h-12 rounded-control border border-danger bg-surface px-4 py-2.5 text-sm leading-5 font-semibold text-danger-text hover:bg-danger-surface focus:outline-none focus:ring-2 focus:ring-focus">Цуцлах</button>
        </div>
    </PaymentPrompt>
);
