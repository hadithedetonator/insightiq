# InsightIQ – AI-Powered Analytics & Reporting Platform

InsightIQ is an enterprise-grade analytics platform designed to bridge the gap between raw data and actionable business intelligence. It features a robust asynchronous data pipeline, automated AI analysis, and multi-tenant workspace isolation.

---

## 🏗️ Architecture

```text
User ──► Next.js Frontend (Tailwind/Lucide) ──► Express API (JWT Auth)
                                                  │
             ┌────────────────────────────────────┴────────────────────────────────────┐
             ▼                                    ▼                                    ▼
       Prisma (Postgres)                   OpenAI (GPT-4)                        AWS ECS (Compute)
    (Data Modeling/RBAC)               (Analytical Insights)               (Scalable Hosting)
```

---

## 📂 Project Structure

- **`/backend`**: Node.js + Express API. Handles JWT auth, role-based logic, and data pipelines.
- **`/frontend`**: Next.js 14 Dashboard. Interactive UI with role-aware navigation.
- **`/prisma`**: Shared data models and migration history.
- **`/aws`**: ECS Task definitions and deployment configurations.

---

## �️ Data Models

### **User**
```prisma
model User {
  id            String          @id @default(uuid())
  email         String          @unique
  password      String          // bcrypt hashed
  name          String?
  role          RoleType        @default(VIEWER)  // Platform-level role
  workspaces    WorkspaceUser[] // Many-to-many with workspaces
  aiRequests    AIRequest[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}
```

**Fields:**
- `role`: Platform-level permission (ADMIN, WORKSPACE_OWNER, VIEWER)
- `workspaces`: Junction table for workspace memberships

---

### **Workspace**
```prisma
model Workspace {
  id          String          @id @default(uuid())
  name        String
  slug        String          @unique
  users       WorkspaceUser[] // Members with roles
  datasets    Dataset[]       // Isolated data per workspace
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
}
```

**Purpose:** Multi-tenant isolation. Each workspace has its own datasets, members, and analytics.

---

### **WorkspaceUser (Role Assignment)**
```prisma
model WorkspaceUser {
  id          String           @id @default(uuid())
  userId      String
  workspaceId String
  user        User             @relation(fields: [userId], references: [id])
  workspace   Workspace        @relation(fields: [workspaceId], references: [id])
  role        RoleType         @default(VIEWER)  // Workspace-specific role
  status      InvitationStatus @default(ACCEPTED) // PENDING or ACCEPTED
  createdAt   DateTime         @default(now())
  updatedAt   DateTime         @updatedAt

  @@unique([userId, workspaceId])
}
```

**Purpose:** 
- Manages workspace membership and permissions
- Supports invitation workflow (PENDING → ACCEPTED)
- Allows different roles per workspace

---

### **Dataset**
```prisma
model Dataset {
  id          String         @id @default(uuid())
  name        String
  description String?
  workspaceId String
  workspace   Workspace      @relation(fields: [workspaceId], references: [id])
  records     Record[]       // Actual data rows
  aiRequests  AIRequest[]    // AI analysis history
  logs        PipelineLog[]  // Execution logs
  status      PipelineStatus @default(QUEUED)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
}
```

**Status Flow:** `QUEUED → INGESTING → VALIDATING → ANALYZING → COMPLETED/FAILED`

---

### **Record (Table Data)**
```prisma
model Record {
  id        String   @id @default(uuid())
  datasetId String
  dataset   Dataset  @relation(fields: [datasetId], references: [id])
  data      Json     // Flexible schema for any data structure
  createdAt DateTime @default(now())
}
```

**Purpose:** Stores actual dataset rows as JSON for schema flexibility.

---

### **AIRequest / Response**
```prisma
model AIRequest {
  id             String   @id @default(uuid())
  userId         String
  user           User     @relation(fields: [userId], references: [id])
  datasetId      String
  dataset        Dataset  @relation(fields: [datasetId], references: [id])
  prompt         String   // AI instruction sent
  response       Json     // AI-generated insights
  tokenUsage     Int      @default(0)
  executionTime  Int      @default(0) // milliseconds
  createdAt      DateTime @default(now())
}
```

**Purpose:** 
- Tracks every AI interaction
- Monitors token costs
- Stores analysis results for caching

---

### **PipelineLog (Execution Logs)**
```prisma
model PipelineLog {
  id         String         @id @default(uuid())
  datasetId  String
  dataset    Dataset        @relation(fields: [datasetId], references: [id])
  event      String         // e.g., "VALIDATION_STARTED", "AI_ANALYSIS_COMPLETED"
  status     PipelineStatus
  details    String?        // Error messages or metadata
  createdAt  DateTime       @default(now())
}
```

**Purpose:** Observability and debugging for async pipelines.

---

## 🔌 API Design

### **Authentication**
- `POST /api/auth/register` - User signup
- `POST /api/auth/login` - Login with JWT token
- `GET /api/auth/me` - Get current user data (for state refresh)

### **Workspace Management**
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces` - Get user's workspaces
- `GET /api/workspaces/discover` - Browse all workspaces (for Viewers)
- `POST /api/workspaces/request-join` - Request workspace access
- `POST /api/workspaces/approve-request` - Approve join request (Owner/Admin)
- `POST /api/workspaces/invite` - Invite user by email
- `POST /api/workspaces/accept` - Accept invitation

### **Data Ingestion**
- `POST /api/datasets` - Upload dataset (JSON/CSV)
  - Triggers async pipeline: Validation → Storage → AI Analysis
- `GET /api/datasets?workspaceId=<id>` - List workspace datasets
- `GET /api/datasets/:id` - Get dataset details with records

### **AI Analysis**
- `POST /api/analytics/trigger` - Manually trigger AI analysis
  - Body: `{ datasetId, mode: "summarization" | "classification" | "predictive" }`
- `GET /api/analytics/:workspaceId` - Get workspace analytics summary

### **Reporting**
- `GET /api/reports/pdf/:datasetId` - Generate PDF report
- `GET /api/reports/csv/:datasetId` - Export dataset as CSV

### **User Management (Admin Only)**
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/role` - Update platform role
- `PUT /api/users/workspace-role` - Update workspace-specific role
- `DELETE /api/users/:userId` - Delete user

---

## ⚙️ Pipeline Execution

### **Synchronous vs Asynchronous**

#### **Synchronous Operations**
- User authentication
- Workspace creation
- Fetching dashboard data
- Viewing reports

**Why:** Immediate response required, lightweight operations.

#### **Asynchronous Operations**
- Dataset ingestion and validation
- AI analysis (OpenAI API calls)
- Report generation (PDF/CSV)

**Why:** Long-running tasks that shouldn't block the API response.

### **Async Pipeline Flow**

```javascript
// 1. User uploads dataset
POST /api/datasets
  ↓
// 2. Create dataset record with status=QUEUED
Dataset.create({ status: 'QUEUED' })
  ↓
// 3. Return 202 Accepted immediately
res.status(202).json({ datasetId, message: 'Pipeline queued' })
  ↓
// 4. Fire-and-forget async pipeline
runIngestionPipeline(datasetId, data, userId)
  ↓
// Pipeline runs in background:
  - Update status to INGESTING
  - Validate data structure
  - Update status to VALIDATING
  - Store records in database
  - Update status to ANALYZING
  - Call OpenAI API
  - Store AI response
  - Update status to COMPLETED
  - Log each step in PipelineLog
```

**Implementation:**
```javascript
const runIngestionPipeline = async (datasetId, data, userId) => {
    try {
        await updateStatus(datasetId, 'INGESTING');
        const validated = await validateData(data);
        
        await updateStatus(datasetId, 'VALIDATING');
        await storeRecords(datasetId, validated);
        
        await updateStatus(datasetId, 'ANALYZING');
        const insights = await callOpenAI(validated);
        
        await storeAIResponse(datasetId, userId, insights);
        await updateStatus(datasetId, 'COMPLETED');
    } catch (error) {
        await updateStatus(datasetId, 'FAILED');
        await logError(datasetId, error);
    }
};
```

---

## 🛡️ Error Handling

### **API Level**
```javascript
try {
    // Operation
} catch (error) {
    res.status(500).json({ 
        message: 'User-friendly error message',
        error: error.message 
    });
}
```

### **Pipeline Level**
- All errors logged to `PipelineLog` with status `FAILED`
- Dataset status updated to `FAILED`
- Error details stored for debugging

### **Frontend Level**
- API errors caught and displayed to user
- Loading states prevent duplicate requests
- Retry mechanisms for failed operations

---

## 📈 Scaling Considerations

### **Database**
- **Connection Pooling**: Prisma manages connection pool
- **Indexing**: Unique constraints on `email`, `slug`, `userId_workspaceId`
- **Partitioning**: Future: Partition `Record` table by workspace

### **API**
- **Horizontal Scaling**: Stateless Express servers
- **Load Balancing**: AWS ECS with Application Load Balancer
- **Rate Limiting**: Implement per-user rate limits

### **AI Processing**
- **Queue System**: Future: Use Redis/Bull for job queue
- **Batch Processing**: Group multiple datasets for analysis
- **Caching**: Store AI responses to avoid duplicate API calls

### **Storage**
- **File Uploads**: Future: S3 for large CSV files
- **Database**: PostgreSQL with read replicas
- **CDN**: CloudFront for static assets

---

## �️ User Stories & Roadmap

### **Platform Admin**
✅ **As an admin, I want to manage all users across the platform**
- View all users with their workspace memberships
- Edit platform-level roles (ADMIN, WORKSPACE_OWNER, VIEWER)
- Edit workspace-specific roles for each user
- Add/remove users from workspaces

✅ **As an admin, I want to monitor system-wide AI usage**
- View total AI requests across all workspaces
- Track token consumption and costs
- Monitor pipeline execution logs

✅ **As an admin, I want to oversee all workspaces**
- View all workspaces in the platform
- See member counts and dataset statistics
- Approve/reject workspace join requests

---

### **Workspace Owner**
✅ **As a workspace owner, I want to upload datasets to generate AI-powered insights**
- Upload JSON or CSV files
- Automatic validation and normalization
- Trigger AI analysis (summarization, classification, predictive)
- View AI-generated insights in dashboard

✅ **As a workspace owner, I want automated reports so stakeholders can stay updated**
- Generate PDF reports with AI insights
- Export datasets as CSV
- Share reports with team members

✅ **As a workspace owner, I want to track AI usage and token costs**
- View AI request history for workspace
- Monitor token consumption per dataset
- Track execution times and success rates

✅ **As a workspace owner, I want to manage team members**
- Invite users to workspace via email
- Approve/reject join requests from Viewers
- Change member roles (Viewer ↔ Owner)
- Remove members from workspace

---

### **Viewer / Team Member**
✅ **As a viewer, I want to discover and join workspaces**
- Search for available workspaces by name
- View workspace details (member count, dataset count)
- Request to join workspaces
- Track request status (Pending/Approved)

✅ **As a viewer, I want to view datasets and AI insights**
- Access workspace dashboard
- View dataset statistics
- Read AI-generated insights and reports

✅ **As a viewer, I want to request on-demand AI summaries**
- Request AI analysis for specific datasets
- View historical AI responses

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js v18+
- PostgreSQL Database
- OpenAI API Key (optional, defaults to mock mode)

### 2. Setup
```bash
# Clone the repository
cd insightiq

# Install ALL dependencies
npm run install:all

# Configure Backend
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Initialize Database
npm run prisma:push

# Start Development
cd ..
npm run dev
```

### 🗝️ Admin Account Creation
By default, the registration page creates `VIEWER` accounts for security. To create the first **Platform Admin** for testing:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Admin User", "email": "admin@insightiq.ai", "password": "password123", "role": "ADMIN"}'
```

---

## ☁️ Deployment (AWS ECS)

The platform is optimized for horizontal scaling on AWS ECS:
- **Container Port**: 3000 (standardized)
- **Health Check**: Endpoint at `/ping`
- **Infrastructure**: See `aws/ecs-task-def.json` for environment and secret mapping

---

## 🚧 Known Limitations & Next Steps

- Implement real-time WebSocket notifications for long-running AI pipelines
- Add Redis-based job queue for better async processing
- Add support for direct SQL database connections as data sources
- Enhance reporting with custom chart builders and layout editors
- Implement email notifications for invitations and approvals
- Add audit logs for all admin actions
