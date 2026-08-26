import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiClock, FiMail, FiMapPin, FiPhone } from 'react-icons/fi';

import { getMailHref, getTelHref, parseWorkingHours } from './booking/clinicFormat';

const ClinicLogo = ({ clinic }) => {
    const [hasImageError, setHasImageError] = useState(false);

    useEffect(() => setHasImageError(false), [clinic.logoUrl]);

    if (!clinic.logoUrl || hasImageError) {
        return <span className="recommended-clinic-card__initial">{clinic.logoInitial}</span>;
    }

    return (
        <img
            src={clinic.logoUrl}
            alt={`${clinic.name} лого`}
            onError={() => setHasImageError(true)}
        />
    );
};

const ClinicCard = ({ clinic }) => {
    const location = clinic.address || [clinic.city, clinic.province].filter(Boolean).join(', ');
    const telHref = getTelHref(clinic.phone);
    const mailHref = getMailHref(clinic.email);
    const workingHours = parseWorkingHours(clinic.workingHours);

    return (
        <article className="recommended-clinic-card">
            <div className="recommended-clinic-card__header">
                <div className="recommended-clinic-card__logo"><ClinicLogo clinic={clinic} /></div>
                <h3>{clinic.name}</h3>
            </div>

            {telHref ? (
                <p className="recommended-clinic-card__meta">
                    <FiPhone aria-hidden="true" />
                    <a href={telHref}>{clinic.phone}</a>
                </p>
            ) : null}

            {mailHref ? (
                <p className="recommended-clinic-card__meta">
                    <FiMail aria-hidden="true" />
                    <a href={mailHref}>{clinic.email}</a>
                </p>
            ) : null}

            {location ? (
                <p className="recommended-clinic-card__meta">
                    <FiMapPin aria-hidden="true" />
                    <span>{location}</span>
                </p>
            ) : null}

            {workingHours.length ? (
                <div className="recommended-clinic-card__hours">
                    <div className="recommended-clinic-card__hours-label">
                        <FiClock aria-hidden="true" />
                        <span>Цагийн хуваарь</span>
                    </div>
                    <div className="recommended-clinic-card__hours-list">
                        {workingHours.map((row, index) => (
                            <div key={`${clinic.id}-${row.label}-${index}`}>
                                {row.label ? <span>{row.label}</span> : null}
                                <strong>{row.hours}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            <Link
                to={`/booking?clinicId=${encodeURIComponent(clinic.id)}`}
                state={{ clinic }}
                className="recommended-clinic-card__action"
            >
                Цаг авах <FiArrowRight aria-hidden="true" />
            </Link>
        </article>
    );
};

export default function RecommendedClinics({ clinicData }) {
    const { clinics, isLoading, error, needsAuth, retry } = clinicData;
    const bookableClinics = clinics.filter(
        (clinic) => clinic.isSuggested && clinic.bookingEnabled
    );

    if (!isLoading && !needsAuth && !error && bookableClinics.length === 0) {
        return null;
    }

    return (
        <section className="recommended-clinics" aria-labelledby="recommended-clinics-title">
            <div className="container">
                <div className="recommended-clinics__heading">
                    <div>
                        <h3 id="recommended-clinics-title">Санал болгож буй эмнэлгүүд</h3>
                    </div>
                </div>

                {isLoading ? (
                    <div className="recommended-clinics__rail" aria-busy="true" aria-label="Эмнэлгийн жагсаалт ачаалж байна">
                        {[0, 1, 2].map((index) => <div key={index} className="recommended-clinic-card recommended-clinic-card--skeleton" />)}
                    </div>
                ) : needsAuth ? (
                    <div className="recommended-clinics__state" role="alert">
                        Эмнэлгийн жагсаалтыг харахын тулд <Link to="/login">нэвтэрнэ үү</Link>.
                    </div>
                ) : error ? (
                    <div className="recommended-clinics__state" role="alert">
                        <span>{error}</span>
                        <button type="button" onClick={retry}>Дахин оролдох</button>
                    </div>
                ) : (
                    <div className="recommended-clinics__rail" role="list">
                        {bookableClinics.map((clinic) => <ClinicCard key={clinic.id} clinic={clinic} />)}
                    </div>
                )}
            </div>
        </section>
    );
}
