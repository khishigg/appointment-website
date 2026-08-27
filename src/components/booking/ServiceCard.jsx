import { FiCheck, FiChevronDown, FiClock } from 'react-icons/fi';

/**
 * ServiceCard — Clinic Detail хуудасны үйлчилгээний картын нэгдсэн дизайн.
 *
 * Хоёр горим:
 *  - Browse (onSelect дамжуулаагүй): картын аль ч хэсгийг дарахад тайлбар нээгдэнэ/хаагдана.
 *  - Select (onSelect дамжуулсан): картын бие = үйлчилгээ сонгох (radio), баруун chevron =
 *    зөвхөн тайлбар нээх (сонголтод нөлөөлөхгүй).
 *
 * Тайлбар (description) ЗӨВХӨН expanded үед харагдана — нээгдээгүй үед гарахгүй.
 */
export default function ServiceCard({
    name,
    subtitle = '',
    duration = '',
    price = '',
    description = '',
    expanded = false,
    selected = false,
    onToggle,
    onSelect,
}) {
    const isSelectable = typeof onSelect === 'function';
    const hasDescription = Boolean(description);

    const handleCardKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect();
        }
    };

    const header = (
        <span className="min-w-0">
            <span className="block text-base font-semibold leading-tight text-heading lg:text-sm">
                {name}
            </span>
            {subtitle ? (
                <span className="mt-1.5 block text-xs font-medium leading-5 text-faint">
                    {subtitle}
                </span>
            ) : null}
        </span>
    );

    // lg: нягтрал — min-h авч, padding багасгаснаар нэг дэлгэцэнд илүү олон үйлчилгээ
    // багтана (desktop хулгана нь мэдрэгчийн target хэмжээ шаарддаггүй).
    return (
        <article
            className={`min-h-[108px] rounded-card border px-4 pt-4 pb-3.5 shadow-card transition-colors lg:min-h-0 lg:px-3.5 lg:pt-3 lg:pb-3 ${
                selected ? 'border-selected-border bg-selected-bg ring-1 ring-selected-border' : 'border-line bg-surface'
            } ${isSelectable ? 'cursor-pointer' : ''}`}
            role={isSelectable ? 'radio' : undefined}
            aria-checked={isSelectable ? selected : undefined}
            tabIndex={isSelectable ? 0 : undefined}
            onClick={isSelectable ? onSelect : undefined}
            onKeyDown={isSelectable ? handleCardKeyDown : undefined}
        >
            {isSelectable ? (
                // Select горим: header нь энгийн мөр; chevron нь тусдаа товч.
                <div className="flex w-full items-center justify-between gap-3 text-left">
                    {header}
                    <span className="flex flex-shrink-0 items-center gap-2">
                        {selected ? (
                            <span
                                className="booking-selection-active flex h-5 w-5 items-center justify-center rounded-full"
                                aria-hidden="true"
                            >
                                <FiCheck className="h-3 w-3" />
                            </span>
                        ) : null}
                        {hasDescription ? (
                            <button
                                type="button"
                                className="-m-1 p-1"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    onToggle?.();
                                }}
                                aria-expanded={expanded}
                                aria-label={expanded ? 'Тайлбар хаах' : 'Тайлбар харах'}
                            >
                                <FiChevronDown
                                    className={`h-4 w-4 text-faint transition-transform ${expanded ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                            </button>
                        ) : null}
                    </span>
                </div>
            ) : (
                // Browse горим: header бүхэлдээ toggle товч.
                <button
                    type="button"
                    className="flex w-full items-center justify-between gap-3 text-left"
                    onClick={onToggle}
                    aria-expanded={expanded}
                >
                    {header}
                    {hasDescription ? (
                        <FiChevronDown
                            className={`h-4 w-4 flex-shrink-0 text-faint transition-transform ${expanded ? 'rotate-180' : ''}`}
                            aria-hidden="true"
                        />
                    ) : null}
                </button>
            )}

            {duration || price ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    {duration ? (
                        <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-canvas px-2.5 text-label font-semibold text-muted">
                            <FiClock className="h-3 w-3 text-faint" aria-hidden="true" />
                            {duration}
                        </span>
                    ) : null}
                    {price ? (
                        <span className="inline-flex min-h-7 items-center rounded-full bg-canvas px-2.5 text-label font-semibold text-muted">
                            {price}
                        </span>
                    ) : null}
                </div>
            ) : null}

            {expanded && hasDescription ? (
                <div className="mt-3 border-t border-line-soft pt-3">
                    <p className="text-xs leading-5 text-muted">{description}</p>
                </div>
            ) : null}
        </article>
    );
}
