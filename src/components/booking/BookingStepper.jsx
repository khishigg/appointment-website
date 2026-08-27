import { FiCheck } from 'react-icons/fi';

/**
 * BookingStepper — захиалгын 3 алхмын индикатор.
 *
 * Локал identity flow нь consent → арга сонголт → OTP гэсэн 3 дэд алхамтай боловч
 * stepper дээр нэг "Баталгаажуулалт" үе шат болгон харуулна.
 */

const STEPS = [
    { step: 1, label: 'Үйлчилгээ' },
    { step: 2, label: 'Мэдээлэл' },
    { step: 3, label: 'Төлбөр' },
    { step: 6, label: 'Баталгаа' },
];

export default function BookingStepper({ step = 1 }) {
    const activeIndex = step <= 1 ? 0 : step === 2 ? 1 : step <= 5 ? 2 : 3;

    return (
        <nav aria-label="Захиалгын алхам" className="flex items-center gap-2 px-4 py-3 sm:gap-3 lg:px-0 lg:py-2.5">
            {STEPS.map((item, index) => {
                const isDone = index < activeIndex;
                const isActive = index === activeIndex;

                return (
                    <div key={item.step} className="flex flex-1 items-center gap-2 last:flex-none">
                        <div
                            className="flex items-center gap-2"
                            aria-current={isActive ? 'step' : undefined}
                        >
                            <span
                                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-pill border text-label transition-colors lg:h-5 lg:w-5 ${
                                    isDone || isActive
                                        ? 'booking-selection-active'
                                        : 'border-line bg-surface text-muted'
                                }`}
                            >
                                {isDone ? (
                                    <FiCheck className="h-3 w-3" aria-hidden="true" />
                                ) : (
                                    index + 1
                                )}
                            </span>

                            {/* Mobile-д зөвхөн ИДЭВХТЭЙ алхмын шошго — 3 шошго 375px-д багтахгүй. */}
                            <span
                                className={`whitespace-nowrap text-caption transition-colors ${
                                    isActive ? 'font-semibold text-ink' : 'hidden text-muted sm:inline'
                                }`}
                            >
                                {item.label}
                            </span>
                        </div>

                        {index < STEPS.length - 1 ? (
                            <span
                                className={`h-px min-w-4 flex-1 transition-colors lg:min-w-10 lg:flex-none ${
                                    isDone ? 'booking-selection-line' : 'bg-line'
                                }`}
                                aria-hidden="true"
                            />
                        ) : null}
                    </div>
                );
            })}
        </nav>
    );
}
