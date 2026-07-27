# Ashid Booking — Token Migration

Магик тоо → token руу шилжих төлөвлөгөө. Токен: [`src/styles/tokens.css`](src/styles/tokens.css),
лавлах: [`src/styles/TOKENS.md`](src/styles/TOKENS.md), аудит: [`audit.md`](audit.md).

> **Дараалал:** давтамж багатай эрсдэл багатайгаас биш — **эвдэрсэн зүйлээс** эхэл (Phase 0),
> дараа нь автоматжуулж болох (Phase 1), дараа нь гараар шалгах (Phase 2–3).
> Алхам бүрийн дараа: `npm run build && npm run lint`, дараа нь 375px preview.

---

## Phase 0 — ЭВДРЭЛ ЗАСАХ (яаралтай)

`--spacing-card` устсан тул **`gap-card` одоо ажиллахгүй** (зай алдагдсан). 2 газар:

| Файл | Мөр | Хуучин | Шинэ |
|---|---|---|---|
| `src/components/booking/ServiceSelector.jsx` | картын жагсаалт | `gap-card` | `gap-4` |
| `src/components/booking/BookingStepContent.jsx` | step 1 radiogroup | `gap-card` | `gap-4` |

```bash
grep -rl 'gap-card' src --include=*.jsx | xargs sed -i 's/\bgap-card\b/gap-4/g'
```

---

## Phase 1 — Автомат солилт (arbitrary → token, эрсдэл бага)

Доорх утгууд **нэг утгатай** тул sed-ээр аюулгүй. Git Bash:

```bash
FILES=$(find src \( -name '*.jsx' -o -name '*.js' \))
echo "$FILES" | xargs sed -i \
  -e 's/rounded-\[10px\]/rounded-control/g' \
  -e 's/rounded-\[20px\]/rounded-card/g' \
  -e 's/rounded-\[14px\]/rounded-panel/g' \
  -e 's/rounded-\[16px\]/rounded-panel/g' \
  -e 's/shadow-\[0_6px_18px_rgba(15,23,42,0.045)\]/shadow-card/g' \
  -e 's/shadow-\[0_10px_24px_rgba(15,23,42,0.06)\]/shadow-overlay/g' \
  -e 's/shadow-\[0_8px_22px_rgba(15,23,42,0.055)\]/shadow-overlay/g' \
  -e 's/text-\[10px\]/text-label/g' \
  -e 's/text-\[11px\]/text-label/g' \
  -e 's/text-\[13px\]/text-body-sm/g' \
  -e 's/text-\[12px\]/text-caption/g' \
  -e 's/z-\[9999\]/z-[var(--z-modal)]/g' \
  -e 's/z-\[1000\]/z-[var(--z-sticky)]/g'
```

**Хамрах:** `rounded-[10px]`×3, `rounded-[14px]`×3, `rounded-[20px]`, `rounded-[16px]`,
`shadow-[…045/06/055]`×5, `text-[10/11/12/13px]`×22, `z-[9999]`×3, `z-[1000]`×2.

> ⚠️ `text-[14px]` (×7)-ийг Phase 1-д БҮҮ автоматжуул — `text-body` нь line-height/weight-ийг
> хамт тавьдаг тул зэрэгцээх `leading-*`/`font-*`-тэй мөрөнд гараар шалга (Phase 2).

**Дараа нь:** `npm run build` — `text-label/caption/body-sm`, `rounded-*`, `shadow-*` эдгээр
utility одоо **бодитоор үүснэ** (JIT). Preview-д радиус/сүүдэр хэвээр эсэхийг шалга.

---

## Phase 2 — Гараар шалгах (утга/context хамаарна)

### 2a. Өнгө (semantic санаа тодорхойлно — sed эрсдэлтэй)

Файл бүрд TOKENS.md-ийн "Магик тоо→Token" өнгөний хүснэгтийг мөрдөж, **контекстээр** сонго:
- Текст үү? → `text-ink` (үндсэн) / `text-heading` (гарчиг) / `text-muted` (хоёрдогч).
- Хүрээ юу? → `border-line` / `border-line-soft`.
- Дэвсгэр үү? → `bg-surface` / `bg-canvas` / `bg-primary`.
- **`slate-400`/`gray-400`-ийг текстэд ашигласан бол** → `text-muted` (slate-500) руу
  **өсгө** (contrast засвар), icon/хүрээ бол `text-faint`/`border-line`.

Тэргүүлэх файлууд (arbitrary + hex хамгийн их):

| Файл | Гол ажил |
|---|---|
| `src/components/booking/LocationSelector.jsx` (23) | arbitrary radius/shadow (Phase 1 хамрана) + `text-slate-*`/`border-slate-*` → token |
| `src/components/booking/DoctorSelector.jsx` (16) | `text-[13/14px]`→`text-body-sm/body`, `text-gray-*`→`text-ink/muted`, amber accent (доор) |
| `src/components/booking/BookingStepContent.jsx` (16) | payment mock (доор), form input өнгө, `text-gray-*`→token |
| `src/components/booking/TimeSlotModal.jsx` (11) | `text-[12/14px]`, `#FFF200` slot (доор), `text-gray-*` |
| `src/components/booking/BranchSelector.jsx` (10) | radius/shadow (Phase 1) + өнгө |
| `src/components/booking/ServiceCard.jsx` | `text-slate-800`→`text-heading`, `text-slate-400`→`text-faint`, `bg-slate-50` pill→`bg-canvas` |
| `src/components/booking/BookingDetails.jsx` | `bg-gray-900`→`bg-primary`, `text-gray-700`→`text-ink`, border→`border-line` |
| `src/components/booking/SummaryHeader.jsx` | `text-slate-900`→`text-ink`, `text-slate-500`→`text-muted`, icon→`text-faint` |

### 2b. Typography (weight/leading давхцлыг шалга)

`text-[14px]`, `text-sm`, `text-lg`, `text-xl`, `text-2xl` → `text-body`/`text-title`/`text-display`.
Token нь **size + weight + line-height** гурвыг тавьдаг тул зэрэгцээ байгаа `font-*`/`leading-*`-ийг
шалга: хэрэв илүүц бол хас, зөрчилдвөл token-ийн дараа бичсэн utility давамгайлна.

### 2c. Хамрах хүрээнээс ГАДУУР (одоо бүү хөндөх — тусад нь шийднэ)

- **Payment mock** (`BookingStepContent.jsx` step 3): `bg-[#E31837]` QPay, `bg-[#00A651]`
  SocialPay, `#1a1a1a` QR, `#FFF200` — comment-д/mock тул үлдээ.
- **Doctor/TimeSlot amber accent** (`text-amber-*`, `#FFF200` slot) — brand шийдвэр
  шаардана; одоогийн систем зөвхөн neutral+feedback. Тусдаа brand-accent token болгоно.
- **Legacy home/login** (`index.css`, `Home.jsx`, `Login.jsx`): олон цэнхэр/cyan/amber —
  өөрийн brand identity-тэй, энэ neutral системд хамаарахгүй. Дараагийн үе шат.

---

## Phase 3 — State токен нэвтрүүлэх (a11y цоорхой хаах)

Аудитаас: `focus-visible` 0, товч focus-ring-гүй, disabled тогтворгүй.

1. **Focus (бүх интерактив элемент):** товч/карт/chip-д нэм:
   ```
   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2
   ```
   (эсвэл `focus-visible:shadow-focus`). Form input дээрх `focus:ring-gray-900`-ийг
   `focus-visible:ring-focus` болго.
2. **Disabled (primary товч):** нөхцөлт `bg-gray-200 text-gray-400`-ийн оронд
   `disabled:bg-disabled-bg disabled:text-disabled-text disabled:opacity-[var(--opacity-disabled)]`.
3. **Selected (ServiceCard):** `border-gray-900 bg-gray-50` → `border-selected-border bg-selected-bg`.
4. **Hover мөр** (эмч/салбар мөр): `hover:bg-gray-50` → `hover:bg-hover-surface`.

---

## Гараар шалгах ёстой тохиолдол (sed-д БҮҮ оруул)

- `rounded-xl`/`rounded-2xl` → `rounded-panel`: 12/16px→16px, зарим нь жижиг элемент —
  тус бүрд нүдээр шалга.
- `shadow-sm`/`shadow-md`/`shadow-lg` → elevation шат: өндрийн санаагаар (карт/overlay/modal)
  гараар сонго.
- Бүх `#hex`, `rgb()/rgba()`: context-ээр (текст/хүрээ/дэвсгэр) шийднэ.
- `text-base` (16px): body уу, title уу — тус бүрд.

---

## Батлах (алхам бүрийн дараа)

```bash
npm run build   # utility үүссэн, алдаагүй
npm run lint    # цэвэр
```
Дараа нь **375px mobile preview**: booking overlay (карт зай, сонголт, form радиус),
баталгаажилт (өнгө/сүүдэр), доод бар. Токен солилт нь **зөвхөн presentational** тул зан
төлөв өөрчлөгдөх ёсгүй — зөвхөн харагдац токенд нийцнэ.
```
