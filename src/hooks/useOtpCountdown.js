import { useEffect, useMemo, useState } from 'react';

const getRemainingSeconds = (expiresAt) => {
    const expiresAtMs = Date.parse(expiresAt || '');
    if (!Number.isFinite(expiresAtMs)) return null;

    return Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
};

/**
 * Derives remaining time from the backend's absolute expiry timestamp.
 * Recalculating from Date.now() prevents the UI timer from drifting while a
 * browser tab is backgrounded.
 */
export default function useOtpCountdown(expiresAt) {
    const expiryKey = useMemo(() => expiresAt || '', [expiresAt]);
    const [remainingSeconds, setRemainingSeconds] = useState(() => getRemainingSeconds(expiryKey));

    useEffect(() => {
        const updateRemainingTime = () => setRemainingSeconds(getRemainingSeconds(expiryKey));

        updateRemainingTime();
        if (!expiryKey) return undefined;

        const intervalId = window.setInterval(updateRemainingTime, 1000);
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') updateRemainingTime();
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [expiryKey]);

    return remainingSeconds;
}
