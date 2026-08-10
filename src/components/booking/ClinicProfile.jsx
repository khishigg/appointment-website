/**
 * ClinicProfile - clinic information header and tab navigation.
 *
 * Хоёр мөрт header:
 *   Мөр 1 — зүүнд лого + нэр, баруунд хаяг/утас + цагийн хуваарь (desktop-д л).
 *   Мөр 2 — табын навигаци (desktop-д зүүн эгнэсэн, sticky).
 *
 * Эмнэлгийн ТАЙЛБАР энд БАЙХГҮЙ — "Танилцуулга" табд харагдана (ClinicAbout).
 * Ингэснээр header нягт болж, шийдвэрт хэрэгтэй хаяг/утас/цаг байнга харагдана.
 */

import { useEffect, useState } from 'react';
import { FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

import DrAngelLogo from '../../assets/DrAngel.jpg';
import { getMailHref, getTelHref, parseWorkingHours } from './clinicFormat';

const defaultClinicData = {
    id: 1,
    name: 'Dr.Angel Dental Clinic',
    type: 'Dental Practice',
    logo: DrAngelLogo,
    address: 'Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо',
    description: `Welcome to Dr.Angel Dental Clinic, a premier dental practice in Ulaanbaatar with an outstanding reputation. Our team is passionate about helping patients achieve beautiful, healthy smiles in a comfortable and modern environment. We provide a wide range of services including general dentistry, orthodontics, and cosmetic treatments. Our clinic is equipped with the latest technology to ensure the best possible care for you and your family.`,
};

// Шошго нь Figma-гийн эцсийн дизайны дагуу. id-ууд ӨӨРЧЛӨГДӨӨГҮЙ тул
// BookingPage-ийн табын чиглүүлэлт хэвээр ажиллана.
const tabs = [
    { id: 'salbar', label: 'Цаг авах' },
    { id: 'about', label: 'Бидний тухай' },
    { id: 'location', label: 'Хаяг' },
    { id: 'doctor', label: 'Эмч нар' },
    { id: 'service', label: 'Үйлчилгээ' },
];

// Header-ийн баруун талын нэг мэдээллийн бүлэг: icon + доор нь мөрүүд.
const MetaGroup = ({ icon: Icon, children }) => (
    <div className="flex items-start gap-2">
        <Icon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-faint" aria-hidden="true" />
        <div className="min-w-0 text-[11px] leading-snug text-muted">{children}</div>
    </div>
);

export default function ClinicProfile({
    clinic,
    activeTab = 'salbar',
    onTabChange,
}) {
    const [logoFailed, setLogoFailed] = useState(false);

    const displayClinic = clinic
        ? {
            ...defaultClinicData,
            ...clinic,
            logo: clinic.logoUrl || clinic.logo || defaultClinicData.logo,
        }
        : defaultClinicData;

    const logoSrc = displayClinic.logo || '';
    const logoInitial = displayClinic.name?.trim()?.charAt(0)?.toUpperCase() || 'Э';
    const shouldShowLogo = logoSrc && !logoFailed;

    const telHref = getTelHref(displayClinic.phoneNumber);
    const mailHref = getMailHref(displayClinic.email);
    const hoursRows = parseWorkingHours(displayClinic.workingHours);
    const hasContact = Boolean(displayClinic.address || telHref || mailHref);

    useEffect(() => {
        setLogoFailed(false);
    }, [logoSrc]);

    return (
        <div className="bg-surface">
            
            <div className="mx-auto max-w-[1280px] px-4 pt-4 pb-3 md:px-6 lg:flex lg:items-start lg:justify-between lg:gap-8">
                <div className="flex items-center gap-3">
          
                    <div className="flex-shrink-0">
                        {shouldShowLogo ? (
                            <img
                                src={logoSrc}
                                alt={`${displayClinic.name} logo`}
                                className="h-14 w-auto max-w-[120px] object-contain md:h-16 md:max-w-[200px] lg:h-20"
                                onError={() => setLogoFailed(true)}
                            />
                        ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-canvas text-xl font-semibold text-muted md:h-16 md:w-16 lg:h-20 lg:w-20">
                                {logoInitial}
                            </div>
                        )}
                    </div>

                    <h1 className="min-w-0 truncate text-[21px] md:text-2xl md:whitespace-normal lg:text-[22px] font-semibold lg:font-medium text-heading leading-tight">
                        {displayClinic.name}
                    </h1>
                </div>

                {hasContact || hoursRows.length > 0 ? (
                    <div className="hidden lg:-mt-1.5 lg:flex lg:flex-shrink-0 lg:items-start lg:gap-8">
                        {displayClinic.address ? (
                            <MetaGroup icon={FiMapPin}>
                                <p className="max-w-[240px]">{displayClinic.address}</p>
                            </MetaGroup>
                        ) : null}

                     
                        {hoursRows.length > 0 || telHref || mailHref ? (
                            <div className="flex flex-col gap-0.5 text-[11px] leading-snug text-muted">
                                {hoursRows.map((row, index) => (
                                    <div key={`${row.label}-${index}`} className="flex items-center gap-1.5">
                                        {/* Icon зөвхөн эхний мөрөнд; дараагийнх нь ижил өргөнөөр эгнэнэ. */}
                                        {index === 0 ? (
                                            <FiClock className="h-3 w-3 flex-shrink-0 text-faint" aria-hidden="true" />
                                        ) : (
                                            <span className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                                        )}
                                        <span className="whitespace-nowrap">
                                            {row.label ? `${row.label}: ` : ''}{row.hours}
                                        </span>
                                    </div>
                                ))}

                                {telHref ? (
                                    <a href={telHref} className="flex items-center gap-1.5 hover:text-ink">
                                        <FiPhone className="h-3 w-3 flex-shrink-0 text-faint" aria-hidden="true" />
                                        {displayClinic.phoneNumber}
                                    </a>
                                ) : null}

                                {mailHref ? (
                                    <a href={mailHref} className="flex items-center gap-1.5 hover:text-ink">
                                        <FiMail className="h-3 w-3 flex-shrink-0 text-faint" aria-hidden="true" />
                                        {displayClinic.email}
                                    </a>
                                ) : null}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>

            {/* ===== Мөр 2: табын навигаци ===== */}
            <div className="relative border-t border-line bg-surface lg:sticky lg:top-0 lg:z-[var(--z-sticky)]">
                {/* 5 таб нь 375px-д тэнцүү баганад багтахгүй ("Танилцуулга" тасарна) тул
                    mobile-д хэвтээ гүйлгэлт, desktop-д зүүн эгнээ. */}
                <nav
                    className="mx-auto flex max-w-[1280px] gap-6 overflow-x-auto px-4 max-md:no-scrollbar md:gap-8 md:px-4 lg:gap-10 lg:overflow-visible lg:px-6"
                    aria-label="Tabs"
                >
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange?.(tab.id)}
                            className={`
                                py-4 text-sm lg:text-[15px] font-medium border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-selected-border text-ink'
                                    : 'border-transparent text-muted hover:text-heading hover:border-line'
                                }
                            `}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                {/* Баруун ирмэгийн бүдгэрэл — гүйлгэх боломжтойг илэрхийлнэ (зөвхөн mobile,
                    "Үйлчилгээ" таб тасарч харагддаг тул). */}
                <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-surface to-transparent lg:hidden"
                />
            </div>
        </div>
    );
}
