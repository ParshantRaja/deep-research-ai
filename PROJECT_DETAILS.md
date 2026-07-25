# Deep Research AI - Project Technical Documentation

## 1. Project Overview
Deep Research AI is an advanced, autonomous intelligence agent designed to perform exhaustive web research and generate professional, academic-grade reports. It leverages state-of-the-art LLMs and specialized search APIs to synthesize deep insights from live internet data.

## 2. Core Technology Stack
*   **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
*   **Animations**: Framer Motion.
*   **Icons/UI Components**: Lucide React, Radix UI.
*   **Backend**: Next.js API Routes (Serverless).
*   **Database**: Firebase Firestore (NoSQL).
*   **Authentication**: NextAuth.js (Google OAuth) + Custom OTP (Gmail SMTP).
*   **AI Engine (LLM)**: Google Gemini 1.5 Flash.
*   **Search Engine**: Tavily AI (Agentic Search).
*   **Email Service**: Nodemailer via Gmail SMTP.

## 3. Infrastructure & Deployment
*   **Containerization**: Docker.
*   **Deployment Platform**: Google Cloud Run.
*   **Build Pipeline**: Google Cloud Build.
*   **Environment Management**: .env.local + Cloud Run Environment Variables.

## 4. Key Features
*   **Cross-Device Auth**: User profiles and history are synced via Firestore.
*   **OTP Verification**: Secure signup flow using dynamic 6-digit codes.
*   **12-Section Reports**: Exhaustive analysis including Abstract, Literature Review, Methodology, and Findings.
*   **Smart Citations**: Automated in-text citations [1], [2] linked to a full references list.
*   **History Sync**: Persistent sidebar with access to all previous research reports.
*   **Navigation Guard**: History-aware UI that prevents accidental exits from the dashboard.

## 5. Development Notes
*   **Models used**: `gemini-flash-latest` (fastest & most reliable for JSON).
*   **Search Depth**: `advanced` (via Tavily) for deep web crawling.
*   **Security**: Autocomplete disabled on auth forms, secure environment variable injection during build/runtime.
