# ProgressPulse — Performance Intelligence Platform

## Tech Stack
- React 18 + Vite
- React Router v6
- Bootstrap 5
- Sonner (toast notifications)
- Axios (API layer)
- Recharts (charts)
- React Icons

## Setup
```bash
npm install
npm run dev
```

## Configuration
Edit `.env`:
```
VITE_API_BASE_URL=https://localhost:7000
```

## Pages
| Role     | Route                                   | Feature                |
|----------|-----------------------------------------|------------------------|
| Both     | /login                                  | Login                  |
| Manager  | /manager/dashboard                      | Dashboard overview     |
| Manager  | /manager/team-logs                      | Team logs + comments   |
| Manager  | /manager/employee/:id/summary           | 90-day summary         |
| Manager  | /manager/employee/:id/appraisal         | Full appraisal report  |
| Employee | /employee/goals                         | Goals management       |
| Employee | /employee/logs                          | Weekly logs submission |
