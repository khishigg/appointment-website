/**
 * ClinicAbout — "Танилцуулга" табын агуулга.
 *
 * Эмнэлгийн тайлбар нь өмнө header-т 145 тэмдэгтээр таслагдаж, "show more"-оор
 * дэлгэгддэг байсан. Одоо энд БҮТНЭЭР харагдана — header нягт болж, шийдвэрт
 * хэрэгтэй хаяг/утас/цаг тэнд байнга харагдана.
 */

import { FiExternalLink, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

import { getMailHref, getTelHref, parseWorkingHours } from './clinicFormat';

const ContactRow = ({ icon: Icon, label, value, href }) => {
    if (!value) return null;

    return (
        <div className="flex items-start gap-3">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-faint" aria-hidden="true" />
            <div className="min-w-0">
                <p className="text-label font-semibold uppercase tracking-wide text-muted">{label}</p>
                {href ? (
                    <a href={href} className="text-body text-ink hover:underline break-words">{value}</a>
                ) : (
                    <p className="text-body text-ink break-words">{value}</p>
                )}
            </div>
        </div>
    );
};

export default function ClinicAbout({ clinic }) {
    const description = clinic?.description || '';
    const telHref = getTelHref(clinic?.phoneNumber);
    const mailHref = getMailHref(clinic?.email);
    const hoursRows = parseWorkingHours(clinic?.workingHours);
    const socialUrl = clinic?.socialAddressUrl || '';

    const hasAnything = description
        || clinic?.address
        || telHref
        || mailHref
        || socialUrl
        || hoursRows.length > 0;

    if (!hasAnything) {
        return <div className="booking-data-state">Эмнэлгийн танилцуулга бүртгэгдээгүй байна.</div>;
    }

    return (
        <section id="about" className="bg-canvas pt-5 pb-8 lg:pb-5">
            <div className="px-4 md:px-6 lg:px-0">
                <h2 className="mb-4 text-[22px] font-semibold tracking-[-0.02em] text-heading">
                    Танилцуулга
                </h2>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
                    {description ? (
                        <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                            <p className="max-w-[70ch] text-body leading-relaxed text-heading whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                    ) : null}

                    <div className="rounded-card border border-line bg-surface p-5 shadow-card">
                        <h3 className="mb-4 text-title text-heading">Холбоо барих</h3>
                        <div className="flex flex-col gap-4">
                            <ContactRow icon={FiMapPin} label="Хаяг" value={clinic?.address} />
                            <ContactRow
                                icon={FiPhone}
                                label="Утас"
                                value={clinic?.phoneNumber}
                                href={telHref}
                            />
                            <ContactRow
                                icon={FiMail}
                                label="Имэйл"
                                value={clinic?.email}
                                href={mailHref}
                            />
                            {socialUrl ? (
                                <ContactRow
                                    icon={FiExternalLink}
                                    label="Вэб / Сошиал"
                                    value={socialUrl}
                                    href={socialUrl}
                                />
                            ) : null}
                        </div>

                        {hoursRows.length > 0 ? (
                            <div className="mt-5 border-t border-line-soft pt-4">
                                <p className="mb-2 text-label font-semibold uppercase tracking-wide text-muted">
                                    Ажиллах цаг
                                </p>
                                <div className="flex flex-col gap-1">
                                    {hoursRows.map((row, index) => (
                                        <div
                                            key={`${row.label}-${index}`}
                                            className="flex items-baseline justify-between gap-4 text-body-sm"
                                        >
                                            {row.label ? <span className="text-muted">{row.label}</span> : null}
                                            <span className="font-medium text-ink">{row.hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    );
}
