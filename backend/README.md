# InsightIQ Backend API

The InsightIQ backend is a Node.js/Express application using Prisma ORM with PostgreSQL. It handles authentication, workspace isolation, data pipelines, and AI analysis.

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Database**:
   - Ensure PostgreSQL is running.
   - Update `.env` with `DATABASE_URL`.
   ```bash
   npm run prisma:push
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🔐 Authentication (JWT)

Use the following endpoints to manage access:

### Register
`POST /api/auth/register`
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Admin", "email": "alice@insightiq.ai", "password": "password123"}'
```

### Create Admin
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name": "Platform Admin", "email": "admin@insightiq.ai", "password": "password123", "role": "ADMIN"}'
```

### Login
`POST /api/auth/login`
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@insightiq.ai", "password": "password123"}'
```

## 🏢 Workspace Management

### Invite Team Member
`POST /api/workspaces/invite`
```bash
curl -X POST http://localhost:3001/api/workspaces/invite \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId": "<WS_ID>", "email": "bob@analyst.com", "role": "VIEWER"}'
```

### Accept Invitation
`POST /api/workspaces/accept`
```bash
curl -X POST http://localhost:3001/api/workspaces/accept \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"workspaceId": "<WS_ID>"}'
```

## 📊 Datasets & Pipelines

### Upload Dataset
`POST /api/datasets`
```bash
curl -X POST http://localhost:3001/api/datasets \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name": "Sales Q4", "workspaceId": "<WS_ID>", "data": [{"month": "Oct", "rev": 5000}]}'
```

## 📈 Reports

### Export PDF
`GET /api/reports/pdf/:datasetId`
```bash
curl -X GET http://localhost:3001/api/reports/pdf/<ID> \
  -H "Authorization: Bearer <TOKEN>" --output report.pdf
```
