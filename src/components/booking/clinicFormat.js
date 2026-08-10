/**
 * Эмнэлэг / салбарын мэдээллийг дэлгэцэнд харуулах формат.
 * ClinicProfile болон LocationSelector хоёрын ДУНДЫН эх сурвалж.
 */

export const firstDisplayValue = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== '');

export const formatWorkingHours = (value) => {
    if (!value || typeof value !== 'string') return '';
    return value.trim().replace(/\s*-\s*/g, ' - ');
};

/**
 * Backend-ийн талбар нэр `workingHoursJson` боловч бодит агуулга нь JSON эсэх
 * БАТАЛГААГҮЙ (одоогийн код бүхэлдээ энгийн мөр мэт харьцдаг). Тиймээс аль алиныг
 * тэсвэрлэнэ.
 */
export const getWorkingHours = (item = {}) => {
    const source = item.source || {};
    return formatWorkingHours(firstDisplayValue(
        item.workingHours,
        item.workingHoursJson,
        source.workingHours,
        source.WorkingHours,
        source.workingHoursJson,
        source.WorkingHoursJson,
        source.hours,
        source.Hours
    ));
};

/**
 * Цагийн хуваарийг мөр болгон задална.
 *   - JSON объект/массив бол өдөр тус бүрээр "Даваа: 09:00 - 18:00" мөрүүд болгоно.
 *   - Энгийн мөр бол нэг мөрөөр буцаана.
 * Задлаж чадаагүй тохиолдолд ямар ч үед унахгүй — түүхий мөрийг л харуулна.
 */
export const parseWorkingHours = (value) => {
    const raw = typeof value === 'string' ? value.trim() : value;
    if (!raw) return [];

    if (typeof raw === 'string' && !/^[[{]/.test(raw)) {
        return [{ label: '', hours: formatWorkingHours(raw) }];
    }

    let parsed = raw;
    if (typeof raw === 'string') {
        try {
            parsed = JSON.parse(raw);
        } catch {
            return [{ label: '', hours: formatWorkingHours(raw) }];
        }
    }

    if (Array.isArray(parsed)) {
        return parsed
            .map((entry) => {
                if (typeof entry === 'string') {
                    return { label: '', hours: formatWorkingHours(entry) };
                }
                const label = firstDisplayValue(entry?.day, entry?.Day, entry?.label, entry?.name) || '';
                const hours = formatWorkingHours(
                    firstDisplayValue(entry?.hours, entry?.Hours, entry?.time, entry?.value) || ''
                );
                return { label: String(label), hours };
            })
            .filter((entry) => entry.hours);
    }

    if (parsed && typeof parsed === 'object') {
        return Object.entries(parsed)
            .map(([label, hours]) => ({
                label,
                hours: formatWorkingHours(typeof hours === 'string' ? hours : String(hours ?? '')),
            }))
            .filter((entry) => entry.hours);
    }

    return [];
};

export const getTelHref = (phone) => {
    const normalized = String(phone || '').replace(/[^\d+]/g, '');
    return normalized ? `tel:${normalized}` : '';
};

export const getMailHref = (email) => {
    const normalized = String(email || '').trim();
    return normalized ? `mailto:${normalized}` : '';
};
