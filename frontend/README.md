# InsightIQ Frontend

A premium Next.js 14 dashboard for AI-powered analytics.

## 🏗️ Architecture

- **Next.js 14 (App Router)**: Modern routing and server components.
- **Tailwind CSS**: Sleek, enterprise-grade dark mode UI.
- **AuthContext**: Centralized state for JWT, user profile, and workspace switching.
- **ProtectedRoute**: Higher-order component for role-based access control.

## 🚀 Development

```bash
npm install
npm run dev
```

## 🗺️ Page Mapping

- `/dashboard`: Unified overview showing AI insights and dataset status.
- `/datasets`: Data management, upload, and pipeline monitoring.
- `/workspace/members`: Team management and invitation portal.
- `/reports`: Archive of AI-generated insights and export options.
- `/admin`: Platform-wide governance (Admin role only).

## 🔑 Role Enforcements

- **ADMIN**: Access to `/admin` and all platform logs.
- **WORKSPACE_OWNER**: Full control over datasets, team invites, and analysis.
- **VIEWER**: Read-only access to dashboards and reports.

## 🔄 Workspace Switching

The `WorkspaceSelector` component in the header updates the `currentWorkspace` in `AuthContext`, which automatically re-triggers data fetching on all active pages to ensure complete data isolation.
