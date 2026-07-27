# UI Design Tokens — Ashid Booking (FE)

Цаг захиалгын FE-ийн **нэгдсэн UI токен** систем. Минимал саарал төрх (gray-900 primary,
slate саарал). Эх сурвалж: [`src/styles/tokens.css`](./tokens.css) — Tailwind v4 `@theme`.

Токен бүр **хоёр аргаар** ашиглагдана:
- **Tailwind utility** (JSX-д): `className="rounded-card shadow-card text-ink"`
- **CSS `var()`** (custom CSS-д): `border-radius: var(--radius-card);`

> ⚠️ Магик тоо (`rounded-[10px]`, `gap-[14px]`, `shadow-[0_6px_18px...]`) битгий бич —
> доорх токеныг ашигла. Ингэснээр урсгал даяар нэг л утга мөрдөгдөнө.

---

## 🎨 Colors

| Token | Утга | Utility жишээ | Хэрэглээ |
|---|---|---|---|
| `--color-surface` | `#ffffff` | `bg-surface` | Карт / sheet дэвсгэр |
| `--color-canvas` | `#f9fafb` | `bg-canvas` | Хуудас / бүдэг дэвсгэр |
| `--color-ink` | `#111827` | `text-ink` | Үндсэн текст |
| `--color-ink-soft` | `#1e293b` | `text-ink-soft` | Гарчиг |
| `--color-muted` | `#64748b` | `text-muted` | Хоёрдогч текст |
| `--color-faint` | `#94a3b8` | `text-faint` | Label / icon |
| `--color-line` | `#e2e8f0` | `border-line` | Үндсэн хүрээ |
| `--color-line-soft` | `#f1f5f9` | `border-line-soft` | Хуваагч зураас |
| `--color-primary` | `#111827` | `bg-primary` | Үндсэн үйлдлийн товч |
| `--color-primary-hover` | `#1f2937` | `hover:bg-primary-hover` | Товчны hover |
| `--color-success` | `#22c55e` | `bg-success` | Амжилт (баталгаажилт) |
| `--color-danger` | `#ef4444` | `text-danger` | Алдаа |

## 📐 Radius

| Token | Утга | Utility | Хэрэглээ |
|---|---|---|---|
| `--radius-control` | `10px` | `rounded-control` | Input, товч |
| `--radius-panel` | `16px` | `rounded-panel` | Мэдээллийн панель |
| `--radius-card` | `20px` | `rounded-card` | Үйлчилгээний карт |
| `--radius-pill` | `9999px` | `rounded-pill` | Chip / badge |

## 🌑 Elevation

| Token | Утга | Utility | Хэрэглээ |
|---|---|---|---|
| `--shadow-card` | `0 6px 18px rgba(15,23,42,.045)` | `shadow-card` | Картын зөөлөн сүүдэр |

## 📏 Spacing

| Token | Утга | Utility | Хэрэглээ |
|---|---|---|---|
| `--spacing-card` | `14px` | `gap-card`, `p-card`, `m-card`… | Карт хоорондын зай |

## 🔠 Type

| Token | Утга | Utility | Хэрэглээ |
|---|---|---|---|
| `--text-label` | `10px` | `text-label` | Uppercase meta label |

---

## Магик тоо → Token замбараа

| Хуучин (битгий бич) | Шинэ токен |
|---|---|
| `rounded-[10px]` | `rounded-control` |
| `rounded-[20px]` | `rounded-card` |
| `rounded-2xl` (панель) | `rounded-panel` |
| `shadow-[0_6px_18px_rgba(15,23,42,0.045)]` | `shadow-card` |
| `gap-[14px]` | `gap-card` |
| `text-[10px]` (label) | `text-label` |

Аль хэдийн шилжүүлсэн: `ServiceCard`, `ServiceSelector`, `BookingStepContent`,
`BookingDetails`.

---

## Шинэ токен нэмэх

`src/styles/tokens.css`-ийн `@theme` дотор нэмнэ. Tailwind v4 автоматаар utility үүсгэнэ:
- `--color-{нэр}` → `bg/text/border/ring-{нэр}`
- `--radius-{нэр}` → `rounded-{нэр}`
- `--shadow-{нэр}` → `shadow-{нэр}`
- `--spacing-{нэр}` → `p/px/gap/m/w/h-{нэр}`
- `--text-{нэр}` → `text-{нэр}`
