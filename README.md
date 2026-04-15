# Rakshak Welfare

Rakshak Welfare is a full-stack welfare-assistance platform that helps users:
- register and manage profile data
- verify email and securely authenticate
- recover account access with forgot-password flow
- check eligible and potential government schemes
- run document audit on uploaded images

## Current Features

### Authentication
- Register with profile details
- Email verification via verification link
- Login restricted until email is verified
- Resend verification email
- Forgot password via reset email link
- Reset password with expiring token
- Logout via HTTP-only cookie clearing

### User and Schemes
- Profile update endpoint (`/api/users/me`)
- Eligibility matching (`/api/schemes/eligible`) with:
  - `eligible` schemes
  - `potential` schemes

### Document Audit
- Upload-based document audit endpoint (`/api/audit/audit-upload`)

### Database Reliability
- MongoDB connection fallback support:
  - primary: `MONGO_URI`
  - fallback for restrictive networks: `MONGO_URI_DIRECT`

## Tech Stack

- Backend: Node.js, Express, Mongoose
- Frontend: React + Vite 
- Auth: JWT + HTTP-only cookies
- Email: Nodemailer (SMTP)

## Local Setup

### 1) Backend

```bash
cd backend
npm install
node app.js
```

Runs on: `http://localhost:5000`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on: `http://localhost:5173`

## Backend Environment Variables

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

# Mongo
MONGO_URI=your_mongodb_srv_uri
MONGO_URI_DIRECT=your_mongodb_direct_uri

# Auth
JWT_SECRET=your_strong_jwt_secret
CLIENT_URL=http://localhost:5173

# SMTP (required for real verification/forgot-password emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your_app_password_without_spaces
SMTP_FROM="Rakshak Welfare <your-email@gmail.com>"
```

## API Endpoints

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create unverified user and send verification email |
| POST/GET | `/api/auth/verify-email` | Verify account using token |
| POST | `/api/auth/resend-verification` | Resend verification email |
| POST | `/api/auth/login` | Login only if email verified |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### User / Schemes / Audit

| Method | Endpoint | Description |
|---|---|---|
| PATCH | `/api/users/me` | Update profile and recalculate scheme results |
| GET | `/api/schemes/eligible` | Fetch eligible and potential schemes |
| POST | `/api/audit/audit-upload` | Upload and audit document |

## Frontend Notes

- Password fields now include reusable eye-icon show/hide toggles.
- Verification and reset flows are link-first (real-world style).
- UI is simplified/minimal compared to earlier versions.

## Project Structure

```text
rakshak-welfare/
|-- backend/
|   |-- app.js
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- utils/
|   `-- seed.js
|-- frontend/
|   |-- src/
|   `-- vite.config.js
`-- README.md
```
