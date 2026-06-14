# Security Summary

## 1. Security issues found

- Seminar registration was inserted directly from a client component, which let the browser send trusted fields such as `payment_status`, `payment_amount`, and `xendit_external_id`.
- Login, signup, and forgot-password flows called Supabase directly from the browser, so the app could not apply its own rate limits.
- Payment creation updated `payment_status` before the trusted Xendit webhook confirmed the invoice status.
- The payment success page could verify Xendit and update payment fields outside the webhook path.
- Public API routes had no rate limiting.
- Several API routes returned raw server/database error messages.
- Admin data reads were server-side, but admin mutation routes needed shared server-side authorization and rate limiting.
- Ownership was not enforced for payment pages when a registration belongs to a logged-in user.
- Supabase RLS policies are required in the database; code alone cannot enforce table-level RLS.

## 2. Files changed

- `app/api/auth/login/route.ts`
- `app/api/auth/register/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/seminar-registrations/route.ts`
- `app/api/payment/xendit/route.ts`
- `app/api/webhook/xendit/route.ts`
- `app/api/admin/seminar-registrations/[id]/route.ts`
- `app/login/form.tsx`
- `app/register/form.tsx`
- `app/forgot-password/page.tsx`
- `app/reset-password/page.tsx`
- `app/registration/form.tsx`
- `app/payment/page.tsx`
- `app/payment/success/page.tsx`
- `lib/auth.ts`
- `lib/http.ts`
- `lib/rate-limit.ts`
- `lib/validation.ts`
- `package.json`
- `package-lock.json`

## 3. What was implemented

- Added Zod validation for public inputs:
  - Login
  - Signup
  - Forgot password
  - Reset password
  - Seminar registration
  - Payment creation
  - Admin delete route params
  - Xendit webhook payload
- Moved seminar registration inserts to `POST /api/seminar-registrations`.
- Payment amount is now computed server-side only.
- Client code no longer inserts `payment_status`, `payment_amount`, `paid_at`, `xendit_invoice_id`, or `xendit_invoice_url`.
- Payment creation stores invoice metadata but no longer updates `payment_status`.
- `payment_status` and `paid_at` are updated only by trusted server-side Xendit checks:
  - `POST /api/webhook/xendit`
  - `/payment/success`, only after fetching the invoice from Xendit with `XENDIT_SECRET_KEY`
- Xendit webhook validates `x-callback-token` using a timing-safe comparison.
- Added rate limiting helper with Upstash Redis REST support and local in-memory fallback.
- Added rate limits for:
  - Login
  - Signup
  - Forgot password
  - Reset password
  - Seminar registration
  - Payment creation
  - Xendit webhook
  - Admin registration delete
- Added server-side admin authorization helper.
- Admin delete route now validates input, rate limits requests, checks admin server-side, and hides raw database errors.
- Logged-in owned registrations now require the same user to view/pay the payment flow.
- Payment success page is read-only and waits for webhook-confirmed database status.
- Redirects for payment creation validate `NEXT_PUBLIC_APP_URL` and fall back to request origin.

## 4. Supabase RLS policies to add

Run this in the Supabase SQL editor after confirming these columns exist. The `user_id` column is important for ownership checks.

```sql
alter table public.seminar_registrations
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists seminar_registrations_user_id_idx
  on public.seminar_registrations(user_id);

alter table public.seminar_registrations enable row level security;

drop policy if exists "Users can read own seminar registrations"
  on public.seminar_registrations;

create policy "Users can read own seminar registrations"
  on public.seminar_registrations
  for select
  to authenticated
  using (user_id = auth.uid());

-- Do not add public insert/update/delete policies for seminar_registrations.
-- Registrations, payment metadata, payment status, and admin deletes are handled
-- by server routes using the service role key.

alter table public.admin_users enable row level security;

drop policy if exists "Users can read own admin flag"
  on public.admin_users;

create policy "Users can read own admin flag"
  on public.admin_users
  for select
  to authenticated
  using (user_id = auth.uid());

-- Optional but recommended if you do not already have this constraint:
alter table public.seminar_registrations
  drop constraint if exists seminar_registrations_payment_status_check;

alter table public.seminar_registrations
  add constraint seminar_registrations_payment_status_check
  check (
    payment_status in (
      'unpaid',
      'pending',
      'paid',
      'failed',
      'expired',
      'cancelled',
      'settled'
    )
  );
```

## 5. Environment variables to configure

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Never expose `SUPABASE_SERVICE_ROLE_KEY` with `NEXT_PUBLIC_`.

### Xendit

- `XENDIT_SECRET_KEY`
- `XENDIT_CALLBACK_TOKEN`

Never expose either Xendit secret with `NEXT_PUBLIC_`.

In Xendit, set the invoice webhook callback URL to:

```text
https://your-domain.com/api/webhook/xendit
```

### App URL

- `NEXT_PUBLIC_APP_URL`

Example:

```text
https://your-domain.com
```

### Rate limiting

For production on Vercel, configure Upstash Redis REST:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

If these are missing, the app uses an in-memory fallback that is only suitable for local development.

### Supabase redirects

Add these to the Supabase Auth redirect allowlist:

```text
http://localhost:3000/auth/callback
https://your-domain.com/auth/callback
```

## 6. Remaining security limitations

- Anonymous seminar registrations have `user_id = null`, so their payment pages are protected by the unguessable `order_id` token only. Logged-in registrations are tied to `user_id`.
- Upstash Redis is required for reliable production rate limiting on Vercel. The in-memory fallback is not reliable across serverless instances.
- Google OAuth still starts through Supabase's browser OAuth helper. Supabase/Google rate limits apply there; the app-level login rate limit applies to email/password login.
- RLS policies must be applied manually in Supabase. The app cannot enable RLS by itself.
- Xendit webhook trust is based on `x-callback-token`. Keep `XENDIT_CALLBACK_TOKEN` strong and private. The success page fallback still uses `XENDIT_SECRET_KEY` server-side and does not trust browser-provided payment status.
- The service role key is used only in server routes/pages. Keep it server-only in Vercel environment variables.
