# Scaling Architecture (Post-MVP Roadmap): Event Streaming, Apache Kafka Multi-Sink Fan-Out & Central Lab (`LB`) Pipelines

> **Document ID:** `VIALIQ-SCALE-006`  
> **Domain:** Platform Scalability — Post-MVP Event Streaming, Multi-Sink Warehousing & High-Volume Lab Ingestion  
> **Status:** Deferred / Post-MVP Evolution Roadmap (Phase 2+ — **Do NOT Deploy in Phase 1 MVP**)  
> **Date:** November 2026  
> **Target Systems (Future):** Apache Kafka / Managed Event Hubs, Schema Registry (Avro/Protobuf), `.NET 9 Vialiq.CdcWorker`, Central SQL Server 2022+, Snowflake / Databricks, AI Safety Signal Pipeline, Central Lab Vendors (`HL7` / `FHIR` / `CDISC LAB`)  
> **Regulatory Standards:** FDA 21 CFR Part 11, EU CTR 536/2014, GDPR Art. 9/28, HIPAA § 164.312, China PIPL/DSL, ICH GCP E6(R3), CDISC SDTM `LB` / ODM v1.3.2 / UCUM  
> **Related Architecture Documents:**
> - [ADR 004: CSFLE-to-SQL Server CDC Decryption Boundary](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)
> - [ADR 010: Double-Blind RTSM Unblinding Prevention](../critical-problems-and-adrs/010-double-blind-rtsm-unblinding-prevention-in-caching-tiers-adr.md)
> - [Scale 004: Distributed Redis Caching & RabbitMQ Queues](./004-caching-queues-and-resilience-patterns.md)
> - [Scale 005: Database Cluster Farm & Compliance Scaling](./005-database-cluster-farm-regional-compliance-and-throughput-scaling.md)
> - [Scale 005-A: Multilingual Global Studies & Federated Reporting](./005-a-multilingual-study-db-per-site-group-and-reporting-guide.md)

---

## 1. Phase 1 MVP Guardrail: Why Kafka Is Explicitly Deferred Today

> [!IMPORTANT]
> **Phase 1 Production Mandate (No Kafka / Debezium in MVP):**  
> During Phase 1 MVP, **75% of trials** run `StorageTopologyMode.Single` (single region, single culture) with one analytical sink (**Central SQL Server 2022**). Deploying Apache Kafka, Kafka Connect, Schema Registry, and Debezium in Phase 1 adds unnecessary cluster cost and operational tax.  
> - **Phase 1 Operational Queuing:** Handled by **RabbitMQ + `.NET 9` Workers** ([Scale 004](./004-caching-queues-and-resilience-patterns.md)).  
> - **Phase 1 Operational CDC:** Handled directly by **`.NET 9 Vialiq.CdcWorker`** reading majority-committed MongoDB Change Streams inside the regional CSFLE decryption enclave ([ADR 004](../critical-problems-and-adrs/004-csfle-to-sql-server-cdc-decryption-boundary-adr.md)).

### Measurable Graduation Triggers (When to Activate This Roadmap)
This architecture turns on **only** when the platform crosses at least one of these post-MVP thresholds:
1. **Multi-Sink Event Fan-Out ($\ge 3$ independent consumers):** The exact same clinical/audit event stream must drive **Central SQL Server** + **Snowflake/Databricks Data Lake** + **AI/ML Safety Signal Engine** + **Sponsor Event Webhooks** simultaneously with independent consumer offsets and multi-day/week replay.
2. **High-Volume Central Lab / eLab / Biomarker Ingestion:** Sponsor trials ingest automated bulk vendor feeds (**50,000–500,000+ lab panels (`LB`) per batch drop** — CBC, CMP, Pharmacokinetics/PK, Genomics) from Labcorp, Q2 Solutions, Covance, or hospital HL7/FHIR streams requiring replayable quarantine and multi-consumer routing.
3. **Extended Warehouse Outage Buffering:** Analytical warehouse downtime windows exceed safe MongoDB oplog retention windows (`24–72h`), requiring durable broker disk retention (`7–30 days`).

---

## 2. Outbound Post-MVP Multi-Sink Architecture (Preserving ADR 004 CSFLE Security)

Even after crossing the MVP threshold into **Apache Kafka**, Vialiq **never** deploys naive raw Debezium-to-SQL connectors over encrypted MongoDB PII:
* Raw MongoDB oplogs contain AES-256-GCM **CSFLE ciphertext** for `SiteIdentifier` fields (`ADR 004`) and raw treatment arm values (`BlindedRTSM`, `ADR 010`).
* Pushing raw MongoDB documents into Kafka would either leak unusable ciphertext to downstream consumers or require storing plaintext PHI inside shared Kafka brokers.

### Canonical Hybrid Evolution (`Vialiq.CdcWorker` $\rightarrow$ Clean Kafka Backbone)

```
Regional Clinical VPC (e.g., ZONE_US / ZONE_EU / ZONE_CN, or Single Zone)
┌─────────────────────────────────────────────────────────────────────────────────┐
│ MongoDB 7.0+ Primary  ──(Change Stream: w:"majority")──▶  .NET 9 Vialiq.CdcWorker│
│ (CSFLE Ciphertext)                                       (RAM Decryption Enclave)│
│                                                          1. Decrypt CSFLE in RAM│
│                                                          2. DROP SiteIdentifier  │
│                                                          3. MASK BlindedRTSM     │
└─────────────────────────────────────────────────────────────┬───────────────────┘
                                                              │ TLS 1.3 (Clean, Pseudonymized
                                                              │ ClinicalResearch Avro Events)
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Apache Kafka / Event Hubs Backbone (7–30 Day Replayable Retention)              │
│ Topic: edc.clinical.events.v1 (Partition Key: STUDYID + USUBJID)                │
├──────────────────────┬───────────────────────┬─────────────────┬────────────────┤
│ Group A              │ Group B               │ Group C         │ Group D        │
│ SQL Server 2022+     │ Snowflake / Databricks│ AI / ML Safety  │ Sponsor        │
│ (SDTM Regulatory)    │ (Global Data Lake)    │ Signal Engine   │ Webhooks / API │
└──────────────────────┴───────────────────────┴─────────────────┴────────────────┘
```

### Architectural Guarantees Preserved
1. **Zero PHI / Unblinding on Kafka Brokers:** `Vialiq.CdcWorker` strips `SiteIdentifier` PII (`ADR 004`) and masks `BlindedRTSM` fields (`ADR 010`) **before** any byte hits a Kafka topic.
2. **Per-Subject Ordering:** Partitioning topics strictly by `(STUDYID, USUBJID)` guarantees chronological causal ordering per patient across every consumer group.
3. **Zero Impact on 75% `Single` Studies:** `Single` tenants remain completely unaffected unless they opt into Sponsor Event Streams / Snowflake / Central Lab enterprise modules.

---

## 3. Central & Local Laboratory Data (`LB` / `eLab` / `HL7` / `FHIR`) — Why Kafka Shines Here

Central Lab integration is **distinct from nurse eCRF entry**: nurses enter forms interactively one patient at a time, whereas Central Labs (`Labcorp`, `Q2 Solutions`, `Covance`) and hospital EHR interfaces deliver **massive asynchronous bulk feeds** that must be validated, reconciled, alerted, and archived cleanly.

### Phase 1 MVP vs. Post-MVP Lab Data Path
* **Phase 1 MVP (`Single` / Small Batch Studies):** A scheduled SFTP/HTTPS pull triggers a `.NET 9` **RabbitMQ worker** (`q.labs.batch`), normalizes UCUM units (`mg/dL` $\leftrightarrow$ `mmol/L`), checks reference ranges, writes `LB` domain results into MongoDB (`w: "majority"`), and routes anomalies into the discrepancy queue.
* **Post-MVP Global Phase 3 / Oncology / Biomarker Studies (Kafka Pipeline):** Inbound lab vendors publish parsed records to partitioned regional Kafka ingestion topics before touching live MongoDB operational clusters.

### Post-MVP Central Lab Streaming Topology

```
Central Lab Vendor (SFTP CSV / CDISC LAB / HL7 v2 / FHIR R4 Observation)
                                  │
                                  ▼
                Lab Ingestion Gateway (.NET 9 / mTLS)
     • Validates vendor manifest & checksum
     • Keeps regional raw lab files inside origin VPC (EU/CN/US sovereignty)
                                  │
                                  ▼
         Kafka Topic: labs.inbound.raw.v1 (Partitioned by StudyId)
          │                       │                        │
          ▼                       ▼                        ▼
┌───────────────────┐   ┌───────────────────┐   ┌───────────────────────┐
│ Consumer Group 1  │   │ Consumer Group 2  │   │ Consumer Group 3      │
│ EDC Reconciliation│   │ Quarantine & DM   │   │ Analytical Warehouse  │
│                   │   │ Replay Queue      │   │ & Biomarker / AI Lake │
│ • Match USUBJID + │   │                   │   │                       │
│   Visit Window    │   │ • Unmatched IDs,  │   │ • SQL Server sdtm.LB  │
│ • Apply UCUM &    │   │   invalid dates,  │   │ • Snowflake Lake      │
│   Age/Sex Ranges  │   │   missing units   │   │ • Safety ML Signals   │
│ • CTCAE Grade 3/4 │   │ • DM fixes map &  │   │                       │
│   auto-alert to   │   │   replays cleanly │   │                       │
│   PI / SAE triage │   │   from Kafka log  │   │                       │
│ • Write LB doc to │   │                   │   │                       │
│   MongoDB Study DB│   │                   │   │                       │
└───────────────────┘   └───────────────────┘   └───────────────────────┘
```

### Four Reasons Kafka Specifically Fits Clinical Lab (`LB`) Workloads
1. **Burst Isolation (Protects Live Nurse eCRFs):** A single 300,000-row Central Lab weekly transmission stays buffered in Kafka and feeds MongoDB via controlled backpressure (`BulkWriteAsync` micro-batches) so live site coordinators never feel write latency spikes.
2. **Deterministic Reconciliation Replay (Most Important Lab Workflow):** In real trials, 3–8% of incoming central lab rows arrive with typoed subject IDs, unscheduled visit names, or missing age/sex reference ranges. Routing unmatched records to a **Data Manager Reconciliation Queue** and replaying the immutable Kafka event after mapping fixes avoids asking vendors to re-transmit entire batches — while preserving full **21 CFR Part 11 audit provenance** (`Vendor Batch ID` + `Kafka Offset`).
3. **Instant Dual Routing for Safety Alerts + Warehousing:** Group 1 flags life-threatening **CTCAE Grade 3/4 toxicities / Hy's Law alerts** into EDC SAE triage immediately without waiting for slow analytical joins in Snowflake/SQL Server.
4. **Sovereignty & Double-Blind Safety Guards:**
   * **Double-Blind Protection (`ADR 010`):** Lab tests that can expose treatment assignment (e.g., **Pharmacokinetic (PK) drug plasma concentrations**, anti-drug antibodies (`ADA`), or drug-specific biomarkers) MUST be tagged `BlindedRTSM` at gateway parse time and routed ONLY to authorized bioanalytical/unblinded sinks — never published to site-visible EDC or blinded warehouse consumers.
   * **Regional Data Residency (`Scale 005-A`):** For `MultiRegionGeoPartitioned` trials (`ZONE_EU`, `ZONE_CN`), inbound lab feeds containing local lab patient identifiers execute gateway parsing & `SiteIdentifier` scrubbing **inside the local regional VPC** before clean `ClinicalResearch` `LB` records stream outward.

---

## 4. Zero-Rework Phase 1 Preparation Rule

To ensure adopting this roadmap in Phase 2+ requires **zero schema or API rewrites**:
1. Phase 1 services emit events behind an explicit C# boundary (`IClinicalEventPublisher` / `ILabIngestionPipeline`), keeping MongoDB schemas (`LB` documents, `audit_trail`, `_event_outbox`) vendor-agnostic.
2. `Vialiq.CdcWorker` keeps CSFLE decryption + PII stripping decoupled from the SQL Server `MERGE` writer (`Scale 004` / `ADR 004`), so attaching a Kafka producer sink alongside SQL Server is an additive Phase 2 module — **never** a Phase 1 core refactor.

