# UI Polish Checklist

## Type Scale
- Base: `text-sm` for body copy and labels
- Small: `text-xs` for meta, captions, and helper text
- Large: `text-base` for emphasized body and key stats
- XL: `text-2xl` to `text-3xl` for page headings (mobile), `sm:text-3xl`/`sm:text-4xl` on desktop

## Button Sizing Rules
- Minimum tap target: 44px height
- Default buttons: `h-11`, `text-sm`, modest horizontal padding
- Primary CTAs: full width on mobile, inline on `sm+`
- Avoid oversized CTAs; use `size="lg"` only for hero

## Page Padding + Width
- Standard page padding: `py-8` with `container`
- Dense pages (lists/forms): `space-y-5` to `space-y-6`
- Max width guidance:
  - Forms: `max-w-sm` to `max-w-md`
  - Detail pages: `max-w-4xl`

## Card/List Density (Directories)
- Use list rows or compact cards
- Row padding: `px-3 py-3`
- Avatar size: 40px
- One-line name + handle, optional one-line bio/tag (truncate)
- Keep badges compact (`text-xs`) and secondary
- Aim: 3–5 rows visible on mobile, 6–10 on desktop
