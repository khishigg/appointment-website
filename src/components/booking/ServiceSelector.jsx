import { useState } from 'react';

import ServiceCard from './ServiceCard';
import { formatProductDuration, formatProductPrice } from './productFormat';

const serviceCatalog = [
    {
        id: 'exam',
        name: 'Шүдний үзлэг',
        subtitle: 'Ерөнхий үзлэг, зөвлөгөө',
        duration: '30 мин',
        price: '30,000₮',
        description: 'Эмчийн үзлэгээр амны хөндийн ерөнхий нөхцөл байдлыг шалгаж, шаардлагатай эмчилгээний төлөвлөгөө гаргана.',
    },
    {
        id: 'cleaning',
        name: 'Шүд цэвэрлэгээ',
        subtitle: 'Чулуу, өнгөр арилгах',
        duration: '45 мин',
        price: '80,000₮',
        description: 'Шүдний чулуу болон өнгөрийг арилгаж, амны хөндийн эрүүл ахуйг сайжруулах үйлчилгээ.',
    },
    {
        id: 'root-canal',
        name: 'Сувгийн эмчилгээ',
        subtitle: 'Шүдний мэдрэл таслах, цэвэрлэх',
        duration: '60 мин',
        price: '150,000₮',
        description: 'Сувгийн халдвар болон өвдөлтийг эмчилж, шүдийг хадгалан үлдэхэд чиглэсэн эмчилгээ.',
    },
    {
        id: 'extraction',
        name: 'Шүд авах',
        subtitle: 'Энгийн болон акт араа авах',
        duration: '30-60 мин',
        price: '',
        description: 'Эмчийн оношилгоонд үндэслэн авах шаардлагатай шүдийг аюулгүй авах үйлчилгээ.',
    },
    {
        id: 'cosmetic-filling',
        name: 'Гоо сайхны ломбо',
        subtitle: 'Шүдний хэлбэр, өнгө сэргээх',
        duration: '45 мин',
        price: '120,000₮',
        description: 'Шүдний хэлбэр болон өнгийг сэргээж, гоо сайхны хувьд илүү цэвэр харагдуулах ломбо.',
    },
];

// Backend-ийн product-ыг энэ компонентын карт бүтэц рүү хөрвүүлнэ.
// subtitle-д description-ийг ХИЙХГҮЙ — description зөвхөн карт нээгдсэн (expanded) үед гарна.
const productToService = (product) => ({
    id: product.id,
    name: product.name,
    subtitle: '',
    duration: formatProductDuration(product.durationMinutes),
    price: formatProductPrice(product.price),
    description: product.description || 'Дэлгэрэнгүй мэдээлэл бүртгэгдээгүй байна.',
});

export default function ServiceSelector({
    products = null,
    isLoading = false,
    error = '',
    onRetry,
}) {
    const [openServiceIds, setOpenServiceIds] = useState(() => new Set());
    // products prop ирсэн үед (admin горим) API өгөгдлийг ашиглана; ирээгүй үед mock каталог.
    const items = products ? products.map(productToService) : serviceCatalog;

    if (products && isLoading) {
        return <div className="booking-data-state">Үйлчилгээний жагсаалтыг уншиж байна...</div>;
    }

    if (products && error) {
        return (
            <div className="booking-data-state booking-data-state--error" role="alert">
                <span>{error}</span>
                <button type="button" onClick={onRetry} className="booking-cta-outline rounded-control px-3 py-2 text-xs font-bold">Дахин оролдох</button>
            </div>
        );
    }

    if (products && items.length === 0) {
        return <div className="booking-data-state">Бүртгэлтэй үйлчилгээ олдсонгүй.</div>;
    }

    const toggleService = (serviceId) => {
        setOpenServiceIds((current) => {
            const next = new Set(current);
            if (next.has(serviceId)) {
                next.delete(serviceId);
            } else {
                next.add(serviceId);
            }
            return next;
        });
    };

    return (
        <section id="service" className="bg-canvas px-4 py-4 md:px-6 lg:px-0">
            <div className="mx-auto grid max-w-md grid-cols-1 items-start gap-4 md:max-w-3xl md:grid-cols-2 lg:max-w-none">
                {items.map((service) => (
                    <ServiceCard
                        key={service.id}
                        name={service.name}
                        subtitle={service.subtitle}
                        duration={service.duration}
                        price={service.price}
                        description={service.description}
                        expanded={openServiceIds.has(service.id)}
                        onToggle={() => toggleService(service.id)}
                    />
                ))}
            </div>
        </section>
    );
}
