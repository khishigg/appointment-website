# UI Design Brief

## Product direction

Healthcare/dental appointment UI should feel calm, credible, accessible, practical, and production-ready.

The interface should help patients and clinic users quickly understand:
- which clinic they are viewing
- when branches/providers are available
- what time slots can be booked
- what action they should take next

Prioritize clear information hierarchy over visual decoration.

## Visual style

Use a clean medical SaaS style:

- white or soft gray backgrounds
- rounded cards
- soft borders
- restrained shadows
- readable typography
- calm spacing rhythm
- clear section separation
- orange/Ashid accent for primary actions, active states, and subtle brand moments

Avoid:

- heavy gradients
- neon colors
- excessive glassmorphism
- random card colors
- childish or playful visuals
- fake-looking marketing blocks
- dense form-like layouts when content belongs in profile/card UI
- banner-dependent layouts that break when image quality is poor

## Booking experience

Clinic detail, branch selection, doctor selection, availability, and booking summary should feel like one continuous booking flow.

Booking screens should be:
- mobile-first
- easy to scan
- clear about the next action
- consistent across clinic, branch, doctor, and time-slot sections

Primary actions should be visually obvious.
Secondary information should not compete with the booking CTA.

## Data display rules

Admin API-driven clinic views must use backend data only.

Allowed public clinic fields include:
- name
- logo
- description
- address
- phone
- email
- social URL
- working hours
- branch/provider information returned by the relevant API

Do not fill missing admin API fields with mock clinic, branch, doctor, or service facts.

Hide backend/internal metadata unless explicitly requested:
- `companyReg`
- `status`
- tenant connection details
- unused `services`
- internal IDs that are not useful to users

Non-admin mock booking flow may keep existing mock data unless the task says otherwise.

## Component guidance

Reuse `src/components/booking` components for booking screens when possible.

Keep these visually consistent:
- clinic profile
- branch selector
- doctor cards
- time-slot UI
- booking summary
- loading, empty, error, and retry states

Cards should use consistent:
- border radius
- border color
- padding
- gap
- shadow level
- typography scale
- CTA placement

## Mobile-first requirements

Check responsive behavior at:
- 375px
- 430px
- 768px
- 1024px
- 1440px

Requirements:
- no horizontal scroll on mobile
- touch targets should be at least 44px
- fixed headers/navs must not hide content
- primary CTA should be visible and easy to tap
- important information should be scannable within a few seconds

## Accessibility

- Use readable contrast.
- Inputs should have labels or accessible names.
- Icon-only buttons need accessible labels.
- Focus states must be visible.
- Loading and error states must be understandable.
- Do not rely on color alone to communicate state.