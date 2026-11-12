# Security Specification & Threat Model

## Application Overview
Logitech Rewards & Earning System with real-time multi-tier referral distribution, admin plan activation, wallet management, payment verification, and withdrawal requests.
- Admin Identity: `godhhduby@gmail.com` / `logitech01`
- Collections: `users`, `plans`, `payments`, `withdrawals`, `ledger`, `settings`, `audit_logs`

## Data Invariants
1. `users`:
   - `id` matches document ID.
   - `walletBalance`, `totalEarnings`, `totalWithdrawn`, `referralEarnings` must be numeric >= 0.
   - `role` is strictly `'admin'` or `'member'`.
   - `status` is strictly `'active'` or `'blocked'`.
   - Only admin can modify `role`, `status`, or manually alter plan activation status.
   - Unauthenticated or client users cannot escalate themselves to `'admin'`.
2. `payments`:
   - `amount` must be greater than 0.
   - Initial status is `'pending'`.
   - Only admin can transition status to `'approved'` or `'rejected'`.
   - `utr` is non-empty string.
3. `withdrawals`:
   - `amount` >= minimum withdrawal setting.
   - Initial status is `'pending'`.
   - Only admin can transition status to `'approved'` or `'rejected'`.
4. `plans` & `settings`:
   - Publicly readable.
   - Only admin can create, update, or delete plans and settings.
5. `audit_logs`:
   - Append-only by admin actions.

## The Dirty Dozen Threat Matrix
1. **Unauthenticated privilege escalation**: Attacker sends document write claiming `role: 'admin'`. Blocked by checking admin credentials/identity.
2. **Self-approval of payments**: Member submits payment already marked `status: 'approved'`. Blocked by enforcing `status == 'pending'` on creation by non-admin.
3. **Arbitrary wallet inflation**: Member writes directly to `walletBalance`. Blocked by restricting balance updates to admin-only or system transactional logic.
4. **Forging withdrawal status**: Member approves own withdrawal request. Blocked by verifying status transition only allowed by admin.
5. **UTR spoofing & duplicate collision**: Enforced unique or validated non-empty string.
6. **Path traversal in doc ID**: All match blocks validate strictly formatted document IDs.
7. **Negative withdrawal amounts**: Net and gross amounts must be strictly positive (> 0).
8. **Plan pricing tampering**: Users cannot modify plan costs or daily earning multipliers.
9. **Tampering with company UPI / QR**: Company settings documents are write-restricted to admin.
10. **Data snooping across members**: Regular members read their own user record or publicly needed referral names; sensitive data is protected.
11. **Malicious field injection**: Unknown fields stripped or rejected via schema validator checks.
12. **Denial of service via oversized payload**: String lengths constrained across user and payment submissions.
