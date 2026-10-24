# Multi-Factor Authentication (MFA) Recovery & Operational Runbook

## Overview
Administrator accounts in Futura require Authenticator Assurance Level 2 (AAL2) via TOTP (Google Authenticator) to access `/admin/**` surfaces and administrative API routes.

This document describes the three recovery paths available to prevent permanent administrator lockout or unauthorized authenticator hijacking.

---

## 1. Self-Service Recovery (Email Ownership)
If an administrator loses their authenticator device or suspects an unauthorized factor was bound:

1. Navigate to `/forgot-password`.
2. Enter the administrator's registered email address.
3. Click the secure, single-use recovery link received in the email inbox.
4. Set a new password on `/reset-password`.
5. **Automatic Factor Eviction**:
   - The password reset handler (`/api/auth/reset-password`) automatically revokes and deletes all existing bound MFA factors (`auth.admin.mfa.deleteFactor`).
   - All active sessions are terminated immediately.
6. The administrator logs in with the new password and is immediately prompted to enroll their fresh, authentic device at `/login/mfa-enroll`.

---

## 2. Operator-Facing Administrative Reset
If an administrator is locked out but another administrator holds an active AAL2 session:

- An active AAL2 administrator can trigger an MFA reset via `POST /api/admin/mfa/reset`:
  ```bash
  curl -X POST https://<domain>/api/admin/mfa/reset \
    -H "Content-Type: application/json" \
    -H "Cookie: <aal2_admin_session_cookie>" \
    -d '{"targetUserId": "<locked_admin_uuid>"}'
  ```
- This securely wipes the target administrator's MFA factors and sends an automated security notification to their email address.
- On their next login, the target administrator will be routed to `/login/mfa-enroll` to register a new authenticator.

---

## 3. Break-Glass Procedure (Sole Administrator Fallback)
If all administrators lose their authenticators or the sole administrator cannot access their email, use the Supabase Service-Role emergency procedure:

### Option A: Supabase Dashboard
1. Open the project in the [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to **Authentication** > **Users**.
3. Select the locked administrator account.
4. Click on **Multi-Factor Authentication** / **MFA Factors**.
5. Delete or unenroll the TOTP factor.

### Option B: Supabase Admin REST API (Service Role)
Execute using your secret `SUPABASE_SERVICE_ROLE_KEY`:

```bash
# 1. List user factors
curl -X GET "https://<SUPABASE_URL>/auth/v1/admin/users/<USER_ID>/factors" \
  -H "apikey: <SUPABASE_SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"

# 2. Delete the factor
curl -X DELETE "https://<SUPABASE_URL>/auth/v1/admin/users/<USER_ID>/factors/<FACTOR_ID>" \
  -H "apikey: <SUPABASE_SERVICE_ROLE_KEY>" \
  -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"
```

### Option C: SQL Editor (Direct Table Cleanup)
In the Supabase SQL Editor:
```sql
-- Remove verified MFA factors for the specified user
DELETE FROM auth.mfa_factors
WHERE user_id = '<USER_ID>';

-- Ensure user sessions are reset to AAL1
DELETE FROM auth.mfa_challenges
WHERE factor_id NOT IN (SELECT id FROM auth.mfa_factors);
```

Once removed, the administrator can sign in normally and will be prompted to enroll a new device at `/login/mfa-enroll`.
