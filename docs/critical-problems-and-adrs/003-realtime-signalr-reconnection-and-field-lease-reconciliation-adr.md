# ADR 003: Single-Editor Form Locking, Judicious Redis Lifecycle & Multi-Reader Concurrency Architecture

> **Document ID:** `VIALIQ-ADR-CRIT-003`  
> **Status:** APPROVED & SEALED  
> **Date:** October 26, 2026  
> **Authors:** Architecture Review Board / Prashant Gupta  
> **Domain:** Form Concurrency, Single-Editor Multi-Reader Pattern, Judicious Redis Lifecycle, Clinical EDC Usability  
> **Compliance Standards:** FDA 21 CFR Part 11 § 11.10(e), ICH GCP E6(R3), EU CTR 536/2014, HIPAA § 164.312  

---

## 1. Context & Architectural Rationale

### 1.1 The Rejection of "Google Docs / Figma" Over-Engineering
Initial proposals considered fine-grained, field-by-field distributed leases with continuous 10-second WebSocket heartbeats, Lua scripts, and client-side merge drawers. 

In an enterprise Mega-Trial with **100,000 subjects across 500+ global sites**, this approach was formally rejected as severe **accidental complexity and over-engineering**:
1. **Clinical Workflow is Sequential, Not Simultaneous**: Site coordinators, investigators, data managers, and monitors perform distinct role-segregated tasks at different times. The probability of two users actively typing into the *exact same subject’s form at the exact same second* is practically zero (< 0.001%).
2. **Infrastructure Churn at Scale**: Managing 80,000 active field keys with 250+ heartbeat pings/sec across 500 hospital networks floods Redis with TTL renewals and causes false lock losses during transient Wi-Fi drops (e.g., elevators).
3. **Regulatory Attribution Confusion**: Under **FDA 21 CFR Part 11 § 11.10(e)**, a clinical form must have a single, unequivocal legal author per edit session. Co-authoring fields simultaneously muddles the audit trail.

### 1.2 The Clinical Industry Standard (Rave / Veeva Pattern)
The established, gold-standard pattern across enterprise clinical platforms (Medidata Rave, Veeva Vault EDC, Oracle InForm) is **Single-Editor, Multi-Reader Form Locking**:
* A form is opened in **Edit Mode by exactly ONE user** at a time.
* All other users open the form in **Read-Only Mode** with an informative banner.

---

## 2. Fundamental Architectural Decisions

```
=============================================================================================================
VIALIQ SINGLE-EDITOR FORM CONCURRENCY & LEASE ARCHITECTURE
=============================================================================================================
Core Decision                      Technical Specification                   Clinical & Operational Benefit
-------------------------------------------------------------------------------------------------------------
1. Single-Editor / Multi-Reader    1 active writer in Edit Mode;             Zero race conditions, zero field
                                   all other users render Read-Only.         collisions, zero diff merge drawers.
-------------------------------------------------------------------------------------------------------------
2. Composite User Identity &       Key: {Tenant}:{Study}:{User}:{Session}    Guarantees study-scoped permissions;
   Multi-Session Configuration     Study setting: AllowConcurrentSessions    supports clinic tablet/PC handover.
-------------------------------------------------------------------------------------------------------------
3. 4 Natural Release Triggers &    Save/Cancel, Logout, Session Expiry (15m) Eliminates ghost locks and prevents
   Atomic Compare-And-Delete (CAD) Server Timeout; Lua script CAD release    accidental deletion of peer locks.
-------------------------------------------------------------------------------------------------------------
4. Clinical Breakout Scenario      Role permission 'CanUnlockForms' with     Prevents trial gridlock if staff leaves
   (Admin-Assigned Permission)     mandatory Part 11 audit reason dialog.    abruptly; immutable legal audit trail.
-------------------------------------------------------------------------------------------------------------
5. Active Lease Inspection         GetCurrentLockAsync dynamically returns   Renders real-time countdown banner
   & Countdown Banner              TTL seconds (KeyTimeToLiveAsync).         in UI without active polling.
-------------------------------------------------------------------------------------------------------------
6. Dual-Tier Authority Model       Tier 1: MongoDB (Canonical Source)        Guarantees 21 CFR Part 11 audit safety
                                   Tier 2: Redis (Fast-Path & Notifications) even if cache tier restarts or fails.
=============================================================================================================
```

---

### Decision 1: Single-Editor, Multi-Reader Form Access

When a clinical user navigates to a Case Report Form (CRF) in the Clinical Workspace:
* **Case A: Form is Unlocked (Available)**:
  * The user acquires the exclusive **Form Edit Lock**.
  * Input fields, repeat sections, and medical codelists are interactive; mutations can be saved.
* **Case B: Form is Currently Locked by Another User**:
  * The form mounts in **Read-Only Mode**.
  * All input fields and action buttons are disabled (grayed out).
  * A persistent top amber banner displays the active lease status and countdown:
    > *"🔒 Currently being edited by Dr. Sarah Smith (CRC) since 10:14 AM (Expires in 11m 42s). Viewing in Read-Only Mode."*

```
                           COORDINATOR OPENS CRF
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
          Is Form Free in DB/Redis?         Is Form Currently Locked?
                    │                                 │
                   YES                               NO
                    ▼                                 ▼
          ACQUIRE EDIT LOCK                  RENDER READ-ONLY
          • Full Edit Mode                   • Inputs disabled (grayed out)
          • Form inputs interactive          • Amber banner with live countdown
          • Stored in DB & Redis             • Observer can view data safely
```

---

### Decision 2: Composite User Identity & Multi-Session Configuration

In clinical trials, a user is **never** a flat, global identity. A single investigator often participates across multiple clinical protocols with completely different regulatory roles:
* Dr. Sarah Rao may be a **Principal Investigator (Full Write & Override Authority)** on `Study-ONCO-101`.
* The same Dr. Sarah Rao may be an **Independent Medical Monitor (Read-Only Observer)** on `Study-CARD-202`.

#### 1. The Composite Lock Key Structure
To guarantee study-level isolation and prevent cross-study lock contamination, all lock holders and tracking keys use a composite structure:
```
Lock Target Key:  edc:form_lock:{studyId}:{crfId}
User Session Key: edc:user_locks:{studyId}:{userId}:{sessionId}
```

Lock metadata payload stored in both MongoDB and Redis:
```json
{
  "tenantId": "pharma-novis",
  "studyId": "STUDY-ONCO-101",
  "userId": "USR-8821",
  "sessionId": "SES-9941a7b2",
  "lockToken": "7f9a2b8e-4c1d-4a3b-9e2f-1a8b7c6d5e4f",
  "displayName": "Dr. Sarah Rao",
  "role": "PrincipalInvestigator",
  "acquiredAtUtc": "2026-11-04T10:14:00Z",
  "expiresAtUtc": "2026-11-04T10:29:00Z"
}
```

#### 2. Configurable Multi-Session Policy (`AllowConcurrentSessions`)
Clinical users move frequently between the **nurse's station desktop PC** and a **bedside examination tablet (iPad / Surface)**. However, sponsor security mandates vary widely:

* **Policy A: Strict Single Session (`AllowConcurrentSessions: false`)**:
  * Mandated by conservative sponsors to prevent shared credential abuse (e.g. two clinic staff members sharing a single doctor's login on two computers simultaneously).
  * Logging into Device B automatically revokes the session on Device A and clears associated edit locks.
* **Policy B: Flexible Mobile Clinic Workflow (`AllowConcurrentSessions: true`)**:
  * Enabled for clinical environments where investigators carry mobile tablets between exam rooms.
  * If Dr. Rao opens a form on her clinic desktop while it is already open on her bedside tablet, the system uses the composite `SessionId` to detect the difference and offers a smooth, intentional handover:
    > *"⚠️ You currently have this form open on another device (iPad - Exam Room 3).  
    > [ Transfer Edit Session to This Desktop ]   [ Continue in Read-Only Mode ]"*
  * Clicking **Transfer** safely moves the lock token to the desktop session without data loss.

---

### Decision 3: The 4 Natural Release Triggers & Atomic Compare-And-Delete (CAD)

Rather than maintaining fragile real-time WebSocket heartbeats, a form lock is deterministically tied to the active editing session and **can only ever be released in one of four natural ways**:

```
┌───────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ Release Trigger                       │ System Action & Concurrency Safeguard                  │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ a. User Saves or Cancels              │ Normal exit. Form editing is complete. System executes  │
│                                       │ an atomic release. Lock is immediately available.      │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ b. Explicit User Logout               │ Intentional departure. `POST /api/v1/auth/logout`      │
│                                       │ safely cleans up all active locks tied to that user.   │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ c. Session Inactivity Expiration      │ Inactivity timeout (15 min per 21 CFR Part 11 § 11.10).│
│                                       │ User walked away; session terminates and frees locks.  │
├───────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ d. Abrupt Termination (Dead Client)   │ Laptop closed, browser crashed, Wi-Fi lost. Server TTL │
│                                       │ naturally expires the lock after 15 minutes.           │
└───────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

#### The Elimination of Blind Deletions (Atomic CAD):
In distributed caching, calling raw `DEL` or `KeyDeleteAsync(lockKey)` creates a fatal race condition:
1. User A's 15-minute lease expires at 10:15:00 AM.
2. User B opens the form at 10:15:01 AM and acquires a fresh lock.
3. User A's browser, delayed by network latency, arrives at 10:15:02 AM with an old `ReleaseLock` request.
4. **If raw `DEL` is used, User A destroys User B's brand new active lock!**

To eliminate this vulnerability permanently, all releases execute an **Atomic Compare-And-Delete (CAD)** Lua script directly in Redis:
```lua
-- Atomic Compare-And-Delete (CAD)
local val = redis.call('get', KEYS[1])
if val then
    local data = cjson.decode(val)
    -- Verify User Association AND LockToken match
    if data and data.UserId == ARGV[1] and (ARGV[2] == '' or data.LockToken == ARGV[2]) then
        redis.call('del', KEYS[1])
        return 1
    end
end
return 0 -- Mismatch: Expired or owned by another user -> Safe No-Op!
```

#### Safe End-of-Day Logout Cleanup:
When a coordinator logs out at 5:00 PM, `edc:user_locks:{userId}` contains keys from forms touched throughout the entire workday. The logout routine **never blindly deletes these keys**. It iterates through them using the CAD script:
* Any key whose 15-minute lease expired hours ago and was subsequently locked by a colleague will fail the CAD ownership check and be **left 100% untouched**.
* Only locks genuinely held by the logging-out user are released.

---

### Decision 4: Clinical Breakout Scenario (`CanUnlockForms` Role Permission)

If a study coordinator enters vitals, locks a form, and is unexpectedly called away to an emergency room without saving or logging out, the form must not remain inaccessible if a Principal Investigator urgently needs to complete patient discharge documentation or protocol drug administration.

#### 1. Study Admin Role Configuration
The unlock capability is **not hardcoded** to any single role. Instead, the Study Administrator configures an explicit permission:
* **Permission Flag:** `CanUnlockForms` (Emergency Form Unlock).
* **Assignment:** Typically granted only to senior, legally accountable site roles (Principal Investigator, Sub-Investigator, Site Admin).

#### 2. The 21 CFR Part 11 Audit Override Workflow
When an authorized user with `CanUnlockForms` encounters a locked form:
1. They see an explicit action in the banner: **`[ ⚡ Unlock Form & Take Over ]`**.
2. Clicking the button opens a mandatory **Part 11 Electronic Signature Dialog**:
   * **Mandatory Reason for Unlock** (e.g., *"Coordinator called away to ICU; immediate protocol drug administration required"*).
   * **Credential Re-authentication** (Password / PIN entry).
3. The server executes `BreakLockAsync`:
   * Atomically overwrites the active lock with the new user's identity and a **brand-new `LockToken`**.
   * Logs an immutable legal event in the MongoDB audit collection (`ClinicalAuditRecordEntity`):
     ```json
     {
       "eventType": "FORM_LOCK_OVERRIDE",
       "studyId": "STUDY-ONCO-101",
       "crfId": "CRF-9021",
       "previousLockHolder": "USR-1044 (Nurse Patel)",
       "overriddenBy": "USR-8821 (Dr. Rao - PI)",
       "auditReason": "Emergency ICU admission documentation",
       "timestampUtc": "2026-11-04T10:28:14Z"
     }
     ```
   * Publishes a `LockBroken` notification over Redis PubSub, immediately converting the previous user's browser to Read-Only mode with an alert notification.

---

### Decision 5: Active Lease Inspection & Read-Only Banner Countdown (`GetCurrentLockAsync`)

When an observer or monitor opens a locked form:
1. The endpoint `GetCurrentLockAsync` queries Redis for the active lock payload.
2. It dynamically calculates the remaining lease seconds via `KeyTimeToLiveAsync(lockKey)`.
3. The client renders the form in **Read-Only Mode** and initializes a live client-side countdown timer:
   ```
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │ 🔒 FORM LOCKED BY DR. SARAH RAO (Expires in 11m 42s)                                   │
   │ You are viewing this CRF in Read-Only mode. Inputs are disabled to prevent overwrites. │
   │                                                                                        │
   │ [ View Read-Only Audit History ]          [ ⚡ Unlock Form & Take Over (PI Only) ]     │
   └────────────────────────────────────────────────────────────────────────────────────────┘
   ```
4. Observers can review, inspect, and verify clinical data without blocking or interfering with the primary editor.

---

### Decision 6: The 2-Tier Canonical Authority Model (MongoDB + Redis)

In clinical software validation (GAMP 5 / FDA 21 CFR Part 11), an in-memory cache **cannot be the sole legal authority** for data integrity. Redis is the distributed performance and real-time notification backplane paired synchronously with MongoDB (`ADR 007-A` Decision 3.1).

The locking engine operates as a **Dual-Write Synchronous System (DB + Cache)**:

```
                       [ CLIENT FORM REQUEST ]
                                  │
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ TIER 2: REDIS FAST-PATH INGRESS (< 0.5 ms)                        │
│ • Checks Regulatory Freeze/DBL (`vialiq:locks:{studyId}`) FIRST;  │
│   returns HTTP 423 Locked immediately if frozen/hard-locked.      │
│ • Checks active form edit lease (`edc:form_lock:{studyId}:{crfId}`)│
│   and rejects concurrent editors for observers without DB reads.  │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ (If open, free or owned by caller, or 0.001% total HA outage bypass)
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ TIER 1: MONGODB CANONICAL AUTHORITY (Source of Truth)             │
│ • Verifies governance `study_locks` (no active freeze/DBL).       │
│ • Upserts 15m edit lease in `study_{id}_prod.study_edit_leases`   │
│   (partial unique index `{ studyId: 1, targetCrfId: 1 }` on active).│
│ • MongoDB Primary is the legal timestamp and ACID authority.      │
└─────────────────────────────────┬─────────────────────────────────┘
                                  │ (Once DB commits successfully)
                                  ▼
┌───────────────────────────────────────────────────────────────────┐
│ SYNCHRONOUS CACHE COMPLETION (Strict DB + Cache Consistency)      │
│ • Updates/evicts key with 15-minute TTL before returning 200 OK.  │
│ • Transient sync failure when Redis is active throws HTTP 503     │
│   (`CacheSynchronizationException`) — never serves stale cache.   │
│ • Total Redis HA outage (~0.001%): single session circuit-breaker │
│   check redirects directly to canonical MongoDB until recovery.   │
└───────────────────────────────────────────────────────────────────┘
```

> **Authoritative Service Contract (`IStudyLockService` / `StudyLockService`):**  
> Lock operations follow `IStudyLockService` (`AcquireFormLockAsync`, `ReleaseFormLockAsync`, `BreakFormLockAsync`, `ReleaseAllLocksForSessionAsync`, and `GetCurrentLockAsync`), verifying governance `study_locks` (`HTTP 423` gate) before persisting 15-minute UI edit leases in MongoDB `study_edit_leases` and synchronizing Redis key `edc:form_lock:{studyId}:{crfId}` atomically via `SET`/CAD Lua before acknowledging completion.

---

## 3. Concrete Implementation Specifications (`IStudyLockService`)

> Aligned with `API ADR 006`, `ADR 007-A`, and `ADR 007-B`, `IStudyLockService` supersedes legacy field-lock prototypes and enforces **Single-Editor / Multi-Reader Form Locking** backed by MongoDB (`study_edit_leases`, gated by governance `study_locks`) + synchronous Redis coordination.

### 3.1 Form Concurrency Service Contract (`IStudyLockService.cs`)

```csharp
namespace Vialiq.Caching.Abstractions;

public interface IStudyLockService
{
    Task<LockResult> AcquireFormLockAsync(string studyId, string crfId, UserContext user, CancellationToken ct = default);
    Task ReleaseFormLockAsync(string studyId, string crfId, UserContext user, string? lockToken = null, CancellationToken ct = default);
    Task ReleaseAllLocksForSessionAsync(string studyId, string userId, string sessionId, CancellationToken ct = default);
    Task BreakFormLockAsync(string studyId, string crfId, string auditReason, UserContext user, CancellationToken ct = default);
    Task<FormLockInfo?> GetCurrentLockAsync(string studyId, string crfId, CancellationToken ct = default);
}
```

### 3.2 Atomic CAD Release, Logout Sweep & Dual-Write Mechanics

1. **Redis Key Structure (`15-Minute` TTL):**
   - Form lock key: `edc:form_lock:{studyId}:{crfId}` storing serialized `{ TenantId, StudyId, UserId, FullName, SessionId, LockToken, AcquiredAtUtc, ExpiresAtUtc }`.
   - Session tracking set: `edc:user_locks:{studyId}:{userId}:{sessionId}` tracking active form keys for deterministic logout cleanup.
2. **Atomic Compare-And-Delete (CAD) Lua Script:**
   - Every normal release (`ReleaseFormLockAsync`) and logout cleanup (`ReleaseAllLocksForSessionAsync`) verifies `UserId` + `LockToken` inside Redis before deleting `edc:form_lock:{studyId}:{crfId}`, guaranteeing a stale network request or logout sweep never deletes a colleague's newly acquired lock:
   ```lua
   -- Atomic Compare-And-Delete (CAD)
   local val = redis.call('get', KEYS[1])
   if val then
       local data = cjson.decode(val)
       if data and data.UserId == ARGV[1] and (ARGV[2] == '' or data.LockToken == ARGV[2]) then
           redis.call('del', KEYS[1])
           return 1
       end
   end
   return 0
   ```
3. **Dual-Write Synchronous Completion (`ADR 007-A Decision 3.1`) & Total-Outage Redirect:**
   - **Normal HA Operation:** Lock acquisition (verifying regulatory `study_locks` `HTTP 423` gate first, then `FindOneAndUpdateAsync` in MongoDB `study_edit_leases` + synchronous `StringSetAsync` in Redis), release (`Status = Released` + Atomic CAD delete), and break-lock override (`Status = Broken` + immutable Part 11 audit log + synchronous Redis replacement/eviction + `vialiq:pubsub:locks` notification) must complete synchronously across **DB + Cache** before returning success.
   - **0.001% Total Redis HA Outage (Primary + Replica Both Down):** A single session circuit-breaker check bypasses Redis and queries/updates canonical MongoDB (`study_locks` + `study_edit_leases`) directly until Sentinel restores Redis HA.
   - *(Detailed C# implementation blueprint is maintained alongside `ScopedCacheService` in [ADR 007-B](./007-b-high-availability-redis-cluster-and-scaling-guide.md#43-form-concurrency-lock-service-studylockservicecs).)*

---

## 4. Performance, Capacity & Operational Metrics

```
=============================================================================================================
FORM CONCURRENCY CAPACITY SIZING (100k SUBJECTS / 500+ SITES)
=============================================================================================================
Metric                         Target / Budget               Observed Sizing              Operational Benefit
-------------------------------------------------------------------------------------------------------------
Redis Active Lock Keys         Max 1,000 keys at peak        ~500 - 800 keys globally     Negligible overhead
Total Redis Memory Consumed    < 5 MB                        ~150 Kilobytes               99.9% Memory Reduction
Heartbeat Network Calls        0 req/sec                     0 req/sec                    Zero Network Churn
Lock Acquisition Latency       < 2 ms                        < 0.4 ms (Redis SETNX)       Instant UI rendering
Elevator / Network Disconnect  Zero Stale Drops              100% Retained (15m TTL)      Zero User Disruption
21 CFR Part 11 Attribution     Single Legal Author           100% Deterministic           Zero Race Overwrites
=============================================================================================================
```

---

## 5. Decision Consequences

### Positive Consequences:
1. **Extreme Architectural Simplicity**: Eliminates high-frequency WebSocket heartbeat chatter and complex client-side diff-merge drawers, replacing them with a deterministic 15-minute key lease and an atomic Compare-And-Delete (CAD) Lua script.
2. **Rock-Solid at Mega-Scale**: Works flawlessly for 100,000 subjects across 500 sites because total active Redis state is capped by active human editors (~1,000 keys), not total subjects or fields.
3. **Elevator & Dead Zone Resilience**: The 15-minute TTL guarantees that entering an elevator, radiology basement, or Wi-Fi dead zone for a few minutes never drops an in-progress editing session.
4. **Clean Regulatory Lineage**: One legal author per edit session guarantees 100% compliance with FDA 21 CFR Part 11 § 11.10(e) audit trail standards.
5. **Study-Scoped Multi-Session Safety**: Composite keys `{Tenant}:{Study}:{User}:{Session}` ensure multi-device clinic workflows (iPad $\leftrightarrow$ Desktop) transition smoothly without cross-study lock contamination.

### Trade-offs & Mitigations:
1. **Simultaneous Co-Editing Not Supported**: Two people cannot edit the same form at the same time.
   * *Mitigation:* In clinical research, simultaneous co-authoring is neither standard nor compliant with GCP roles. Read-only mode allows others to review data without risk of conflicting updates.
2. **Staff Forgetting to Save / Close**:
   * *Mitigation:* Redis automatically evicts locks after 15 minutes of inactivity, and staff with the admin-configured `CanUnlockForms` role permission can execute an authorized Break Lock with a mandatory 21 CFR Part 11 audit reason.
