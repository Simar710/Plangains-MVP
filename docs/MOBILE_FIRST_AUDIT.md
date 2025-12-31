# Mobile-First UI Audit

## Mobile UX Checklist
- Tap targets are >= 44px (buttons, inputs, menu items)
- Primary flows use single-column layout by default
- Multi-column layouts only at `md:` and above
- Forms are stacked with clear labels and errors
- Navigation fits in one row or wraps without overflow
- No tables for core flows (program view, logging)
- Text sizes remain readable at 320–430px width

## Pages Reviewed
- /
- /auth/sign-in
- /auth/sign-up
- /app
- /app/program
- /creator
- /creator/become
- /creator/settings
- /creator/[slug]
- /creators
- /admin

## Per-Page Results
- /: PASS
  - Adjusted hero typography and spacing for small screens
  - Stacked hero metrics on mobile
- /auth/sign-in: PASS
  - Form remains single column; inputs/buttons use >=44px height
- /auth/sign-up: PASS
  - Form remains single column; inputs/buttons use >=44px height
- /app: PASS
  - Action row wraps on mobile; subscription card stacks CTA
- /app/program: PASS
  - Program day cards stack metadata; exercise rows wrap cleanly
  - Logging grid stacks to single column on mobile
- /creator: PASS
  - CTA buttons stack on mobile
- /creator/become: PASS
  - Form uses stacked inputs and textarea
- /creator/settings: PASS
  - Stripe connect button full width on mobile
- /creator/[slug]: PASS
  - Subscribe card remains single column on mobile
- /creators: PASS
  - Search/filter form stacks; card rows stack and CTA is full width
- /admin: PASS
  - Creator controls stack; action button is full width on mobile
