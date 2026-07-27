/**
 * BookingPage - clinic detail and booking flow.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import {
    ClinicProfile,
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
import { isAdminRole, useAuthStore } from '../store/AuthStore';
import { useBookingStore } from '../store/BookingStore';

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
    isAdminTenant: true,
});

const normalizeBranch = (branch, clinicId) => {
    const clinicNum = branch.clinicNum ?? branch.ClinicNum;
    const address = [
        branch.address ?? branch.Address,
        branch.address2 ?? branch.Address2,
        branch.city ?? branch.City,
        branch.state ?? branch.State,
        branch.zip ?? branch.Zip,
    ].filter(Boolean).join(', ');

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
    const role = useAuthStore((state) => state.role);
    const isAdmin = isAdminRole(role);
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

        if (!isAdmin || !clinicId) {
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
    }, [clinicId, isAdmin, reloadKey, resetBooking, setSelectedClinic]);

    useEffect(() => {
        if (!isAdmin || !clinicId) return undefined;
        loadProviders(selectedBranch);
        return () => providerController.current?.abort();
    }, [isAdmin, clinicId, selectedBranch, reloadKey, loadProviders]);

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
    const renderNonAdminTabContent = () => {
        if (activeClinicTab === 'service') {
            return { top: <ServiceSelector />, railed: null };
        }

        if (activeClinicTab === 'doctor') {
            return { top: null, railed: <DoctorSelector /> };
        }

        if (activeClinicTab === 'location') {
            return {
                top: <LocationSelector useMockData onBookBranch={handleBookBranch} />,
                railed: null,
            };
        }

        return { top: <BranchSelector />, railed: null };
    };

    const reloadLists = useCallback(() => setReloadKey((value) => value + 1), []);

    const renderAdminTabContent = () => {
        const adminDoctorList = (
            <DoctorSelector
                doctors={providers}
                isAdmin
                isLoading={isLoadingBranches || isLoadingProviders}
                error={providerError}
                onRetry={() => loadProviders(selectedBranch)}
            />
        );

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
            return { top: null, railed: adminDoctorList };
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
                    isAdmin
                    isLoading={isLoadingBranches}
                    error={branchError}
                    onRetry={() => setReloadKey((value) => value + 1)}
                />
            ),
            railed: <div className="border-t border-line-soft bg-surface">{adminDoctorList}</div>,
        };
    };

    // Non-admin нь mock өгөгдөлтэй тул үргэлж харагдана; admin нь эмнэлэг ачаалагдсаны дараа.
    const showBookingContent = !isAdmin || Boolean(clinicId && clinic && !isLoadingTenant);

    // Захиалгын рэйл нь ЗӨВХӨН эмчийн жагсаалт дэлгэц дээр байхад утгатай.
    // Admin-ийн 'salbar' таб нь BranchSelector + DoctorSelector хоёуланг рендэрлэдэг.
    const showRail = activeClinicTab === 'doctor' || (isAdmin && activeClinicTab === 'salbar');

    const tabContent = showBookingContent
        ? (isAdmin ? renderAdminTabContent() : renderNonAdminTabContent())
        : { top: null, railed: null };

    return (
        <div className="min-h-screen bg-canvas pb-20 lg:pb-8">
            {!isAdmin ? (
                <ClinicProfile
                    activeTab={activeClinicTab}
                    onTabChange={setActiveClinicTab}
                />
            ) : null}

            {isAdmin && !clinicId ? (
                <div className="tenant-detail-state">
                    Дэлгэрэнгүй харахын тулд нүүр хуудаснаас эмнэлэг сонгоно уу.
                </div>
            ) : null}

            {isAdmin && isLoadingTenant ? (
                <div className="tenant-detail-state">Эмнэлгийн мэдээллийг уншиж байна...</div>
            ) : null}

            {isAdmin && tenantError ? (
                <div className="tenant-detail-state tenant-detail-state--error" role="alert">
                    <span>{tenantError}</span>
                    <button type="button" onClick={() => setReloadKey((value) => value + 1)}>
                        Дахин оролдох
                    </button>
                </div>
            ) : null}

            {isAdmin && clinic && !isLoadingTenant ? (
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
                    rail={(
                        // BookingDetails-ийг ГАНЦ газарт төвлөрүүлэв (өмнө admin/non-admin
                        // салаа тус бүрд давхар байсан). BookingRail нь desktop дээр рэйл
                        // дотор, mobile/tablet дээр шууд дамжуулж рендэрлэнэ.
                        <BookingRail visible={showRail}>
                            <BookingDetails
                                {...(isAdmin ? {
                                    products,
                                    isLoadingProducts,
                                    productError,
                                    onReloadLists: reloadLists,
                                } : {})}
                            />
                        </BookingRail>
                    )}
                />
            ) : null}

            {/* Overlay — desktop дээр өөрөө null буцаана (тэнд рэйл эзэмшинэ) */}
            <TimeSlotModal />
        </div>
    );
}
