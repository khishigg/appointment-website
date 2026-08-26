import { useCallback, useEffect, useRef, useState } from 'react';
import {
    Baby,
    Brain,
    ChevronRight,
    Eye,
    PawPrint,
    Smile,
} from 'lucide-react';

function DentalOutlineIcon(props) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M8.1 3.5c1.2 0 2.1.7 3.9.7s2.7-.7 3.9-.7c2.1 0 3.6 1.8 3.6 4.1 0 2.8-1.1 5.2-2.3 7.6-.9 1.7-1.4 4.5-2.8 4.5-1 0-1.2-3.4-2.4-3.4s-1.4 3.4-2.4 3.4c-1.4 0-1.9-2.8-2.8-4.5-1.2-2.4-2.3-4.8-2.3-7.6 0-2.3 1.5-4.1 3.6-4.1Z" />
        </svg>
    );
}

const CLINIC_TYPES = [
    { id: 'dental', label: 'Шүдний', keywords: ['шүд', 'dental', 'dentistry'], Icon: DentalOutlineIcon },
    { id: 'eye', label: 'Нүдний', keywords: ['нүд', 'хараа', 'eye', 'ophthalmology', 'vision'], Icon: Eye },
    { id: 'pediatric', label: 'Хүүхдийн', keywords: ['хүүхэд', 'pediatric', 'pediatrics'], Icon: Baby },
    { id: 'neurology', label: 'Мэдрэлийн', keywords: ['мэдрэл', 'neuro', 'neurology'], Icon: Brain },
    { id: 'beauty', label: 'Гоо сайхан', keywords: ['гоо сайхан', 'beauty', 'aesthetic', 'cosmetic'], Icon: Smile },
    { id: 'veterinary', label: 'Малын', keywords: ['мал', 'амьтан', 'vet', 'veterinary'], Icon: PawPrint },
];

export default function TrustStats({ variant = "full", onSelectClinicType }) {
    const railRef = useRef(null);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const rail = railRef.current;
        if (!rail) return;

        const maxScrollLeft = rail.scrollWidth - rail.clientWidth;
        setCanScrollRight(maxScrollLeft > 1 && rail.scrollLeft < maxScrollLeft - 1);
    }, []);

    useEffect(() => {
        const rail = railRef.current;
        if (!rail || variant !== 'mini') return undefined;

        updateScrollState();
        rail.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);

        const resizeObserver = typeof ResizeObserver === 'undefined'
            ? null
            : new ResizeObserver(updateScrollState);
        resizeObserver?.observe(rail);

        return () => {
            rail.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
            resizeObserver?.disconnect();
        };
    }, [updateScrollState, variant]);

    const scrollRight = () => {
        const rail = railRef.current;
        if (!rail) return;

        rail.scrollBy({
            left: Math.max(rail.clientWidth * 0.7, 88),
            behavior: 'smooth',
        });
    };

    if (variant === "mini") {
        return (
            <section className="clinic-type-browser" aria-labelledby="clinic-type-title">
                <div className="clinic-type-browser__header">
                    <h2 id="clinic-type-title">Төрлөөр хайх</h2>
                    <button
                        type="button"
                        className="clinic-type-browser__next"
                        onClick={scrollRight}
                        disabled={!canScrollRight}
                        aria-label="Эмнэлгийн төрлүүдийг баруун тийш гүйлгэх"
                    >
                        <ChevronRight aria-hidden="true" />
                    </button>
                </div>

                <ul ref={railRef} className="clinic-type-grid">
                    {CLINIC_TYPES.map((item) => (
                        <li key={item.id}>
                            <button
                                type="button"
                                className="clinic-type-grid__item"
                                aria-label={`${item.label} төрлөөр эмнэлэг хайх`}
                                onClick={() => onSelectClinicType?.({
                                    id: item.id,
                                    label: item.label,
                                    keywords: item.keywords,
                                })}
                            >
                                <item.Icon className="clinic-type-grid__icon" aria-hidden="true" />
                                <span>{item.label}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            </section>
        );
    }

    return null; // Legacy full version removed to force mini usage
}
