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
        <div className="bg-white">
            <div className="px-4 pt-4 pb-3 md:px-6 lg:px-8">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
                            {shouldShowLogo ? (
                                <img
                                    src={logoSrc}
                                    alt={`${displayClinic.name} logo`}
                                    className="w-full h-full object-contain p-1"
                                    onError={() => setLogoFailed(true)}
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xl font-semibold text-slate-500">
                                    {logoInitial}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-1">
                        <h1 className="text-[21px] md:text-2xl font-semibold text-gray-800 leading-tight">
                            {displayClinic.name}
                        </h1>

                        {/* {displayClinic.type ? (
                            <p className="mt-1 text-sm text-gray-500">
                                {displayClinic.type}
                            </p>
                        ) : null} */}

                        {/* {displayClinic.address ? <p>{displayClinic.address}</p> : null} */}
                    </div>
                </div>

                {description ? (
                    <div className="mt-3">
                        <p className="text-[13px] text-gray-700 leading-relaxed">
                            {isExpanded || !shouldTruncate ? (
                                description
                            ) : (
                                <>
                                    {description.slice(0, maxChars)}
                                    <button
                                        type="button"
                                        onClick={() => setIsExpanded(true)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors mx-0.5"
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
                                    className="text-gray-900 font-medium underline underline-offset-2 hover:text-gray-700"
                                >
                                    {isExpanded ? 'show less' : 'show more'}
                                </button>
                            )}
                        </p>
                    </div>
                ) : null}
            </div>

            <div className="border-t border-gray-200 bg-white z-20">
                <nav className="grid grid-cols-4 px-0 md:px-4" aria-label="Tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange?.(tab.id)}
                            className={`
                                py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                ${activeTab === tab.id
                                    ? 'border-gray-900 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
