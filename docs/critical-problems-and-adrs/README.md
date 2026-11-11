# Critical Architecture Decisions & Problem Catalog (ADRs)

> **Domain:** Full-Stack Enterprise Architecture Decisions, Failure Modes & Mitigations  
> **Target Scope:** Vialiq EDC & ePRO Platform  
> **Status:** Active Architectural Resolution  
> **Compliance Standards:** FDA 21 CFR Part 11, ICH GCP E6(R3), EU CTR 536/2014, HIPAA § 164.312, GAMP 5 Category 4/5  

---

## 1. Executive Overview & Problem Catalog Status

To ensure every major architectural failure mode is thoroughly addressed without bloating a single monolithic document, each critical problem is codified as an independent, formal **Architecture Decision Record (ADR)**.

```
=============================================================================================================
VIALIQ 10 CRITICAL ARCHITECTURE DECISIONS (ADRs) TRACKER
=============================================================================================================
ADR ID   Problem / Domain Area                    Failure Severity   Status     Key Decision / Architecture
-------------------------------------------------------------------------------------------------------------
ADR 001  Subject Matrix Virtualization & Search   HIGH (Browser OOM) SEALED     Unified Workspace & ⌘K Search Modal
ADR 002  ePRO Validation & Isolated Edit Checks   MEDIUM (Bandwidth) SEALED     Separate Forms & 4-Tier Isolated ECs
ADR 003  Form Concurrency & Lock Lifecycle        HIGH (Race Hazard) SEALED     Single-Editor Form Lock & Redis Lifecycle
ADR 004  CSFLE-to-SQL Server CDC Boundary         CRITICAL (HIPAA)   SEALED     Metadata Data Classification & Ingress Drop
ADR 005  Model Decoupling & Intentional Asymmetry N/A (By Design)    SEALED     Intentional Asymmetry (No 1:1 Parity Needed)
ADR 006  21 CFR Part 11 Audit Trail Architecture  CRITICAL (Part 11) SEALED     Stratified Collections & 4D Compound Indexes
ADR 007-A Multi-Tenant Cache Scoping & Security    CRITICAL (Breach)  SEALED     Data Boundary, Dual-Write Completion, Redis Cluster
ADR 007-B HA Redis Cluster, Dev/Prod & Scaling     HIGH (SPOF/Scale)  SEALED     HA Pair + Sentinel, <2s Failover, 1k Studies Math
ADR 008  Protocol Amendment Invalidation Storms   HIGH (Redis Spike) SEALED     5-Stage Governed Pipeline & Pre-Warmed Cache Rebuild
ADR 009  Distributed Clock Skew & Part 11 E-Sig   HIGH (Regulatory)  SEALED     Non-Sharded Replica Set, Atomic Sequence, Zero Client Trust
ADR 010  Double-Blind RTSM Blinding Perimeter    CRITICAL (Blind)   SEALED     Role-Scoping & Masking (RTSM Engine Deferred Phase 2+)
ADR 011  Study-Specific Controls & Module Fed     HIGH (Bloat/CSV)   SEALED     Module Federation Plugin & Property Comp
=============================================================================================================
```

---

## 2. Directory Navigation Tree

```
docs/critical-problems-and-adrs/
├── README.md                                                                 # Master Tracker & Catalog
├── 001-subject-matrix-virtualization-and-modern-workspace-adr.md             # ADR 001: Matrix & Search Workspace
├── 002-epro-validation-payload-optimization-and-isolated-edit-checks-adr.md # ADR 002: ePRO Forms & Edit Checks
├── 003-realtime-signalr-reconnection-and-field-lease-reconciliation-adr.md  # ADR 003: Form Concurrency & Redis Lock
├── 004-csfle-to-sql-server-cdc-decryption-boundary-adr.md                    # ADR 004: CDC Enclave & SDTM Classification
├── 005-model-decoupling-and-intentional-asymmetry-adr.md                     # ADR 005: Model Decoupling by Design
├── 006-audit-trail-streaming-backpressure-and-bulk-flushing-adr.md           # ADR 006: High-Velocity Audit
├── 007-a-multitenant-cache-isolation-and-security-scoping-adr.md             # ADR 007-A: Multi-Tenant Cache Scoping
├── 007-b-high-availability-redis-cluster-and-scaling-guide.md               # ADR 007-B: HA Redis Cluster & Scaling Guide
├── 008-protocol-amendment-cache-invalidation-and-epoch-rotation-adr.md       # ADR 008: Epoch Salt Rotation
├── 009-distributed-clock-skew-and-part-11-audit-timestamp-integrity-adr.md  # ADR 009: Monotonic Timestamps
├── 010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md       # ADR 010: RTSM Role Stripping
└── 011-dynamic-study-specific-controls-and-module-federation-plugin-architecture-adr.md # ADR 011: Study Controls MFE
```

---

## 3. Related System Documentation

* **Full-Stack Evaluation & Readiness**: [`../enterprise-fullstack-architecture-evaluation-and-readiness.md`](../enterprise-fullstack-architecture-evaluation-and-readiness.md)
* **Competitive Technical Evaluation & Ranking**: [`../edc-market-technical-evaluation-and-ranking-matrix.md`](../edc-market-technical-evaluation-and-ranking-matrix.md)
* **Modern EDC UX Concepts & Mockups**: [`../modern-edc-ux-concepts.md`](../modern-edc-ux-concepts.md)
* **Backend Database ADRs**: [`../backend-architecture/database/`](../backend-architecture/database/)
* **Backend API ADRs**: [`../backend-architecture/api/`](../backend-architecture/api/)
* **Platform Scaling Architecture**: [`../scaling-architecture/`](../scaling-architecture/)
* **Functional & Technical Specifications**: [`../functional-and-technical-specs/`](../functional-and-technical-specs/)
