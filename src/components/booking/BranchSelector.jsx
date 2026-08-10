/**
 * BranchSelector - horizontal branch list.
 */

import { motion } from 'framer-motion';
import { FiArrowRight, FiMapPin, FiCheck, FiClock, FiPhone } from 'react-icons/fi';
import { useBookingStore } from '../../store/BookingStore';

const defaultBranches = [
    {
        id: 1,
        name: 'Сүхбаатар салбар',
        address: '1-р хороо, Энхтайвны өргөн чөлөө',
        hours: '09:00 - 18:00',
        phone: '7000-7000',
        isOpen: true,
    },
    {
        id: 2,
        name: 'Баянзүрх салбар',
        address: '3-р хороо, Зайсангийн гудамж',
        hours: '09:00 - 19:00',
        phone: '7000-7001',
        isOpen: true,
    },
    {
        id: 3,
        name: 'Хан-Уул салбар',
        address: '15-р хороо, Яармагийн зам',
        hours: '09:00 - 18:00',
        phone: '7000-7002',
        isOpen: false,
    },
    {
        id: 4,
        name: 'Чингэлтэй салбар',
        address: '2-р хороо, Москвагийн гудамж',
        hours: '10:00 - 20:00',
        phone: '7000-7003',
        isOpen: true,
    },
    {
        id: 5,
        name: 'Сонгинохайрхан салбар',
        address: '10-р хороо, Баруун 4-н зам',
        hours: '09:00 - 18:00',
        phone: '7000-7004',
        isOpen: true,
    },
];

export default function BranchSelector({
    branches = defaultBranches,
    isLoading = false,
    error = '',
    onRetry,
    onBranchChange,
}) {
    const { selectedBranch, selectBranch } = useBookingStore();

    if (isLoading) {
        return <div className="booking-data-state">Салбарын жагсаалтыг уншиж байна...</div>;
    }

    if (error) {
        return (
            <div className="booking-data-state booking-data-state--error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={onRetry}>Дахин оролдох</button>
            </div>
        );
    }

    return (
        <div id="salbar" className="bg-canvas py-5">
            <div className="px-4 md:px-6 lg:px-0 mb-4">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-heading">Салбар сонгох</h2>
            </div>

            {/* Desktop grid: 4 салбарт өнчин карт үүсэхээс сэргийлж lg=2×2, xl=1×4. */}
            <div
                className="flex gap-[14px] overflow-x-auto px-4 md:px-6 lg:px-0 pb-3 max-md:no-scrollbar snap-x snap-mandatory lg:grid lg:grid-cols-2 xl:grid-cols-4 lg:gap-4 lg:overflow-visible lg:snap-none"
                style={{ scrollPaddingLeft: '1rem' }}
            >
                {branches.length === 0 ? (
                    <div className="booking-data-empty">Бүртгэлтэй салбар олдсонгүй.</div>
                ) : null}
                {branches.map((branch) => {
                    const isSelected = selectedBranch?.id === branch.id;

                    return (
                        <motion.button
                            key={branch.id}
                            type="button"
                            onClick={() => {
                                const nextBranch = isSelected ? null : branch;
                                onBranchChange?.(nextBranch);
                                if (isSelected) {
                                    selectBranch(null);
                                } else {
                                    selectBranch(branch);
                                }
                            }}
                            whileTap={{ scale: 0.97 }}
                            className={`
                                branch-card group w-[200px] md:w-[252px] lg:w-auto min-h-[130px] text-left flex flex-col h-full
                                ${isSelected ? 'selected' : ''}
                                ${!branch.isOpen ? 'opacity-60' : ''}
                            `}
                            disabled={!branch.isOpen}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-[20px] leading-[1.08] font-semibold text-heading">
                                    {branch.name}
                                </h3>
                                {/* Сонгогдсон → check. Үгүй бол desktop hover-т сум илэрч,
                                    карт дарж болохыг илэрхийлнэ. */}
                                {isSelected ? (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center"
                                    >
                                        <FiCheck className="w-3 h-3 text-primary-text" />
                                    </motion.div>
                                ) : (
                                    <FiArrowRight
                                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-faint opacity-0 transition-opacity group-hover:opacity-100"
                                        aria-hidden="true"
                                    />
                                )}
                            </div>

                            <div className="flex items-start gap-1.5 mt-2">
                                <FiMapPin className="w-3.5 h-3.5 text-faint flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-muted line-clamp-2">{branch.address}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-auto pt-3">
                                {branch.hours ? (
                                    <div className="flex items-center gap-1">
                                        <FiClock className="w-3 h-3 text-faint" />
                                        <span className="text-label font-medium text-muted">{branch.hours}</span>
                                    </div>
                                ) : null}
                                {branch.phone ? (
                                    <div className="flex items-center gap-1">
                                        <FiPhone className="w-3 h-3 text-faint" />
                                        <span className="text-label font-medium text-muted">{branch.phone}</span>
                                    </div>
                                ) : null}
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
