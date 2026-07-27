/**
 * Backend-ийн product (үйлчилгээ)-ийн утгуудыг дэлгэцэнд харуулах формат.
 */

export const formatProductPrice = (price) =>
    price === null || price === undefined || price === ''
        ? ''
        : `${Number(price).toLocaleString('mn-MN')}₮`;

export const formatProductDuration = (durationMinutes) =>
    durationMinutes === null || durationMinutes === undefined
        ? ''
        : `${durationMinutes} мин`;
