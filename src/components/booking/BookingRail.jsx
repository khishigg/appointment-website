import { FiCalendar, FiUser } from 'react-icons/fi';

import { useBookingStore } from '../../store/BookingStore';
import { useBookingLayout } from '../../hooks/useMediaQuery';
import ResponsiveSheet from './ResponsiveSheet';
import TimeSlotPanel from './TimeSlotPanel';

/**
 * BookingRail — desktop-ийн баруун талын захиалгын хэсэг.
 *
 * Mobile/tablet дээр, эсвэл `visible=false` (эмчийн жагсаалтгүй таб) үед юу ч рендэрлэхгүй.
 *
 * Рэйл нь ЗӨВХӨН цаг сонголтыг эзэмшинэ. Захиалгын алхмууд (BookingDetails) нь бүх
 * breakpoint дээр overlay болсон тул BookingPage-д тусад нь, үргэлж mount хэвээр байна.
 *
 * Рэйлийн төлөв нь ОДОО БАЙГАА store-оос гарна (шинэ state нэмээгүй):
 *   эмч сонгоогүй            → 'empty'
 *   isTimeSlotModalOpen      → 'slots'  (захиалга нээлттэй үед ч цагууд ард харагдана)
 *   бусад (эмч сонгосон)     → 'doctor'
 */
export default function BookingRail({ visible = true }) {
    const layout = useBookingLayout();
    const {
        selectedDoctor,
        selectedTimeSlot,
        selectTimeSlot,
        isTimeSlotModalOpen,
        openBookingDetails,
        initialScrollDate,
        availabilityRefreshKey,
    } = useBookingStore();

    if (layout !== 'desktop' || !visible) return null;

    let view = 'empty';
    if (selectedDoctor) {
        if (isTimeSlotModalOpen) view = 'slots';
        else view = 'doctor';
    }

    // Desktop: цаг сонгоход closeTimeSlotModal ДУУДАХГҮЙ — тэр нь initialScrollDate-ыг
    // цэвэрлэж, "Буцах" дарахад рэйл цаг сонгох төлөв рүү буцаж чадахгүй болгоно.
    const handleSelectSlot = (slot) => {
        selectTimeSlot(slot);
        openBookingDetails();
    };

    return (
        // top-14 (56px) — ClinicProfile-ийн sticky таб барын өндөр (py-4 + text-sm + border
        // ≈ 53px). Эс тэгвэл рэйл гүйхдээ таб барын доогуур ормоор харагдана.
        <aside className="lg:sticky lg:top-14 lg:h-[calc(100vh-4.5rem)]">
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

                {/* Захиалгын цонх нээлттэй үед ч цагийн панель mount хэвээр — "Буцах"
                    дарахад availability дахин татагдахгүй. Ганц instance тул давхар
                    fetch үүсэхгүй. */}
                {view === 'slots' && selectedDoctor ? (
                    <div className="flex min-h-0 flex-1 flex-col">
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
