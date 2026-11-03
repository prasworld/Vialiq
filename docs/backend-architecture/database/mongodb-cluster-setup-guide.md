# Comprehensive Guide: Creating MongoDB Clusters in Development (Docker & Cloud Atlas)

> **Domain:** Backend Architecture — Database Infrastructure  
> **Audience:** Developers, DevOps, and System Architects (Beginner-friendly: assumes zero prior MongoDB or Docker clustering knowledge)  
> **Purpose:** Step-by-step instructions for creating multiple small MongoDB clusters (Replica Sets) locally for **$0** using Docker, and online using **MongoDB Atlas** (Free and Low-Cost Cloud Tiers).  
> **Related Documents:**
> - [3-Cluster & Flexible Tenancy Architecture](./002-3-cluster-and-flexible-tenancy-architecture.md)
> - [Auth, Identity & Multi-Tenancy Architecture](../../auth-identity-multitenancy-clinical-edc.md)
> - [Database Architecture Specification](./database-architecture-specification.md)
> - [ADR: Database Selection (SQL Server vs MongoDB)](./001-database-selection-adr.md)
> - [Docker Cluster Config](../../../tools/docker/docker-compose.mongo-cluster.yml)

---

## Table of Contents

1. [Foundational Concepts: What is a Cluster & Why Do We Need One?](#1-foundational-concepts-what-is-a-cluster--why-do-we-need-one)
2. [Part 1: Running Local Clusters Using Docker ($0 Cost)](#2-part-1-running-local-clusters-using-docker-0-cost)
   - [2.1 Prerequisites: Installing Docker Desktop](#21-prerequisites-installing-docker-desktop)
   - [2.2 Option A: Ultra-Lightweight 1-Node Replica Set (~150MB RAM)](#22-option-a-ultra-lightweight-1-node-replica-set-150mb-ram)
   - [2.3 Option B: Full 3-Node Replica Set Cluster (~400MB RAM)](#23-option-b-full-3-node-replica-set-cluster-400mb-ram)
   - [2.4 Option C: Running the Full 3-Cluster Platform Topology Simultaneously](#24-option-c-running-the-full-3-cluster-platform-topology-simultaneously)
   - [2.5 How to Inspect & Test Your Local Cluster (Compass & mongosh)](#25-how-to-inspect--test-your-local-cluster-compass--mongosh)
3. [Part 2: Creating Clusters Online Using MongoDB Atlas (Cloud)](#3-part-2-creating-clusters-online-using-mongodb-atlas-cloud)
   - [3.1 Step 1: Sign Up for MongoDB Atlas](#31-step-1-sign-up-for-mongodb-atlas)
   - [3.2 Step 2: Deploy an M0 Free Cluster ($0 Forever)](#32-step-2-deploy-an-m0-free-cluster-0-forever)
   - [3.3 Step 3: Configure Database Security & IP Whitelisting](#33-step-3-configure-database-security--ip-whitelisting)
   - [3.4 Step 4: Obtaining Your Connection String](#34-step-4-obtaining-your-connection-string)
   - [3.5 How to Deploy the Full 3-Cluster Architecture Online for $0 (Atlas Free Tier)](#35-how-to-deploy-the-full-3-cluster-architecture-online-for-0-atlas-free-tier)
4. [Part 3: Other Cloud Providers & Self-Hosted Cloud VMs](#4-part-3-other-cloud-providers--self-hosted-cloud-vms)
   - [4.1 AWS DocumentDB vs. True MongoDB (Beware Compatibility)](#41-aws-documentdb-vs-true-mongodb-beware-compatibility)
   - [4.2 Running Docker Clusters on Cheap Cloud VMs ($5-$6/month)](#42-running-docker-clusters-on-cheap-cloud-vms-5-6month)
5. [Part 4: Code Verification — Testing Multi-Document ACID Transactions](#5-part-4-code-verification--testing-multi-document-acid-transactions)
6. [Part 5: Troubleshooting & Common Pitfalls](#6-part-5-troubleshooting--common-pitfalls)

---

## 1. Foundational Concepts: What is a Cluster & Why Do We Need One?

### What is a "Standalone" MongoDB vs. a "Replica Set Cluster"?
* **Standalone Instance**: Runs a single database process (`mongod`). It stores data on disk, but operates alone.
* **Replica Set (Cluster)**: A group of MongoDB processes that maintain the exact same data set. Typically, a cluster consists of **3 nodes**:
  * **1 Primary Node**: Receives all write operations (inserts, updates).
  * **2 Secondary Nodes**: Continuously replicate data from the Primary. If the Primary crashes, the secondaries hold an automatic election and one becomes the new Primary within 10–30 seconds.

```
                      ┌──────────────────────┐
                      │    Primary (Write)   │
                      │      Port 27017      │
                      └──────────┬───────────┘
                                 │
                 Replicates Data │ Continuously (Oplog)
                                 ▼
        ┌────────────────────────┴────────────────────────┐
        ▼                                                 ▼
┌──────────────────────┐                         ┌──────────────────────┐
│  Secondary (Replica) │                         │  Secondary (Replica) │
│      Port 27018      │                         │      Port 27019      │
└──────────────────────┘                         └──────────────────────┘
```

### Why does an EDC strictly require a Replica Set even in Development?
1. **Multi-Document ACID Transactions**: In an EDC, when a coordinator submits a form, the system must write the form data, write the audit trail record, and flag discrepancy queries in a single atomic commit. If one fails, everything rolls back. **MongoDB explicitly disables transactions on standalone databases.** You *must* have a Replica Set (even a 1-node replica set) to run transactions.
2. **Change Streams (Real-Time CDC)**: To listen to live database events (for audit logs, live notifications, or reporting projections), MongoDB uses Change Streams. **Change Streams only function on Replica Sets** because they read the cluster's replication log (`oplog.rs`).

---

## 2. Part 1: Running Local Clusters Using Docker ($0 Cost)

Docker runs lightweight, isolated software containers on your computer. With Docker, you don't need to install MongoDB directly on your operating system; Docker downloads the official MongoDB image and runs it in an isolated sandbox.

### 2.1 Prerequisites: Installing Docker Desktop
1. Download **Docker Desktop** for your operating system:
   * **Mac**: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) (Select Apple Silicon or Intel chip).
   * **Windows**: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) (Enable WSL 2 if prompted).
   * **Linux**: Install via package manager (`apt-get install docker-compose-plugin`).
2. Open your terminal and verify Docker is running:
   ```bash
   docker --version
   docker compose version
   ```
   *If you see version numbers (e.g., Docker version 24+), you are ready.*

---

### 2.2 Option A: Ultra-Lightweight 1-Node Replica Set (~150MB RAM)

If your computer has limited RAM (e.g., 8GB or 16GB) and you simply want to write code and test ACID transactions locally, you can run a **1-node replica set**. It is a single container configured to act as its own cluster.

#### Step 1: Create a file named `docker-compose.mongo-single.yml`
Save this file anywhere in your workspace:

```yaml
version: '3.8'

services:
  mongo-single:
    image: mongo:7.0
    container_name: edc-mongo-single
    restart: always
    # The --replSet flag tells MongoDB to enable replica set features (transactions & change streams)
    command: ["mongod", "--replSet", "rs-single", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27017:27017"
    volumes:
      - mongo_single_data:/data/db

  # Helper service to initialize the replica set once
  mongo-init:
    image: mongo:7.0
    depends_on:
      - mongo-single
    restart: "no"
    entrypoint: [ "bash", "-c", "
      sleep 2;
      mongosh --host mongo-single:27017 --eval '
        try {
          rs.status();
        } catch (e) {
          rs.initiate({
            _id: \"rs-single\",
            members: [{ _id: 0, host: \"localhost:27017\" }]
          });
        }
      ';
    "]

volumes:
  mongo_single_data:
```

#### Step 2: Start the container
Run in your terminal:
```bash
docker compose -f docker-compose.mongo-single.yml up -d
```
* **Status**: Running in the background.
* **Connection String**: `mongodb://localhost:27017/vialiq_edc?replicaSet=rs-single`
* **RAM Used**: ~120MB.

---

### 2.3 Option B: Full 3-Node Replica Set Cluster (~400MB RAM)

This simulates a real production setup. It runs 3 separate MongoDB containers (`mongo1`, `mongo2`, `mongo3`) communicating over an internal virtual network.

This configuration is already included in your project at [`tools/docker/docker-compose.mongo-cluster.yml`](file:///Users/prashantgupta/code/nx/tools/docker/docker-compose.mongo-cluster.yml).

```yaml
version: '3.8'

services:
  mongo1:
    image: mongo:7.0
    container_name: edc-mongo1
    restart: always
    command: ["mongod", "--replSet", "rs-edc", "--bind_ip_all", "--port", "27017"]
    ports:
      - "27017:27017"
    volumes:
      - mongo1_data:/data/db
    networks:
      - edc-net

  mongo2:
    image: mongo:7.0
    container_name: edc-mongo2
    restart: always
    command: ["mongod", "--replSet", "rs-edc", "--bind_ip_all", "--port", "27018"]
    ports:
      - "27018:27018"
    volumes:
      - mongo2_data:/data/db
    networks:
      - edc-net

  mongo3:
    image: mongo:7.0
    container_name: edc-mongo3
    restart: always
    command: ["mongod", "--replSet", "rs-edc", "--bind_ip_all", "--port", "27019"]
    ports:
      - "27019:27019"
    volumes:
      - mongo3_data:/data/db
    networks:
      - edc-net

  # Auto-initializer: Registers the 3 nodes into the replica set
  mongo-init:
    image: mongo:7.0
    depends_on:
      - mongo1
      - mongo2
      - mongo3
    networks:
      - edc-net
    restart: "no"
    entrypoint: [ "bash", "-c", "
      sleep 3;
      mongosh --host mongo1:27017 --eval '
        try {
          rs.status();
        } catch (e) {
          rs.initiate({
            _id: \"rs-edc\",
            members: [
              { _id: 0, host: \"mongo1:27017\" },
              { _id: 1, host: \"mongo2:27018\" },
              { _id: 2, host: \"mongo3:27019\" }
            ]
          });
        }
      ';
    "]

networks:
  edc-net:
    driver: bridge

volumes:
  mongo1_data:
  mongo2_data:
  mongo3_data:
```

#### How to Control the 3-Node Cluster:

* **Start the Cluster**:
  ```bash
  docker compose -f tools/docker/docker-compose.mongo-cluster.yml up -d
  ```
* **Check Status**:
  ```bash
  docker ps
  # You will see edc-mongo1, edc-mongo2, edc-mongo3 running
  ```
* **Stop the Cluster (Preserves Data)**:
  ```bash
  docker compose -f tools/docker/docker-compose.mongo-cluster.yml stop
  ```
* **Wipe Clean & Reset State (Fresh DB for testing)**:
  ```bash
  docker compose -f tools/docker/docker-compose.mongo-cluster.yml down -v
  ```
* **Application Connection String**:
  ```
  mongodb://localhost:27017,localhost:27018,localhost:27019/vialiq_edc?replicaSet=rs-edc
  ```

---

### 2.4 Option C: Running the Full 3-Cluster Platform Topology Simultaneously

In production, Vialiq EDC is always structured into **3 physical clusters**:
1. **Cluster 0: Admin Layer / Control Plane** (`vialiq_control_plane`)
2. **Cluster 1: Not-Live Study Cluster** (`study_{id}_dev`, `study_{id}_uat`)
3. **Cluster 2: Live / PROD Study Cluster** (`study_{id}_prod`)

To replicate this exact multi-cluster physical separation locally on your laptop without paying for cloud resources, Docker isolates the clusters using **distinct host port ranges** and **Docker Compose project names (`-p`)**:

| Platform Cluster | Role | Host Ports (Primary, Sec 1, Sec 2) | Replica Set Name |
|:---|:---|:---:|:---:|
| **Cluster 0: Admin** | Control Plane (tenants, routing, users) | `27017`, `27018`, `27019` | `rs-cluster0` |
| **Cluster 1: Not-Live** | Form Builder drafts & UAT mock dry-runs | `27027`, `27028`, `27029` | `rs-cluster1` |
| **Cluster 2: Live / PROD** | Live clinical trials & 21 CFR Part 11 audit trails | `27037`, `27038`, `27039` | `rs-cluster2` |

#### Run all 3 platform clusters simultaneously:
```bash
# 1. Start Cluster 0 (Admin / Control Plane on 27017-27019)
docker compose -p edc-cluster0 -f tools/docker/docker-compose.mongo-cluster.yml up -d

# 2. Start Cluster 1 (Not-Live DEV/UAT on 27027-27029)
docker compose -p edc-cluster1 -f tools/docker/docker-compose.cluster1.yml up -d

# 3. Start Cluster 2 (Live / PROD on 27037-27039)
docker compose -p edc-cluster2 -f tools/docker/docker-compose.cluster2.yml up -d
```
All 3 clusters run completely isolated from each other in separate RAM sandboxes with zero possibility of cross-cluster data leakage.

---

### 2.5 How to Inspect & Test Your Local Cluster (Compass & mongosh)

#### Method 1: Using the GUI (MongoDB Compass)
1. Download the free GUI: **[MongoDB Compass](https://www.mongodb.com/products/tools/compass)**.
2. Open Compass and paste the connection string:
   ```
   mongodb://localhost:27017,localhost:27018,localhost:27019/vialiq_edc?replicaSet=rs-edc
   ```
3. Click **Connect**. Compass will display all collections and show `PRIMARY` and `SECONDARY` badges next to the cluster members.

#### Method 2: Using the Command Line (`mongosh`)
Connect into the primary container from your terminal:
```bash
docker exec -it edc-mongo1 mongosh --port 27017
```
Once inside the prompt:
```javascript
// Check the health and status of the cluster nodes
rs.status()

// Check which node is Primary
rs.isMaster().primary
```

---

## 3. Part 2: Creating Clusters Online Using MongoDB Atlas (Cloud)

**MongoDB Atlas** is the official fully-managed database-as-a-service provided by the creators of MongoDB. It runs on top of **AWS**, **Google Cloud (GCP)**, or **Microsoft Azure**.

### 3.1 Step 1: Sign Up for MongoDB Atlas
1. Navigate to **[mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)**.
2. Sign up with your work email or Google account (No credit card required).
3. Follow the onboarding wizard to name your Organization (e.g., `Vialiq Health`) and your first Project (e.g., `EDC Platform`).

---

### 3.2 Step 2: Deploy an M0 Free Cluster ($0 Forever)
1. In the Atlas dashboard, click the green **Create** (or **Build a Database**) button.
2. Under deployment options, select **M0 (Free)**:
   * **Storage**: 512 MB (plenty for thousands of development CRF test records).
   * **RAM / vCPU**: Shared.
   * **Cost**: **$0.00 / month forever**.
3. Choose your Cloud Provider and Region:
   * **Provider**: Select **AWS**, **Google Cloud**, or **Azure** (choose whichever cloud your team uses most).
   * **Region**: Select the region closest to you (e.g., `N. Virginia (us-east-1)`, `Frankfurt (eu-central-1)`, or `Mumbai (ap-south-1)`).
4. **Name your Cluster**: Enter `edc-dev-cluster` (lowercase, alphanumeric).
5. Click **Create Deployment**. Atlas will provision a 3-node replica set in the cloud within 1–3 minutes.

---

### 3.3 Step 3: Configure Database Security & IP Whitelisting
Before anyone can connect, Atlas requires two security configurations:

#### A. Create a Database User (Authentication)
1. A dialog will prompt you to create an administrative user:
   * **Username**: `edc_dev_admin`
   * **Password**: Click **Autogenerate Secure Password** and copy it to a secure password manager.
2. Click **Create User**.

#### B. IP Access List (Network Security)
By default, Atlas blocks all incoming internet traffic.
1. In the same security dialog under **Where would you like to connect from?**:
   * For local developer testing: Click **Add My Current IP Address**.
   * For team access / CI/CD pipelines (Development only): You can choose **Allow Access from Anywhere** (`0.0.0.0/0`), protected by your strong username/password.
2. Click **Finish and Close**.

---

### 3.4 Step 4: Obtaining Your Connection String
1. On your cluster dashboard, click the **Connect** button.
2. Choose your connection method:
   * **Drivers (Node.js, C#, Python, etc.)**: Select your language and version.
   * **Compass (GUI)**: If you want to view data visually.
3. Atlas provides an **SRV connection string**:
   ```
   mongodb+srv://edc_dev_admin:<password>@edc-dev-cluster.xxxx.mongodb.net/vialiq_edc?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your actual password and save this in your application's `.env` configuration file:
   ```env
   DATABASE_URL=mongodb+srv://edc_dev_admin:MySuperSecretPassword@edc-dev-cluster.xxxx.mongodb.net/vialiq_edc?retryWrites=true&w=majority
   ```

---

### 3.5 How to Deploy the Full 3-Cluster Architecture Online for $0 (Atlas Free Tier)

**The Rule in MongoDB Atlas**: Atlas permits **one free (M0) cluster per Project**.

To deploy our complete **3-Cluster Platform Architecture** in the cloud for staging or testing without paying cloud bills:

#### Strategy: Create 3 Projects within your Atlas Organization
1. In the top-left navigation bar of MongoDB Atlas, click the **Projects** dropdown.
2. Create **Project 1**: `Vialiq-Cluster-0-Admin` ➔ Deploy an **M0 Free Cluster** (`cluster0-admin.xxxx.mongodb.net`).
3. Create **Project 2**: `Vialiq-Cluster-1-NotLive` ➔ Deploy an **M0 Free Cluster** (`cluster1-notlive.xxxx.mongodb.net`).
4. Create **Project 3**: `Vialiq-Cluster-2-Live` ➔ Deploy an **M0 Free Cluster** (`cluster2-live.xxxx.mongodb.net`).
* **Result**: You have the complete 3-cluster physical topology deployed in the cloud, completely isolated across networks and storage, running at **$0.00 / month forever**.

---

## 4. Part 3: Other Cloud Providers & Self-Hosted Cloud VMs

### 4.1 AWS DocumentDB vs. True MongoDB (Beware Compatibility!)
You may see **Amazon DocumentDB** or **Azure Cosmos DB (with Mongo API)**.
> [!WARNING]
> **Do not use AWS DocumentDB or Azure Cosmos DB for EDC development.**
> * AWS DocumentDB is **not MongoDB**. It is an AWS-proprietary engine that emulates the MongoDB 4.0/5.0 API.
> * It lacks support for modern MongoDB features (like specific Client-Side Field-Level Encryption algorithms, certain aggregation pipeline stages, and specific transaction semantics).
> * DocumentDB has **no free tier**; the minimum instance costs ~$0.08/hour (~$60/month).
> * **Recommendation**: Always use **MongoDB Atlas** for managed cloud, or native **MongoDB Community Edition in Docker**.

### 4.2 Running Docker Clusters on Cheap Cloud VMs ($5-$6/month)
If your team wants a shared remote development cluster without using Atlas:
1. Spin up a low-cost Linux VM (e.g., **DigitalOcean Droplet** for $6/mo, **AWS Lightsail** for $5/mo, or **Hetzner Cloud** for €4/mo).
2. Install Docker on the VM:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Copy `tools/docker/docker-compose.mongo-cluster.yml` to the VM and run:
   ```bash
   docker compose up -d
   ```
* **Result**: Your whole team shares a dedicated 3-node MongoDB cluster accessible over the internet for $5–$6 per month.

---

## 5. Part 4: Code Verification — Testing Multi-Document ACID Transactions

To verify that your cluster (local Docker or Atlas) supports **21 CFR Part 11 compliant multi-document ACID transactions**, you can run this test script:

```typescript
import { MongoClient } from 'mongodb';

async function testTransaction() {
  const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017,localhost:27018,localhost:27019/vialiq_edc?replicaSet=rs-edc';
  const client = new MongoClient(uri);

  await client.connect();
  const db = client.db('vialiq_edc');
  const session = client.startSession();

  console.log('Testing Multi-Document ACID Transaction...');

  try {
    await session.withTransaction(async () => {
      // 1. Insert CRF entry
      await db.collection('crf_entries').insertOne({
        subjectId: 'SUBJ-TEST-001',
        visitId: 'VISIT-1',
        data: { heartRate: 75 },
        createdAt: new Date()
      }, { session });

      // 2. Insert corresponding Audit Trail log
      await db.collection('audit_trail').insertOne({
        entityId: 'SUBJ-TEST-001',
        action: 'INITIAL_SAVE',
        reasonForChange: 'Initial enrollment data entry',
        timestamp: new Date()
      }, { session });

      console.log('✅ Both records written inside atomic transaction.');
    });

    console.log('🎉 Transaction committed successfully! Your cluster is 100% ready for EDC development.');
  } catch (error) {
    console.error('❌ Transaction failed:', error);
  } finally {
    await session.endSession();
    await client.close();
  }
}

testTransaction();
```

---

## 6. Part 5: Troubleshooting & Common Pitfalls

| Problem | Cause | Exact Fix |
|:---|:---|:---|
| `"Transaction numbers are only allowed on a replica set"` | You connected to a standalone MongoDB instance instead of a Replica Set. | Ensure your connection string includes `?replicaSet=rs-edc` and that your Docker container was started with `--replSet rs-edc`. |
| `Error: bind: address already in use 0.0.0.0:27017` | Another MongoDB instance or local service is already using port 27017. | Stop existing service (`brew services stop mongodb-community` or `sudo service mongod stop`) or change the host port mapping in Docker to `27027:27017`. |
| `MongoServerSelectionError: connection timed out` on Atlas | Your current IP address is not whitelisted in MongoDB Atlas. | Log into MongoDB Atlas ➔ Go to **Network Access** ➔ Click **Add IP Address** ➔ Click **Add Current IP Address** ➔ Save. |
| Docker container exits immediately after `docker compose up` | Insufficient Docker Desktop disk space or memory. | Open Docker Desktop Settings ➔ Resources ➔ Increase RAM to at least 2GB and Disk space to at least 10GB. |
| Replica set election loops or cannot find Primary | Nodes cannot reach each other by hostname. | Verify that all nodes belong to the same internal network in `docker-compose.yml` (`edc-net`). |
