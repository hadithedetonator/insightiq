# InsightIQ – AI-Powered Analytics & Reporting Platform

InsightIQ is a high-performance, full-stack analytics platform that automates the transition from raw data to actionable AI-driven insights. Designed for modern enterprises, it provides seamless data ingestion, automated validation pipelines, and structured AI analysis.

## 🚀 Key Features
- **Asynchronous Ingestion Pipeline**: Decoupled ingestion, validation, and analysis steps for high reliability.
- **AI-Powered Insights**: Automated summary generation and trend detection using GPT-4.
- **Role-Based Access Control**: Secure multi-tenancy with Admin, Workspace Owner, and Viewer roles.
- **Dynamic Dashboards**: Real-time observability of usage metrics, token consumption, and pipeline health.
- **Professional Reporting**: One-click PDF/CSV report generation for stakeholders.

## 🏗️ Architecture
`Frontend (Next.js)` → `Backend (Express/Node.js)` → `Prisma ORM` → `PostgreSQL`
                                        ↓
                                `AI Pipeline (OpenAI)`

## 📊 Data Models
- **User**: Authentication and profile data.
- **Workspace**: Isolated environments for teams.
- **Dataset**: Containers for raw data and metadata.
- **Record**: Atomic data units within a dataset.
- **AIRequest**: Logs of AI prompts, responses, and token usage.
- **PipelineLog**: Event-based tracking of ingestion statuses.

## 👥 User Stories & Roadmap

### Primary Roles:
1. **Admin**: System-wide oversight, user management, and global usage monitoring.
2. **Workspace Owner**: Full control over datasets, workspace users, and reporting exports.
3. **Viewer**: Read-only access to insights and dashboards within a specific workspace.

### Core Flows:
- **Data Ingestion**: A Workspace Owner uploads a JSON dataset → System validates schema → AI generates summary → Status updates to 'COMPLETED'.
- **Reporting**: User navigates to dataset details → Clicks "Export PDF" → Receives structured report with AI insights.
- **Monitoring**: Admin views global dashboard → Tracks token usage across all workspaces.

### Failure Scenarios handled:
- **Invalid Data**: Pipeline catches schema mismatches during validation and logs 'FAILED' status.
- **AI Timeout**: System retries or provides a graceful fallback with partial results.

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- PostgreSQL
- OpenAI API Key (optional, defaults to mock)

### Local Development
1. **Clone the repo**
2. **Install dependencies**:
   ```bash
   npm run install:all
   ```
3. **Setup Environment**:
   - Copy `backend/.env.example` to `backend/.env`
   - Configure `DATABASE_URL` and `OPENAI_API_KEY`.
4. **Database Migration**:
   ```bash
   npm run prisma:push
   ```
5. **Start Applications**:
   ```bash
   npm run dev
   ```

## 🛣️ API Endpoints

### 🔐 Authentication
- `POST /api/auth/register`: Create a new account & default workspace.
- `POST /api/auth/login`: Authenticate and receive JWT.

### 📊 Datasets & Pipelines
- `GET /api/datasets?workspaceId={id}`: List all datasets in a workspace.
- `POST /api/datasets`: Create dataset and trigger async ingestion + AI pipeline.
- `GET /api/datasets/:id`: Get detailed records, logs, and AI insights.

### 📈 Analytics & Reporting
- `GET /api/analytics/:workspaceId`: Usage metrics and token tracking.
- `GET /api/reports/csv/:datasetId`: Export raw data as CSV.
- `GET /api/reports/pdf/:datasetId`: Export AI-summary report as PDF.

### 💓 Health
- `GET /ping`: ECS health check endpoint.

## ☁️ Deployment (AWS ECS)

### Step 1: ECR Setup
1. Create a repository: `aws ecr create-repository --repository-name insightiq-backend`
2. Push your Docker image to ECR.

### Step 2: Infrastructure
1. **Security Groups**: Create a SG allowing port 80/443 (LB) and 3000 (ECS).
2. **CloudWatch**: Create log group `/ecs/insightiq-backend`.
3. **Secrets Manager/SSM**: Store `DATABASE_URL` and `JWT_SECRET`.

### Step 3: ECS Service
1. Register Task Definition using `aws/ecs-task-def.json`.
2. Create an ECS Service with Fargate and attach it to an Application Load Balancer.
3. Health check path: `/ping`.

## ⏭️ Known Limitations & Next Steps
- Implement real-time WebSocket notifications for pipeline completion.
- Support for larger file uploads (CSV/XLSX) using S3.
- Advanced visualization with D3.js.
