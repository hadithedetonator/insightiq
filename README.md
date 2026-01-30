# InsightIQ – AI-Powered Analytics & Reporting Platform

InsightIQ is a high-performance, full-stack analytics platform that automates the transition from raw data to actionable AI-driven insights. It is structured as a **unified monorepo** for seamless development and deployment.

## 🚀 Key Features
- **Asynchronous Ingestion Pipeline**: Decoupled ingestion, validation, and analysis steps.
- **AI-Powered Insights**: Automated summary generation and trend detection using GPT-4.
- **Role-Based Access Control**: Secure multi-tenancy with Admin, Workspace Owner, and Viewer roles.
- **Dynamic Dashboards**: Real-time observability of usage metrics and pipeline health.
- **Professional Reporting**: One-click PDF/CSV report generation.

## 🏗️ Project Structure
```text
/repo/insightiq
├─ backend/             # Express API (JWT, Auth, Pipelines)
├─ frontend/            # Next.js 14 Dashboard
├─ prisma/              # Shared Database Schema
├─ aws/                 # AWS ECS Deployment Configs
└─ package.json         # Root Monorepo Configuration
```

## 📊 Data Models
- **User**: Authentication and profile data.
- **Workspace**: Team-based isolation.
- **Dataset**: Data containers and metadata.
- **AIRequest**: Detailed logs of AI prompts and costs.
- **PipelineLog**: Status tracking for all ingestion events.

## 🛣️ API Endpoints

### 🔐 Auth
- `POST /api/auth/register`: Signup & auto-workspace creation.
- `POST /api/auth/login`: JWT generation.

### 📊 Data
- `POST /api/datasets`: Trigger AI pipeline for new data.
- `GET /api/datasets/:id`: Deep dive into logs & insights.

### 📈 Reports
- `GET /api/reports/csv/:datasetId`: Raw data export.
- `GET /api/reports/pdf/:datasetId`: AI Summary report.

## 🛠️ Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm run install:all
   ```
2. **Database Setup**:
   - Create a `.env` in `backend/` with `DATABASE_URL`.
   - Run: `npm run prisma:push`
3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## ☁️ Deployment (AWS ECS)
- **Repo Location**: `/repo/insightiq`
- **Task Definition**: Found in `aws/ecs-task-def.json`
- **Health Check**: `/ping` endpoint on port 3001.

---
*Maintained as a single repository container for both frontend and backend.*
