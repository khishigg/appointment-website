# Ashid Booking — FE Design Value Audit

> Scope: `src/**` — **37 `.jsx` + 11 `.js` + 4 `.css`**. Read-only тооллого (grep).
> Зорилго: эцсийн design token систем зохиоход хэрэгтэй бодит утгын давтамж.
> ⚠️ Стек нь TypeScript биш — `.tsx` файл **байхгүй**, бүхэлдээ JSX/JS.

---

## 1. Хураангуй тоо

| Хэмжүүр | Тоо |
|---|---:|
| Arbitrary value (`x-[...]`) нийт (jsx+js) | **93** |
| Hardcoded hex (`#...`) | **341** |
| `rgb()/rgba()` | **158** |
| `hsl()` | **12** |
| Нийт өнгөний литерал | **~511** |
| CSS дэх ялгаатай `box-shadow` | **53** |
| CSS дэх ялгаатай `border-radius` утга | **21** |
| Одоо ашиглагдаж буй жинхэнэ token utility | **~14** |
| Dark mode ул мөр (`dark:`, `prefers-color-scheme`) | **0** |
| `focus-visible:` | **0** |
| `prefers-reduced-motion` | **0** |

**Гол дүгнэлт:** өнгө болон arbitrary утгууд бүхэлдээ тарамдсан; token давхарга үүссэн ч
**coverage маш бага (<10%)**. Neutral палитр (gray/slate) холилдсон, focus/disabled
тогтворгүй, dark mode-д огт бэлдээгүй.

---

## 2. Arbitrary values (93) — ангиллаар

| Утга | Давтамж | Гол файлууд | Санал token |
|---|---:|---|---|
| `text-[13px]` | 8 | DoctorSelector, ServiceCard | `text-body-sm` (13→14?) |
| `text-[14px]` | 7 | DoctorSelector, TimeSlotModal | `text-body` |
| `text-[12px]` | 5 | DoctorSelector, TimeSlotModal | `text-caption` |
| `text-[10px]` | 5 | TimeSlotModal, InfoCell | `text-label` (10→11) |
| `text-[11px]` | 4 | ServiceCard, SummaryHeader | `text-label` |
| `text-[20px]`, `[21/22/16/15/17px]` | 1 бүр | Home, DoctorSelector | `text-title/body` рүү нэгтгэ |
| `z-[9999]` | 3 | BookingDetails, TimeSlotModal, MapModal | `--z-modal` |
| `z-[1000]` | 2 | ClinicProfile | `--z-sticky` |
| `shadow-[0_10px_24px_rgba(15,23,42,0.06)]` | 3 | BranchSelector, Location | `--shadow-overlay` |
| `shadow-[0_8px_22px_rgba(15,23,42,0.055)]` | 1 | Location | `--shadow-overlay` |
| `rounded-[14px]` | 3 | Location, Branch | `radius-panel` (→16) |
| `rounded-[10px]` | 3 | ui/Input, бусад | `radius-control` |
| `rounded-[16px]` | 1 | — | `radius-panel` |
| `bg-[#E31837]` / `bg-[#00A651]` | 3 бүр | BookingStepContent (payment mock) | brand tokens (доор) |
| `bg-[#FFF200]` / `bg-[#007AFF]` / `bg-[#FFFFFF]` | 1–2 | TimeSlot, DoctorSelector | palette руу |
| `active:scale-[0.98]` | 3 | товчнууд | motion pattern (үлдэнэ) |
| `tracking-[-0.02em]` | 2 | гарчиг | `--text-display--letter-spacing` |
| `h-[154px]`, `h-[95px]`, `min-w-[105px]`, `w-[200px]`, `min-h-[108/130px]`, `max-w-[190px]` | 1–2 | Doctor, Location, Branch | зохиц хэмжээ — token БУС (layout) |
| `focus:shadow-[0_0_0_4px_rgba(...)]` | 2 | Home input | `--shadow-focus` |
| `backdrop-blur-[3px]` | 2 | modal overlay | pattern |

**Файлаар (arbitrary хамгийн их):** LocationSelector 23 · DoctorSelector 16 ·
BookingStepContent 16 · TimeSlotModal 11 · BranchSelector 10 · MapDiscoveryModal 4 ·
ServiceCard 3 · BookingDetails 3.

---

## 3. Hardcoded өнгө

**Top hex (бүх src):** `#ffffff`×33, `#fff`×22, `#1a1a1a`×15, `#0e7490`×13 (login cyan),
`#64748b`×10 (slate-500), `#00a8ff`×10, `#0f172a`×9 (slate-900), `#4facfe`×7, `#e31837`×6,
`#0d6efd`×6, `#00a651`×6, `#007bff`×6, `#e2e8f0`×5 (slate-200), `#b91c1c`×5 (red-700),
`#94a3b8`×4 (slate-400), `#111827`×4 (gray-900), `#f1f5f9`×4 (slate-100).

**Booking компонент доторх hex:** `#1a1a1a`×13 (QR mock SVG), `#e31837`×6 / `#00a651`×6 /
`#c4142e` / `#008c44` (QPay/SocialPay mock), `#fff200` (slot шар), `#0f5d8c`, `#0f172a`.

**Top rgba:** `rgba(0,0,0,0.1)`×13, `0.05`×12, `0.08`×8, `0.04`×6, `0.02`×6 — сүүдэрт
хэрэглэсэн, өнгө нь **бүгд хар (0,0,0)** ба **slate (15,23,42)** хоёр өөр суурьтай.

**Зөрчил:** дор хаяж **6 өөр "primary" цэнхэр** — `#00a8ff`, `#0d6efd`, `#007bff`,
`#007aff`, `#0e7490`, `#4facfe` — home/login хооронд тогтворгүй. Нэмээд amber
`--primary-500 #FFF000` ба booking-ийн gray-900. **3+ өрсөлдөгч "primary" өнгө.**

---

## 4. Typography — size × weight × line-height

**Sizes (Tailwind scale):** `text-sm`×29, `text-xs`×16, `text-base`×6, `text-xl`×3,
`text-lg`×3, `text-2xl`×1. **Arbitrary px:** 13(×8),14(×7),12(×5),10(×5),11(×4),20(×2)
+ 22/21/17/16/15(×1). → **~11 ялгаатай px хэмжээ.**

**Weight:** `font-semibold`×32, `font-medium`×30, `font-bold`×12, `font-normal`×1.
**Line-height:** `leading-5`×9, `leading-tight`×6, `leading-snug`×4, `leading-normal`×2,
`leading-relaxed`×1, `leading-4`×1. **Tracking:** `tracking-wide`×4, `tracking-tight`×1,
`tracking-[-0.02em]`×2.

**Дүгнэлт:** ~11 size × 4 weight × 6 line-height → **олон арван түр хослол**.
6 шат (display/title/body/body-sm/caption/label) болгож нэгтгэх боломжтой.

---

## 5. Spacing (Tailwind default, 4px base)

| Утга | Давтамж |
|---|---:|
| `gap-2` (8px) | 21 |
| `p-4` (16px) | 17 |
| `gap-3` (12px) | 11 |
| `gap-4` (16px) | 6 |
| `gap-1.5` (6px) | 5 |
| `gap-1` (4px) | 5 |
| `p-3` (12px) | 5 |
| `gap-2.5` (10px) | 2 |
| `p-2` (8px), `p-1` (4px) | 2 бүр |

**Off-grid:** `gap-[14px]`×1 (booking), `gap-1.5`/`gap-2.5` (6/10px). Tailwind-ийн дефолт
spacing аль хэдийн 4px суурьтай тул **шинэ spacing token шаардлагагүй** — зөвхөн
custom `--spacing-card` (14px)-ийг устгаж `gap-4` (16px) руу нэгтгэнэ.

---

## 6. Shadow / Elevation

**JSX Tailwind scale:** `shadow-sm`×18, `shadow`×9, `shadow-lg`×6, `shadow-md`×5,
`shadow-2xl`×2, `shadow-none`×2. **Arbitrary:** `0_10px_24px_rgba(15,23,42,.06)`×3,
`0_8px_22px_...055`×1, focus `0_0_0_4px_...`×2, card `0_6px_18px_...045`×1.

**CSS:** **53 ялгаатай `box-shadow`** — scale огт байхгүй, файл болгонд өөр.
Санал: 4 шат (`xs / card / overlay / modal`), бүгд slate-900 rgb-ээс.

---

## 7. State стиль

| Variant | Тоо | Тэмдэглэл |
|---|---:|---|
| `hover:` | 37 | тархай, тогтмол дүрэмгүй |
| `focus:` | 15 | **зөвхөн 4 нь ring** (`focus:ring-2 focus:ring-gray-900 focus:border-transparent`) — form input дээр л |
| `focus-visible:` | **0** | ❌ ашиглаагүй — keyboard focus стандарт алга |
| `active:` | 8 | `active:scale-[0.98]` голдуу |
| `disabled:` | **1** | зөвхөн `disabled:opacity-50` (Буцах товч) |
| `group-hover:` | 4 | payment mock |
| `aria-*` | 27 | ихэвчлэн `aria-label/expanded/checked` |

**Focus:** input дээр л ring бий, **товчнуудад focus ring БАЙХГҮЙ** → a11y цоорхой.
**Disabled:** primary товч `disabled:` биш, нөхцөлт класс (`bg-gray-200 text-gray-400`)-аар
илэрхийлдэг → тогтворгүй. → `--color-focus`, `--color-disabled-*` token шаардлагатай.

---

## 8. Motion

**JSX:** `transition`×23, `transition-all`×20, `transition-colors`×16,
`transition-transform`×2. `duration-200`×3, `duration-300`×2. `ease-*` **0** (framer-motion
нь JS-ээр easing хийдэг). **CSS:** `0.3s`×25, `160ms`×13, `0.2s`×11, `0.25s`×9, `0.6s`×5,
`0.5s`×4, `240ms`×3 — **тогтворгүй duration**. `@keyframes fadeIn` **5 удаа давхардаж**
тодорхойлогдсон, `scroll` 2 удаа. `prefers-reduced-motion` **0**.

Санал: `--duration-fast/base/slow` (150/200/300), `--ease-out/in-out`, reduced-motion заавар.

---

## 9. Z-index

`z-[9999]`×3 (modal/sheet: BookingDetails, TimeSlotModal, MapModal), `z-[1000]`×2
(ClinicProfile sticky), `z-30`×3 / `z-20`×2 / `z-10`×2 / `z-40`×1 (modal доторх sticky
header/footer). → scale: `--z-sticky / --z-overlay / --z-modal / --z-toast`.

---

## 10. Компонентын инвентар

| Төрөл | Файл / эх сурвалж |
|---|---|
| **Card** | `booking/ServiceCard.jsx`, `booking/DoctorSelector.jsx` (эмч), `booking/BranchSelector.jsx`, `booking/LocationSelector.jsx`, `booking/ClinicProfile.jsx`; CSS: `.doctor-card`, `.branch-card`, `.feature-card`, `.appointment-card`, `.logo-card`, `.feature-card-minimal` |
| **Button** | `booking/BookingDetails.jsx` (primary/secondary), олон компонент inline; CSS: `.btn-gradient`, `.login-submit`, `.tab-btn` |
| **Input** | `components/ui/Input.jsx`, `booking/BookingStepContent.jsx` (form), `SearchBar.jsx`; CSS: `.search-modal-input`, `.login-input-shell`, `.auth-form .form-control` |
| **Modal / Sheet** | `booking/BookingDetails.jsx` (bottom sheet), `booking/TimeSlotModal.jsx` (bottom sheet), `MapDiscoveryModal.jsx`; CSS: `.search-modal-container` |
| **Chip / Pill** | CSS `.search-modal-chip`, `.default-pill`; `booking/DoctorSelector.jsx` (боломжит цаг) |
| **Badge** | CSS `.status-badge`; ServiceCard duration/price pill |
| **Toast** | ❌ байхгүй |
| **Skeleton** | ❌ байхгүй (loading = "…уншиж байна" текст) |

**Pages:** BookingPage, CalendarPage, Home, Login, RegisterPage.

---

## 11. Token coverage

**Жинхэнэ ашиглагдсан token utility (~14):**
`rounded-control`×8, `gap-card`×2, `rounded-card`×1, `rounded-panel`×1, `shadow-card`×1,
`text-label`×1.

**Семантик өнгөний token (`surface/canvas/ink/muted/…`): компонентод ~0** — тодорхойлсон
хэдий ч огт хэрэглээгүй.

**Coverage тооцоо:**
- Booking компонент дотор: ~14 adopted / (14 + ~40 arbitrary + ~34 booking hex) ≈ **~16%**
- Codebase даяар (511 өнгө + 93 arbitrary орсон): **< 5%**

---

## 12. Зөрчил / зөрүү (эцсийн систем заавал шийднэ)

1. **Neutral палитр 2 салаа:** gray (`#111827/#1f2937/#f9fafb`) vs slate
   (`#1e293b/#64748b/#94a3b8/#e2e8f0/#f1f5f9`) — ижил үүрэгт хоёр ramp.
2. **"Primary" 3+ өрсөлдөгч:** cyan `#0e7490`, олон цэнхэр (`#00a8ff/#0d6efd/#007bff`),
   amber `#FFF000`, booking gray-900.
3. **Radius олон утга:** JSX 10/14/16/20px + CSS 6/8/9/10/12/14/16/20/24/28/32px + pill
   (999/100/99/50px) — ижил зорилготой олон радиус.
4. **Shadow scale алга:** 53 ялгаатай CSS + 4 arbitrary JSX; суурь өнгө нь `rgba(0,0,0)`
   ба `rgba(15,23,42)` хоёр өөр.
5. **Focus тогтворгүй:** зөвхөн input, товч focus-гүй, `focus-visible` 0.
6. **Disabled тогтворгүй:** `disabled:opacity-50` vs нөхцөлт класс.
7. **`@keyframes fadeIn` 5 удаа давхардсан.**
8. **Contrast fail:** `#94a3b8` (slate-400) ~2.9:1, `#ef4444` (red-500) ~3.76:1 —
   текстэд AA (4.5:1) унана.
9. **Dark mode бэлтгэлгүй:** semantic давхарга байхгүй тул theme солих боломжгүй.
