# SentinelChain — Enterprise Architecture Document

> **Version**: 3.0 &nbsp;|&nbsp; **Classification**: CONFIDENTIAL &nbsp;|&nbsp; **Date**: August 2026
> **Prepared by**: Solution Architecture Team &nbsp;|&nbsp; **Status**: Approved

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [High-Level Architecture](#3-high-level-architecture)
4. [Low-Level Architecture](#4-low-level-architecture)
5. [Microservice Architecture](#5-microservice-architecture)
6. [Component Diagram](#6-component-diagram)
7. [Sequence Diagrams](#7-sequence-diagrams)
8. [Deployment Architecture](#8-deployment-architecture)
9. [Data Flow Diagram](#9-data-flow-diagram)
10. [Trust Boundaries](#10-trust-boundaries)
11. [Security Architecture](#11-security-architecture)
12. [Threat Model](#12-threat-model)
13. [Database Architecture](#13-database-architecture)
14. [Folder Structure](#14-folder-structure)
15. [Development Roadmap](#15-development-roadmap)

---

## 1. Executive Summary

**SentinelChain** is an enterprise-grade Digital Evidence Management Platform purpose-built for Cyber Crime Police, Digital Forensic Labs, Government Agencies, and Courts of Law.

The platform provides a tamper-proof, AI-augmented chain of custody for digital evidence by combining:

| Pillar | Technology | Purpose |
|--------|-----------|---------|
| **Immutable Ledger** | Polygon Amoy Blockchain + Solidity Smart Contracts | Evidence hash anchoring, non-repudiation |
| **Decentralized Storage** | IPFS via Pinata | Content-addressable file persistence |
| **AI Forensics Engine** | Python FastAPI + OpenAI GPT-4o | Tampering detection, classification, risk scoring |
| **Relational Core** | PostgreSQL 16 | Case management, RBAC, audit trail |
| **API Gateway** | Node.js Express | Business logic orchestration, JWT auth |
| **Frontend** | React 18 + Vite | Investigator dashboard, evidence vault UI |

### Key Capabilities

- **SHA-256 cryptographic hashing** of every evidence file at ingest
- **Blockchain anchoring** — immutable on-chain record (Polygon Amoy) within seconds
- **AI-powered integrity analysis** — deepfake detection, metadata consistency scoring, tampering alerts
- **Role-Based Access Control** — 4 roles: Admin, Investigator, Analyst, Viewer
- **Complete audit trail** — every view, download, verify action is logged immutably
- **Chain of custody tracking** — forensic-grade custody transfer log with blockchain proof
- **Court-ready PDF export** — auto-generated forensic certificates

> [!IMPORTANT]
> This architecture is designed to scale to **millions of evidence files** and **thousands of concurrent users** while maintaining ISO 27037 and NIST 800-86 compliance.

---

## 2. System Overview

SentinelChain follows a **5-layer enterprise architecture** pattern:

```mermaid
graph TB
    subgraph "Layer 1 — Presentation"
        A["React SPA<br/>(Vite + TailwindCSS)"]
        B["Mobile PWA<br/>(Future)"]
    end

    subgraph "Layer 2 — API Gateway & Security"
        C["Express.js API Gateway<br/>JWT Auth · Rate Limiting · CORS · Helmet"]
    end

    subgraph "Layer 3 — Business Logic Services"
        D["Evidence Service"]
        E["Auth & IAM Service"]
        F["Audit & Compliance Service"]
        G["Blockchain Anchor Service"]
        H["AI Forensics Service<br/>(Python FastAPI)"]
    end

    subgraph "Layer 4 — Infrastructure & Data"
        I["PostgreSQL 16<br/>Primary Data Store"]
        J["IPFS / Pinata<br/>Decentralized File Storage"]
        K["Redis Cache<br/>(Planned)"]
        L["File System<br/>Upload Buffer"]
    end

    subgraph "Layer 5 — Blockchain Layer"
        M["Polygon Amoy Testnet<br/>SentinelChain.sol<br/>SentinelToken.sol"]
    end

    A --> C
    B --> C
    C --> D & E & F & G
    D --> H
    D --> I & J & L
    E --> I
    F --> I
    G --> M
    H -.->|"REST /api/ai/*"| D

    style A fill:#1e293b,stroke:#38bdf8,color:#e2e8f0
    style C fill:#1e293b,stroke:#f59e0b,color:#e2e8f0
    style M fill:#1e293b,stroke:#8b5cf6,color:#e2e8f0
    style H fill:#1e293b,stroke:#10b981,color:#e2e8f0
    style I fill:#1e293b,stroke:#06b6d4,color:#e2e8f0
```

### Quality Attribute Requirements

| Attribute | Target | Mechanism |
|-----------|--------|-----------|
| **Availability** | 99.95% uptime | Active-passive DB, K8s self-healing pods |
| **Scalability** | 10M+ evidence files | Horizontal pod scaling, DB partitioning |
| **Latency** | < 200ms API P95 | Redis caching, CDN for static assets |
| **Integrity** | Zero undetected tampering | SHA-256 + blockchain anchoring |
| **Auditability** | Full forensic trail | Immutable audit_logs table, no DELETE |
| **Compliance** | ISO 27037, NIST 800-86, FRE 902 | RBAC, encryption at rest, chain of custody |

---

## 3. High-Level Architecture

```mermaid
C4Context
    title SentinelChain — System Context Diagram (C4 Level 1)

    Person(investigator, "Investigator", "Uploads, verifies, and analyzes digital evidence")
    Person(admin, "Admin", "Manages users, roles, and platform settings")
    Person(analyst, "Analyst", "Views analytics dashboards and AI reports")
    Person(judge, "Court / Judge", "Reviews forensic certificates and evidence chain")

    System(sentinel, "SentinelChain Platform", "AI-Powered Blockchain Evidence Management System")

    System_Ext(polygon, "Polygon Amoy Blockchain", "Immutable evidence hash anchoring")
    System_Ext(ipfs, "IPFS / Pinata", "Decentralized file storage with content addressing")
    System_Ext(openai, "OpenAI GPT-4o", "AI-powered evidence analysis and tampering detection")
    System_Ext(smtp, "SMTP Service", "Email notifications and password resets")
    System_Ext(polygonscan, "PolygonScan Explorer", "Public blockchain transaction viewer")

    Rel(investigator, sentinel, "Uploads evidence, verifies hashes, manages cases")
    Rel(admin, sentinel, "Manages users, configures roles and settings")
    Rel(analyst, sentinel, "Views dashboards, reads AI forensic reports")
    Rel(judge, sentinel, "Downloads forensic certificates, verifies chain")

    Rel(sentinel, polygon, "Anchors SHA-256 hashes via ethers.js")
    Rel(sentinel, ipfs, "Pins evidence files for decentralized persistence")
    Rel(sentinel, openai, "Requests AI analysis, classification, tampering detection")
    Rel(sentinel, smtp, "Sends email alerts and password reset tokens")
    Rel(polygonscan, polygon, "Indexes and displays transactions")
```

### External System Integration Points

| External System | Protocol | Data Exchanged | Direction |
|----------------|----------|---------------|-----------|
| Polygon Amoy | JSON-RPC via ethers.js | Evidence hash, IPFS CID, Case ID | Bidirectional |
| Pinata / IPFS | REST API | Evidence file binary, CID receipt | Write → Read |
| OpenAI GPT-4o | REST API | File metadata, analysis JSON | Request → Response |
| SMTP | SMTP/TLS | Password reset tokens, alerts | Outbound |
| PolygonScan | Browser link | Transaction hash viewer | Outbound (user) |

---

## 4. Low-Level Architecture

### 4.1 Client Tier — React SPA

```mermaid
graph LR
    subgraph "React Application (Vite)"
        direction TB
        subgraph "Pages"
            P1["Dashboard"]
            P2["EvidenceList"]
            P3["EvidenceDetail"]
            P4["UploadEvidence"]
            P5["VerifyEvidence"]
            P6["AdminPanel"]
            P7["Analytics"]
            P8["Login / Register"]
        end
        subgraph "Components"
            C1["Layout + Sidebar"]
            C2["ProtectedRoute"]
            C3["RiskScoreBadge"]
            C4["TamperingDiffCard"]
            C5["CyberToast"]
        end
        subgraph "Services"
            S1["api.js — Axios HTTP Client"]
            S2["blockchain.js — ethers.js"]
            S3["ipfs.js — Pinata SDK"]
        end
        subgraph "State"
            ST1["AuthStore (Zustand/Context)"]
            ST2["React Query Cache"]
        end
    end

    P1 & P2 & P3 & P4 & P5 & P6 & P7 --> C1
    P3 --> C3 & C4
    C2 --> ST1
    P1 & P2 & P3 & P4 & P5 & P7 --> S1
    P5 --> S2
    P4 --> S3
    S1 -->|"HTTP/REST"| EXT["Express API :5000"]

    style EXT fill:#334155,stroke:#f59e0b,color:#e2e8f0
```

### 4.2 Server Tier — Express API

```mermaid
graph TB
    subgraph "Express.js Server (:5000)"
        direction TB
        subgraph "Middleware Stack"
            MW1["Helmet — Security Headers"]
            MW2["CORS — Cross-Origin"]
            MW3["Rate Limiter — 100 req/15min"]
            MW4["Morgan — Request Logging"]
            MW5["JWT Auth Middleware"]
            MW6["Multer — File Upload"]
        end
        subgraph "Route Layer"
            R1["/api/auth"]
            R2["/api/evidence"]
            R3["/api/verify"]
            R4["/api/audit-logs"]
            R5["/api/analytics"]
            R6["/api/users"]
        end
        subgraph "Controller Layer"
            CT1["authController"]
            CT2["evidenceController"]
            CT3["verifyController"]
            CT4["auditController"]
            CT5["analyticsController"]
            CT6["userController"]
        end
        subgraph "Utils & Config"
            U1["hash.js — SHA-256 / MD5 streaming"]
            U2["blockchain.js — ethers.js contract calls"]
            U3["aiService.js — Python AI bridge"]
            U4["helpers.js — formatResponse, paginate"]
            U5["pinata.js — IPFS upload client"]
        end
    end

    MW1 --> MW2 --> MW3 --> MW4 --> MW5
    R1 --> CT1
    R2 --> CT2
    R3 --> CT3
    R4 --> CT4
    R5 --> CT5
    R6 --> CT6
    CT2 --> U1 & U2 & U3 & U5
    CT3 --> U1 & U2
```

### 4.3 AI Service Tier — FastAPI

```mermaid
graph TB
    subgraph "Python FastAPI (:8000)"
        direction TB
        subgraph "Routers"
            AR1["analysis.py — /api/ai/analyze"]
            AR2["classification.py — /api/ai/classify"]
            AR3["integrity.py — /api/ai/integrity-check"]
        end
        subgraph "Services"
            AS1["AIEngine Class"]
            AS2["analyze_evidence()"]
            AS3["classify_content()"]
            AS4["detect_tampering()"]
            AS5["extract_metadata()"]
            AS6["assess_risk()"]
        end
        subgraph "Models"
            AM1["AnalysisResponse"]
            AM2["ClassificationResponse"]
            AM3["TamperingDetectionResponse"]
            AM4["MetadataResponse"]
        end
    end

    AR1 --> AS2
    AR2 --> AS3
    AR3 --> AS4
    AS1 --> AS2 & AS3 & AS4 & AS5 & AS6
    AS2 & AS3 & AS4 --> AM1 & AM2 & AM3

    EXT_OPENAI["OpenAI GPT-4o API"] -.-> AS1
    EXT_EXPRESS["Express Server"] ==>|"POST /api/ai/analyze"| AR1

    style EXT_OPENAI fill:#334155,stroke:#10b981,color:#e2e8f0
    style EXT_EXPRESS fill:#334155,stroke:#f59e0b,color:#e2e8f0
```

### 4.4 Smart Contract Tier — Solidity

| Contract | Network | Purpose |
|----------|---------|---------|
| [SentinelChain.sol](file:///c:/Users/VICTUS/Documents/sairam/contracts/contracts/SentinelChain.sol) | Polygon Amoy (Chain 80002) | Evidence storage, verification, chain of custody |
| [SentinelToken.sol](file:///c:/Users/VICTUS/Documents/sairam/contracts/contracts/SentinelToken.sol) | Polygon Amoy (Chain 80002) | ERC-20 utility token for platform governance |

---

## 5. Microservice Architecture

SentinelChain's services are organized into **7 bounded contexts** following Domain-Driven Design:

```mermaid
graph TB
    subgraph "API Gateway Layer"
        GW["Express API Gateway<br/>:5000<br/>JWT · Rate Limit · CORS"]
    end

    subgraph "Core Domain Services"
        SVC1["📦 Evidence Ingest Service"]
        SVC2["🔐 Crypto Engine Service"]
        SVC3["🤖 AI Forensics Service<br/>:8000 (FastAPI)"]
        SVC4["⛓️ Blockchain Anchor Service"]
    end

    subgraph "Supporting Domain Services"
        SVC5["🔑 Identity & IAM Service"]
        SVC6["📋 Audit & Compliance Service"]
        SVC7["📁 Case Management Service"]
    end

    subgraph "Data Stores"
        DB["🐘 PostgreSQL 16"]
        IPFS["📡 IPFS / Pinata"]
        BC["⛓️ Polygon Amoy"]
        FS["💾 File System Buffer"]
    end

    GW --> SVC1 & SVC2 & SVC5 & SVC6 & SVC7
    SVC1 --> SVC2 & SVC3 & SVC4
    SVC1 --> DB & IPFS & FS
    SVC2 --> DB
    SVC3 -.->|"Async REST"| SVC1
    SVC4 --> BC
    SVC5 --> DB
    SVC6 --> DB
    SVC7 --> DB
```

---

## 6. Component Diagram

```mermaid
graph TB
    subgraph "Client Package"
        CP_PAGES["pages/"]
        CP_COMP["components/"]
        CP_SVC["services/"]
    end

    subgraph "Server Package"
        SP_ROUTES["routes/"]
        SP_CTRL["controllers/"]
        SP_MODELS["models/"]
        SP_UTILS["utils/"]
    end

    subgraph "AI Service Package"
        AI_ROUTERS["routers/"]
        AI_SERVICES["services/"]
    end

    subgraph "Contracts Package"
        SC_CONTRACTS["contracts/"]
    end

    CP_PAGES --> CP_COMP & CP_SVC
    CP_SVC ==>|"HTTP REST"| SP_ROUTES
    SP_ROUTES --> SP_CTRL
    SP_CTRL --> SP_MODELS & SP_UTILS
    SP_UTILS -->|"REST"| AI_ROUTERS
    SP_UTILS -->|"ethers.js"| SC_CONTRACTS
    AI_ROUTERS --> AI_SERVICES
```

---

## 7. Sequence Diagrams

### 7.1 Evidence Upload Flow

```mermaid
sequenceDiagram
    autonumber
    participant UI as React Client
    participant GW as Express API Gateway
    participant EC as evidenceController
    participant HASH as hash.js (SHA-256)
    participant IPFS as Pinata / IPFS
    participant AI as Python AI Service
    participant BC as Polygon Blockchain
    participant DB as PostgreSQL

    UI->>GW: POST /api/evidence (multipart form + file)
    GW->>EC: createEvidence(req)
    EC->>HASH: generateHash(filePath)
    HASH-->>EC: sha256
    EC->>IPFS: uploadFileToPinata()
    IPFS-->>EC: ipfsCid
    EC->>AI: POST /api/ai/analyze
    AI-->>EC: AI results
    EC->>BC: storeEvidence()
    BC-->>EC: txHash, blockNumber
    EC->>DB: Evidence.create()
    EC-->>UI: 201 Created JSON
```

---

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph "Public Internet"
        USERS["👤 Users"]
        CDN["CloudFlare CDN"]
    end

    subgraph "DMZ"
        LB["NGINX Ingress Controller"]
    end

    subgraph "Kubernetes Cluster"
        POD_API["Pod: Express API (x3)"]
        POD_AI["Pod: AI FastAPI (x2)"]
    end

    subgraph "Data Tier"
        PG_PRIMARY["PostgreSQL 16 Primary"]
        PG_REPLICA["PostgreSQL 16 Replica"]
    end

    subgraph "External"
        POLYGON["Polygon Amoy"]
        PINATA["Pinata IPFS"]
    end

    USERS --> CDN --> LB --> POD_API
    POD_API --> PG_PRIMARY & PG_REPLICA & POD_AI & POLYGON & PINATA
```

---

## 9. Data Flow Diagram

```mermaid
graph LR
    INV["🔍 Investigator"] -->|"1. Upload file"| P1["1.0 Receive File"]
    P1 -->|"File buffer"| P2["2.0 SHA-256 Hasher"]
    P2 -->|"Hash + Binary"| P3["3.0 IPFS Pinning"]
    P2 -->|"Hash + CID"| P4["4.0 Polygon Anchor"]
    P1 -->|"File path"| P5["5.0 AI Engine"]
    P4 -->|"Tx Record"| P6["6.0 PostgreSQL"]
    P5 -->|"AI Analysis"| P6
    P6 -->|"Log"| P7["7.0 Audit Logger"]
    P6 -->|"Read Record"| P8["8.0 Vault UI / PDF"]
    P8 -->|"Forensic Report"| COURT["⚖️ Court"]
```

---

## 10. Trust Boundaries

- **Zone 0 (Untrusted)**: Public Internet & Web Browsers
- **Zone 1 (DMZ)**: NGINX Reverse Proxy & WAF
- **Zone 2 (Application Zone)**: Express API & FastAPI Microservices
- **Zone 3 (Restricted Data Zone)**: PostgreSQL Database & Encrypted Volumes
- **Zone 4 (Immutable Blockchain)**: Polygon Amoy & Decentralized IPFS

---

## 11. Security Architecture

- **Authentication**: JWT Bearer Tokens (HMAC-SHA256)
- **Authorization**: RBAC (Admin, Investigator, Analyst, Viewer)
- **Encryption**: TLS 1.3 in transit, AES-256-CBC at rest, bcrypt for passwords
- **API Protection**: Helmet security headers, CORS origin filtering, rate limiting (100 req/15min)

---

## 12. Threat Model (STRIDE)

1. **Spoofing**: Impersonation via stolen JWT → Short token lifetimes & audit alerts
2. **Tampering**: File modification → SHA-256 & Polygon blockchain anchoring
3. **Repudiation**: Denying actions → Immutable PostgreSQL audit trail
4. **Information Disclosure**: Unauthorized file download → RBAC checks & stream proxy
5. **Denial of Service**: API flooding → Rate limiting & reverse proxy bounds
6. **Elevation of Privilege**: Unauthorized role escalation → RBAC middleware enforcement

---

## 13. Database Architecture

**7 Core Tables**:
- `users`: User profiles, roles, wallet addresses
- `cases`: Investigation case groupings
- `evidence`: Main digital evidence records (SHA-256, IPFS CID, AI score)
- `blockchain_transactions`: Polygon transaction receipts & block details
- `audit_logs`: Immutable audit logging of all system actions
- `chain_of_custody`: Custody transfer history
- `verification_records`: Hash verification logs

---

## 14. Folder Structure

```
sentinelchain/
├── client/           # React 18 SPA (Vite + Tailwind)
├── server/           # Express.js API Gateway & Controllers
├── python-ai/        # FastAPI AI Forensics Microservice
├── contracts/        # Solidity Smart Contracts (Polygon Amoy)
├── database/         # PostgreSQL schema.sql & seed.sql
├── docs/             # Technical architecture & API documentation
├── docker-compose.yml# Full stack container orchestration
└── README.md         # Repository documentation
```

---

## 15. Development Roadmap

- **Phase 1 — Foundation** (Completed): Core 5-tier architecture, evidence vault, AI scan, blockchain anchoring.
- **Phase 2 — Hardening** (In Progress): Docker Compose containerization, Nginx proxying, production security configuration.
- **Phase 3 — Scale**: Kubernetes deployment, DB read replicas, background job queues, table partitioning.
- **Phase 4 — Intelligence**: Advanced ELA visual analysis, NLP summaries, mainnet migration.
- **Phase 5 — Compliance**: ISO 27037, NIST 800-86, FRE 902 legal admissibility certification.
