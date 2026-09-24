# MediMind AI — Draw.io / Mermaid Diagram Codes
> **Instructions for Draw.io (https://app.diagrams.net):**
> 1. Open [draw.io](https://app.diagrams.net)
> 2. Top menu par click karo: **Arrange** -> **Insert** -> **Advanced** -> **Mermaid**
> 3. Neeche diya gaya code paste karo aur **Insert** par click karo! Diagram turant draw ho jayega!
> 4. You can also export as PNG / SVG / PDF directly into your Word Report!

---

## 1. Figure 7.1.1: Use Case Diagram

```mermaid
graph LR
    classDef actorStyle fill:#2563EB,stroke:#1E40AF,stroke-width:2px,color:#fff;
    classDef systemStyle fill:#F8FAFC,stroke:#64748B,stroke-width:2px,stroke-dasharray: 5 5;
    classDef ucStyle fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E293B;
    classDef agentStyle fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;

    Patient["fa:fa-user Patient / User"]:::actorStyle
    Doctor["fa:fa-user-md Doctor / Clinician"]:::actorStyle
    
    subgraph MediMind_Platform [" MediMind AI Platform Boundary "]
        UC1(["UC-01: Register & Verify via 6-Digit OTP"]):::ucStyle
        UC2(["UC-02: View Unified Patient Dashboard"]):::ucStyle
        UC3(["UC-03: Upload Chest X-Ray Scan"]):::ucStyle
        UC4(["UC-04: Submit Symptom Questionnaire"]):::ucStyle
        UC5(["UC-05: Upload & Parse Pathology Lab Report"]):::ucStyle
        UC6(["UC-06: Check Drug-Drug Interactions"]):::ucStyle
        UC7(["UC-07: Query Longitudinal Health RAG"]):::ucStyle
        UC8(["UC-08: Review Patient Urgency & Diagnostic Reports"]):::ucStyle
    end

    ImagingAgent["fa:fa-microchip Imaging AI Agent<br/>(CheXNet + GradCAM)"]:::agentStyle
    SymptomAgent["fa:fa-heartbeat Symptom Triage Agent<br/>(Red-Flag Detector)"]:::agentStyle
    ReportAgent["fa:fa-file-medical Report Simplifier Agent<br/>(OCR + NLP)"]:::agentStyle
    MedAgent["fa:fa-pills Medication Safety Agent"]:::agentStyle
    RAGAgent["fa:fa-database ChromaDB Vector Memory"]:::agentStyle

    Patient --> UC1
    Patient --> UC2
    Patient --> UC3
    Patient --> UC4
    Patient --> UC5
    Patient --> UC6
    Patient --> UC7

    UC3 -.->|<<delegate>>| ImagingAgent
    UC4 -.->|<<delegate>>| SymptomAgent
    UC5 -.->|<<delegate>>| ReportAgent
    UC6 -.->|<<delegate>>| MedAgent
    UC7 -.->|<<query memory>>| RAGAgent

    Doctor --> UC8
    UC8 -.-> UC2
```

---

## 2. Figure 7.1.2: Sequence Diagram (Diagnostic & Cross-Agent RAG Pipeline)

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient (Web UI)
    participant Router as FastAPI Router
    participant Orch as Central Orchestrator
    participant Agent as Specialized AI Agent
    participant DB as Relational DB (SQLAlchemy)
    participant Vector as ChromaDB (Vector Store)

    Note over Patient,Router: Diagnostic Ingestion Phase
    Patient->>Router: POST /api/scan/upload (Chest X-Ray)
    Router->>Orch: handle_scan(image, user_id)
    Orch->>Agent: analyze_radiograph(image)
    Agent-->>Orch: ScanResult (Pneumonia 87%, Grad-CAM matrix)
    Orch->>DB: INSERT into scan_records
    DB-->>Orch: record_id: 1042
    Orch->>Vector: index_for_rag(user_id, summary, metadata)
    Vector-->>Orch: indexed (embedding_id: emb_99)
    Orch-->>Router: return JSON response
    Router-->>Patient: Render Findings + Grad-CAM Heatmap

    Note over Patient,Vector: Longitudinal Health RAG Q&A Phase
    Patient->>Router: POST /api/rag/ask ("Does my past scan show lung infection?")
    Router->>Orch: handle_rag_query(query, user_id)
    Orch->>Vector: similarity_search(query, filter={user_id: user_id})
    Vector-->>Orch: Retrieved records (Pneumonia 87%, Date: 2026-09-23)
    Orch->>Agent: LLM synthesis with clinical history prompt
    Agent-->>Orch: Contextual medical answer
    Orch-->>Router: return answer with source citations
    Router-->>Patient: Display response in conversational chat
```

---

## 3. Figure 7.1.3: Activity Diagram (Patient Journey & Clinical Triage)

```mermaid
flowchart TD
    Start([User Opens MediMind AI]) --> Login{User Authenticated?}
    Login -- No --> SignUp[Register with Email & Password]
    SignUp --> OTP[Enter 6-Digit Live OTP]
    OTP --> VerifyOTP{OTP Valid & Not Expired?}
    VerifyOTP -- No --> OTPError[Display Error Message] --> OTP
    VerifyOTP -- Yes --> Dashboard[Load Unified Health Dashboard]
    Login -- Yes --> Dashboard

    Dashboard --> Action{Choose Health Action}

    Action -->|Chest X-Ray| UploadScan[Upload Chest Radiograph]
    UploadScan --> DenseNet[Run CheXNet CNN Backbone]
    DenseNet --> GradCAM[Generate Grad-CAM Attention Heatmap]
    GradCAM --> ShowScan[Display Pathology Confidence & Visual Overlay]

    Action -->|Symptoms| SymptomInput[Enter Primary Symptoms & Duration]
    SymptomInput --> RedFlagCheck{Life-Threatening Keywords?}
    RedFlagCheck -- YES --> EmergencyAlert[TRIGGER CRITICAL RED-FLAG ALERT:<br/>Dial 108/911 Immediately!]
    RedFlagCheck -- NO --> TriageAI[Evaluate Differential Urgency Score]
    TriageAI --> HomeGuidance[Suggest Non-Pharmacological Guidance & Doctor Questions]

    Action -->|Lab Report| UploadLab[Upload Pathology PDF / Image]
    UploadLab --> OCR[Extract Biomarkers & Reference Ranges]
    OCR --> Simplify[Generate 6th-Grade Plain English Explanation]

    Action -->|Medications| EnterMeds[Enter Prescription Drug Regimen]
    EnterMeds --> AuditMatrix[Audit Drug-Drug Interactions]
    AuditMatrix --> SeverityCheck[Classify: Major / Moderate / Minor Warnings]

    ShowScan --> Orchestrate[Send Summary to Central Orchestrator]
    HomeGuidance --> Orchestrate
    EmergencyAlert --> Orchestrate
    Simplify --> Orchestrate
    SeverityCheck --> Orchestrate

    Orchestrate --> SaveRelational[Save into SQLite / PostgreSQL]
    SaveRelational --> EmbedRAG[Embed Record into ChromaDB Vector Collection]
    EmbedRAG --> End([Display Updated Dashboard & Longitudinal History])
```

---

## 4. Figure 7.1.4: State Chart Diagram (Diagnostic Report Lifecycle)

```mermaid
stateDiagram-v2
    [*] --> DRAFT_OR_UPLOADED: Patient uploads artifact (X-Ray / Lab PDF)
    
    DRAFT_OR_UPLOADED --> PREPROCESSING: Format & MIME Validation Passed
    DRAFT_OR_UPLOADED --> REJECTED: File Corrupt / Size > 10MB
    REJECTED --> [*]

    PREPROCESSING --> INFERENCE_RUNNING: Input normalized & queued
    
    state INFERENCE_RUNNING {
        [*] --> AI_ANALYSIS
        AI_ANALYSIS --> URGENCY_EVALUATION
        URGENCY_EVALUATION --> [*]
    }

    INFERENCE_RUNNING --> FLAGGED_CRITICAL: High Urgency (Pneumothorax / Severe ADE / Red-Flag)
    INFERENCE_RUNNING --> NORMAL_OR_MILD: Standard Clinical Finding

    FLAGGED_CRITICAL --> PUSHED_TO_ORCHESTRATOR: Priority Triage Alert Generated
    NORMAL_OR_MILD --> PUSHED_TO_ORCHESTRATOR: Standard Summary Generated

    PUSHED_TO_ORCHESTRATOR --> PERSISTED_IN_DATABASE: Saved to Relational Tables
    PERSISTED_IN_DATABASE --> EMBEDDED_IN_CHROMADB: Vector Embedding generated & stored
    EMBEDDED_IN_CHROMADB --> INDEXED_ACTIVE: Available for Longitudinal RAG Q&A
    
    INDEXED_ACTIVE --> ARCHIVED: Superseded by new patient records
    INDEXED_ACTIVE --> [*]
```

---

## 5. Figure 7.1.5: Class Diagram

```mermaid
classDiagram
    class User {
        +int id
        +string full_name
        +string email
        +string hashed_password
        +string otp_hash
        +datetime otp_expiry
        +bool is_verified
        +datetime created_at
        +register() bool
        +verify_otp(code) bool
    }

    class Orchestrator {
        -ImagingAgent imaging
        -SymptomAgent symptom
        -ReportAgent report
        -MedicationAgent medication
        -RAGAgent rag
        +handle_scan(image, user_id) ScanResult
        +handle_symptoms(text, user_id) TriageResult
        +handle_report(file, user_id) ReportResult
        +handle_medications(list, user_id) MedResult
        +index_for_rag(user_id, type, text) void
    }

    class ImagingAgent {
        +string model_name
        +predict(image_bytes) dict
        +generate_gradcam(image, target_layer) ndarray
    }

    class SymptomAgent {
        +check_redflags(symptoms) bool
        +triage_urgency(symptoms, age) TriageResult
    }

    class ReportAgent {
        +parse_pdf(file_bytes) string
        +extract_biomarkers(raw_text) list
        +generate_plain_summary(markers) string
    }

    class MedicationAgent {
        +audit_interactions(drugs) list
        +classify_severity(interaction) string
    }

    class RAGAgent {
        -ChromaClient client
        +add_record(user_id, rec_id, text, metadata)
        +similarity_search(user_id, query, k) list
        +answer_query(user_id, query) string
    }

    class ScanRecord {
        +int id
        +int user_id
        +string image_path
        +string primary_finding
        +float confidence
        +string urgency
        +datetime timestamp
    }

    class SymptomSession {
        +int id
        +int user_id
        +string symptom_text
        +string urgency_tier
        +string advice_summary
        +datetime timestamp
    }

    User "1" --> "*" ScanRecord : owns
    User "1" --> "*" SymptomSession : logs
    User "1" --> "1" Orchestrator : interacts
    Orchestrator --> ImagingAgent : owns
    Orchestrator --> SymptomAgent : owns
    Orchestrator --> ReportAgent : owns
    Orchestrator --> MedicationAgent : owns
    Orchestrator --> RAGAgent : owns
    RAGAgent ..> ScanRecord : indexes
    RAGAgent ..> SymptomSession : indexes
```

---

## 6. Figure 7.1.6.1: Level-0 DFD (Context Level)

```mermaid
graph TD
    classDef entity fill:#2563EB,stroke:#1E40AF,stroke-width:2px,color:#fff;
    classDef process fill:#10B981,stroke:#047857,stroke-width:2px,color:#fff;

    P[Patient / Registered User]:::entity
    D[Doctor / Clinical Evaluator]:::entity
    Sys((0.0<br/>MediMind AI<br/>Multi-Agent Platform)):::process

    P -->|1. Credentials & 6-Digit OTP| Sys
    P -->|2. Chest X-Ray Radiographs| Sys
    P -->|3. Clinical Symptom Descriptions| Sys
    P -->|4. Pathology Lab Reports PDF/JPG| Sys
    P -->|5. Current Prescription Medications| Sys
    P -->|6. Longitudinal Health Inquiries| Sys

    Sys -->|1. JWT Session & Auth Status| P
    Sys -->|2. Pathology Classification & Grad-CAM| P
    Sys -->|3. Triage Urgency & Emergency Alerts| P
    Sys -->|4. Plain-Language Biomarker Summaries| P
    Sys -->|5. Drug Interaction Severity Flags| P
    Sys -->|6. Contextual Health Q&A Answers| P

    D -->|Query Patient History| Sys
    Sys -->|Consolidated Clinical Summaries & Triage Flags| D
```

---

## 7. Figure 7.1.6.2: Level-1 DFD (Subsystem Decomposition)

```mermaid
graph TD
    classDef entity fill:#2563EB,stroke:#1E40AF,stroke-width:2px,color:#fff;
    classDef proc fill:#0D9488,stroke:#115E59,stroke-width:2px,color:#fff;
    classDef store fill:#F59E0B,stroke:#B45309,stroke-width:2px,color:#fff;

    User[Patient User]:::entity
    
    P1((1.0<br/>Authentication &<br/>OTP Engine)):::proc
    P2((2.0<br/>Diagnostic Artifact<br/>Ingestion)):::proc
    P3((3.0<br/>Multi-Agent<br/>Clinical AI Core)):::proc
    P4((4.0<br/>Orchestrator &<br/>Vector Indexing)):::proc
    P5((5.0<br/>Longitudinal RAG<br/>& Dashboard Query)):::proc

    D1[(D1: Users DB)]:::store
    D2[(D2: Clinical Records DB)]:::store
    D3[(D3: ChromaDB Vector Store)]:::store

    User -->|Signup / Login| P1
    P1 -->|Hash & Verify| D1
    P1 -->|JWT Token| User

    User -->|Upload Scan / Symptoms / Lab PDF| P2
    P2 -->|Validated Payload| P3
    P3 -->|Clinical Findings & Heatmaps| P4
    P4 -->|Store Structured Records| D2
    P4 -->|Embed Record Vectors| D3

    User -->|Ask Health Question / View Feed| P5
    P5 -->|Query History| D2
    P5 -->|Semantic Vector Search| D3
    P5 -->|Contextual Answers & Alerts| User
```

---

## 8. Figure 7.1.6.3: Level-2 DFD (Multi-Agent Evaluation Core)

```mermaid
graph TD
    classDef proc fill:#6366F1,stroke:#4338CA,stroke-width:2px,color:#fff;
    classDef store fill:#F59E0B,stroke:#B45309,stroke-width:2px,color:#fff;
    classDef input fill:#E2E8F0,stroke:#64748B,stroke-width:1.5px,color:#0F172A;

    In1[Raw Chest X-Ray]:::input
    In2[Symptom Text]:::input
    In3[Lab Report PDF]:::input
    In4[Drug Regimen List]:::input

    P31((3.1<br/>Imaging Agent<br/>DenseNet + GradCAM)):::proc
    P32((3.2<br/>Symptom Agent<br/>Red-Flag Classifier)):::proc
    P33((3.3<br/>Report Agent<br/>OCR & Jargon Simplifier)):::proc
    P34((3.4<br/>Medication Agent<br/>Interaction Auditor)):::proc

    OutOrch((4.0 Orchestrator Sync)):::proc

    In1 --> P31
    In2 --> P32
    In3 --> P33
    In4 --> P34

    P31 -->|Pathology probabilities & heatmap array| OutOrch
    P32 -->|Urgency tag & emergency alert status| OutOrch
    P33 -->|Biomarker table & plain English text| OutOrch
    P34 -->|Drug conflicts & severity flags| OutOrch
```

---

## 9. Figure 7.1.7: Entity-Relationship (E-R) Diagram

```mermaid
erDiagram
    USERS ||--o{ SCAN_RECORDS : owns
    USERS ||--o{ SYMPTOM_SESSIONS : records
    USERS ||--o{ LAB_REPORTS : uploads
    USERS ||--o{ MEDICATION_CHECKS : performs
    USERS ||--o{ RAG_CONVERSATIONS : conducts

    USERS {
        int id PK
        string full_name
        string email UK
        string password_hash
        string otp_hash
        datetime otp_expiry
        boolean is_verified
        datetime created_at
    }

    SCAN_RECORDS {
        int id PK
        int user_id FK
        string image_filename
        string detected_pathology
        float confidence_score
        string urgency_level
        string gradcam_overlay_path
        datetime created_at
    }

    SYMPTOM_SESSIONS {
        int id PK
        int user_id FK
        string input_symptoms
        int severity_score
        boolean is_red_flag
        string triage_recommendation
        datetime created_at
    }

    LAB_REPORTS {
        int id PK
        int user_id FK
        string file_name
        json extracted_parameters
        text plain_summary
        string abnormal_flags
        datetime created_at
    }

    MEDICATION_CHECKS {
        int id PK
        int user_id FK
        string drug_names_list
        string max_severity
        text interaction_details
        datetime created_at
    }

    RAG_CONVERSATIONS {
        int id PK
        int user_id FK
        text user_query
        text bot_response
        string cited_sources
        datetime created_at
    }
```
