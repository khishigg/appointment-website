const toFiniteNumber = (value) => {
    if (value === null || value === undefined || value === '') return null;

    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue : null;
};

const firstDefined = (...values) =>
    values.find((value) => value !== undefined && value !== null && value !== '');

const hasDisplayValue = (value) =>
    typeof value === 'string' ? value.trim().length > 0 : value !== null && value !== undefined;

export const getCoordinatePair = (value) => {
    if (!value || typeof value !== 'object') return null;

    const geo = value.geo ?? value.Geo ?? value.location ?? value.Location;
    const lat = toFiniteNumber(
        firstDefined(
            geo?.lat,
            geo?.Lat,
            geo?.latitude,
            geo?.Latitude,
            value.lat,
            value.Lat,
            value.latitude,
            value.Latitude
        )
    );
    const lng = toFiniteNumber(
        firstDefined(
            geo?.lng,
            geo?.Lng,
            geo?.lon,
            geo?.Lon,
            geo?.longitude,
            geo?.Longitude,
            value.lng,
            value.Lng,
            value.lon,
            value.Lon,
            value.longitude,
            value.Longitude
        )
    );

    if (lat === null || lng === null) return null;

    return { lat, lng };
};

const normalizeLocationItem = ({
    value,
    fallbackId,
    type,
    source,
}) => {
    const id = firstDefined(value?.id, value?.Id, value?.clinicNum, value?.ClinicNum, fallbackId);
    const name = firstDefined(value?.name, value?.Name, value?.displayName, value?.DisplayName, '');
    const address = [
        firstDefined(value?.address, value?.Address, ''),
        firstDefined(value?.address2, value?.Address2, ''),
        firstDefined(value?.city, value?.City, ''),
        firstDefined(value?.state, value?.State, ''),
        firstDefined(value?.zip, value?.Zip, ''),
    ].filter(hasDisplayValue).join(', ');
    const phone = firstDefined(
        value?.phone,
        value?.Phone,
        value?.phoneNumber,
        value?.PhoneNumber,
        ''
    );
    const position = getCoordinatePair(value);

    return {
        id,
        type,
        name: typeof name === 'string' ? name.trim() : name,
        address,
        phone,
        position,
        needsGeocoding: !position && hasDisplayValue(address),
        source: value ?? source,
    };
};

export const normalizeClinicLocation = (clinic) => {
    if (!clinic) return null;

    return normalizeLocationItem({
        value: clinic,
        fallbackId: 'clinic',
        type: 'clinic',
        source: clinic,
    });
};

export const normalizeBranchLocation = (branch) => {
    if (!branch) return null;

    return normalizeLocationItem({
        value: branch,
        fallbackId: firstDefined(branch.clinicNum, branch.ClinicNum, branch.id, branch.Id),
        type: 'branch',
        source: branch,
    });
};

const isUsableLocationItem = (item) =>
    Boolean(item) && (hasDisplayValue(item.name) || hasDisplayValue(item.address));

export const buildLocationItems = ({ clinic, branches = [] } = {}) => {
    const items = [];
    const clinicLocation = normalizeClinicLocation(clinic);

    if (isUsableLocationItem(clinicLocation)) {
        items.push(clinicLocation);
    }

    const branchList = Array.isArray(branches) ? branches : [];
    branchList
        .map(normalizeBranchLocation)
        .filter(isUsableLocationItem)
        .forEach((branchLocation) => items.push(branchLocation));

    return items;
};
