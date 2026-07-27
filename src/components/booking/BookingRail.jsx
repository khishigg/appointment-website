import { FiCalendar, FiUser } from 'react-icons/fi';

import { useBookingStore } from '../../store/BookingStore';
import { useBookingLayout } from '../../hooks/useMediaQuery';
import ResponsiveSheet from './ResponsiveSheet';
import TimeSlotPanel from './TimeSlotPanel';

/**
 * BookingRail — desktop-ийн баруун талын захиалгын хэсэг.
 *
 * Mobile/tablet дээр, эсвэл `visible=false` (эмчийн жагсаалтгүй таб) үед ЗӨВХӨН
 * children-ээ дамжуулна — ингэснээр `children` (BookingDetails) нь бүх breakpoint,
 * бүх таб дээр React-ийн ИЖИЛ байрлалд, ганц удаа mount хийгддэг тул `step` зэрэг
 * state хэзээ ч алдагдахгүй, mobile дээр overlay мөн алга болохгүй.
 *
 * Рэйлийн төлөв нь ОДОО БАЙГАА store-оос гарна (шинэ state нэмээгүй):
 *   эмч сонгоогүй            → 'empty'
 *   isBookingDetailsOpen     → 'details'
 *   isTimeSlotModalOpen      → 'slots'
 *   бусад (эмч сонгосон)     → 'doctor'
 */
export default function BookingRail({ visible = true, children }) {
    const layout = useBookingLayout();
    const {
        selectedDoctor,
        selectedTimeSlot,
        selectTimeSlot,
        isTimeSlotModalOpen,
        isBookingDetailsOpen,
        openBookingDetails,
        initialScrollDate,
        availabilityRefreshKey,
    } = useBookingStore();

    if (layout !== 'desktop' || !visible) return children;

    let view = 'empty';
    if (selectedDoctor) {
        if (isBookingDetailsOpen) view = 'details';
        else if (isTimeSlotModalOpen) view = 'slots';
        else view = 'doctor';
    }

    // Desktop: цаг сонгоход closeTimeSlotModal ДУУДАХГҮЙ — тэр нь initialScrollDate-ыг
    // цэвэрлэж, "Буцах" дарахад рэйл цаг сонгох төлөв рүү буцаж чадахгүй болгоно.
    const handleSelectSlot = (slot) => {
        selectTimeSlot(slot);
        openBookingDetails();
    };

    const showSlots = view === 'slots' || view === 'details';

    return (
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)]">
            <ResponsiveSheet mode="inline" label="Захиалгын хэсэг">
                {view === 'empty' ? (
                    <RailPlaceholder
                        icon={FiUser}
                        title="Эмч сонгоно уу"
                        hint="Зүүн талын жагсаалтаас эмч сонгоход боломжит цаг энд харагдана."
                    />
                ) : null}

                {view === 'doctor' ? (
                    <>
                        <RailHeader doctor={selectedDoctor} />
                        <RailPlaceholder
                            icon={FiCalendar}
                            title="Өдөр сонгоно уу"
                            hint="Эмчийн картан дээрх өдрөөс сонгоход тухайн өдрийн цагууд энд гарна."
                        />
                    </>
                ) : null}

                {/* Цагийн панель: 'details' үед UNMOUNT ХИЙХГҮЙ, зөвхөн нуух —
                    эс тэгвэл "Буцах" дарахад бүх availability дахин татагдана.
                    Ганц instance тул давхар fetch үүсэхгүй. */}
                {showSlots && selectedDoctor ? (
                    <div className={view === 'details' ? 'hidden' : 'flex min-h-0 flex-1 flex-col'}>
                        <RailHeader doctor={selectedDoctor} />
                        <TimeSlotPanel
                            variant="inline"
                            doctor={selectedDoctor}
                            initialDate={initialScrollDate}
                            refreshKey={availabilityRefreshKey}
                            selectedTimeSlot={selectedTimeSlot}
                            onSelectSlot={handleSelectSlot}
                        />
                    </div>
                ) : null}

                {/* ҮРГЭЛЖ mount хэвээр — BookingDetails хаалттай үедээ өөрөө null буцаана.
                    Нөхцөлтэйгээр рендэрлэвэл 409-ийн дараа `step` алдагдана. */}
                {children}
            </ResponsiveSheet>
        </aside>
    );
}

function RailHeader({ doctor }) {
    if (!doctor) return null;

    return (
        <div className="border-b border-line-soft px-4 py-3">
            <p className="text-label font-semibold uppercase tracking-wide text-muted">Эмч</p>
            <p className="mt-0.5 truncate text-sm font-semibold text-ink">{doctor.name}</p>
        </div>
    );
}

function RailPlaceholder({ icon: Icon, title, hint }) {
    return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-canvas">
                <Icon className="h-5 w-5 text-faint" aria-hidden="true" />
            </span>
            <p className="mt-3 text-sm font-semibold text-heading">{title}</p>
            <p className="mt-1 text-caption leading-5 text-muted">{hint}</p>
        </div>
    );
}
