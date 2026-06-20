/**
 * BranchSelector - horizontal branch list.
 */

import { motion } from 'framer-motion';
import { FiMapPin, FiCheck, FiClock, FiPhone } from 'react-icons/fi';
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
    isAdmin = false,
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
        <div id="salbar" className="bg-gray-50 py-5">
            <div className="px-4 md:px-6 mb-4">
                <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-gray-800">Салбар сонгох</h2>
            </div>

            <div
                className="flex gap-[14px] overflow-x-auto px-4 md:px-6 pb-3 no-scrollbar snap-x snap-mandatory"
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
                                branch-card w-[200px] md:w-[252px] min-h-[130px] text-left flex flex-col h-full
                                ${isSelected ? 'selected' : ''}
                                ${!branch.isOpen ? 'opacity-60' : ''}
                            `}
                            disabled={!branch.isOpen}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <h3 className="text-[20px] leading-[1.08] font-semibold text-gray-800">
                                    {branch.name}
                                </h3>
                                {isSelected && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="flex-shrink-0 w-5 h-5 rounded-full bg-trust-green flex items-center justify-center"
                                    >
                                        <FiCheck className="w-3 h-3 text-white" />
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex items-start gap-1.5 mt-2">
                                <FiMapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-gray-500 line-clamp-2">{branch.address}</span>
                            </div>

                            <div className="flex items-center justify-between gap-2 mt-auto pt-3">
                                {!isAdmin && branch.hours ? (
                                    <div className="flex items-center gap-1">
                                        <FiClock className="w-3 h-3 text-gray-400" />
                                        <span className="text-[10px] font-medium text-gray-600">{branch.hours}</span>
                                    </div>
                                ) : null}
                                {branch.phone ? (
                                    <div className="flex items-center gap-1">
                                        <FiPhone className="w-3 h-3 text-gray-400" />
                                        <span className="text-[10px] font-medium text-gray-600">{branch.phone}</span>
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
