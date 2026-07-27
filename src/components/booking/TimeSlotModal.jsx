import { FiX } from 'react-icons/fi';

import { useBookingStore } from '../../store/BookingStore';
import { useBookingLayout } from '../../hooks/useMediaQuery';
import ResponsiveSheet from './ResponsiveSheet';
import TimeSlotPanel from './TimeSlotPanel';

/**
 * TimeSlotModal — цаг сонголтын БҮРХҮҮЛ (mobile: bottom sheet, tablet: dialog).
 *
 * Desktop дээр null буцаана: тэнд захиалгын рэйл (BookingRail) нь TimeSlotPanel-ыг
 * шууд inline эзэмшинэ. Ингэснээр агуулга ХЭЗЭЭ Ч хоёр газар зэрэг mount хийгдэхгүй
 * (эс тэгвэл availability fetch давхарлана).
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
        availabilityRefreshKey,
    } = useBookingStore();
    const layout = useBookingLayout();

    if (layout === 'desktop') return null;
    if (!selectedDoctor) return null;

    // Overlay горим: цаг сонгомогц өөрийгөө хааж, дэлгэрэнгүйг нээнэ.
    const handleSelectSlot = (slot) => {
        selectTimeSlot(slot);
        closeTimeSlotModal();
        openBookingDetails();
    };

    return (
        <ResponsiveSheet
            mode={layout === 'tablet' ? 'dialog' : 'sheet'}
            open={isTimeSlotModalOpen}
            onClose={closeTimeSlotModal}
            label="Цаг захиалах"
        >
            <div className="z-20 flex items-center border-b border-line-soft bg-surface px-8 py-2">
                <button
                    type="button"
                    onClick={closeTimeSlotModal}
                    className="-ml-2 rounded-full p-2 text-ink transition-colors hover:bg-canvas"
                    aria-label="Хаах"
                >
                    <FiX className="h-7 w-7" />
                </button>
                <h2 className="ml-4 mt-2 text-xl font-bold text-heading">Цаг захиалах</h2>
            </div>

            <TimeSlotPanel
                variant="overlay"
                doctor={selectedDoctor}
                initialDate={initialScrollDate}
                refreshKey={availabilityRefreshKey}
                selectedTimeSlot={selectedTimeSlot}
                onSelectSlot={handleSelectSlot}
            />
        </ResponsiveSheet>
    );
}
