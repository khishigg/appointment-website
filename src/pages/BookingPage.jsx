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
} from '../components/booking';
import { getClinic, getClinicBranches, getBranchProviders, resolveClinicAssetUrl } from '../api/clinics';
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
        address: address || 'Хаягийн мэдээлэлгүй',
        phone: branch.phone ?? branch.Phone ?? '',
        isOpen: true,
    };
};

const normalizeProvider = (provider, clinicId, clinicNum) => {
    const provNum = provider.provNum ?? provider.ProvNum;
    const displayName =
        provider.displayName ??
        provider.DisplayName ??
        [
            provider.firstName ?? provider.FirstName,
            provider.lastName ?? provider.LastName,
        ].filter(Boolean).join(' ').trim();

    return {
        id: provNum,
        provNum,
        clinicId,
        clinicNum,
        name: displayName || `Provider #${provNum}`,
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
    const [isLoadingTenant, setIsLoadingTenant] = useState(false);
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingProviders, setIsLoadingProviders] = useState(false);
    const [tenantError, setTenantError] = useState('');
    const [branchError, setBranchError] = useState('');
    const [providerError, setProviderError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const selectedBranch = useBookingStore((state) => state.selectedBranch);
    const selectBranch = useBookingStore((state) => state.selectBranch);
    const resetBooking = useBookingStore((state) => state.resetBooking);
    const setSelectedClinic = useBookingStore((state) => state.setSelectedClinic);
    const tenantRequestId = useRef(0);
    const providerRequestId = useRef(0);
    const providerController = useRef(null);

    useEffect(() => {
        const requestId = ++tenantRequestId.current;
        providerRequestId.current += 1;
        providerController.current?.abort();
        resetBooking();
        setActiveClinicTab('salbar');
        setBranches([]);
        setProviders([]);
        setBranchError('');
        setProviderError('');
        setIsLoadingBranches(false);
        setIsLoadingProviders(false);

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
                setBranches(asList(branchData).map((branch) => normalizeBranch(branch, clinicId)));
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

        return () => controller.abort();
    }, [clinicId, isAdmin, reloadKey, resetBooking, setSelectedClinic]);

    const loadProviders = useCallback(async (branch) => {
        const requestId = ++providerRequestId.current;
        providerController.current?.abort();
        setProviders([]);
        setProviderError('');

        if (!branch || !clinicId) {
            setIsLoadingProviders(false);
            return;
        }

        const controller = new AbortController();
        providerController.current = controller;
        setIsLoadingProviders(true);

        try {
            const data = await getBranchProviders(
                clinicId,
                branch.clinicNum,
                { signal: controller.signal }
            );

            if (requestId !== providerRequestId.current) return;
            setProviders(asList(data).map((provider) => normalizeProvider(provider, clinicId, branch.clinicNum)));
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

    useEffect(() => () => providerController.current?.abort(), []);

    const clinic = tenant;

    const handleBookBranch = useCallback((branch) => {
        if (!branch) return;

        selectBranch(branch);
        if (isAdmin) {
            loadProviders(branch);
        }
        setActiveClinicTab('doctor');
    }, [isAdmin, loadProviders, selectBranch]);

    const renderNonAdminTabContent = () => {
        if (activeClinicTab === 'service') {
            return <ServiceSelector />;
        }

        if (activeClinicTab === 'doctor') {
            return <DoctorSelector />;
        }

        if (activeClinicTab === 'location') {
            return (
                <LocationSelector
                    useMockData
                    onBookBranch={handleBookBranch}
                />
            );
        }

        return <BranchSelector />;
    };

    const renderAdminTabContent = () => {
        if (activeClinicTab === 'service') {
            return <ServiceSelector />;
        }

        if (activeClinicTab === 'doctor') {
            return (
                <DoctorSelector
                    doctors={providers}
                    isAdmin
                    isLoading={isLoadingProviders}
                    error={providerError}
                    onRetry={() => loadProviders(selectedBranch)}
                />
            );
        }

        if (activeClinicTab === 'location') {
            return (
                <LocationSelector
                    clinic={clinic}
                    branches={branches}
                    isLoading={isLoadingBranches}
                    error={branchError}
                    onRetry={() => setReloadKey((value) => value + 1)}
                    onBookBranch={handleBookBranch}
                />
            );
        }

        return (
            <BranchSelector
                branches={branches}
                isAdmin
                isLoading={isLoadingBranches}
                error={branchError}
                onRetry={() => setReloadKey((value) => value + 1)}
                onBranchChange={loadProviders}
            />
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
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

            {!isAdmin ? (
                <>
                    <div className="h-2 bg-gray-50" />
                    {renderNonAdminTabContent()}
                    <BookingDetails />
                </>
            ) : null}

            {isAdmin && clinicId && clinic && !isLoadingTenant ? (
                <>
                    <div className="h-2 bg-gray-50" />
                    {renderAdminTabContent()}
                    <BookingDetails />
                </>
            ) : null}
        </div>
    );
}
