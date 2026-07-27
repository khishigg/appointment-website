# Ashid Booking — Design Tokens

3-давхаргат систем. Эх файл: [`tokens.css`](./tokens.css). Аудит: [`audit.md`](../../audit.md).
Шилжилт: [`MIGRATION.md`](../../MIGRATION.md).

- **LAYER 1 · PRIMITIVE** (`--slate-900`, `--red-500`…) — түүхий hex. **Компонентод бүү хэрэглэ.**
- **LAYER 2 · SEMANTIC** (`--color-ink`, `--radius-card`…) — үүрэг. **Үүнийг л хэрэглэ.**
- **LAYER 3 · COMPONENT** — одоогоор байхгүй (шаардлага гарвал нэмнэ).

Neutral палитр = **Slate** (gray ramp-ыг устгав — booking аль хэдийн slate ашигладаг байсан).

---

## Хэрэглэх 2 арга

```jsx
// 1) Tailwind utility (JSX-д — ЭНЭ НЬ ГОЛ АРГА)
<button className="bg-primary text-primary-text rounded-control shadow-card">

// 2) var() (custom CSS-д)
.thing { background: var(--color-surface); border-radius: var(--radius-card); }
```

var()-only токенууд (z-index, motion — utility үүсгэдэггүй) arbitrary-аар:
```jsx
<div className="z-[var(--z-modal)] duration-[var(--duration-base)] ease-[var(--ease-emphasized)]">
```

---

## Color — Contrast (цагаан дэвсгэр дээр, WCAG AA)

| Token | Primitive | Utility | Харьцаа | Хэрэглээ | ⛔ БҮҮ |
|---|---|---|---:|---|---|
| `--color-ink` | slate-900 | `text-ink` | 17.9:1 ✓AAA | Үндсэн текст | — |
| `--color-heading` | slate-800 | `text-heading` | 14.5:1 ✓AAA | Гарчиг, карт нэр | — |
| `--color-muted` | slate-500 | `text-muted` | 4.8:1 ✓AA | Хоёрдогч текст | — |
| `--color-faint` | slate-400 | `text-faint` | **2.9:1 ✗** | Icon, placeholder, чимэглэл | **Текст** |
| `--color-line` | slate-200 | `border-line` | — | Хүрээ | текст/icon |
| `--color-line-soft` | slate-100 | `border-line-soft` | — | Хуваагч | текст/icon |
| `--color-surface` | white | `bg-surface` | — | Карт/sheet дэвсгэр | — |
| `--color-canvas` | slate-50 | `bg-canvas` | — | Хуудасны дэвсгэр | — |
| `--color-primary` | slate-900 | `bg-primary` | — | Товчны дэвсгэр | текстэд шууд |
| `--color-primary-hover` | slate-800 | `hover:bg-primary-hover` | — | Товч hover | — |
| `--color-primary-text` | white | `text-primary-text` | 17.9:1 ✓ | primary дээрх текст | цагаан дэвсгэр |
| `--color-danger` | red-500 | `text-danger`/`bg-danger` | **3.8:1** | Icon/UI зааг | **Текст** |
| `--color-danger-surface` | red-50 | `bg-danger-surface` | — | Алдааны дэвсгэр | — |
| `--color-danger-text` | red-700 | `text-danger-text` | 6.3:1 ✓AA | Алдааны текст | — |
| `--color-success` | green-600 | `text-success`/`bg-success` | 3.3:1 | Icon/UI (том) | **Жижиг текст** |
| `--color-success-surface` | green-50 | `bg-success-surface` | — | Амжилтын дэвсгэр | — |
| `--color-success-text` | green-700 | `text-success-text` | 4.9:1 ✓AA | Амжилтын текст | — |
| `--color-warning` | amber-600 | `text-warning`/`bg-warning` | 3.4:1 | Icon/UI | **Жижиг текст** |
| `--color-warning-surface` | amber-50 | `bg-warning-surface` | — | Анхаарлын дэвсгэр | — |
| `--color-warning-text` | amber-700 | `text-warning-text` | 5.0:1 ✓AA | Анхаарлын текст | — |
| `--color-info` | blue-600 | `text-info`/`bg-info` | 5.2:1 ✓AA | Icon/UI/текст | — |
| `--color-info-surface` | blue-50 | `bg-info-surface` | — | Мэдээллийн дэвсгэр | — |
| `--color-info-text` | blue-700 | `text-info-text` | 6.3:1 ✓AA | Мэдээллийн текст | — |
| `--color-focus` | slate-900 | `ring-focus` | — | Focus ring | — |
| `--color-selected-bg` | slate-50 | — | — | Сонгосон карт/chip дэвсгэр | — |
| `--color-selected-border` | slate-900 | — | — | Сонгосон карт/chip хүрээ | — |
| `--color-disabled-bg` | slate-200 | `disabled:bg-disabled-bg` | — | Идэвхгүй товч | — |
| `--color-disabled-text` | slate-400 | `disabled:text-disabled-text` | 2.9:1 (зорилготой) | Идэвхгүй текст | — |

### ⛔ ХЭЗЭЭ Ч текстэд бүү ашигла (contrast унана)
`text-faint` (slate-400), `text-danger` (red-500), `text-success`/`text-warning` (жижиг текст).
Эдгээр нь **icon / хүрээ / том UI элемент**-д зориулагдсан. Текстэд `-text` хувилбарыг нь
ашигла (`text-danger-text`, `text-success-text`…).

---

## Radius / Elevation / Type

| Token | Утга | Utility | Хэрэглээ |
|---|---|---|---|
| `--radius-control` | 10px | `rounded-control` | input, товч |
| `--radius-panel` | 16px | `rounded-panel` | панель, alert |
| `--radius-card` | 20px | `rounded-card` | карт |
| `--radius-pill` | 9999px | `rounded-pill` | pill, chip, avatar |
| `--shadow-xs` | 0 1px 2px /.05 | `shadow-xs` | нарийн зааг |
| `--shadow-card` | 0 6px 18px /.05 | `shadow-card` | тайван карт |
| `--shadow-overlay` | 0 10px 24px /.08 | `shadow-overlay` | dropdown, popover |
| `--shadow-modal` | 0 24px 48px /.18 | `shadow-modal` | dialog, sheet |
| `--shadow-focus` | 0 0 0 4px /.10 | `shadow-focus` | focus гэрэлтүүлэг |
| `--text-display` | 24/700/1.15 | `text-display` | hero гарчиг |
| `--text-title` | 18/600/1.25 | `text-title` | section/карт гарчиг |
| `--text-body` | 14/400/1.5 | `text-body` | үндсэн текст |
| `--text-body-sm` | 13/400/1.45 | `text-body-sm` | meta |
| `--text-caption` | 12/400/1.4 | `text-caption` | жижиг тайлбар |
| `--text-label` | 11/600/1.3 | `text-label` | uppercase label |

**Spacing:** тусгай token байхгүй — Tailwind-ийн дефолт **4px scale** (`gap-2`=8, `p-4`=16…)
шууд хэрэглэ. `--spacing-card`-ыг устгав (утгагүй `w-card` utility үүсгэдэг + off-grid байсан).

**Motion / Z-index** (var()-only): `--duration-fast|base|slow` (150/200/300),
`--ease-standard|emphasized`, `--z-dropdown|sticky|overlay|modal|toast`.

---

## Магик тоо → Token (бүрэн map)

### Өнгө
| Хуучин | Token |
|---|---|
| `#111827`, `#1f2937` (gray) | `bg-primary` / `hover:bg-primary-hover` (эсвэл `text-ink`) |
| `#0f172a` slate-900 | `text-ink` / `bg-primary` |
| `#1e293b` slate-800 | `text-heading` |
| `#64748b` slate-500 | `text-muted` |
| `#94a3b8` slate-400 | `text-faint` (**icon/хүрээ л**) |
| `#e2e8f0` slate-200 | `border-line` |
| `#f1f5f9` slate-100 | `border-line-soft` |
| `#f9fafb`, `#f8fafc` | `bg-canvas` |
| `#ffffff`, `#fff` | `bg-surface` / `text-primary-text` |
| `#ef4444` / `#dc2626` / `#b91c1c` / `#fef2f2` | `danger` / `danger` / `danger-text` / `danger-surface` |
| `#22c55e` `#16a34a` / `#15803d` / `#f0fdf4` | `success` / `success-text` / `success-surface` |

> **Legacy (out of scope):** home/login-ийн `#00a8ff·#0d6efd·#007bff·#0e7490·#4facfe` (олон
> цэнхэр), amber `#FFF000`, payment mock `#E31837·#00A651·#1a1a1a·#FFF200` — booking app UI биш.
> Эдгээрийг дараагийн үе шатанд brand token болгож нэгтгэнэ (одоо бүү хөндөх).

### Radius
| Хуучин | Token |
|---|---|
| `rounded-[10px]`, `border-radius:10px`, `rounded-lg` | `rounded-control` |
| `rounded-[14px]`, `rounded-[16px]`, `rounded-xl`, `rounded-2xl` | `rounded-panel` |
| `rounded-[20px]`, `border-radius:20px` | `rounded-card` |
| `rounded-full`, `999px/100px/99px/50px` | `rounded-pill` |

### Shadow
| Хуучин | Token |
|---|---|
| `shadow-sm`, `shadow` | `shadow-xs` / `shadow-card` |
| `shadow-[0_6px_18px…]` | `shadow-card` |
| `shadow-[0_10px_24px…]`, `shadow-[0_8px_22px…]`, `shadow-md` | `shadow-overlay` |
| `shadow-lg`, `shadow-2xl` | `shadow-modal` |
| `focus:shadow-[0_0_0_4px…]` | `shadow-focus` |

### Typography
| Хуучин | Token |
|---|---|
| `text-[10px]`, `text-[11px]` | `text-label` |
| `text-[12px]`, `text-xs` | `text-caption` |
| `text-[13px]` | `text-body-sm` |
| `text-[14px]`, `text-sm`, `text-base`* | `text-body` |
| `text-[15/16/17px]`, `text-lg` | `text-title` |
| `text-[20/21/22px]`, `text-xl`, `text-2xl` | `text-title` / `text-display` |

\* `text-base` (16px)-ийг тохиолдол бүрээр шалга (body эсвэл title).

### Spacing / Z / Motion
| Хуучин | Token |
|---|---|
| `gap-[14px]`, `gap-card` | `gap-4` (16px) |
| `z-[9999]` | `z-[var(--z-modal)]` |
| `z-[1000]` | `z-[var(--z-sticky)]` |
| `duration-200` | `duration-[var(--duration-base)]` (эсвэл хэвээр) |

---

## Шинэ токен нэмэх дүрэм

1. **Эхлээд semantic-аар илэрхийлж болох эсэхийг шалга.** Болвол шинэ токен нэмэхгүй.
2. **3+ газар давтагдсан** ба одоогийн токеноор шууд гарахгүй бол л нэм. 1–2 удаа гарсан
   утгыг хамгийн ойрын шатанд нь нийлүүл (ашиглагдахгүй токен = өр).
3. **hex зөвхөн LAYER 1**-д. Semantic нь `var(--primitive)` заана.
4. **Нэрлэлт:** `--{category}-{role}-{variant}-{state}`, **хэрэглээгээр** нэрл, харагдацаар биш:
   ✅ `--color-danger`  ❌ `--color-red` · ✅ `--radius-card`  ❌ `--radius-20`.
5. Текстэд ашиглах өнгө нэмбэл **AA (4.5:1) хангасан** эсэхийг шалга.
