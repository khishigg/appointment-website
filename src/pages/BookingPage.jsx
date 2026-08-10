/**
 * BookingPage - clinic detail and booking flow.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
    ClinicProfile,
    ClinicAbout,
    BranchSelector,
    ServiceSelector,
    LocationSelector,
    DoctorSelector,
    BookingDetails,
    BookingRail,
    BookingWorkspace,
    TimeSlotModal,
} from '../components/booking';
import {
    getClinic,
    getClinicBranches,
    getBranchProviders,
    getClinicProviders,
    getClinicProducts,
    resolveClinicAssetUrl,
} from '../api/clinics';
import { normalizeProduct } from '../api/appointments';
import { useBookingStore } from '../store/BookingStore';
import SearchBar from '../components/SearchBar';

const asList = (value) => {
    if (Array.isArray(value)) return value;
    if (Array.isArray(value?.items)) return value.items;
    if (Array.isArray(value?.data)) return value.data;
    return [];
};

const normalizeClinicDetail = (clinic, fallbackId) => ({
    id: clinic.id ?? clinic.Id ?? fallbackId,
    name: clinic.name ?? clinic.Name ?? 'Нэргүй эмнэлэг',
    description: clinic.description ?? clinic.Description ?? '',
    address: clinic.address ?? clinic.Address ?? '',
    logoUrl: resolveClinicAssetUrl(clinic.logo ?? clinic.Logo ?? ''),
    phoneNumber: clinic.phoneNumber ?? clinic.PhoneNumber ?? '',
    email: clinic.email ?? clinic.Email ?? '',
    socialAddressUrl: clinic.socialAddressUrl ?? clinic.SocialAddressUrl ?? '',
    workingHours: clinic.workingHoursJson ?? clinic.WorkingHoursJson ?? '',
});

// Хаягийн хэсгүүдийг давхардуулахгүйгээр нэгтгэнэ.
// Backend нь Address ба Address2-т ИЖИЛ бүтэн мөр буцаадаг (мөн City/State/Zip нь
// Address дотор аль хэдийн орсон байдаг) тул энгийн join хийвэл хаяг үг үсгээрээ
// давхарлаж харагддаг: "BGD - 11 khoroo, Ulaanbaatar 16060, BGD - 11 khoroo, Ulaanbaatar 16060".
const joinAddressParts = (parts) => {
    const cleaned = parts
        .map((part) => String(part ?? '').trim())
        .filter(Boolean);

    // Өөр хэсэгт аль хэдийн агуулагдсан хэсгийг хаяна — ингэснээр хамгийн БҮРЭН
    // хувилбар үлдэнэ. Яг ижил давхардлаас зөвхөн эхнийхийг авна.
    const kept = cleaned.filter((part, index) => {
        const needle = part.toLowerCase();

        return !cleaned.some((other, otherIndex) => {
            if (otherIndex === index) return false;

            const haystack = other.toLowerCase();
            if (!haystack.includes(needle)) return false;

            return haystack.length > needle.length || otherIndex < index;
        });
    });

    return kept.join(', ');
};

const normalizeBranch = (branch, clinicId) => {
    const clinicNum = branch.clinicNum ?? branch.ClinicNum;
    const address = joinAddressParts([
        branch.address ?? branch.Address,
        branch.address2 ?? branch.Address2,
        branch.city ?? branch.City,
        branch.state ?? branch.State,
        branch.zip ?? branch.Zip,
    ]);

    return {
        ...branch,
        id: clinicNum,
        clinicNum,
        clinicId,
        name: branch.name ?? branch.Name ?? `Салбар #${clinicNum}`,
        abbreviation: branch.abbreviation ?? branch.Abbreviation,
        address,
        phone: branch.phone ?? branch.Phone ?? '',
        isOpen: true,
    };
};

const toClinicNum = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : null;
};

// Эмч зөвхөн НЭГ салбарт харьяалагдана. Provider DTO нь clinicNum/clinicName-ээ өөрөө
// буцаадаг тул нөөц (fallback) утга ашиглахгүй — байхгүй бол null үлдэж, захиалгын
// payload-аас clinicNum БҮРМӨСӨН гарна (серверт нөхүүлнэ).
const normalizeProvider = (provider, clinicId) => {
    const provNum = provider.provNum ?? provider.ProvNum;
    const clinicNum = toClinicNum(provider.clinicNum ?? provider.ClinicNum);
    const displayName =
        provider.displayName ??
        provider.DisplayName ??
        [
            provider.firstName ?? provider.FirstName,
            provider.lastName ?? provider.LastName,
        ].filter(Boolean).join(' ').trim();

    return {
        id: provNum != null ? String(provNum) : (displayName || 'provider'),
        provNum,
        clinicId,
        clinicNum,
        clinicName: provider.clinicName ?? provider.ClinicName ?? '',
        name: displayName || `Provider #${provNum}`,
        firstName: provider.firstName ?? provider.FirstName ?? '',
        lastName: provider.lastName ?? provider.LastName ?? '',
        abbreviation: provider.abbreviation ?? provider.Abbreviation ?? '',
        isSecondary: provider.isSecondary ?? provider.IsSecondary ?? false,
    };
};

export default function BookingPage() {
    const [searchParams] = useSearchParams();
    const clinicId = searchParams.get('clinicId') ?? searchParams.get('tenantId');
    const [activeClinicTab, setActiveClinicTab] = useState('salbar');
    const [tenant, setTenant] = useState(null);
    const [branches, setBranches] = useState([]);
    const [providers, setProviders] = useState([]);
    const [products, setProducts] = useState([]);
    const [isLoadingTenant, setIsLoadingTenant] = useState(false);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [tenantError, setTenantError] = useState('');
    const [branchError, setBranchError] = useState('');
    const [providerError, setProviderError] = useState('');
    const [productError, setProductError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const selectedBranch = useBookingStore((state) => state.selectedBranch);
    const selectBranch = useBookingStore((state) => state.selectBranch);
    const resetBooking = useBookingStore((state) => state.resetBooking);
    const setSelectedClinic = useBookingStore((state) => state.setSelectedClinic);
    const tenantRequestId = useRef(0);
    const providerRequestId = useRef(0);
    const providerController = useRef(null);

    const loadProviders = useCallback(async (branch) => {
        const requestId = ++providerRequestId.current;
        providerController.current?.abort();
        setProviders([]);
        setProviderError('');

        if (!clinicId) {
            setIsLoadingProviders(false);
            return;
        }

        const controller = new AbortController();
        providerController.current = controller;
        setIsLoadingProviders(true);

        try {
            const data = branch?.clinicNum != null
                ? await getBranchProviders(clinicId, branch.clinicNum, { signal: controller.signal })
                : await getClinicProviders(clinicId, { signal: controller.signal });

            if (requestId !== providerRequestId.current) return;
            // Backend давхцалгүй буцаадаг тул клиент талд дахин dedupe хийхгүй.
            setProviders(
                asList(data).map((provider) => normalizeProvider(provider, clinicId))
            );
        } catch (error) {
            if (
                error.name !== 'AbortError' &&
                requestId === providerRequestId.current
            ) {
                setProviders([]);
                setProviderError(error.message);
            }
        } finally {
            if (
                !controller.signal.aborted &&
                requestId === providerRequestId.current
            ) {
                setIsLoadingProviders(false);
            }
        }
    }, [clinicId]);

    useEffect(() => {
        const requestId = ++tenantRequestId.current;
        providerRequestId.current += 1;
        providerController.current?.abort();
        resetBooking();
        setActiveClinicTab('salbar');
        setBranches([]);
        setProviders([]);
        setProducts([]);
        setBranchError('');
        setProviderError('');
        setProductError('');
        setIsLoadingBranches(false);
        setIsLoadingProviders(false);
        setIsLoadingProducts(false);

        if (!clinicId) {
            setTenant(null);
            setIsLoadingTenant(false);
            setTenantError('');
            return undefined;
        }

        setSelectedClinic({ id: clinicId, name: '' });
        const controller = new AbortController();
        setIsLoadingTenant(true);
        setIsLoadingBranches(true);
        setIsLoadingProducts(true);
        setTenantError('');

        getClinic(clinicId, { signal: controller.signal })
            .then((tenantData) => {
                if (requestId !== tenantRequestId.current) return;
                const normalizedClinic = normalizeClinicDetail(tenantData, clinicId);
                setTenant(normalizedClinic);
                setSelectedClinic({
                    id: normalizedClinic.id,
                    name: normalizedClinic.name,
                });
            })
            .catch((error) => {
                if (
                    error.name !== 'AbortError' &&
                    requestId === tenantRequestId.current
                ) {
                    setTenant(null);
                    setTenantError(error.message);
                }
            })
            .finally(() => {
                if (!controller.signal.aborted) {
                    setIsLoadingTenant(false);
                }
            });

        getClinicBranches(clinicId, { signal: controller.signal })
            .then((branchData) => {
                if (requestId !== tenantRequestId.current) return;
                const normalizedBranches = asList(branchData).map((branch) => normalizeBranch(branch, clinicId));
                setBranches(normalizedBranches);
            })
            .catch((error) => {
                if (
                    error.name !== 'AbortError' &&
                    requestId === tenantRequestId.current
                ) {
                    setBranches([]);
                    setBranchError(error.message);
                }
            })
            .finally(() => {
                if (
                    !controller.signal.aborted &&
                    requestId === tenantRequestId.current
                ) {
                    setIsLoadingBranches(false);
                }
            });

        getClinicProducts(clinicId, { signal: controller.signal })
            .then((productData) => {
                if (requestId !== tenantRequestId.current) return;
                setProducts(asList(productData).map(normalizeProduct));
            })
            .catch((error) => {
                if (
                    error.name !== 'AbortError' &&
                    requestId === tenantRequestId.current
                ) {
                    setProducts([]);
                    setProductError(error.message);
                }
            })
            .finally(() => {
                if (
                    !controller.signal.aborted &&
                    requestId === tenantRequestId.current
                ) {
                    setIsLoadingProducts(false);
                }
            });

        return () => controller.abort();
    }, [clinicId, reloadKey, resetBooking, setSelectedClinic]);

    useEffect(() => {
        if (!clinicId) return undefined;
        loadProviders(selectedBranch);
        return () => providerController.current?.abort();
    }, [clinicId, selectedBranch, reloadKey, loadProviders]);

    useEffect(() => () => providerController.current?.abort(), []);

    const clinic = tenant;

    const handleBookBranch = useCallback((branch) => {
        if (!branch) return;

        selectBranch(branch);
        setActiveClinicTab('doctor');
    }, [selectBranch]);

    // Таб бүрийн агуулгыг хоёр бүсэд хуваана:
    //   top    — бүтэн өргөн (салбар/үйлчилгээ/хаяг)
    //   railed — захиалгын рэйлтэй хослох (ЗӨВХӨН эмчийн жагсаалт)
    const reloadLists = useCallback(() => setReloadKey((value) => value + 1), []);

    const renderApiTabContent = () => {
        const apiDoctorList = (
            <DoctorSelector
                doctors={providers}
                isApiDriven
                isLoading={isLoadingBranches || isLoadingProviders}
                error={providerError}
                onRetry={() => loadProviders(selectedBranch)}
            />
        );

        if (activeClinicTab === 'about') {
            return { top: <ClinicAbout clinic={clinic} />, railed: null };
        }

        if (activeClinicTab === 'service') {
            return {
                top: (
                    <ServiceSelector
                        products={products}
                        isLoading={isLoadingProducts}
                        error={productError}
                        onRetry={reloadLists}
                    />
                ),
                railed: null,
            };
        }

        if (activeClinicTab === 'doctor') {
            return { top: null, railed: apiDoctorList };
        }

        if (activeClinicTab === 'location') {
            return {
                top: (
                    <LocationSelector
                        clinic={clinic}
                        branches={branches}
                        isLoading={isLoadingBranches}
                        error={branchError}
                        onRetry={() => setReloadKey((value) => value + 1)}
                        onBookBranch={handleBookBranch}
                    />
                ),
                railed: null,
            };
        }

        // 'salbar': салбарууд БҮТЭН өргөнөөр дээр, эмчийн жагсаалт доор нь рэйлтэй хамт.
        return {
            top: (
                <BranchSelector
                    branches={branches}
                    isLoading={isLoadingBranches}
                    error={branchError}
                    onRetry={() => setReloadKey((value) => value + 1)}
                />
            ),
            railed: <div className="border-t border-line-soft bg-surface">{apiDoctorList}</div>,
        };
    };


    const showBookingContent = Boolean(clinicId && clinic && !isLoadingTenant);

    // Захиалгын рэйл нь ЗӨВХӨН эмчийн жагсаалт дэлгэц дээр байхад утгатай.
    // API-driven 'salbar' таб нь BranchSelector + DoctorSelector хоёуланг рендэрлэдэг.
    const showRail = activeClinicTab === 'doctor' || activeClinicTab === 'salbar';

    const tabContent = showBookingContent
        ? renderApiTabContent()
        : { top: null, railed: null };

    return (
        <div className="min-h-screen bg-canvas pb-20 lg:pb-8">
            {!clinicId ? (
                <div className="mx-auto max-w-[900px] px-4 py-10 md:px-6">
                    <div className="tenant-detail-state mb-6">
                        Цаг авахын тулд эмнэлгээ сонгоно уу.
                    </div>
                    <SearchBar />
                </div>
            ) : null}

            {clinicId && isLoadingTenant ? (
                <div className="tenant-detail-state">Эмнэлгийн мэдээллийг уншиж байна...</div>
            ) : null}

            {clinicId && tenantError ? (
                <div className="tenant-detail-state tenant-detail-state--error" role="alert">
                    <span>{tenantError}</span>
                    <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
                        Дахин оролдох
                    </button>
                </div>
            ) : null}

            {clinicId && clinic && !isLoadingTenant ? (
                <ClinicProfile
                    clinic={clinic}
                    activeTab={activeClinicTab}
                    onTabChange={setActiveClinicTab}
                />
            ) : null}

            {showBookingContent ? (
                <BookingWorkspace
                    hasRail={showRail}
                    top={tabContent.top}
                    left={tabContent.railed}
                    rail={<BookingRail visible={showRail} />}
                />
            ) : null}

            {/* ===== Overlay-ууд =====
                Хоёулаа хуудасны төвшинд, ГАНЦ газраас, БҮХ таб/breakpoint дээр ҮРГЭЛЖ
                mount хэвээр рендэрлэгдэнэ (хаалттай үедээ өөрсдөө null буцаана).
                Нөхцөлтэйгээр рендэрлэвэл 409 алдааны дараа `step` болон формын
                өгөгдөл алдагдана. */}
            <TimeSlotModal />
            <BookingDetails
                products={products}
                isLoadingProducts={isLoadingProducts}
                productError={productError}
                onReloadLists={reloadLists}
            />
        </div>
    );
}
