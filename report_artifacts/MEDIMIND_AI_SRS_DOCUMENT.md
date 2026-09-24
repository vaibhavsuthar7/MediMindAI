# SOFTWARE REQUIREMENTS SPECIFICATION (SRS)
## MEDIMIND AI — MULTI-AGENT HEALTHCARE ASSISTANT PLATFORM

**Academic Year:** 2025–2026  
**Course:** B.Tech. Semester VI (Computer Engineering / Information Technology)  
**Department:** Department of Computer Engineering / Institute of Technology  
**Institute:** U.V. Patel College of Engineering, Ganpat University, Mehsana - 384012  
**Internal Guide:** Prof. Venus Patel  
**Head of Department:** Dr. Paresh M. Solanki  
**Project Team Members:**
- Mohammad Dhukka [Enrollment: 24172012012]
- Rishi Dhobi [Enrollment: 24172012011]
- Vedant Shukla [Enrollment: 24172012082]
- Vaibhav Suthar [Enrollment: 23012011118]

---

## ABSTRACT
Traditional healthcare delivery systems suffer from acute clinical bottlenecks, including severe doctor shortages, long outpatient waiting times, fragmented diagnostic records, and medical jargon that leaves patients confused and anxious. Misinterpretation of lab reports and undetected harmful drug-drug interactions remain leading causes of preventable health complications.

**MediMind AI** is an advanced full-stack, enterprise-grade multi-agent medical assistant platform designed to democratize clinical insights and streamline personal healthcare management. Built with a decoupled microservice-inspired architecture using a **FastAPI** backend and a modern **React 18 + Vite** frontend, the platform features a centralized **Orchestrator Pattern** managing five domain-specialized AI clinical agents:
1. **Medical Imaging Agent:** Deep learning-driven chest radiograph (X-ray) classification and Grad-CAM visual heatmaps.
2. **Symptom Triage Agent:** Dynamic conversational intake, clinical urgency classification, and emergency red-flag detection.
3. **Lab Report Simplifier Agent:** Medical OCR and document parser translating dense pathology reports into plain, patient-friendly explanations and clinical summaries.
4. **Medication Safety & Interaction Agent:** Polypharmacy verification, contraindication checking, and drug-drug interaction alerts.
5. **Cross-Agent RAG Memory Agent:** Patient-centric vector knowledge base powered by ChromaDB, enabling long-term contextual diagnostic recall across all clinical encounters.

Equipped with a secure **6-digit cryptographic OTP authentication engine**, role-based access control (RBAC), and HIPAA-aligned data privacy protocols, MediMind AI delivers real-time, explainable, and accessible healthcare intelligence directly to patients and clinicians alike.

---

## TABLE OF CONTENTS
- **CHAPTER 1: INTRODUCTION**
  - 1.1 Problem Statement
  - 1.2 Objective
  - 1.3 Purpose
- **CHAPTER 2: PROJECT SCOPE**
  - 2.1 Scope Overview
  - 2.2 Inclusions (In-Scope Capabilities)
  - 2.3 Exclusions (Out-of-Scope Capabilities)
- **CHAPTER 3: SOFTWARE AND HARDWARE REQUIREMENTS**
  - 3.1 Software Requirements
  - 3.2 Hardware Requirements
- **CHAPTER 4: SYSTEM REQUIREMENTS**
  - 4.1 Functional Requirements (FR-01 to FR-20)
  - 4.2 Non-Functional Requirements (NFR-01 to NFR-12)
- **CHAPTER 5: PROCESS MODEL**
  - 5.1 Incremental Process Model & Justification
  - 5.2 Lifecycle Stages (Planning, Analysis, Design, Development, Testing, Deployment, Maintenance)
- **CHAPTER 6: PROJECT PLANNING**
  - 6.1 Work Breakdown Structure & Timeline (Gantt Chart Table)
  - 6.2 Risk Management & Mitigation Matrix
- **CHAPTER 7: SYSTEM DESIGN & UML MODELING**
  - 7.1 UML Modeling Methodology
  - 7.2 Core UML & Architectural Diagrams
    - 7.2.1 Use Case Diagram & Actor Descriptions
    - 7.2.2 Sequence Diagram (Diagnostic Workflow & RAG Pipeline)
    - 7.2.3 Activity Diagram (Patient Journey & Clinical Triage)
    - 7.2.4 Class Diagram (Entities, Schemas, Agent Classes, Orchestrator)
    - 7.2.5 State Chart Diagram (Diagnostic Report Lifecycle)
    - 7.2.6 Data Flow Diagrams (Level 0 Context, Level 1, Level 2 DFDs)
    - 7.2.7 Entity-Relationship (E-R) Diagram
  - 7.3 User Interface (UI) Screen Descriptions
- **CHAPTER 8: CONCLUSION AND FUTURE WORK**
  - 8.1 Conclusion
  - 8.2 Future Work
  - 8.3 Annexure
  - 8.4 References
  - 8.5 About College & Department

---

# CHAPTER 1: INTRODUCTION

### 1.1 Problem Statement
Modern healthcare infrastructure encounters critical operational and diagnostic bottlenecks that compromise patient outcomes and overload clinical providers:
1. **Clinical Overburden & Delayed Triage:** Emergency rooms and primary clinics face high patient-to-doctor ratios, resulting in prolonged wait times where emergent symptoms can deteriorate without timely triage.
2. **Incomprehensible Diagnostic Reports:** Pathology, radiology, and laboratory reports contain dense medical jargon, biochemical acronyms, and statistical reference ranges that ordinary patients cannot interpret. This creates severe health anxiety or leads patients to self-medicate dangerously.
3. **Polypharmacy Risks & Drug Interactions:** With patients consulting multiple specialists for co-morbidities, conflicting prescriptions often go undetected. Adverse Drug Events (ADEs) and hazardous drug-drug interactions account for millions of hospital admissions annually.
4. **Fragmented Health History & Lack of Context:** Patient records exist in disconnected silos (physical papers, varying clinic portals, unindexed PDFs). When a patient visits a new doctor or asks health questions, previous lab values, X-rays, and medication histories are not correlated.
5. **Inaccessible Diagnostic Second Opinions:** Rural and semi-urban populations lack immediate access to certified radiologists for preliminary screening of chest radiographs (pneumonia, effusion, atelectasis, cardiomegaly).

Without a unified, intelligent, and context-aware platform, healthcare consumers remain passive, confused, and vulnerable to preventable medical complications.

### 1.2 Objectives
The primary objectives of the **MediMind AI** project are:
- **To Engineer a Multi-Agent Medical Orchestrator:** Develop an extensible, decoupled architecture where specialized clinical agents (Imaging, Triage, Report Simplification, Medication Safety, and RAG Memory) operate synergistically through a single unified controller.
- **To Deliver Instant Medical Imaging Triage:** Integrate deep learning models (DenseNet121 / CheXNet) and Vision-Language Models to detect thoracic pathologies from chest radiographs, complemented with Grad-CAM heatmaps for visual explainability.
- **To Democratize Laboratory Diagnostic Reports:** Build an automated OCR and NLP pipeline that ingests complex medical reports (PDF/JPG), extracts biochemical parameters, and generates bilingual, jargon-free explanations with clinically vetted action items.
- **To Prevent Harmful Drug-Drug Interactions:** Implement an automated prescription audit system checking multi-drug regimens against pharmaceutical knowledge bases to identify adverse interactions, severity tiers (Mild, Moderate, Severe), and contraindications.
- **To Enable Unified Patient Long-Term Memory via RAG:** Leverage Retrieval-Augmented Generation (ChromaDB vector embeddings) so all past diagnostic findings, scans, and symptoms are indexed per patient, empowering an interactive Q&A assistant with historical context.
- **To Enforce Enterprise-Grade Security & Authentication:** Provide seamless cryptographic user registration with a 6-digit live OTP verification mechanism, password hashing (bcrypt), JWT authorization, and role-based data isolation.

### 1.3 Purpose
The overarching purpose of **MediMind AI** is to build an empathetic, reliable, and scientifically grounded AI healthcare companion that bridges the communication chasm between clinical specialists and everyday patients. 

Rather than serving as a replacement for certified medical professionals, MediMind AI acts as an **intelligent clinical co-pilot and personal health navigator**. It empowers individuals with transparent insights into their biometric markers, alerts them to critical emergencies requiring immediate in-person medical care, safeguards them against conflicting medications, and organizes their entire longitudinal medical history into an easily accessible, intelligent memory bank.

---

# CHAPTER 2: PROJECT SCOPE

### 2.1 Scope Overview
MediMind AI encompasses a complete, production-ready web application engineered to serve both individual patients and healthcare observers. The platform integrates responsive frontend interfaces, high-throughput asynchronous REST APIs, deep learning computer vision inference pipelines, large language model clinical reasoning, and localized vector memory storage.

### 2.2 Inclusions (In-Scope Capabilities)
- **Role-Based Authentication & Verification:** Cryptographic user registration with automated 6-digit OTP verification, secure password hashing, and JWT session handling.
- **Chest Radiograph Classification & Explainability:** Automated thoracic X-ray screening for multi-label pathologies (Pneumonia, Cardiomegaly, Infiltration, Effusion) with confidence scoring and Grad-CAM attention localization.
- **Intelligent Symptom Triage Engine:** Dynamic clinical questionnaire flow evaluating onset, severity, associated symptoms, and outputting urgency triage tags (*Emergency, High, Medium, Low*).
- **Lab Report OCR & Natural Language Translation:** PDF/Image upload parsing for Complete Blood Count (CBC), Lipid Profiles, Metabolic Panels, and Liver Function Tests with range analysis and plain-language summaries.
- **Drug Interaction & Safety Checker:** Multi-drug comparison tool flagging severe interactions, mechanism of action conflicts, food interactions, and safe alternatives.
- **Personalized Longitudinal Health RAG Assistant:** Semantic retrieval over patient’s historical records (ChromaDB + sentence embeddings) answering ad-hoc medical inquiries based strictly on their verified history.
- **Unified Health Dashboard:** Interactive visualization of biometrics, chronological timeline of clinical reports, active medication lists, and urgent health alerts.

### 2.3 Exclusions (Out-of-Scope Capabilities)
- **Autonomous Legal Medical Prescribing:** The system explicitly does not issue legally binding prescription drug orders or authorize pharmacy dispensing.
- **Direct DICOM/PACS Hardware Interfacing:** DICOM ingestion is pre-processed into standard medical image formats (PNG/JPEG); direct integration with hospital PACS servers is slated for enterprise release.
- **Invasive Medical Device Telemetry:** Real-time surgical or ICU telemetry streams (ECG telemetry, invasive arterial lines) are outside the student project scope.
- **Direct Payment Gateway Processing:** Financial billing and insurance claim adjudication are excluded to maintain strict focus on diagnostic and triage assistance.

---

# CHAPTER 3: SOFTWARE AND HARDWARE REQUIREMENTS

### 3.1 Software Requirements
#### 3.1.1 Operating Systems
- **Development Workstations:** Windows 11 (64-bit) / Ubuntu 22.04 LTS / macOS Sonoma.
- **Target Deployment Platform:** Linux (Ubuntu 22.04 LTS / Debian Docker Container) or cloud containerized environments (Render / Railway / AWS EC2).
- **Client End-User Browsers:** Google Chrome 95+, Mozilla Firefox 90+, Microsoft Edge 95+, Apple Safari 15+ (PWA compliant).

#### 3.1.2 Development Environment & Core Tools
- **Runtime Environment:** Python 3.10+ (Backend API & Machine Learning engine).
- **Node.js Environment:** Node.js v18.x or v20.x LTS & npm v9.x+.
- **Integrated Development Environment (IDE):** Visual Studio Code with Python, Pylance, Tailwind CSS, and ESLint extensions.
- **Version Control:** Git v2.40+ and GitHub for collaborative source code management.

#### 3.1.3 Frontend Technology Stack
- **Framework & Build Tool:** React 18 with Vite 5 (ultra-fast HMR and optimized bundle splitting).
- **Styling Architecture:** Tailwind CSS v3 with custom glassmorphism design tokens, CSS variables, and modern dark-mode aesthetic.
- **Component & Animation Libraries:** Framer Motion (page transitions & micro-interactions), Lucide React (vector clinical iconography).
- **HTTP Client & State Management:** Axios for REST API interaction with request/response interceptors; React Context API for global authentication state.

#### 3.1.4 Backend, AI & Database Stack
- **Backend Web Framework:** FastAPI (Asynchronous ASGI framework with automatic OpenAPI / Swagger interactive documentation).
- **ASGI Web Server:** Uvicorn with auto-reload workers.
- **Relational Database & ORM:** SQLAlchemy ORM with SQLite (development) and PostgreSQL (production).
- **Vector Database (RAG):** ChromaDB for high-dimensional vector embeddings and similarity search.
- **Machine Learning & Vision Frameworks:** PyTorch 2.1+, Torchvision, OpenCV, Albumentations, NumPy, Pandas.
- **Large Language Model & Vision APIs:** NVIDIA NIM APIs (Llama 3.1 8B Instruct, Llama 3.2 11B Vision, Mistral Large 2) and Gemini API integration with LangChain / native prompt chains.
- **Document Processing:** PyMuPDF (fitz), Tesseract OCR / PDFPlumber for clinical document extraction.
- **Security & Cryptography:** Passlib (bcrypt), python-jose (JWT token generation/decoding), Python `secrets` for 6-digit OTP generation.

### 3.2 Hardware Requirements
#### 3.2.1 Developer Machine (Academic Setup)
- **Processor (CPU):** Intel Core i5 / i7 (8th Gen+) or AMD Ryzen 5 / 7 (3.0 GHz+).
- **System Memory (RAM):** 16 GB DDR4 (recommended to run FastAPI backend, React Vite server, ChromaDB, and deep learning inference simultaneously; 8 GB minimum with swap).
- **Storage:** 512 GB NVMe SSD (minimum 25 GB free disk space for Python virtual environments, node_modules, and vector store indices).
- **Dedicated Graphics (GPU):** NVIDIA GeForce GTX 1650 / RTX 3050 (4 GB+ VRAM) with CUDA 11.8/12.1 support (or cloud inference via NVIDIA NIM / Groq / Google AI API).

#### 3.2.2 End-User Client Requirements
- **Mobile Devices:** Android 9.0+ or iOS 14+ smartphone with minimum 2 GB RAM and modern WebKit/Blink browser.
- **Laptops / Desktops:** Any standard workstation with modern web browser and minimum display resolution of 1280x720.
- **Internet Connectivity:** Stable broadband or 4G/5G mobile connection (minimum 2 Mbps download / 1 Mbps upload for rapid report and scan transfers).

#### 3.2.3 Server & Deployment Infrastructure
- **Cloud Compute Instance:** 2 vCPU, 4 GB RAM, 20 GB NVMe Storage (e.g., AWS t3.medium, DigitalOcean Droplet, or Railway/Render dedicated container).
- **Vector Storage Footprint:** 500 MB – 2 GB persistent SSD storage for ChromaDB collections.

---

# CHAPTER 4: SYSTEM REQUIREMENTS

### 4.1 Functional Requirements (FR)

#### 4.1.1 Authentication, Authorization & User Profile Management
- **FR-01 (User Registration):** The system shall allow new users to register by providing their full name, email address, secure password, age, biological gender, and optional pre-existing medical conditions.
- **FR-02 (Live 6-Digit Cryptographic OTP Engine):** Upon signup or password recovery, the system shall generate a cryptographically secure 6-digit numerical OTP, store its SHA-256 hashed state with a 10-minute expiry timestamp, and provide 1-click verification during local testing/demonstration.
- **FR-03 (JWT-Based Authentication & Session Handling):** The system shall validate user credentials using bcrypt password hashing and issue signed JSON Web Tokens (JWT) containing user ID, claims, and session expiration (e.g., 24 hours).
- **FR-04 (Role-Based Access Control):** The system shall enforce access controls separating regular Patients from Clinicians/Admins, ensuring patients only view and modify their own health data.

#### 4.1.2 Medical Imaging Agent (Thoracic X-Ray Analysis)
- **FR-05 (Medical Scan Upload):** The system shall accept chest radiograph images in standard image formats (PNG, JPEG) up to 10 MB in file size.
- **FR-06 (Automated Pathological Classification):** The system shall process uploaded radiographs through a deep convolutional neural network / vision-language model to detect key thoracic conditions (Normal, Pneumonia, Cardiomegaly, Atelectasis, Pleural Effusion).
- **FR-07 (Confidence Scoring & Urgency Classification):** The system shall output exact probability percentages for detected findings and categorize findings into urgency tiers (*Normal, Mild, Moderate, Critical*).
- **FR-08 (Visual Explainability via Grad-CAM):** The system shall generate and display a Grad-CAM localization heatmap overlaid on the original radiograph to indicate specific anatomical areas influencing the model’s prediction.

#### 4.1.3 Symptom Triage & Clinical Assessment Agent
- **FR-09 (Conversational Symptom Intake):** The system shall provide an intuitive symptom intake form allowing patients to enter primary complaints, onset duration, severity scale (1–10), and accompanying manifestations.
- **FR-10 (Emergency Red-Flag Detection):** The system shall automatically parse symptom inputs for life-threatening clinical keywords (e.g., crushing chest pain radiating to left arm, acute hemiparesis, severe shortness of breath) and immediately display an emergency protocol alert directing the user to dial emergency services (e.g., 108/911).
- **FR-11 (Differential Possibilities & Home Guidance):** For non-emergent complaints, the system shall generate evidence-informed potential conditions, recommended non-pharmacological comfort measures, and specific questions for the user’s upcoming clinical consultation.

#### 4.1.4 Lab Report Simplification & Parameter Extraction Agent
- **FR-12 (Multiformat Lab Report Ingestion):** The system shall accept pathology reports in PDF and high-resolution image formats.
- **FR-13 (Biochemical Parameter Extraction):** The system shall extract biomarker values (e.g., Hemoglobin, Fasting Blood Glucose, HbA1c, Total Cholesterol, Creatinine, Platelet Count), identify normal reference intervals, and flag values as *Normal, Borderline, or Abnormal*.
- **FR-14 (Plain-Language Explanation Generation):** The system shall synthesize clinical biomarker findings into an accessible 6th-grade reading level summary explaining what each abnormal marker means in everyday terms, followed by dietary and lifestyle questions for their doctor.

#### 4.1.5 Medication Safety & Drug Interaction Checker Agent
- **FR-15 (Multi-Drug Regimen Input):** The system shall allow users to input multiple medication names, dosages, and administration frequencies.
- **FR-16 (Automated Drug-Drug Interaction Audit):** The system shall cross-reference all entered medications against pharmaceutical interaction databases to detect pharmacological antagonisms, synergistic toxicity, and metabolic enzyme competition.
- **FR-17 (Interaction Severity Categorization):** The system shall classify identified interactions into *Major (Avoid Combination), Moderate (Monitor Closely), and Minor*, presenting explicit warnings on physiological side effects.

#### 4.1.6 Central Orchestrator & Cross-Agent Longitudinal RAG Memory
- **FR-18 (Unified Orchestrator Synchronization):** All diagnostic outputs produced by the Imaging, Symptom, Report, and Medication agents shall be channeled through a centralized `Orchestrator` service that coordinates execution and handles fallback logic.
- **FR-19 (Vector Knowledge Base Indexing):** The Orchestrator shall automatically embed clinical summaries into a patient-specific ChromaDB vector collection with structured metadata (record type, timestamp, urgency score).
- **FR-20 (Context-Aware Conversational Health Q&A):** The system shall provide an interactive chat interface allowing the patient to ask free-form health questions (e.g., *"How has my blood sugar changed since my last two reports?"* or *"Could my headache be related to the new medication I started?"*), retrieved contextually across their complete health history.

---

### 4.2 Non-Functional Requirements (NFR)

#### 4.2.1 Performance Requirements
- **NFR-01 (API Response Latency):** Standard database queries and user authentication requests shall respond in under 300 milliseconds.
- **NFR-02 (AI Inference Turnaround):** Symptom assessment and medication audits shall complete within 3.5 seconds; deep learning imaging classification and report OCR pipelines shall deliver complete structured outputs within 8 seconds under standard network conditions.
- **NFR-03 (Concurrent Concurrency):** The backend ASGI service shall seamlessly support a minimum of 50 concurrent active users without degradation of throughput or dropped connections.

#### 4.2.2 Security & Data Privacy Requirements
- **NFR-04 (Cryptographic Data Protection):** All communications between client and server shall enforce TLS/HTTPS encryption. Sensitive biometric and personal records stored at rest shall be isolated using strict relational foreign-key constraints.
- **NFR-05 (Password & Credential Hygiene):** All user passwords shall be irreversibly hashed using the bcrypt algorithm with a minimum salt work factor of 12. No plaintext credentials or OTP codes shall ever be logged to production consoles.
- **NFR-06 (Stateless JWT Token Security):** Session tokens shall be digitally signed with a 256-bit secret key, with automatic invalidation upon logout or expiration.

#### 4.2.3 Usability & Human Factors
- **NFR-07 (User Experience & Accessibility):** The user interface shall adhere to WCAG 2.1 Level AA accessibility standards, featuring high-contrast typography, clear status badges, and intuitive visual cues designed for individuals under acute stress or with limited technical literacy.
- **NFR-08 (Zero Medical Jargon Barrier):** All clinical summaries must pass readability heuristics to ensure primary takeaways are readily comprehensible without requiring prior medical education.

#### 4.2.4 Reliability & Fault Tolerance
- **NFR-09 (Graceful LLM & Agent Fallbacks):** If external cloud AI endpoints experience throttling or network outages, the agent orchestrator must gracefully fall back to local rule-based heuristics or offline models without causing application crashes.
- **NFR-10 (System Uptime):** The production deployment shall maintain 99.5% availability during evaluation and operational periods.

#### 4.2.5 Maintainability & Scalability
- **NFR-11 (Modular Code Architecture):** The backend must strictly decouple agent logic into isolated Python modules (`app/agents/imaging/`, `app/agents/symptom_agent.py`, `app/agents/report_agent.py`, etc.) with standardized Pydantic data schemas, allowing plug-and-play addition of new diagnostic agents.
- **NFR-12 (Database Normalization & Portability):** The data layer must adhere to 3rd Normal Form (3NF) principles and utilize SQLAlchemy ORM to allow transparent switching between SQLite, PostgreSQL, or enterprise databases.

---

# CHAPTER 5: PROCESS MODEL

### 5.1 Incremental Process Model & Justification
The development of **MediMind AI** adopted the **Incremental Software Process Model**. In this model, system requirements are prioritized, partitioned, and implemented across a sequence of functional increments. Each increment produces a fully functional, testable subset of the overall platform that builds upon the foundation laid by previous increments.

```
       ┌────────────────────────────────────────────────────────┐
       │             Requirement & Architecture Phase           │
       └───────────────────────────┬────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
┌───────────────┐            ┌───────────────┐            ┌───────────────┐
│  Increment 1  │  ───────►  │  Increment 2  │  ───────►  │  Increment 3  │
│ Auth, DB, UI  │            │Imaging + Triage│           │Report + Meds  │
└───────────────┘            └───────────────┘            └───────────────┘
                                                                │
                                                                ▼
                                                          ┌───────────────┐
                                                          │  Increment 4  │
                                                          │RAG + Analytics│
                                                          └───────────────┘
```

**Justification for Choosing the Incremental Model:**
1. **Management of High AI Complexity:** Building five distinct specialized AI agents simultaneously within a single monolithic cycle introduces severe debugging friction. The incremental model allowed the team to isolate and rigorously validate each agent's pipeline independently.
2. **Early Availability of Core Infrastructure:** Increment 1 delivered user authentication, database persistence, and the React glassmorphism design system early in the semester, establishing an operational core for subsequent module integration.
3. **Risk Mitigation for AI Endpoints:** AI models have variable latencies and token constraints. Incremental testing allowed the team to fine-tune prompt engineering, token limits, and fallback strategies module-by-module.
4. **Continuous Feedback Loop:** Each increment was subjected to code reviews and simulated clinical edge-case testing, enabling rapid refinement of medical disclaimers and UI feedback components.

---

### 5.2 Lifecycle Stages of MediMind AI

#### 5.2.1 Planning Stage
- Formulated the overarching clinical problem statement and conducted feasibility studies comparing existing health portals (WebMD, Practo) against LLM-driven multi-agent systems.
- Identified hardware constraints (academic laptops with single GPU vs. cloud API requirements) and established the semester timeline (10-week Gantt schedule).
- Defined resource requirements, libraries, and open-source medical datasets (NIH Chest X-ray dataset, Kaggle clinical datasets).

#### 5.2.2 Analysis Stage
- Deconstructed clinical workflows into 20 formal Functional Requirements and 12 Non-Functional Requirements.
- Formalized the **Orchestrator Pattern** to avoid brittle point-to-point couplings between frontend components and AI models.
- Established strict security protocols for patient health data privacy, including JWT token lifecycles and cryptographic OTP verification.

#### 5.2.3 Design Stage
- Developed Entity-Relationship (ER) schemas representing Users, Diagnostic Scans, Symptom Sessions, Lab Reports, Prescriptions, and ChromaDB Vector Metadata.
- Authored comprehensive UML diagrams (Use Case, Sequence, Activity, Class, State, and DFD Levels 0, 1, and 2).
- Designed the frontend design system incorporating medical-grade visual tokens (Coral/Terracotta primary accents, Emerald status indicators, dark background slate `#0B0807`, and fluid Framer Motion micro-interactions).

#### 5.2.4 Development Stage (Increment Breakdown)
- **Increment 1 (Core Platform & Auth):** Implemented FastAPI server skeleton, SQLAlchemy database models, bcrypt authentication, 6-digit live OTP engine, and React 18 frontend dashboard navigation.
- **Increment 2 (Imaging & Triage Agents):** Engineered the Medical Imaging Agent (CheXNet / Vision LLM inference, Grad-CAM heatmap generation) and the dynamic conversational Symptom Triage agent with emergency keyword interceptors.
- **Increment 3 (Lab Reports & Medication Safety):** Implemented the PDF/OCR extraction pipeline for pathology reports and the multi-drug contraindication audit engine with severity categorization.
- **Increment 4 (Orchestrator & Cross-Agent RAG Memory):** Integrated ChromaDB vector store; connected all 4 diagnostic agents to the central Orchestrator to auto-embed clinical outputs into longitudinal patient memory; built the conversational RAG Q&A interface.
- **Increment 5 (Polishing, UI Hardening & Dashboard Analytics):** Finalized real-time biometric metrics, urgency alert feeds, PDF summary exports, and responsive cross-device optimization.

#### 5.2.5 Testing Stage
- **Unit Testing:** Executed pytest suites covering API route contracts, schema validations, JWT token issuance/revocation, and OTP hashing logic.
- **Agent Output Validation:** Evaluated AI agent responses against 50+ benchmark test cases spanning acute emergencies (myocardial infarction, pulmonary embolism) and routine reports (normal CBC, elevated cholesterol) to verify accuracy.
- **End-to-End Integration Testing:** Verified complete data flows from client image upload -> FastAPI router -> Orchestrator -> AI Agent -> ChromaDB embedding -> React UI rendering.
- **User Acceptance Testing (UAT):** Conducted simulated trials with engineering peers and academic faculty to evaluate UI intuitiveness, readability of summaries, and mobile responsiveness.

#### 5.2.6 Deployment Stage
- Containerized the FastAPI backend application and ChromaDB instance using Docker.
- Configured production environment variables (`DATABASE_URL`, `JWT_SECRET_KEY`, `NVIDIA_API_KEY`).
- Built production-optimized React distribution bundles via Vite (`npm run build`) and deployed to cloud staging servers (Railway / Render / AWS).

#### 5.2.7 Maintenance & Monitoring Stage
- Established logging for API response latencies, vector retrieval distances, and error rates.
- Implemented automated database backups and planned periodic refreshes of vector knowledge stores with updated clinical guidelines.

---

# CHAPTER 6: PROJECT PLANNING

### 6.1 Project Schedule & Timeline (Gantt Chart Table)

| Task ID | Project Activity Description | Duration | W1-2 | W3-4 | W5-6 | W7-8 | W9-10 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **T1** | **Requirement Gathering & Medical Feasibility Analysis** | 1.5 Wks | █ █ █ | | | | |
| **T2** | **System Architecture & Database Schema Design** | 1.5 Wks | █ █ █ | | | | |
| **T3** | **Increment 1: Core FastAPI Setup, Auth & OTP Engine** | 2.0 Wks | | █ █ █ █ | | | |
| **T4** | **Increment 2: Medical Imaging & Symptom Triage Agents** | 2.0 Wks | | █ █ █ █ | █ █ | | |
| **T5** | **Increment 3: Lab Report OCR & Medication Safety Checker** | 2.0 Wks | | | █ █ █ █ | | |
| **T6** | **Increment 4: Orchestrator & ChromaDB Cross-Agent RAG** | 1.5 Wks | | | | █ █ █ | |
| **T7** | **Increment 5: Frontend Dashboard & Analytics Integration** | 1.5 Wks | | | | █ █ █ | |
| **T8** | **System Integration, Clinical Edge-Case Testing & QA** | 1.5 Wks | | | | | █ █ █ |
| **T9** | **SRS Documentation, User Manual & Viva Preparation** | Continuous | ▓ ▓ ▓ | ▓ ▓ ▓ | ▓ ▓ ▓ | ▓ ▓ ▓ | ▓ ▓ ▓ ▓ |
| **T10**| **Final Staging Deployment & Capstone Presentation** | 0.5 Wks | | | | | █ █ |

---

### 6.2 Risk Management & Mitigation Matrix

| Risk ID | Identified Risk Category | Probability | Impact | Mitigation Strategy |
| :--- | :--- | :---: | :---: | :--- |
| **R-01** | **Third-Party AI API Latency or Quota Exhaustion** | High | High | Implemented multi-provider routing (NVIDIA NIM, Gemini, local Fallback models) with strict token capping and timeout handling. |
| **R-02** | **Medical Hallucination in Clinical Explanations** | Medium | Critical | Implemented deterministic system prompts with few-shot clinical guidelines, RAG grounding, and prominent legal medical disclaimers. |
| **R-03** | **Sensitive Health Data Leakage** | Low | Critical | Enforced bcrypt password hashing, short-lived JWT tokens, and strict per-user database row filtering. |
| **R-04** | **Low-Quality / Blurry Diagnostic Image Uploads** | Medium | Medium | Added client-side image validation (minimum resolution, accepted MIME types, file size boundaries) with error messaging. |
| **R-05** | **Vector Memory Drift / Slow Similarity Search** | Low | Medium | Scoped ChromaDB collections per individual `user_id`, preventing cross-tenant vector contamination and ensuring O(log N) lookup speeds. |

---

# CHAPTER 7: SYSTEM DESIGN & UML APPROACH

### 7.1 UML Modeling Methodology
The Unified Modeling Language (UML) provides a standard graphical notation for constructing, visualizing, and documenting the artifacts of a software-intensive system. In accordance with standard software engineering practices, MediMind AI is modeled through behavioral, structural, and architectural projections to validate design integrity before code execution.

---

### 7.2 Core UML Diagrams & Architecture

#### 7.2.1 Use Case Diagram
- **Primary Actors:**
  - **Patient / Registered User:** Registers, authenticates with 6-digit OTP, uploads chest radiographs, enters symptoms, uploads lab reports, checks prescription safety, asks questions to RAG memory, and views longitudinal health analytics.
  - **Doctor / Clinician (Evaluator Role):** Reviews aggregated patient diagnostic summaries, inspects Grad-CAM heatmaps, and verifies flagged drug interactions.
  - **System AI Agents (Autonomous Subsystems):** Imaging Agent, Symptom Agent, Report Simplifier, Medication Checker, and ChromaDB Vector Memory.

```
                  +---------------------------------------------------+
                  |                   MediMind AI                     |
                  +---------------------------------------------------+
                  |                                                   |
 (Patient) -----> | (1. Register / Verify via 6-Digit OTP)            |
                  | (2. View Unified Health Dashboard)                |
                  | (3. Upload Chest X-Ray Scan) ----> <<include>> -- | --> [Imaging Agent]
                  | (4. Submit Symptom Questionnaire) > <<include>> - | --> [Symptom Agent]
                  | (5. Upload Pathology Lab Report) -> <<include>> - | --> [Report Agent]
                  | (6. Verify Medication Safety) ----> <<include>> - | --> [Medication Agent]
                  | (7. Query Longitudinal RAG Memory)> <<include>> - | --> [ChromaDB Vector Store]
                  |                                                   |
 (Doctor) ------> | (8. Review Patient History & Urgency Flags)       |
                  |                                                   |
                  +---------------------------------------------------+
```

---

#### 7.2.2 Sequence Diagram: End-to-End Diagnostic & Cross-Agent RAG Flow
This diagram illustrates the sequence of messages when a patient submits a diagnostic artifact (e.g., a chest X-ray or lab report), the Orchestrator processes it, saves it to the relational database, embeds it into ChromaDB vector memory, and subsequently retrieves it for contextual Q&A.

```
Patient/UI            FastAPI Router          Orchestrator          Domain Agent         DB / ChromaDB
    |                       |                       |                     |                     |
    |--- 1. POST /scan ---->|                       |                     |                     |
    |    (X-Ray image)      |--- 2. analyze_scan -->|                     |                     |
    |                       |                       |--- 3. predict ----->|                     |
    |                       |                       |    (DenseNet/VLM)   |                     |
    |                       |                       |<-- 4. findings -----|                     |
    |                       |                       |    (Pneumonia 87%)  |                     |
    |                       |                       |                                           |
    |                       |                       |--- 5. Save scan record to SQLite/Postgres>|
    |                       |                       |--- 6. index_for_rag(text, metadata) ----->|
    |                       |                       |       (ChromaDB collection user_id)       |
    |                       |<-- 7. ScanResult -----|                                           |
    |<-- 8. Render Result --|                       |                                           |
    |    (with Grad-CAM)    |                       |                                           |
    |                       |                       |                                           |
    |=== Later: Contextual Longitudinal Q&A ====================================================|
    |                       |                       |                     |                     |
    |--- 9. POST /rag/ask ->|                       |                     |                     |
    |    ("How is my lung") |--- 10. ask(query) --->|                     |                     |
    |                       |                       |--- 11. vector_search(query) ------------->|
    |                       |<-- 12. retrieved historical context ------|
    |                       |--- 13. LLM synthesis with memory -------->|
    |                       |<-- 14. Answer --------|                                           |
    |<-- 15. Display Answer |                       |                                           |
```

---

#### 7.2.3 Activity Diagram: Patient Diagnostic Triage & Assessment
Illustrates the branching decision logic when a patient navigates the clinical triage process, demonstrating automatic emergency interceptors versus standard AI analysis paths.

```
                       ( Start )
                           │
                           ▼
                  [ Select Action ]
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   [ Upload Scan ]  [ Enter Symptoms ] [ Upload Lab Report ]
         │                 │                 │
         │                 ▼                 │
         │          < Life Threatening >     │
         │             /          \          │
         │         (Yes)          (No)       │
         │          │              │         │
         │          ▼              │         │
         │    [ Display CRITICAL ] │         │
         │    [ 108/911 ALERT    ] │         │
         │          │              │         │
         ▼          ▼              ▼         ▼
     [ Execute Specialized AI Domain Agent Processing ]
                           │
                           ▼
              [ Orchestrator Aggregation ]
                           │
                           ▼
             [ Persist to Relational DB ]
                           │
                           ▼
       [ Push Embeddings to ChromaDB Vector Memory ]
                           │
                           ▼
          [ Display Results & Plain-Language Guidance ]
                           │
                           ▼
                        ( End )
```

---

#### 7.2.4 Class Diagram: Entities, Schemas, Agents & Orchestrator
Outlines the object-oriented structure of the backend architecture, illustrating class attributes, methods, and associative relationships.

```
┌───────────────────────────┐         ┌───────────────────────────────────────────────────────────┐
│           User            │         │                       Orchestrator                        │
├───────────────────────────┤         ├───────────────────────────────────────────────────────────┤
│ + id: int (PK)            │         │ - imaging_agent: ImagingAgent                             │
│ + full_name: str          │         │ - symptom_agent: SymptomAgent                             │
│ + email: str              │◄────────┤ - report_agent: ReportAgent                               │
│ + hashed_password: str    │ 1     1 │ - medication_agent: MedicationAgent                       │
│ + otp_hash: str           │         │ - rag_agent: RAGAgent                                     │
│ + is_verified: bool       │         ├───────────────────────────────────────────────────────────┤
└─────────────┬─────────────┘         │ + handle_scan(image, user_id): ScanResult                │
              │ 1                     │ + handle_symptoms(symptoms, user_id): TriageResult        │
              │                       │ + handle_report(doc, user_id): ReportResult              │
              │ *                     │ + handle_medications(drugs, user_id): MedResult           │
┌─────────────▼─────────────┐         │ + index_for_rag(user_id, rec_type, text): void            │
│       HealthRecord        │         └───────────────────────────────────────────────────────────┘
├───────────────────────────┤                                       │
│ + id: int (PK)            │                                       │ 1..* delegates
│ + user_id: int (FK)       │         ┌─────────────────────────────┼─────────────────────────────┐
│ + record_type: str        │         ▼                             ▼                             ▼
│ + summary_text: str       │ ┌────────────────┐          ┌───────────────────┐        ┌──────────────────┐
│ + urgency_level: str      │ │  ImagingAgent  │          │   SymptomAgent    │        │   ReportAgent    │
│ + created_at: datetime    │ ├────────────────┤          ├───────────────────┤        ├──────────────────┤
└───────────────────────────┘ │ + predict()    │          │ + triage()        │        │ + parse_report() │
                              │ + grad_cam()   │          │ + check_redflags()│        │ + simplify()     │
                              └────────────────┘          └───────────────────┘        └──────────────────┘
```

---

#### 7.2.5 State Chart Diagram: Diagnostic Report & Triage Lifecycle
Models the dynamic state progression of an ingested medical artifact within the system:
1. **DRAFT / UPLOADED:** Raw file received and validated for MIME format and size limits.
2. **PREPROCESSING:** Image normalized or PDF text parsed via OCR.
3. **INFERENCE_RUNNING:** Multi-agent processing (classification or LLM extraction).
4. **EMBEDDING_PENDING:** Diagnostic summary formatted for vectorization.
5. **INDEXED & ACTIVE:** Record saved in database, embedded into ChromaDB, and rendered on the patient dashboard.
6. **FLAGGED_CRITICAL (Substate):** High-urgency finding triggering persistent notification banner.

---

#### 7.2.6 Data Flow Diagrams (DFD)

##### 7.2.6.1 Level-0 DFD (Context Level)
The high-level boundary view showing data exchange between external entities and the system:
- **Inputs:** User Credentials, Biometrics, Symptoms, Medical Scans, Lab Reports, Prescriptions, Health Queries.
- **Process (0.0):** MediMind AI Multi-Agent Healthcare Platform.
- **Outputs:** Authentication Tokens, Diagnostic Summaries, Urgency Triage Tags, Grad-CAM Visualizations, Interaction Warnings, Longitudinal RAG Answers.

##### 7.2.6.2 Level-1 DFD (Subsystem Decomposition)
Breaks down Process 0.0 into 5 principal functional processes:
- **Process 1.0 (Identity & Authentication):** Validates credentials, creates OTP, issues JWT tokens.
- **Process 2.0 (Diagnostic Intake & Ingestion):** Routes files to imaging or report parsers.
- **Process 3.0 (Multi-Agent Clinical Evaluation):** Executes Imaging, Symptom, Report, and Medication models.
- **Process 4.0 (Orchestration & Vector Memory Indexing):** Formats output, saves to Relational DB, embeds into ChromaDB.
- **Process 5.0 (Longitudinal Query & Dashboard Presentation):** Handles patient semantic search and visualization.

##### 7.2.6.3 Level-2 DFD (Decomposition of Process 3.0 - Multi-Agent Evaluation)
Details the data transformation within the specialized clinical agents:
- **Sub-process 3.1:** Pre-process scan -> Run Convolutional Backbone -> Compute Class Activation Mapping (Grad-CAM) -> Generate ScanResult.
- **Sub-process 3.2:** Parse symptom keywords -> Evaluate emergency decision rules -> Query LLM for differential triage -> Generate TriageResult.
- **Sub-process 3.3:** Extract tabular lab values -> Compare against reference ranges -> Synthesize plain-language summary -> Generate ReportResult.
- **Sub-process 3.4:** Extract active drug compounds -> Audit contraindication matrix -> Categorize interaction severity -> Generate MedResult.

---

#### 7.2.7 Entity-Relationship (E-R) Diagram
The relational database schema is structured to ensure 3NF compliance and foreign-key referential integrity:

```
┌──────────────────┐               1:N               ┌────────────────────────┐
│      USERS       │ ─────────────────────────────── │     SCAN_RECORDS       │
├──────────────────┤                                 ├────────────────────────┤
│ * id (PK)        │                                 │ * id (PK)              │
│   full_name      │                                 │   user_id (FK)         │
│   email          │ 1:N                             │   image_path           │
│   password_hash  │ ─────────┐                      │   predicted_label      │
│   otp_hash       │          │                      │   confidence_score     │
│   is_verified    │          │                      │   urgency_tier         │
│   created_at     │          │                      │   created_at           │
└──────────────────┘          │                      └────────────────────────┘
         │                    ▼
         │ 1:N       ┌────────────────────────┐      ┌────────────────────────┐
         └────────── │    SYMPTOM_SESSIONS    │      │      LAB_REPORTS       │
         │           ├────────────────────────┤      ├────────────────────────┤
         │           │ * id (PK)              │      │ * id (PK)              │
         │           │   user_id (FK)         │      │   user_id (FK)         │
         │           │   symptoms_text        │      │   file_name            │
         │           │   urgency_rating       │      │   extracted_data_json  │
         │           │   triage_summary       │      │   plain_summary        │
         │           │   created_at           │      │   created_at           │
         │           └────────────────────────┘      └────────────────────────┘
         │                                                        ▲
         └────────────────────────────────────────────────────────┘ 1:N
```

---

### 7.3 User Interface (UI) Screen Descriptions

1. **Authentication & Live OTP Verification Portal:** Modern glassmorphism card interface featuring email/password inputs, dynamic validation badges, an interactive 6-digit OTP code entry with 1-click test auto-fill, and immediate error/success toasts.
2. **Unified Patient Health Dashboard:** Executive health view presenting core biometrics (Age, Gender, Record Counts), an interactive timeline of past clinical interactions, urgency alert banners, and direct action tiles for each AI agent.
3. **Medical Imaging Diagnostic Workspace:** Dual-pane layout featuring an image dropzone, real-time preview, toggleable Grad-CAM heatmap overlay, probability distribution progress bars, and clinician-facing summary notes.
4. **Symptom Triage Assessment Studio:** Conversational intake form with visual severity sliders (1 to 10), anatomical symptom tag selectors, and high-visibility emergency alert cards styled in high-contrast red for life-threatening symptoms.
5. **Lab Report Simplification Viewer:** Side-by-side comparison screen displaying extracted biochemical tables with color-coded status badges (*Green for Normal, Yellow for Borderline, Red for Critical*) alongside plain-language narrative summaries.
6. **Medication Safety & Interaction Audit Page:** Multi-input medication builder allowing users to assemble their prescription regimen, instantly rendering categorized interaction warning callouts (*Major, Moderate, Minor*).
7. **Longitudinal RAG Conversational Health Chat:** Clean conversational chat interface with streaming message bubbles, cited clinical history timestamps, and contextual suggestions.

---

# CHAPTER 8: CONCLUSION AND FUTURE WORK

### 8.1 Conclusion
The **MediMind AI** project successfully demonstrates the feasibility, engineering rigor, and clinical utility of a multi-agent architectural paradigm in modern digital healthcare. By unifying specialized artificial intelligence agents under an enterprise-grade **Orchestrator Pattern**, the platform overcomes the limitations of single-model chatbots that suffer from hallucinations and lack domain specificity.

Key accomplishments of the platform include:
- Rapid, visual chest radiograph triage supported by Grad-CAM explainability heatmaps.
- Emergency-aware symptom triage that protects users by prioritizing immediate human medical intervention for critical symptoms.
- Complete breakdown of impenetrable medical jargon into clear, empowering explanations.
- Proactive detection of hazardous polypharmacy drug-drug interactions.
- Seamless longitudinal memory continuity via ChromaDB vector embeddings.

Through robust software engineering—including asynchronous FastAPI services, cryptographic 6-digit OTP authentication, relational schema normalization, and an intuitive React 18 interface—MediMind AI delivers a secure, scalable, and empathetic digital healthcare companion.

### 8.2 Future Work
To transition MediMind AI from an academic capstone into a production clinical system, future iterations will pursue the following enhancements:
1. **Wearable IoT Telemetry Integration:** Incorporate real-time physiological data streams from smartwatches (heart rate variability, continuous SpO2, blood pressure trends) into the RAG vector store for continuous anomaly detection.
2. **Multilingual Speech-to-Speech Interface:** Implement voice-driven symptom intake and vernacular audio explanations in regional languages (Hindi, Gujarati, Tamil, etc.) to support rural and semi-literate patient populations.
3. **Doctor-Clinician Shared Portal:** Introduce dedicated clinician accounts with bidirectional messaging, enabling doctors to annotate AI findings and issue validated digital care plans.
4. **Federated Learning for Cross-Hospital Privacy:** Research federated deep learning techniques to fine-tune imaging and triage models across distributed hospital nodes without centralizing sensitive patient health records.
5. **Direct Electronic Health Record (EHR) Interoperability:** Implement HL7 / FHIR (Fast Healthcare Interoperability Resources) protocols for seamless one-click synchronization with hospital management systems.

### 8.3 Annexure
- **API Documentation:** Interactive Swagger UI accessible at `http://localhost:8000/docs`.
- **System Architecture Source:** Central Orchestrator implemented in `backend/app/agents/orchestrator.py`.
- **Vector Database Store:** Local ChromaDB instance located in `backend/chroma_db/`.
- **Frontend Codebase:** Modular React components under `frontend/src/pages/` and `frontend/src/components/`.

### 8.4 References
1. Rajpurkar, P., et al. "CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning." *arXiv preprint arXiv:1711.05225* (2017).
2. Selvaraju, R. R., et al. "Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization." *IEEE International Conference on Computer Vision (ICCV)* (2017).
3. Lewis, P., et al. "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks." *Advances in Neural Information Processing Systems (NeurIPS)* (2020).
4. Alsentzer, E., et al. "Publicly Available Clinical BERT Embeddings." *NAACL HLT Clinical NLP Workshop* (2019).
5. FastAPI Framework Documentation: `https://fastapi.tiangolo.com/`
6. React Official Documentation: `https://react.dev/`
7. ChromaDB Open Source Vector Database: `https://docs.trychroma.com/`

### 8.5 About College & Department
- **Institution:** U.V. Patel College of Engineering (UVPCE), Constituent College of Ganpat University.
- **Establishment:** Established under the aegis of Mehsana District Education Foundation at Ganpat Vidyanagar campus to impart high-quality, need-based engineering education and foster innovation in Gujarat and beyond.
- **Department:** Department of Computer Engineering / Information Technology, dedicated to producing industry-ready software engineers grounded in technical excellence, ethical computing, and societal responsibility.
- **Academic Program:** Bachelor of Technology (B.Tech.), Semester VI Capstone Project, 2025–2026.
