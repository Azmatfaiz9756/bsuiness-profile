# Security Specification - Vibe Digital Connect

## 1. Data Invariants
- **Owner-Exclusive Writes**: No user can modify a profile, lead, or appointment that they do not own.
- **Identity Integrity**: `ownerId` fields must always match the `request.auth.uid` of the sender.
- **Strict Schema**: No "shadow fields" allowed. If a field isn't in the blueprint, it's rejected.
- **Rate Limit Protection**: All document IDs and string fields must have strict size limits to prevent database bloating.
- **Verified Access**: Only users with verified emails can perform management operations.

## 2. The "Dirty Dozen" Attack Payloads (Protected)
We will strictly block these common hacking attempts:
1. **The Ghost Field**: Adding `isVerified: true` to a user profile to bypass payments.
2. **The ID Poison**: Sending a 1MB string as a Document ID to crash query performance.
3. **The Impersonator**: Trying to create a profile with someone else's `ownerId`.
4. **The Lead Scraper**: Attempting to list all leads across the entire platform.
5. **The Appointment Hijacker**: Trying to delete someone else's booking.
6. **The Unverified Writer**: Writing data without a verified email address.
7. **The Message Spammer**: Sending an array of 10,000 messages in one document.
8. **The PII Leak**: Authenticated users trying to read private contact details of other owners.
9. **The State Shortcutter**: Manually changing a lead status to 'Completed' without the necessary business logic.
10. **The Orphan Maker**: Creating a service without a valid parent profile.
11. **The System Spoof**: Modifying `createdAt` to make a profile look older/more trusted.
12. **The Currency Injector**: Setting a "Quick Pay" currency that isn't in the allowed list (e.g., 'HACK').

## 3. Deployment Strategy
- Use `rules_version = '2'`.
- Mandatory `isValid[Entity]()` checks on every create/update.
- `affectedKeys().hasOnly()` gates for all updates.
