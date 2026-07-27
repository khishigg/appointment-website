import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Breakpoint утгууд Tailwind-ийн дефолттой ЯГ таарна (md=768, lg=1024).
 * Tailwind-д `--breakpoint-*` дарж бичээгүй тул эдгээр хүчинтэй.
 * Хэрэв Tailwind-ийн breakpoint өөрчлөгдвөл ЭНД мөн зэрэг өөрчилнө.
 */
const MD = 768;
const LG = 1024;

/**
 * matchMedia-г React-ийн гадаад эх сурвалж болгож уншина.
 *
 * useEffect биш useSyncExternalStore ашигласан шалтгаан: эхний рендэрт аль хэдийн
 * зөв утга буцаана. useEffect-тэй бол эхний фрэйм "mobile" гэж рендэрлээд дараа нь
 * үсэрдэг (layout flash) — bottom sheet богино хугацаанд гарч ирээд алга болно.
 */
export function useMediaQuery(query) {
    const mql = useMemo(
        () => (typeof window === 'undefined' ? null : window.matchMedia(query)),
        [query]
    );

    const subscribe = useCallback(
        (onStoreChange) => {
            if (!mql) return () => {};
            mql.addEventListener('change', onStoreChange);
            return () => mql.removeEventListener('change', onStoreChange);
        },
        [mql]
    );

    const getSnapshot = useCallback(() => (mql ? mql.matches : false), [mql]);
    // SSR байхгүй (цэвэр Vite SPA) ч hook-ийн гэрээг бүрэн байлгав.
    const getServerSnapshot = useCallback(() => false, []);

    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/**
 * Booking урсгалын layout горим.
 *
 *  'mobile'  (<768px)      — bottom sheet, нэг багана
 *  'tablet'  (768–1023px)  — төвлөрсөн dialog, өргөтгөсөн нэг багана
 *  'desktop' (≥1024px)     — overlay огт байхгүй, баруун талын inline рэйл
 *
 * ЗӨВХӨН байрлалын шийдвэрт (юу хаана mount хийгдэх) ашиглана.
 * Харагдац (grid, зай, фонт) нь Tailwind-ийн `md:`/`lg:` утилитигаар шийдэгдэнэ.
 */
export function useBookingLayout() {
    const isMd = useMediaQuery(`(min-width: ${MD}px)`);
    const isLg = useMediaQuery(`(min-width: ${LG}px)`);

    if (isLg) return 'desktop';
    if (isMd) return 'tablet';
    return 'mobile';
}
