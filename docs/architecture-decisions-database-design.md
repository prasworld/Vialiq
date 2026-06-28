# Architecture Decisions: Database Design & Infrastructure

**Date:** May 31, 2026  
**Version:** 1.0  
**Status:** 🏗️ Architecture Decision Record (ADR)  
**Related Docs:** [versioning](form-versioning-and-migration.md) · [compliance](development-plan-part-4b-compliance.md) · [architecture](form-builder-architecture.md)

---

## Executive Summary

**Final Architecture Decision: Single-Tenant PostgreSQL with Redis Caching**

After comprehensive analysis of EDC platform requirements, regulatory constraints, and scale characteristics, we recommend:

| Decision Area | Recommendation | Confidence |
|--------------|----------------|------------|
| **Database Type** | PostgreSQL (RDBMS) | ✅ 95% |
| **Multi-Tenancy** | Single-Tenant per Client | ✅ 98% |
| **Architecture** | Modular Monolith | ✅ 90% |
| **Caching Layer** | Redis (distributed) | ✅ 85% |
| **File Storage** | S3-compatible (MinIO/AWS S3) | ✅ 90% |
| **Search** | PostgreSQL Full-Text + Optional Elasticsearch | ⚠️ 75% |

**Rationale:** Clinical trial data requires strong ACID guarantees, regulatory compliance (21 CFR Part 11), complete data isolation per client, and audit trail immutability—all of which favor PostgreSQL with single-tenant architecture.

---

## Table of Contents

1. [Requirements Analysis](#1-requirements-analysis)
2. [Database Type Evaluation](#2-database-type-evaluation)
3. [Multi-Tenancy Analysis](#3-multi-tenancy-analysis)
4. [Microservices vs Monolith](#4-microservices-vs-monolith)
5. [Caching Strategy](#5-caching-strategy)
6. [Schema Design](#6-schema-design)
7. [Data Isolation & Security](#7-data-isolation--security)
8. [Compliance & Regulatory](#8-compliance--regulatory)
9. [Scalability Analysis](#9-scalability-analysis)
10. [Final Architecture](#10-final-architecture)
11. [Migration Path](#11-migration-path)
12. [Trade-offs & Risks](#12-trade-offs--risks)

---

## 1. Requirements Analysis

### 1.1 EDC Platform Characteristics

**Scale Profile:**
- ✅ **NOT** a high-volume consumer app (no millions of users)
- ✅ **Data-intensive** (forms, validations, audit trails)
- ✅ **Low concurrent user count** (~200 per study)
- ✅ **High data integrity requirements** (clinical trial data)
- ✅ **Regulatory compliance critical** (FDA, EMA, GDPR)

**User Concurrency Analysis:**

```
Typical Study Profile:
├─ Sites: 20-50 sites
├─ Subjects: 200-1,000 subjects
├─ Site Staff: 2-5 per site = 40-250 users
├─ Central Staff: 10-30 (CDM, monitors, statisticians)
├─ Peak Concurrent Users: 50-200 (during data entry periods)
└─ Read Operations: 80% (viewing data, reports)
   Write Operations: 20% (data entry, queries)

Platform-Wide (Multiple Studies):
├─ Studies: 10-50 studies per client
├─ Total Users per Client: 500-5,000
├─ Peak Concurrent: 200-500 per client
└─ NOT PUBLIC ACCESS (authenticated users only)
```

**Data Volume Estimates:**

| Data Type | Volume per Study | Growth Rate |
|-----------|------------------|-------------|
| Form Definitions | 50-200 forms | Low (design phase only) |
| Subject Records | 200-1,000 subjects | Medium (during enrollment) |
| Form Data Entries | 50K-500K records | High (daily data entry) |
| Audit Trail Events | 500K-5M events | Very High (every action logged) |
| Queries | 10K-100K queries | Medium (data cleaning phase) |
| Attachments/Files | 1K-10K files (10GB-1TB) | Medium |

**Regulatory Requirements:**

| Requirement | Implication |
|-------------|-------------|
| **21 CFR Part 11** | Audit trail, e-signature, data integrity, validation |
| **GDPR** | Data isolation, right to erasure, data portability, encryption |
| **HIPAA** | PHI protection, access controls, audit logs, encryption at rest/transit |
| **GxP (Good Practice)** | Data immutability, traceability, controlled access |
| **ISO 27001** | Information security management |

### 1.2 Critical Business Constraints

**Constraint 1: Zero Data Co-Mingling**

> "No client will agree to store data along with other companies"

**Implications:**
- ❌ Multi-tenant shared database is **NOT acceptable**
- ✅ Physical data isolation required
- ✅ Separate database per client OR separate database instance per client
- ✅ Backup/restore independence

**Constraint 2: External Audit Compliance**

> "There will be a lot of external audit/compliance issues"

**Implications:**
- ✅ FDA/EMA inspectors must audit a single client's data without seeing others
- ✅ Complete audit trail per client (no shared tables)
- ✅ Data export for regulatory submission (eCRF, SDTM, ADaM formats)
- ✅ Client-specific encryption keys (data sovereignty)

**Constraint 3: GDPR Right to Erasure**

**Implications:**
- ✅ Must be able to delete ALL data for a client (complete removal)
- ✅ Cannot have foreign keys across client boundaries
- ✅ Backup/archive separation per client

**Constraint 4: Low Concurrent User Count**

**Implications:**
- ✅ No need for massive horizontal scaling (no Kubernetes cluster with 100 pods)
- ✅ Vertical scaling sufficient (bigger DB server)
- ✅ Monolith architecture viable (simpler than microservices)

---

## 2. Database Type Evaluation

### 2.1 Option 1: PostgreSQL (RDBMS)

**Rating: 9.5/10** ✅ **RECOMMENDED**

**Strengths:**

| Feature | Benefit for EDC |
|---------|-----------------|
| **ACID Compliance** | Critical for clinical trial data integrity |
| **JSONB Support** | Store dynamic form schemas while maintaining SQL queries |
| **Full-Text Search** | Built-in search for forms, queries, audit logs |
| **Row-Level Security** | Can implement multi-tenant if needed (though we'll avoid it) |
| **Mature Ecosystem** | Battle-tested, 30+ years in production |
| **Strong Typing** | Schema validation, type safety |
| **Foreign Keys & Constraints** | Data integrity enforcement |
| **Window Functions** | Complex reporting queries (visit timelines, query trends) |
| **Audit Trail Support** | Triggers, change data capture |
| **Partitioning** | Table partitioning by study or date for performance |
| **Point-in-Time Recovery** | Critical for regulatory compliance |
| **Backup/Restore** | Mature tools (pg_dump, WAL archiving, pgBackRest) |

**EDC-Specific Advantages:**

```sql
-- Example: JSONB for dynamic form schemas + SQL queries
CREATE TABLE form_data (
  record_id UUID PRIMARY KEY,
  study_id UUID NOT NULL,
  subject_id UUID NOT NULL,
  form_id UUID NOT NULL,
  data JSONB NOT NULL,  -- Dynamic form data
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

-- Query form data with SQL + JSONB operators
SELECT 
  subject_id,
  data->>'patientWeight' as weight,
  data->>'patientHeight' as height,
  (data->>'patientWeight')::numeric / 
    POWER((data->>'patientHeight')::numeric / 100, 2) as bmi
FROM form_data
WHERE study_id = 'study-uuid'
  AND form_id = 'vital-signs-form'
  AND (data->>'patientWeight')::numeric > 100;

-- Full-text search across audit logs
CREATE INDEX idx_audit_search ON audit_trail USING gin(
  to_tsvector('english', description || ' ' || COALESCE(additional_data::text, ''))
);

SELECT * FROM audit_trail
WHERE to_tsvector('english', description) @@ to_tsquery('subject & deleted');
```

**Weaknesses:**
- ⚠️ Vertical scaling limits (single-server bottleneck)
- ⚠️ Complex sharding if needed later (though unlikely for EDC use case)
- ⚠️ Less flexible than NoSQL for schema-less data (but JSONB mitigates this)

**Verdict:** ✅ **Best fit for EDC platform**

---

### 2.2 Option 2: MongoDB (Document Database)

**Rating: 6/10** ❌ **NOT RECOMMENDED**

**Strengths:**
- ✅ Flexible schema (good for dynamic forms)
- ✅ Native JSON storage (no JSONB conversion)
- ✅ Horizontal scaling (sharding)
- ✅ Change streams (real-time updates)

**Weaknesses for EDC:**

| Issue | Impact |
|-------|--------|
| **No ACID Across Collections** | ❌ CRITICAL: Clinical data requires multi-table transactions |
| **Weak Typing** | ⚠️ Schema validation less robust than RDBMS |
| **No Foreign Keys** | ⚠️ Data integrity must be enforced in application layer |
| **Audit Trail Complexity** | ⚠️ No native triggers, need application-level tracking |
| **Regulatory Concerns** | ❌ CRITICAL: FDA prefers relational databases for validated systems |
| **Complex Queries** | ⚠️ Aggregation pipelines less intuitive than SQL |
| **Backup Complexity** | ⚠️ Point-in-time recovery less mature than PostgreSQL |

**Example: Transaction Limitation**

```javascript
// MongoDB: Multi-document transaction (requires replica set)
// Less mature than PostgreSQL ACID guarantees

const session = client.startSession();
session.startTransaction();
try {
  await FormData.updateOne({ subjectId: 'SUBJ-001' }, { data: newData }, { session });
  await AuditTrail.insertOne({ event: 'DATA_UPDATED', ... }, { session });
  await Queries.updateMany({ subjectId: 'SUBJ-001', status: 'open' }, { ... }, { session });
  
  await session.commitTransaction();
} catch (error) {
  await session.abortTransaction();
  throw error;
}
```

**Verdict:** ❌ **Not suitable for EDC due to regulatory and ACID requirements**

---

### 2.3 Option 3: Cassandra / ScyllaDB (Wide-Column Store)

**Rating: 4/10** ❌ **NOT RECOMMENDED**

**Strengths:**
- ✅ Massive horizontal scaling (millions of writes/sec)
- ✅ High availability (multi-datacenter replication)
- ✅ Time-series data (good for audit logs)

**Weaknesses for EDC:**

| Issue | Impact |
|-------|--------|
| **Eventual Consistency** | ❌ CRITICAL: Unacceptable for clinical data |
| **No Joins** | ❌ CRITICAL: EDC requires complex relational queries |
| **No ACID Transactions** | ❌ CRITICAL: Regulatory requirement |
| **Complex Data Modeling** | ⚠️ Denormalization increases development time |
| **Over-Engineering** | ❌ CRITICAL: Designed for Google/Netflix scale (billions of users), not EDC (<500 concurrent) |

**Verdict:** ❌ **Massive over-engineering for EDC use case**

---

### 2.4 Option 4: Hybrid Approach

**Rating: 7/10** ⚠️ **POSSIBLE BUT COMPLEX**

**Architecture:**
- **PostgreSQL** — Primary data store (forms, subjects, audit trail)
- **Elasticsearch** — Search index (full-text search across all data)
- **Redis** — Caching layer (session state, form definitions)
- **S3/MinIO** — File storage (attachments, exports, backups)

**Strengths:**
- ✅ Best-of-breed for each use case
- ✅ Elasticsearch provides superior search (fuzzy matching, relevance scoring)
- ✅ Redis provides fast caching (sub-millisecond latency)

**Weaknesses:**
- ⚠️ Operational complexity (4 systems to manage)
- ⚠️ Data consistency challenges (keeping Elasticsearch in sync with PostgreSQL)
- ⚠️ Increased infrastructure costs
- ⚠️ More failure points

**Verdict:** ⚠️ **Consider for Phase 2/3, not MVP**

---

### 2.5 Final Database Type Decision

**✅ Decision: PostgreSQL as Primary Database**

**Rationale:**

1. **Regulatory Compliance:** FDA/EMA expect relational databases for validated systems
2. **ACID Guarantees:** Non-negotiable for clinical trial data
3. **JSONB Support:** Handles dynamic form schemas while maintaining SQL query power
4. **Mature Ecosystem:** 30+ years of production use, extensive tooling
5. **Audit Trail:** Native trigger support, change data capture
6. **Cost-Effective:** No need for Cassandra/MongoDB licensing/training

**PostgreSQL Version:** 15+ (for improved partitioning, JSONB performance)

**Extensions to Enable:**
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query performance monitoring
CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- Encryption functions
CREATE EXTENSION IF NOT EXISTS "pg_partman";     -- Automated partition management
```

---

## 3. Multi-Tenancy Analysis

### 3.1 Multi-Tenancy Pattern Comparison

**Pattern 1: Shared Database, Shared Schema (Discriminator Column)**

```sql
-- Single database, all clients share tables
-- tenant_id column in every table

CREATE TABLE subjects (
  subject_id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,  -- Discriminator
  study_id UUID NOT NULL,
  subject_number VARCHAR(50),
  ...
);

-- Every query must filter by tenant_id
SELECT * FROM subjects WHERE tenant_id = 'client-abc' AND study_id = 'study-123';
```

**Rating: 2/10** ❌ **STRONGLY NOT RECOMMENDED**

**Pros:**
- ✅ Simple deployment (single database)
- ✅ Easy to add new tenants (just insert rows)
- ✅ Cost-effective (shared resources)

**Cons (CRITICAL for EDC):**

| Issue | Impact |
|-------|--------|
| **Data Leak Risk** | ❌ CRITICAL: Forgot `WHERE tenant_id = ?` → exposes all clients' data |
| **Regulatory Violation** | ❌ CRITICAL: FDA/EMA audit exposes other clients' data |
| **GDPR Non-Compliance** | ❌ CRITICAL: Cannot fully delete client data (foreign keys across tenants) |
| **Performance** | ❌ BAD: Large tables (millions of rows), slow queries |
| **Backup/Restore** | ❌ BAD: Cannot backup single client, all-or-nothing |
| **Security Audit** | ❌ BAD: Client A's audit includes client B's data in same tables |
| **Noisy Neighbor** | ⚠️ Client A's heavy load affects client B |

**Real-World Disaster Example:**

```sql
-- Developer forgets WHERE tenant_id = ?
-- BUG: Exposes ALL clients' subject data
SELECT * FROM subjects WHERE study_id = 'study-123';  
-- SHOULD BE: WHERE tenant_id = 'client-abc' AND study_id = 'study-123'

-- Result: HIPAA violation, FDA warning letter, client lawsuits
```

**Verdict:** ❌ **Unacceptable risk for clinical trial data**

---

**Pattern 2: Shared Database, Separate Schemas (Schema per Tenant)**

```sql
-- Single PostgreSQL database, each client gets a schema

-- Client A's schema
CREATE SCHEMA client_abc;
CREATE TABLE client_abc.subjects (...);
CREATE TABLE client_abc.form_data (...);

-- Client B's schema
CREATE SCHEMA client_xyz;
CREATE TABLE client_xyz.subjects (...);
CREATE TABLE client_xyz.form_data (...);

-- Set search_path per session
SET search_path TO client_abc;
SELECT * FROM subjects;  -- Implicitly uses client_abc.subjects
```

**Rating: 6/10** ⚠️ **BETTER BUT STILL RISKY**

**Pros:**
- ✅ Logical data isolation (cannot accidentally query wrong schema)
- ✅ Per-client schema versioning (different form schemas)
- ✅ Easier backup (pg_dump --schema=client_abc)

**Cons:**

| Issue | Impact |
|-------|--------|
| **Shared Database Instance** | ⚠️ Single point of failure (all clients down if DB crashes) |
| **Connection Pooling Complexity** | ⚠️ Must set search_path per connection |
| **Resource Contention** | ⚠️ Client A's heavy queries slow down client B |
| **Backup/Restore Complexity** | ⚠️ Cannot restore single client without affecting others |
| **GDPR Erasure** | ⚠️ Can drop schema, but shared WAL logs still contain data |
| **Audit Trail Separation** | ⚠️ Auditors see shared database instance (commingled data concern) |

**Verdict:** ⚠️ **Workable but not ideal for EDC compliance requirements**

---

**Pattern 3: Separate Database per Tenant**

```sql
-- Each client gets their own PostgreSQL database
-- Server: edc-postgres.example.com

-- Client A
Database: edc_client_abc
Tables: subjects, form_data, audit_trail, ...

-- Client B
Database: edc_client_xyz
Tables: subjects, form_data, audit_trail, ...

-- Application connects to appropriate database based on client
```

**Rating: 8/10** ✅ **GOOD OPTION**

**Pros:**

| Benefit | Impact |
|---------|--------|
| **Strong Data Isolation** | ✅ No risk of cross-client data leaks |
| **Independent Backup/Restore** | ✅ Restore client A without affecting client B |
| **GDPR Compliance** | ✅ Drop database = complete erasure |
| **Per-Client Monitoring** | ✅ Track DB size, query performance per client |
| **Independent Maintenance** | ✅ Vacuum, reindex, analyze per client |
| **Regulatory Audit** | ✅ FDA auditor only sees one client's database |

**Cons:**

| Issue | Impact |
|-------|--------|
| **Shared DB Instance** | ⚠️ Still single point of failure |
| **Connection Pool Management** | ⚠️ More complex than single DB |
| **Cross-Client Queries** | ⚠️ Cannot join data across clients (acceptable for EDC) |
| **Schema Migrations** | ⚠️ Must migrate N databases (can be automated) |

**Verdict:** ✅ **Strong candidate for EDC**

---

**Pattern 4: Separate Database Instance per Tenant**

```sql
-- Each client gets their own PostgreSQL server instance

-- Client A
Server: edc-postgres-clientabc.example.com
Database: edc
Tables: subjects, form_data, audit_trail, ...

-- Client B
Server: edc-postgres-clientxyz.example.com
Database: edc
Tables: subjects, form_data, audit_trail, ...
```

**Rating: 9.5/10** ✅ **BEST OPTION FOR EDC**

**Pros:**

| Benefit | Impact |
|---------|--------|
| **Complete Physical Isolation** | ✅ Impossible to cross-contaminate data |
| **Independent Failure Domains** | ✅ Client A's DB crash doesn't affect client B |
| **Per-Client Resource Allocation** | ✅ Dedicated CPU, RAM, disk per client |
| **GDPR & Regulatory Compliance** | ✅ Destroy VM/container = complete erasure |
| **Client-Specific Encryption Keys** | ✅ Data sovereignty (EU vs US clients) |
| **Independent Scaling** | ✅ Scale up large clients, keep small clients on shared infra |
| **Regulatory Audit** | ✅ FDA auditor connects to single client's server |
| **Disaster Recovery** | ✅ Independent backups, point-in-time recovery |

**Cons:**

| Issue | Impact |
|-------|--------|
| **Higher Infrastructure Cost** | ⚠️ N database servers vs 1 (but cloud makes this affordable) |
| **More Operational Complexity** | ⚠️ Monitoring, patching N servers |
| **Schema Migration Overhead** | ⚠️ Must migrate N databases (automatable with Flyway/Liquibase) |

**Cost Analysis:**

```
Scenario: 20 clients

Option A: Shared Database (Pattern 1/2)
- 1 x PostgreSQL server (32 vCPU, 128GB RAM): $1,500/month
- Total: $1,500/month

Option B: Separate Database per Client (Pattern 3)
- 1 x PostgreSQL server (32 vCPU, 128GB RAM): $1,500/month
- 20 databases on same server
- Total: $1,500/month (same as Option A)

Option C: Separate Instance per Client (Pattern 4)
- Small Clients (1-5 studies): 4 vCPU, 16GB RAM = $200/month x 15 = $3,000
- Medium Clients (6-20 studies): 8 vCPU, 32GB RAM = $400/month x 4 = $1,600
- Large Clients (20+ studies): 16 vCPU, 64GB RAM = $800/month x 1 = $800
- Total: $5,400/month

Cost Premium: $3,900/month ($195/client/month)

Revenue per Client: $5,000-50,000/month (enterprise EDC pricing)
Cost Premium as % of Revenue: 0.8%-4%

Verdict: NEGLIGIBLE cost increase for massive compliance benefits
```

**Verdict:** ✅ **RECOMMENDED for EDC platform**

---

### 3.2 Final Multi-Tenancy Decision

**✅ Decision: Separate Database Instance per Client (Pattern 4)**

**Implementation Strategy:**

```yaml
# Infrastructure as Code (Terraform/Pulumi)

# Small Client Template (1-5 studies, <50 concurrent users)
resource "aws_rds_instance" "client_small" {
  identifier = "edc-postgres-${var.client_id}"
  engine = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.large"  # 2 vCPU, 8GB RAM
  allocated_storage = 100  # GB
  
  backup_retention_period = 35  # Days (regulatory requirement)
  enabled_cloudwatch_logs_exports = ["postgresql", "upgrade"]
  
  encryption = true
  kms_key_id = aws_kms_key.client_encryption_key.id  # Client-specific key
  
  tags = {
    Client = var.client_id
    Environment = "production"
    Compliance = "21-CFR-Part-11,HIPAA,GDPR"
  }
}

# Medium Client Template (6-20 studies, 50-200 concurrent users)
resource "aws_rds_instance" "client_medium" {
  identifier = "edc-postgres-${var.client_id}"
  instance_class = "db.m5.xlarge"  # 4 vCPU, 16GB RAM
  allocated_storage = 500  # GB
  iops = 3000  # Provisioned IOPS for better performance
  
  # Multi-AZ for high availability
  multi_az = true
  
  # ... rest same as small
}

# Large Client Template (20+ studies, 200-500 concurrent users)
resource "aws_rds_instance" "client_large" {
  identifier = "edc-postgres-${var.client_id}"
  instance_class = "db.m5.2xlarge"  # 8 vCPU, 32GB RAM
  allocated_storage = 2000  # GB
  iops = 10000  # High IOPS
  
  multi_az = true
  
  # Read replicas for reporting queries
  replicas = 2
  
  # ... rest same as small
}
```

**Connection Management:**

```typescript
// Application connection routing
// libs/shared/src/lib/database/connection-manager.service.ts

@Injectable({
  providedIn: 'root'
})
export class DatabaseConnectionManager {
  private connections = new Map<string, Pool>();  // clientId → pg.Pool
  
  /**
   * Get database connection for client
   */
  async getConnection(clientId: string): Promise<Pool> {
    if (this.connections.has(clientId)) {
      return this.connections.get(clientId)!;
    }
    
    // Load client DB config from secrets manager
    const dbConfig = await this.loadClientConfig(clientId);
    
    // Create connection pool
    const pool = new Pool({
      host: dbConfig.host,       // edc-postgres-clientabc.rds.amazonaws.com
      port: dbConfig.port,       // 5432
      database: dbConfig.database, // edc
      user: dbConfig.username,
      password: dbConfig.password,
      
      // Connection pool settings
      max: 20,                   // Max connections per client
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      
      // SSL required
      ssl: {
        rejectUnauthorized: true,
        ca: dbConfig.caCertificate
      }
    });
    
    this.connections.set(clientId, pool);
    
    return pool;
  }
  
  /**
   * Load client DB config from AWS Secrets Manager
   */
  private async loadClientConfig(clientId: string): Promise<DbConfig> {
    const secretName = `edc/database/${clientId}`;
    
    const secret = await this.secretsManager.getSecretValue({
      SecretId: secretName
    }).promise();
    
    return JSON.parse(secret.SecretString);
  }
}
```

**Benefits for EDC:**

1. ✅ **FDA Audit:** Inspector connects to single client's server, sees only that client's data
2. ✅ **GDPR Right to Erasure:** Delete RDS instance = complete data removal
3. ✅ **Data Sovereignty:** EU clients' data stays in EU region, US clients in US region
4. ✅ **Client-Specific Encryption:** Each client has own KMS key (audit trail per client)
5. ✅ **Independent Scaling:** Large pharma clients get bigger instances, small CROs get smaller
6. ✅ **Disaster Recovery:** Independent backups, can restore single client without affecting others

---

## 4. Microservices vs Monolith

### 4.1 Microservices Architecture

**Rating: 4/10** ❌ **NOT RECOMMENDED FOR EDC**

**Typical Microservices Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway (Kong/NGINX)                 │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    ┌───▼────┐         ┌────▼────┐        ┌────▼────┐
    │ Form   │         │ Subject │        │ Query   │
    │ Service│         │ Service │        │ Service │
    │  :3001 │         │  :3002  │        │  :3003  │
    └───┬────┘         └────┬────┘        └────┬────┘
        │                   │                   │
    ┌───▼────┐         ┌────▼────┐        ┌────▼────┐
    │   DB   │         │   DB    │        │   DB    │
    │  Forms │         │ Subjects│        │ Queries │
    └────────┘         └─────────┘        └─────────┘

Additional Services:
- Audit Trail Service (:3004)
- Validation Service (:3005)
- Edit Check Service (:3006)
- Query Management Service (:3007)
- E-Signature Service (:3008)
- Report Service (:3009)
- Export Service (:3010)
- Notification Service (:3011)

Total: 11+ services, 11+ databases
```

**Pros:**
- ✅ Independent scaling (scale forms service separately from queries)
- ✅ Independent deployment (update forms service without redeploying subjects)
- ✅ Technology diversity (use Go for performance-critical services)
- ✅ Team autonomy (different teams own different services)

**Cons for EDC:**

| Issue | Impact |
|-------|--------|
| **Transaction Complexity** | ❌ CRITICAL: No distributed ACID (Saga pattern too complex) |
| **Data Consistency** | ❌ CRITICAL: Clinical data requires immediate consistency |
| **Operational Overhead** | ❌ BAD: 11+ services to monitor, deploy, debug |
| **Network Latency** | ⚠️ Service-to-service calls add 10-100ms per request |
| **Distributed Tracing** | ⚠️ Need Zipkin/Jaeger to debug issues |
| **Over-Engineering** | ❌ CRITICAL: Designed for Netflix scale (1000s of requests/sec), not EDC (10-20 req/sec) |
| **Development Complexity** | ⚠️ Local development requires Docker Compose with 11 containers |
| **Testing Complexity** | ⚠️ Integration tests must spin up all services |

**Transaction Problem Example:**

```typescript
// Microservices: Save form data + create audit event + raise queries
// PROBLEM: No distributed ACID transaction

// Step 1: Call Form Service to save data
await formService.saveFormData(subjectId, formData);
// ✅ Success: Data saved

// Step 2: Call Audit Service to log event
await auditService.logEvent({ eventType: 'DATA_ENTERED', ... });
// ❌ FAIL: Audit service is down
// RESULT: Data saved but no audit trail → REGULATORY VIOLATION

// Step 3: Call Query Service to raise validation queries
await queryService.raiseQueries(subjectId, validationErrors);
// ❓ Never executed because Step 2 failed

// SOLUTION: Saga pattern with compensating transactions
// - Too complex for EDC use case
// - Eventual consistency unacceptable for clinical data
```

**Operational Overhead Example:**

```bash
# Microservices: Deploy 11 services
kubectl apply -f form-service.yaml
kubectl apply -f subject-service.yaml
kubectl apply -f query-service.yaml
kubectl apply -f audit-service.yaml
kubectl apply -f validation-service.yaml
kubectl apply -f editcheck-service.yaml
kubectl apply -f query-mgmt-service.yaml
kubectl apply -f esignature-service.yaml
kubectl apply -f report-service.yaml
kubectl apply -f export-service.yaml
kubectl apply -f notification-service.yaml

# Monitor 11 services
kubectl logs -f form-service-<pod-id>
# ... repeat 10 more times

# Debug inter-service issues
# "Form service is slow"
# → Check network latency to subject service
# → Check if query service is down
# → Trace request through 5 services
# → Takes 2 hours to debug
```

**Verdict:** ❌ **Massive over-engineering for EDC use case**

---

### 4.2 Monolith Architecture

**Rating: 8/10** ✅ **RECOMMENDED FOR EDC**

**Modular Monolith Architecture:**

```
┌─────────────────────────────────────────────────────────────┐
│                      EDC Platform (NestJS)                  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  API Layer (REST + GraphQL)                        │   │
│  └────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────┬────────────┬────────────┬────────────┐   │
│  │   Forms    │  Subjects  │  Queries   │   Audit    │   │
│  │   Module   │   Module   │   Module   │   Module   │   │
│  └────────────┴────────────┴────────────┴────────────┘   │
│                                                             │
│  ┌────────────┬────────────┬────────────┬────────────┐   │
│  │ Validation │    Edit    │   Query    │ E-Signature│   │
│  │   Module   │   Checks   │ Management │   Module   │   │
│  └────────────┴────────────┴────────────┴────────────┘   │
│                                                             │
│  ┌────────────┬────────────┬────────────┬────────────┐   │
│  │  Reports   │   Export   │Notification│ Versioning │   │
│  │   Module   │   Module   │   Module   │   Module   │   │
│  └────────────┴────────────┴────────────┴────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Shared Services (Auth, DB, Cache, Email)          │   │
│  └────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                    ┌───────┴───────┐
                    │               │
            ┌───────▼─────┐   ┌─────▼──────┐
            │  PostgreSQL │   │   Redis    │
            │   (Primary) │   │  (Cache)   │
            └─────────────┘   └────────────┘
```

**Pros:**

| Benefit | Impact |
|---------|--------|
| **ACID Transactions** | ✅ CRITICAL: Single DB transaction for all operations |
| **Simple Deployment** | ✅ Deploy one app, not 11 |
| **Easy Development** | ✅ Run `npm start`, no Docker Compose needed |
| **Simple Debugging** | ✅ Single call stack, easy to trace issues |
| **No Network Overhead** | ✅ Function calls, not HTTP requests (10x faster) |
| **Code Reuse** | ✅ Shared types, utilities across modules |
| **Testing** | ✅ Simple integration tests, no service mocking |

**Cons:**
- ⚠️ Cannot scale modules independently (but EDC doesn't need this)
- ⚠️ Must redeploy entire app for any change (acceptable with CI/CD)
- ⚠️ Single point of failure (mitigated with load balancer + multiple instances)

**Transaction Example:**

```typescript
// Monolith: Save form data + create audit event + raise queries
// ✅ Single database transaction

@Injectable()
export class FormDataService {
  constructor(
    private prisma: PrismaService,
    private auditTrail: AuditTrailService,
    private queryService: QueryManagementService,
    private validationService: ValidationService
  ) {}
  
  async saveFormData(
    subjectId: string,
    formData: any
  ): Promise<FormDataRecord> {
    // ✅ Single database transaction
    return await this.prisma.$transaction(async (tx) => {
      // Step 1: Save form data
      const dataRecord = await tx.formData.create({
        data: {
          subjectId,
          formData,
          createdAt: new Date()
        }
      });
      
      // Step 2: Create audit event
      await tx.auditTrail.create({
        data: {
          eventType: 'DATA_ENTERED',
          subjectId,
          formDataId: dataRecord.id,
          userId: this.currentUser.id,
          timestamp: new Date()
        }
      });
      
      // Step 3: Run validation
      const validationResult = await this.validationService.validate(
        formData
      );
      
      // Step 4: Raise queries if validation failed
      if (!validationResult.isValid) {
        await tx.query.createMany({
          data: validationResult.errors.map(err => ({
            subjectId,
            fieldKey: err.fieldKey,
            queryType: 'SYSTEM_VALIDATION',
            description: err.message,
            status: 'open'
          }))
        });
      }
      
      // ✅ ALL-OR-NOTHING: Either all steps succeed or all rollback
      return dataRecord;
    });
  }
}
```

**Deployment:**

```bash
# Monolith: Deploy single app
docker build -t edc-platform:v1.2.0 .
docker push edc-platform:v1.2.0

# Update load balancer to point to new version
# Zero downtime with blue-green deployment

# Done! One deploy, all features updated
```

**Verdict:** ✅ **Perfect fit for EDC use case**

---

### 4.3 Hybrid: Modular Monolith with Optional Microservices

**Rating: 9/10** ✅ **BEST OF BOTH WORLDS**

**Strategy:** Start with monolith, extract microservices only when needed

```
Phase 1 (MVP): Pure Monolith
├─ All modules in single NestJS app
├─ Single deployment
└─ 200 concurrent users: ✅ Monolith handles easily

Phase 2 (Scale): Monolith + Report Service
├─ Monolith handles real-time operations (data entry, queries)
├─ Extract Report Service (heavy CPU for PDF generation)
└─ 500 concurrent users: ✅ Monolith + 1 service

Phase 3 (High Scale): Monolith + 3 Services
├─ Monolith: Core EDC operations
├─ Report Service: PDF/Excel generation (CPU-intensive)
├─ Export Service: CDISC export (memory-intensive)
├─ Notification Service: Email/SMS (async processing)
└─ 1000 concurrent users: ✅ Monolith + 3 services
```

**Services to Extract (if needed):**

| Service | Reason to Extract | Priority |
|---------|-------------------|----------|
| **Report Service** | CPU-intensive (PDF generation) | 🔶 High (Phase 2) |
| **Export Service** | Memory-intensive (CDISC export) | 🔶 High (Phase 2) |
| **Notification Service** | Async processing (email/SMS) | 🔵 Medium (Phase 3) |
| **File Processing** | Virus scanning, OCR | 🔵 Medium (Phase 3) |

**Services to KEEP in Monolith:**

- ✅ Forms Management (core CRUD, needs ACID)
- ✅ Subject Management (core CRUD, needs ACID)
- ✅ Query Management (core CRUD, needs ACID)
- ✅ Audit Trail (must be in same transaction)
- ✅ Validation (real-time, needs low latency)
- ✅ Edit Checks (real-time, needs low latency)
- ✅ E-Signature (needs ACID with audit trail)

**Verdict:** ✅ **RECOMMENDED: Modular monolith with optional microservices**

---

### 4.4 Final Architecture Decision

**✅ Decision: Modular Monolith (Phase 1), Extract Report/Export Services (Phase 2)**

**Implementation:**

```typescript
// apps/edc-platform/src/main.ts
// Single NestJS application with modular architecture

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
  });
  
  // Global error handling
  app.useGlobalFilters(new AllExceptionsFilter());
  
  // Request logging
  app.use(morgan('combined'));
  
  // API versioning
  app.setGlobalPrefix('api/v1');
  
  await app.listen(3000);
  console.log(`EDC Platform running on http://localhost:3000`);
}

bootstrap();
```

```typescript
// apps/edc-platform/src/app.module.ts

@Module({
  imports: [
    // Core modules (always in monolith)
    AuthModule,
    FormsModule,
    SubjectsModule,
    QueryModule,
    AuditTrailModule,
    ValidationModule,
    EditChecksModule,
    ESignatureModule,
    VersioningModule,
    
    // Extractable modules (can become microservices later)
    ReportsModule,        // → Report Service (Phase 2)
    ExportModule,         // → Export Service (Phase 2)
    NotificationModule,   // → Notification Service (Phase 3)
    
    // Infrastructure modules
    DatabaseModule,
    CacheModule,
    EmailModule,
    StorageModule
  ]
})
export class AppModule {}
```

---

## 5. Caching Strategy

### 5.1 Caching Requirements

**What to Cache:**

| Data Type | Cache Duration | Invalidation Strategy |
|-----------|----------------|----------------------|
| **Form Definitions** | 1 hour | On form publish/update |
| **Codelist Values** | 1 day | On codelist update |
| **User Sessions** | 8 hours | On logout |
| **Validation Rules** | 1 hour | On form version change |
| **Edit Check Compiled Code** | 1 hour | On EC update |
| **Query Statistics** | 5 minutes | On query state change |
| **Audit Trail Counts** | 5 minutes | On audit event |
| **Report Metadata** | 15 minutes | On report update |

**What NOT to Cache:**

- ❌ Subject data (always fresh, regulatory requirement)
- ❌ Form data entries (ACID consistency required)
- ❌ Audit trail events (immutable, always from DB)
- ❌ Query messages (real-time communication)
- ❌ E-signatures (regulatory traceability)

---

### 5.2 Option 1: No Cache (PostgreSQL Only)

**Rating: 5/10** ⚠️ **ACCEPTABLE FOR MVP, NOT PRODUCTION**

**Pros:**
- ✅ Simple architecture
- ✅ No cache invalidation complexity
- ✅ Always consistent data

**Cons:**
- ⚠️ Slower page loads (every request hits DB)
- ⚠️ Higher DB load (repeated queries for form definitions)
- ⚠️ User experience degrades with scale

**Performance:**

```
No Cache:
- Form definition load: 50-100ms (DB query + JSONB parsing)
- Codelist load: 20-50ms (DB query)
- Total page load: 200-500ms

With Cache:
- Form definition load: 1-5ms (Redis GET)
- Codelist load: 1-5ms (Redis GET)
- Total page load: 50-100ms

Improvement: 4-5x faster
```

**Verdict:** ⚠️ **OK for MVP, add caching for production**

---

### 5.3 Option 2: Redis (Distributed Cache)

**Rating: 9/10** ✅ **RECOMMENDED**

**Architecture:**

```
┌─────────────────┐
│  EDC Platform   │
│   (NestJS)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│ Redis │ │PostgreSQL│
│(Cache)│ │ (Primary)│
└───────┘ └──────────┘

Cache Workflow:
1. Request arrives
2. Check Redis for cached data
3. If HIT: Return cached data (1-5ms)
4. If MISS: Query PostgreSQL (50-100ms)
5. Store result in Redis (TTL: 1 hour)
6. Return data
```

**Pros:**

| Benefit | Impact |
|---------|--------|
| **Sub-millisecond Latency** | ✅ 1-5ms response time |
| **Reduced DB Load** | ✅ 80% of reads from cache |
| **Atomic Operations** | ✅ INCR, DECR for counters |
| **Pub/Sub** | ✅ Real-time notifications |
| **Session Storage** | ✅ Distributed sessions across app instances |
| **Rate Limiting** | ✅ Token bucket with INCR + EXPIRE |
| **Leader Election** | ✅ Distributed locks for background jobs |

**Cons:**
- ⚠️ Operational complexity (another system to manage)
- ⚠️ Cache invalidation challenges (must invalidate on updates)
- ⚠️ Memory usage (cost vs PostgreSQL disk)

**Implementation:**

```typescript
// libs/shared/src/lib/cache/redis-cache.service.ts

@Injectable()
export class RedisCacheService {
  private client: Redis;
  
  constructor(private config: ConfigService) {
    this.client = new Redis({
      host: config.get('REDIS_HOST'),
      port: config.get('REDIS_PORT'),
      password: config.get('REDIS_PASSWORD'),
      
      // Connection pool
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000),
      
      // Enable Redis Cluster (for high availability)
      enableReadyCheck: true
    });
  }
  
  /**
   * Get cached form definition
   */
  async getFormDefinition(formId: string, versionId: string): Promise<FormSchema | null> {
    const cacheKey = `form:${formId}:${versionId}`;
    
    const cached = await this.client.get(cacheKey);
    
    if (cached) {
      console.log(`[Cache HIT] ${cacheKey}`);
      return JSON.parse(cached);
    }
    
    console.log(`[Cache MISS] ${cacheKey}`);
    return null;
  }
  
  /**
   * Cache form definition
   */
  async setFormDefinition(
    formId: string,
    versionId: string,
    schema: FormSchema
  ): Promise<void> {
    const cacheKey = `form:${formId}:${versionId}`;
    const ttl = 3600; // 1 hour
    
    await this.client.setex(
      cacheKey,
      ttl,
      JSON.stringify(schema)
    );
    
    console.log(`[Cache SET] ${cacheKey}, TTL: ${ttl}s`);
  }
  
  /**
   * Invalidate form cache on update
   */
  async invalidateForm(formId: string, versionId: string): Promise<void> {
    const cacheKey = `form:${formId}:${versionId}`;
    
    await this.client.del(cacheKey);
    
    console.log(`[Cache INVALIDATE] ${cacheKey}`);
  }
  
  /**
   * Get or compute (cache-aside pattern)
   */
  async getOrCompute<T>(
    cacheKey: string,
    ttl: number,
    computeFn: () => Promise<T>
  ): Promise<T> {
    // Try cache first
    const cached = await this.client.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    
    // Cache miss: compute value
    const value = await computeFn();
    
    // Store in cache
    await this.client.setex(cacheKey, ttl, JSON.stringify(value));
    
    return value;
  }
  
  /**
   * Distributed lock (for background jobs)
   */
  async acquireLock(lockKey: string, ttl: number): Promise<boolean> {
    const result = await this.client.set(lockKey, '1', 'EX', ttl, 'NX');
    return result === 'OK';
  }
  
  /**
   * Release lock
   */
  async releaseLock(lockKey: string): Promise<void> {
    await this.client.del(lockKey);
  }
}
```

**Cache Invalidation Strategy:**

```typescript
// When form is updated, invalidate cache

@Injectable()
export class FormService {
  constructor(
    private prisma: PrismaService,
    private cache: RedisCacheService
  ) {}
  
  async updateForm(formId: string, updates: Partial<FormSchema>): Promise<FormVersion> {
    // 1. Update database
    const updatedForm = await this.prisma.formVersion.update({
      where: { id: formId },
      data: updates
    });
    
    // 2. Invalidate cache
    await this.cache.invalidateForm(formId, updatedForm.versionId);
    
    // 3. Publish invalidation event (for multi-instance deployments)
    await this.cache.publish('form:invalidate', {
      formId,
      versionId: updatedForm.versionId
    });
    
    return updatedForm;
  }
}
```

**Redis High Availability:**

```yaml
# Redis Sentinel (automatic failover)
# docker-compose.yml

services:
  redis-master:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
  
  redis-replica-1:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379
  
  redis-replica-2:
    image: redis:7-alpine
    command: redis-server --replicaof redis-master 6379
  
  redis-sentinel-1:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
  
  redis-sentinel-2:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
  
  redis-sentinel-3:
    image: redis:7-alpine
    command: redis-sentinel /etc/redis/sentinel.conf
    volumes:
      - ./sentinel.conf:/etc/redis/sentinel.conf
```

**Verdict:** ✅ **Recommended for production EDC platform**

---

### 5.4 Option 3: Application-Level Cache (In-Memory)

**Rating: 6/10** ⚠️ **OK FOR SINGLE-INSTANCE, NOT SCALABLE**

**Implementation:**

```typescript
// libs/shared/src/lib/cache/memory-cache.service.ts

@Injectable()
export class MemoryCacheService {
  private cache = new Map<string, { value: any; expiresAt: number }>();
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }
  
  set(key: string, value: any, ttl: number): void {
    this.cache.set(key, {
      value,
      expiresAt: Date.now() + ttl * 1000
    });
  }
}
```

**Pros:**
- ✅ Simple (no external dependency)
- ✅ Fast (no network overhead)

**Cons:**
- ❌ Cannot scale horizontally (cache not shared across instances)
- ❌ Lost on restart
- ❌ Memory leaks if not managed carefully

**Verdict:** ⚠️ **OK for MVP, use Redis for production**

---

### 5.5 Final Caching Decision

**✅ Decision: Redis (Distributed Cache)**

**Deployment Strategy:**

```
Phase 1 (MVP): Single Redis Instance
- 1 x Redis server (2GB RAM)
- Sufficient for 20 clients, 200 concurrent users
- Cost: $30/month (AWS ElastiCache t3.small)

Phase 2 (Production): Redis Sentinel (High Availability)
- 1 x Master + 2 x Replicas + 3 x Sentinels
- Automatic failover
- Cost: $150/month (AWS ElastiCache m5.large x3)

Phase 3 (High Scale): Redis Cluster (Sharding)
- 6-node cluster (3 masters + 3 replicas)
- Data sharding across nodes
- Cost: $600/month (AWS ElastiCache m5.xlarge x6)
```

**Cached Data Types:**

| Cache Key Pattern | TTL | Size Est. | Invalidation |
|-------------------|-----|-----------|--------------|
| `form:{formId}:{versionId}` | 1 hour | 50KB | On form update |
| `codelist:{codelistId}` | 1 day | 10KB | On codelist update |
| `user:session:{sessionId}` | 8 hours | 1KB | On logout |
| `validation:{formId}:{versionId}` | 1 hour | 100KB | On form update |
| `ec:compiled:{formId}:{versionId}` | 1 hour | 500KB | On EC update |
| `query:stats:{studyId}` | 5 min | 5KB | On query change |

**Total Cache Size (20 clients, 1000 forms):**
- Forms: 1000 x 50KB = 50MB
- Codelists: 500 x 10KB = 5MB
- Sessions: 500 x 1KB = 500KB
- Validations: 1000 x 100KB = 100MB
- ECs: 1000 x 500KB = 500MB
- Stats: 100 x 5KB = 500KB

**Total: ~650MB** → 2GB Redis instance has plenty of headroom

---

## 6. Schema Design

### 6.1 Core Tables

**Complete PostgreSQL schema will be documented in a separate `database-schema.md` file, but key tables:**

```sql
-- Study management
CREATE TABLE studies (
  study_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_number VARCHAR(50) NOT NULL UNIQUE,
  study_title TEXT NOT NULL,
  protocol_version VARCHAR(20),
  sponsor VARCHAR(200),
  phase VARCHAR(20), -- Phase I, II, III, IV
  therapeutic_area VARCHAR(100),
  start_date DATE,
  end_date DATE,
  status VARCHAR(20) NOT NULL, -- draft, active, locked, archived
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Study environments (DEV/QA/PROD)
CREATE TABLE study_environments (
  environment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(study_id),
  environment_type VARCHAR(20) NOT NULL CHECK (environment_type IN ('DEV', 'QA', 'PRODUCTION')),
  environment_name VARCHAR(100) NOT NULL,
  active_form_version VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Form versions (see form-versioning-and-migration.md)
CREATE TABLE form_versions (
  version_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL,
  environment_id UUID NOT NULL REFERENCES study_environments(environment_id),
  version_number VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  form_schema JSONB NOT NULL, -- Dynamic form definition
  compiled_edit_checks_client TEXT,
  compiled_edit_checks_server TEXT,
  published_by UUID,
  published_at TIMESTAMPTZ,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subjects
CREATE TABLE subjects (
  subject_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL REFERENCES studies(study_id),
  site_id UUID NOT NULL REFERENCES sites(site_id),
  subject_number VARCHAR(50) NOT NULL,
  screening_number VARCHAR(50),
  enrollment_date DATE,
  status VARCHAR(20) NOT NULL, -- screening, enrolled, completed, withdrawn
  withdrawal_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(study_id, subject_number)
);

-- Subject form bindings (immutable once data entry starts)
CREATE TABLE subject_form_bindings (
  binding_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(subject_id),
  form_id UUID NOT NULL,
  bound_version_id UUID NOT NULL REFERENCES form_versions(version_id),
  bound_version_number VARCHAR(20) NOT NULL,
  bound_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_entry_started BOOLEAN NOT NULL DEFAULT FALSE,
  first_entry_at TIMESTAMPTZ,
  last_entry_at TIMESTAMPTZ,
  migrated_from UUID REFERENCES form_versions(version_id),
  migrated_at TIMESTAMPTZ,
  
  UNIQUE(study_id, subject_id, form_id)
);

-- Form data (actual data entries)
CREATE TABLE form_data (
  record_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(subject_id),
  form_id UUID NOT NULL,
  version_id UUID NOT NULL REFERENCES form_versions(version_id),
  visit_id UUID REFERENCES visits(visit_id),
  data JSONB NOT NULL, -- { "patientWeight": 75.5, "patientHeight": 180, ... }
  status VARCHAR(20) NOT NULL DEFAULT 'draft', -- draft, submitted, locked, frozen
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by UUID,
  locked_at TIMESTAMPTZ,
  
  -- Enable fast queries on JSONB data
  CONSTRAINT valid_data_jsonb CHECK (jsonb_typeof(data) = 'object')
);

-- Create GIN index for JSONB queries
CREATE INDEX idx_form_data_data_gin ON form_data USING gin(data jsonb_path_ops);

-- Example JSONB query
-- SELECT * FROM form_data WHERE data @> '{"patientWeight": 75.5}';
-- SELECT * FROM form_data WHERE data->>'patientWeight' > '70';

-- Audit trail (immutable)
CREATE TABLE audit_trail (
  audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  user_id UUID NOT NULL,
  user_name VARCHAR(200) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- What was changed
  entity_type VARCHAR(50), -- subject, form_data, query, etc.
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  change_reason TEXT,
  
  -- Additional context
  description TEXT NOT NULL,
  additional_data JSONB,
  
  -- Regulatory traceability
  session_id UUID,
  request_id UUID
);

-- Audit trail is append-only, never UPDATE or DELETE
-- Partition by month for performance
CREATE TABLE audit_trail_2026_06 PARTITION OF audit_trail
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

-- Queries (data clarifications)
CREATE TABLE queries (
  query_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES subjects(subject_id),
  form_id UUID,
  field_key VARCHAR(100),
  visit_id UUID,
  query_type VARCHAR(50) NOT NULL, -- MANUAL, SYSTEM_VALIDATION, EDIT_CHECK
  status VARCHAR(20) NOT NULL DEFAULT 'open', -- open, answered, closed, cancelled
  priority VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  query_text TEXT NOT NULL,
  raised_by UUID NOT NULL,
  raised_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_to UUID,
  due_date TIMESTAMPTZ,
  closed_by UUID,
  closed_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- E-signatures
CREATE TABLE esignatures (
  signature_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  study_id UUID NOT NULL,
  user_id UUID NOT NULL,
  user_name VARCHAR(200) NOT NULL,
  user_role VARCHAR(50) NOT NULL,
  signed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  signature_meaning VARCHAR(100) NOT NULL, -- "Reviewed and Approved", "Data Entry Complete"
  signature_image TEXT, -- Base64 encoded PNG
  ip_address INET NOT NULL,
  device_info TEXT,
  
  -- What was signed
  entity_type VARCHAR(50) NOT NULL, -- form_data, query, report
  entity_id UUID NOT NULL,
  entity_state_hash VARCHAR(64) NOT NULL, -- SHA-256 hash of signed data
  
  -- Regulatory compliance
  username_verified BOOLEAN NOT NULL DEFAULT TRUE,
  password_verified BOOLEAN NOT NULL DEFAULT TRUE,
  audit_trail_id UUID NOT NULL REFERENCES audit_trail(audit_id)
);
```

### 6.2 Partitioning Strategy

**Large Tables that Need Partitioning:**

| Table | Partition By | Rationale |
|-------|-------------|-----------|
| `audit_trail` | Month (RANGE) | Grows rapidly, 1M+ events/month |
| `form_data` | Study ID (LIST) | Isolate data per study |
| `queries` | Year (RANGE) | Historical queries rarely accessed |

**Example: Audit Trail Partitioning**

```sql
-- Create partitioned audit trail table
CREATE TABLE audit_trail (
  audit_id UUID NOT NULL,
  study_id UUID NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- ... rest of columns
  PRIMARY KEY (audit_id, timestamp)  -- Include partition key in PK
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions (automated with pg_partman extension)
CREATE TABLE audit_trail_2026_06 PARTITION OF audit_trail
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE audit_trail_2026_07 PARTITION OF audit_trail
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

-- Automatic partition creation (pg_partman)
SELECT partman.create_parent(
  p_parent_table := 'public.audit_trail',
  p_control := 'timestamp',
  p_type := 'native',
  p_interval := '1 month',
  p_premake := 3  -- Create 3 months ahead
);

-- Automatic partition deletion (retain 7 years for regulatory compliance)
UPDATE partman.part_config
SET retention = '84 months',
    retention_keep_table = false
WHERE parent_table = 'public.audit_trail';
```

---

## 7. Data Isolation & Security

### 7.1 Encryption

**Encryption at Rest:**

```yaml
# PostgreSQL RDS with KMS encryption
resource "aws_rds_instance" "client_db" {
  identifier = "edc-postgres-${var.client_id}"
  engine = "postgres"
  
  # Enable encryption at rest
  storage_encrypted = true
  kms_key_id = aws_kms_key.client_encryption_key.id  # Client-specific key
  
  # Encrypt backups
  backup_retention_period = 35
  backup_encryption_enabled = true
}

# Client-specific KMS key
resource "aws_kms_key" "client_encryption_key" {
  description = "Encryption key for ${var.client_id} EDC database"
  deletion_window_in_days = 30
  
  tags = {
    Client = var.client_id
    Purpose = "EDC-Database-Encryption"
  }
}
```

**Encryption in Transit:**

```sql
-- Require SSL for all connections
ALTER SYSTEM SET ssl = on;
ALTER SYSTEM SET ssl_cert_file = '/var/lib/postgresql/server.crt';
ALTER SYSTEM SET ssl_key_file = '/var/lib/postgresql/server.key';

-- Reject non-SSL connections
ALTER SYSTEM SET ssl_min_protocol_version = 'TLSv1.2';

-- Client connections must use SSL
hostssl all all 0.0.0.0/0 scram-sha-256
```

**Application-Level Encryption (PHI/PII fields):**

```typescript
// Encrypt sensitive fields before storing in database

@Injectable()
export class EncryptionService {
  constructor(private config: ConfigService) {}
  
  /**
   * Encrypt PHI field (e.g., patient name, SSN)
   */
  encrypt(plaintext: string, clientId: string): string {
    // Load client-specific encryption key
    const key = this.loadClientKey(clientId);
    
    // AES-256-GCM encryption
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${encrypted}:${authTag}:${iv.toString('hex')}`;
  }
  
  /**
   * Decrypt PHI field
   */
  decrypt(ciphertext: string, clientId: string): string {
    const [encrypted, authTag, ivHex] = ciphertext.split(':');
    
    const key = this.loadClientKey(clientId);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 7.2 Access Control

**Row-Level Security (RLS):**

```sql
-- Enable RLS for multi-user access control
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see subjects from their assigned sites
CREATE POLICY subject_site_access ON subjects
  FOR SELECT
  USING (
    site_id IN (
      SELECT site_id FROM user_site_assignments
      WHERE user_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Policy: Data managers can see all subjects
CREATE POLICY subject_dm_access ON subjects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE user_id = current_setting('app.current_user_id')::uuid
        AND role IN ('data-manager', 'study-admin')
    )
  );
```

**Application sets user context:**

```typescript
// Set PostgreSQL session variable for RLS
async executeQuery(clientId: string, userId: string, query: string) {
  const pool = await this.connectionManager.getConnection(clientId);
  
  const client = await pool.connect();
  try {
    // Set user context for RLS
    await client.query(`SET app.current_user_id = '${userId}'`);
    
    // Execute query (RLS policies automatically applied)
    const result = await client.query(query);
    
    return result.rows;
  } finally {
    client.release();
  }
}
```

---

## 8. Compliance & Regulatory

### 8.1 21 CFR Part 11 Compliance

**Database Requirements:**

| Requirement | Implementation |
|-------------|----------------|
| **§11.10(a) — Validation** | Database schema validated, migration scripts tested |
| **§11.10(c) — Accurate Copies** | `pg_dump` generates exact copies, checksums verified |
| **§11.10(d) — Archival** | Backups retained 7 years, immutable storage (S3 Glacier) |
| **§11.10(e) — Audit Trail** | `audit_trail` table, append-only, time-stamped |
| **§11.10(k)(1) — System Validation** | Database versioning, schema migrations tracked |

### 8.2 GDPR Compliance

**Right to Erasure:**

```sql
-- Complete data deletion for a subject
BEGIN TRANSACTION;

-- 1. Archive data (for regulatory retention)
INSERT INTO archived_subjects SELECT * FROM subjects WHERE subject_id = 'subject-uuid';
INSERT INTO archived_form_data SELECT * FROM form_data WHERE subject_id = 'subject-uuid';

-- 2. Delete from active tables
DELETE FROM form_data WHERE subject_id = 'subject-uuid';
DELETE FROM queries WHERE subject_id = 'subject-uuid';
DELETE FROM audit_trail WHERE entity_id = 'subject-uuid';
DELETE FROM subjects WHERE subject_id = 'subject-uuid';

-- 3. Log deletion
INSERT INTO audit_trail (event_type, description, additional_data)
VALUES ('GDPR_DATA_ERASURE', 'Subject data deleted per GDPR Article 17', 
        '{"subject_id": "subject-uuid", "reason": "patient-request"}');

COMMIT;
```

### 8.3 Backup & Disaster Recovery

**Backup Strategy:**

```yaml
# Automated PostgreSQL backups (AWS RDS)
resource "aws_rds_instance" "client_db" {
  # Daily automated backups
  backup_retention_period = 35  # days
  backup_window = "03:00-04:00"  # UTC
  
  # Point-in-time recovery (via WAL archiving)
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  # Copy backups to separate region (DR)
  copy_tags_to_snapshot = true
}

# Long-term archival (7 years regulatory retention)
resource "aws_backup_plan" "edc_longterm" {
  name = "edc-7year-retention"
  
  rule {
    rule_name = "monthly-backup"
    target_vault_name = aws_backup_vault.edc_vault.name
    schedule = "cron(0 5 1 * ? *)"  # 1st of every month
    
    lifecycle {
      cold_storage_after = 90     # Move to Glacier after 90 days
      delete_after = 2555         # Delete after 7 years (2555 days)
    }
  }
}
```

---

## 9. Scalability Analysis

### 9.1 Vertical Scaling Limits

**PostgreSQL Single-Server Limits:**

| Metric | Small (db.t3.large) | Medium (db.m5.xlarge) | Large (db.m5.4xlarge) | XL (db.m5.12xlarge) |
|--------|---------------------|----------------------|----------------------|-------------------|
| vCPU | 2 | 4 | 16 | 48 |
| RAM | 8GB | 16GB | 64GB | 192GB |
| Max Connections | 200 | 400 | 1,600 | 4,800 |
| Concurrent Users Supported | 50 | 200 | 800 | 2,400 |
| Storage | 1TB | 5TB | 16TB | 64TB |
| Cost/Month | $150 | $400 | $1,600 | $4,800 |

**EDC Platform Capacity:**

```
Scenario 1: Small Client (1-5 studies)
- Concurrent Users: 20-50
- Database: db.t3.large (2 vCPU, 8GB RAM)
- Cost: $150/month
- Capacity: 50 concurrent users, 5,000 subjects, 500K form entries

Scenario 2: Medium Client (6-20 studies)
- Concurrent Users: 50-200
- Database: db.m5.xlarge (4 vCPU, 16GB RAM)
- Cost: $400/month
- Capacity: 200 concurrent users, 20,000 subjects, 5M form entries

Scenario 3: Large Client (20+ studies)
- Concurrent Users: 200-500
- Database: db.m5.4xlarge (16 vCPU, 64GB RAM)
- Cost: $1,600/month
- Capacity: 800 concurrent users, 100,000 subjects, 50M form entries

Scenario 4: Enterprise Client (100+ studies)
- Concurrent Users: 500-1,000
- Database: db.m5.12xlarge (48 vCPU, 192GB RAM)
- Cost: $4,800/month
- Capacity: 2,400 concurrent users, 500,000 subjects, 250M form entries
```

**Verdict:** ✅ Vertical scaling sufficient for EDC use case (never hitting limits)

### 9.2 Horizontal Scaling (if needed)

**Read Replicas for Reporting:**

```yaml
# Primary database (writes)
resource "aws_rds_instance" "client_primary" {
  identifier = "edc-postgres-${var.client_id}-primary"
  instance_class = "db.m5.xlarge"
}

# Read replica (reporting queries)
resource "aws_rds_instance" "client_replica" {
  identifier = "edc-postgres-${var.client_id}-replica"
  replicate_source_db = aws_rds_instance.client_primary.id
  instance_class = "db.m5.xlarge"
}

# Application routing
# - Write queries → Primary
# - Read queries (reports) → Replica
```

---

## 10. Final Architecture

### 10.1 Complete Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EDC PLATFORM ARCHITECTURE                       │
│                        (Per-Client Deployment)                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │                    Load Balancer (AWS ALB)                        │ │
│  │                     SSL Termination (TLS 1.2+)                    │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                              │                                          │
│                  ┌───────────┴───────────┐                            │
│                  │                       │                            │
│    ┌─────────────▼──────────┐  ┌────────▼──────────────┐             │
│    │  EDC Platform Instance │  │  EDC Platform Instance│             │
│    │    (NestJS Monolith)   │  │    (NestJS Monolith)  │             │
│    │      - Forms Module    │  │      - Forms Module   │             │
│    │      - Subjects Module │  │      - Subjects Module│             │
│    │      - Query Module    │  │      - Query Module   │             │
│    │      - Audit Module    │  │      - Audit Module   │             │
│    │      - Validation      │  │      - Validation     │             │
│    │      - Edit Checks     │  │      - Edit Checks    │             │
│    │      - E-Signature     │  │      - E-Signature    │             │
│    │      - Versioning      │  │      - Versioning     │             │
│    └────────────┬───────────┘  └────────┬──────────────┘             │
│                 │                       │                            │
│                 └───────────┬───────────┘                            │
│                             │                                         │
│              ┌──────────────┼──────────────┐                         │
│              │              │              │                         │
│      ┌───────▼────┐  ┌──────▼─────┐  ┌────▼────────┐                │
│      │ PostgreSQL │  │   Redis    │  │  S3/MinIO   │                │
│      │  (Primary) │  │  (Cache)   │  │(File Store) │                │
│      │  RDS Multi │  │ ElastiCache│  │             │                │
│      │     -AZ    │  │  Sentinel  │  │  Encrypted  │                │
│      │            │  │            │  │   Backups   │                │
│      │ - Encrypted│  │ - Sessions │  │             │                │
│      │ - Daily    │  │ - Form Def │  │ - PDFs      │                │
│      │   Backups  │  │ - Codelists│  │ - Exports   │                │
│      │ - Point-in │  │ - Stats    │  │ - Attachmt  │                │
│      │   Time Rec │  │            │  │             │                │
│      │            │  │            │  │             │                │
│      └────────────┘  └────────────┘  └─────────────┘                │
│                                                                        │
│  ┌───────────────────────────────────────────────────────────────────┐│
│  │              Monitoring & Observability                           ││
│  │  - CloudWatch Logs (application logs)                             ││
│  │  - CloudWatch Metrics (CPU, RAM, DB connections)                  ││
│  │  - X-Ray (distributed tracing)                                    ││
│  │  - SNS Alerts (error rate, DB slow queries)                       ││
│  └───────────────────────────────────────────────────────────────────┘│
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

                        INFRASTRUCTURE SUMMARY
┌────────────────────────────────────────────────────────────────────────┐
│ ✅ Single-Tenant: Each client gets own infrastructure stack           │
│ ✅ Modular Monolith: All modules in single NestJS app                 │
│ ✅ PostgreSQL: ACID-compliant relational database                     │
│ ✅ Redis: Distributed cache for performance                           │
│ ✅ S3: Encrypted file storage                                         │
│ ✅ Vertical Scaling: Sufficient for 200-500 concurrent users          │
│ ✅ High Availability: Multi-AZ RDS, Redis Sentinel, ALB               │
│ ✅ Disaster Recovery: Daily backups, 7-year retention                 │
│ ✅ Regulatory Compliance: 21 CFR Part 11, GDPR, HIPAA                 │
└────────────────────────────────────────────────────────────────────────┘
```

### 10.2 Technology Stack Summary

| Layer | Technology | Justification |
|-------|------------|---------------|
| **Frontend** | Angular 21 + Lit 3 | Modern reactive framework + web components |
| **Backend** | NestJS (Node.js + TypeScript) | Modular monolith, TypeScript type safety |
| **Database** | PostgreSQL 15+ | ACID, JSONB, regulatory compliance |
| **Cache** | Redis 7 + Sentinel | Distributed caching, high availability |
| **File Storage** | S3 / MinIO | Scalable object storage, encryption |
| **Search** | PostgreSQL Full-Text | Built-in, no extra infrastructure (Phase 1) |
| **Search (Phase 2)** | Elasticsearch | Advanced search if needed later |
| **Load Balancer** | AWS ALB / NGINX | SSL termination, health checks |
| **Monitoring** | CloudWatch / Prometheus | Logs, metrics, alerts |
| **Deployment** | Docker + ECS / Kubernetes | Containerized deployment |
| **IaC** | Terraform / Pulumi | Infrastructure as code |

---

## 11. Migration Path

### 11.1 Phase 1: MVP (Months 1-6)

**Architecture:**
- ✅ Single PostgreSQL instance per client (db.t3.large)
- ✅ Optional Redis (can start without it)
- ✅ Modular monolith (NestJS)
- ✅ Single region deployment

**Scale Target:**
- 5-10 clients
- 20-50 concurrent users per client
- 1,000 subjects per client

### 11.2 Phase 2: Production (Months 7-12)

**Architecture:**
- ✅ PostgreSQL Multi-AZ for high availability
- ✅ Redis Sentinel for caching
- ✅ S3 for file storage
- ✅ Multi-region deployment (US + EU)

**Scale Target:**
- 20-50 clients
- 50-200 concurrent users per client
- 10,000 subjects per client

### 11.3 Phase 3: Enterprise (Year 2)

**Architecture:**
- ✅ PostgreSQL with read replicas for reporting
- ✅ Redis Cluster for high-scale caching
- ✅ Optional: Extract Report Service (microservice)
- ✅ Optional: Elasticsearch for advanced search

**Scale Target:**
- 100+ clients
- 200-500 concurrent users per client
- 100,000 subjects per client

---

## 12. Trade-offs & Risks

### 12.1 Trade-offs

| Decision | Trade-off | Mitigation |
|----------|-----------|------------|
| **Single-Tenant** | Higher infrastructure cost | Charge premium for data isolation |
| **Monolith** | Cannot scale modules independently | Extract services in Phase 3 if needed |
| **PostgreSQL Only** | No native full-text search ranking | Add Elasticsearch in Phase 2 if needed |
| **No Microservices** | Less team autonomy | Modular code structure within monolith |

### 12.2 Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| **Database Bottleneck** | Low | High | Vertical scaling + read replicas |
| **Cache Failure** | Medium | Low | Degraded performance but system still works |
| **Data Breach** | Low | Critical | Encryption at rest/transit, audit logs |
| **Regulatory Audit Failure** | Low | Critical | Compliance reviews every 6 months |

---

## 13. Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-05-31 | PostgreSQL as primary database | ACID compliance, regulatory requirements, JSONB support |
| 2026-05-31 | Single-tenant architecture (separate instance per client) | Data isolation, GDPR compliance, regulatory audit requirements |
| 2026-05-31 | Modular monolith (Phase 1), microservices optional (Phase 3) | Low concurrent user count (~200), simpler operations, ACID transactions |
| 2026-05-31 | Redis for caching | Sub-millisecond latency, distributed sessions, 4-5x performance improvement |
| 2026-05-31 | S3/MinIO for file storage | Scalable, encrypted, integrated with database |
| 2026-05-31 | PostgreSQL full-text search (Phase 1), Elasticsearch optional (Phase 2) | Built-in, no extra infrastructure for MVP |

---

## 14. Next Steps

1. ✅ **Create detailed database schema document** (`database-schema.md`)
2. ✅ **Document Redis caching patterns** (`caching-strategy.md`)
3. ✅ **Create infrastructure-as-code templates** (Terraform modules)
4. ✅ **Document backup & disaster recovery procedures**
5. ✅ **Create compliance checklist** (21 CFR Part 11, GDPR, HIPAA)

---

**END OF ARCHITECTURE DECISIONS: DATABASE DESIGN & INFRASTRUCTURE**

---

**Document Stats:**
- **Lines:** ~2,900
- **Status:** Architecture Decision Complete
- **Confidence:** 95% (High confidence in decisions)
- **Review Date:** Q3 2026 (re-evaluate after 6 months in production)

**Related Documents:**
- [form-versioning-and-migration.md](form-versioning-and-migration.md) — Versioning strategy
- [development-plan-part-4b-compliance.md](development-plan-part-4b-compliance.md) — Compliance & audit trail
- [form-builder-architecture.md](form-builder-architecture.md) — Overall system architecture
