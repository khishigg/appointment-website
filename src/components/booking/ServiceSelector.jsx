import { useState } from 'react';
import { FiChevronDown, FiClock } from 'react-icons/fi';

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

export default function ServiceSelector() {
    const [openServiceIds, setOpenServiceIds] = useState(() => new Set());

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
        <section id="service" className="bg-gray-50 px-4 py-4 md:px-6">
            <div className="mx-auto flex max-w-md flex-col gap-[14px]">
                {serviceCatalog.map((service) => {
                    const isOpen = openServiceIds.has(service.id);

                    return (
                        <article
                            key={service.id}
                            className="min-h-[108px] rounded-[20px] border border-slate-200 bg-white px-4 pt-4 pb-3.5 shadow-[0_6px_18px_rgba(15,23,42,0.045)]"
                        >
                            <button
                                type="button"
                                className="flex w-full items-center justify-between gap-3 text-left"
                                onClick={() => toggleService(service.id)}
                                aria-expanded={isOpen}
                            >
                                <span className="min-w-0">
                                    <span className="block text-base font-semibold leading-tight text-slate-800">
                                        {service.name}
                                    </span>
                                    <span className="mt-1.5 block text-xs font-medium leading-5 text-slate-400">
                                        {service.subtitle}
                                    </span>
                                </span>
                                <FiChevronDown
                                    className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                                    aria-hidden="true"
                                />
                            </button>

                            <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-600">
                                    <FiClock className="h-3 w-3 text-slate-400" aria-hidden="true" />
                                    {service.duration}
                                </span>
                                {service.price ? (
                                    <span className="inline-flex min-h-7 items-center rounded-full bg-slate-50 px-2.5 text-[11px] font-semibold text-slate-600">
                                        {service.price}
                                    </span>
                                ) : null}
                            </div>

                            {isOpen ? (
                                <div className="mt-3 border-t border-slate-100 pt-3">
                                    <p className="text-xs leading-5 text-slate-600">
                                        {service.description}
                                    </p>
                                </div>
                            ) : null}
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
