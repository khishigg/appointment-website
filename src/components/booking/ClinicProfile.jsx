/**
 * ClinicProfile - clinic information header and tab navigation.
 */

import { useEffect, useState } from 'react';
import DrAngelLogo from '../../assets/DrAngel.jpg';

const defaultClinicData = {
    id: 1,
    name: 'Dr.Angel Dental Clinic',
    type: 'Dental Practice',
    logo: DrAngelLogo,
    address: 'Улаанбаатар, Сүхбаатар дүүрэг, 1-р хороо',
    description: `Welcome to Dr.Angel Dental Clinic, a premier dental practice in Ulaanbaatar with an outstanding reputation. Our team is passionate about helping patients achieve beautiful, healthy smiles in a comfortable and modern environment. We provide a wide range of services including general dentistry, orthodontics, and cosmetic treatments. Our clinic is equipped with the latest technology to ensure the best possible care for you and your family.`,
};

const tabs = [
    { id: 'salbar', label: 'Салбар' },
    { id: 'service', label: 'Үйлчилгээ' },
    { id: 'doctor', label: 'Эмч' },
    { id: 'location', label: 'Хаяг' },
];

export default function ClinicProfile({
    clinic,
    activeTab = 'salbar',
    onTabChange,
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);

    const displayClinic = clinic
        ? {
            ...defaultClinicData,
            ...clinic,
            logo: clinic.logoUrl || clinic.logo || defaultClinicData.logo,
        }
        : defaultClinicData;

    const maxChars = 145;
    const description = displayClinic.description || '';
    const shouldTruncate = description.length > maxChars;
    const logoSrc = displayClinic.logo || '';
    const logoInitial = displayClinic.name?.trim()?.charAt(0)?.toUpperCase() || 'Э';
    const shouldShowLogo = logoSrc && !logoFailed;

    useEffect(() => {
        setLogoFailed(false);
    }, [logoSrc]);

    return (
        <div className="bg-surface">
            {/* Өргөн нь BookingWorkspace-тэй ЯГ ижил — эс тэгвэл том дэлгэц дээр лого/гарчиг
                нь доорх картуудтай өөр босоо шугам дээр таарна. */}
            <div className="mx-auto max-w-[1280px] px-4 pt-4 pb-3 md:px-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 lg:w-12 lg:h-12 rounded-full border border-line overflow-hidden bg-canvas flex items-center justify-center">
                            {shouldShowLogo ? (
                                <img
                                    src={logoSrc}
                                    alt={`${displayClinic.name} logo`}
                                    className="w-full h-full object-contain p-1"
                                    onError={() => setLogoFailed(true)}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-canvas text-xl font-semibold text-muted">
                                    {logoInitial}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h1 className="text-[21px] md:text-2xl lg:text-xl font-semibold text-heading leading-tight">
                            {displayClinic.name}
                        </h1>

                        {/* {displayClinic.type ? (
                            <p className="mt-1 text-sm text-muted">
                                {displayClinic.type}
                            </p>
                        ) : null} */}

                        {/* {displayClinic.address ? <p>{displayClinic.address}</p> : null} */}
                    </div>
                </div>

                {description ? (
                    <div className="mt-3">
                        <p className="text-body-sm text-heading leading-relaxed">
                            {isExpanded || !shouldTruncate ? (
                                description
                            ) : (
                                <>
                                    {description.slice(0, maxChars)}
                                    <button
                                        type="button"
                                        onClick={() => setIsExpanded(true)}
                                        className="text-faint hover:text-muted transition-colors mx-0.5"
                                    >
                                        ...
                                    </button>
                                </>
                            )}
                            {' '}
                            {shouldTruncate && (
                                <button
                                    type="button"
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="text-ink font-medium underline underline-offset-2 hover:text-heading"
                                >
                                    {isExpanded ? 'show less' : 'show more'}
                                </button>
                            )}
                        </p>
                    </div>
                ) : null}
            </div>

            <div className="border-t border-line bg-surface z-20">
                <nav className="mx-auto grid max-w-[1280px] grid-cols-4 px-0 md:px-4 lg:px-6" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange?.(tab.id)}
                            className={`
                                py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
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
            </div>
        </div>
    );
}
