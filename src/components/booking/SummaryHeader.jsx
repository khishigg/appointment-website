import React from 'react';

import { formatProductPrice } from './productFormat';

/**
 * Захиалгын хураангуй — BookingDetails-ийн доод хэсэгт, Буцах/Захиалах товчнуудын дээр.
 *
 * Хайрцаг (card) БИШ — зөвхөн цэвэрхэн текст. Огноо & цаг нь хэрэглэгчийн батлах гэж буй
 * гол мэдээлэл тул тэргүүлэх мөрөнд тод; эмч · үйлчилгээ · үнэ нь доор бүдэг дэмжих мөрөнд.
 * Юу ч тасрахгүй — урт бол байгалиар мулгайлна.
 */
export default function SummaryHeader({
    selectedService,
    selectedDoctor,
    selectedTimeSlot,
}) {
    const servicePrice = formatProductPrice(selectedService?.price);
    const timeLabel = selectedTimeSlot
        ? `${selectedTimeSlot.date || ''} • ${selectedTimeSlot.time || ''}`.replace(/^ • | • $/, '').trim()
        : '';

    // Дэмжих мөр: Эмч · Үйлчилгээ · Үнэ. Сонгогдоогүй хэсгийг алгасна.
    const supportingParts = [selectedDoctor?.name, selectedService?.name, servicePrice].filter(Boolean);

    return (
        <div className="mb-3">
            <p className="text-sm font-semibold leading-snug text-ink break-words">
                {timeLabel || 'Цаг сонгоогүй'}
            </p>
            {supportingParts.length > 0 ? (
                <p className="mt-0.5 text-xs leading-snug text-muted break-words">
                    {supportingParts.join(' · ')}
                </p>
            ) : null}
        </div>
    );
}
