# Rakshak Welfare

Rakshak Welfare is a comprehensive welfare-assistance platform that helps users discover and access government schemes through intelligent eligibility matching and document verification.

## Key Features

### 🔐 Authentication & Security

- User registration with profile details and government ID verification
- Email verification with secure token-based links
- JWT-based authentication with HTTP-only cookies
- Password recovery via email reset links
- Account security with bcrypt password hashing

### 📋 Eligibility Matching

- **Smart Scheme Discovery**: Matches users to government schemes based on:
  - Age, gender, caste, income, state residency
  - Document verification status
- **Eligible Schemes**: Fully qualified schemes (all criteria met + documents verified)
- **Potential Schemes**: Near-miss schemes with improvement suggestions
- **Real-time Updates**: Eligibility recalculates on profile changes

### 📄 Document Management

- **Self-Declared Documents**: Users can list documents they hold during registration
- **Auto-Document Addition**: Government ID documents auto-added based on registration type
- **OCR-Powered Verification**: Upload document images for AI audit and verification
- **Verification Status**: Documents move from `documentsHeld` to `verifiedDocuments` upon successful audit

### 🤖 AI Document Audit

- Upload government document images (JPG/PNG)
- OCR extraction and validation using Tesseract.js
- Fuzzy name matching and date validation
- Automatic document verification on successful audit

### 🗄️ Database Management

- Auto-seeding of government schemes on server startup
- MongoDB with Mongoose ODM
- Connection fallback for restrictive networks

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Frontend**: React 18, Vite, Tailwind CSS
- **Authentication**: JWT, bcryptjs
- **Email**: Nodemailer with SMTP
- **OCR**: Tesseract.js
- **AI Matching**: Custom eligibility algorithms

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB Atlas account or local MongoDB
- SMTP email service (Gmail recommended)

### Installation

1. **Clone and Setup**

   ```bash
   git clone <repository-url>
   cd rakshak-welfare
   ```

2. **Backend Setup**

   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure environment variables
   node app.js
   ```

   Server runs on: `http://localhost:5000`

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   App runs on: `http://localhost:5173`

## Environment Configuration

Create `backend/.env`:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rakshak-welfare
MONGO_URI_DIRECT=mongodb://localhost:27017/rakshak-welfare

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-here
CLIENT_URL=http://localhost:5173

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password
SMTP_FROM="Rakshak Welfare <your-email@gmail.com>"
```

## API Reference

### Authentication Endpoints

| Method | Endpoint                        | Description                               |
| ------ | ------------------------------- | ----------------------------------------- |
| POST   | `/api/auth/register`            | Register user with auto-document addition |
| POST   | `/api/auth/verify-email`        | Verify email with token                   |
| POST   | `/api/auth/resend-verification` | Resend verification email                 |
| POST   | `/api/auth/login`               | Authenticate verified user                |
| POST   | `/api/auth/logout`              | Clear authentication                      |
| POST   | `/api/auth/forgot-password`     | Send password reset email                 |
| POST   | `/api/auth/reset-password`      | Reset password with token                 |

### User Management

| Method | Endpoint        | Description                                |
| ------ | --------------- | ------------------------------------------ |
| PATCH  | `/api/users/me` | Update profile and recalculate eligibility |

### Scheme Eligibility

| Method | Endpoint                | Description                                     |
| ------ | ----------------------- | ----------------------------------------------- |
| GET    | `/api/schemes/eligible` | Get eligible and potential schemes with reasons |

### Document Audit

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/api/audit/audit-upload` | Upload and audit document image |

## User Flow

1. **Registration**: User provides details, selects government ID type → Document auto-added to profile
2. **Email Verification**: Click verification link to activate account
3. **Login**: Authenticate with verified credentials
4. **Eligibility Check**: View matched schemes (eligible + potential with reasons)
5. **Document Verification**: Upload document images for OCR audit → Verified documents enable more schemes
6. **Profile Updates**: Modify details to improve eligibility matches

## Database Schema

### User Model

- Personal info (name, email, age, gender, caste, income, location)
- Authentication (password hash, email verification status)
- Documents (held: self-declared, verified: audited)
- Government ID (type and number)

### Scheme Model

- Scheme details (name, department, state, description)
- Eligibility criteria (age range, income limit, gender, caste)
- Required documents array
- Application link

## Project Structure

```
rakshak-welfare/
├── backend/
│   ├── app.js              # Main server with auto-seeding
│   ├── config/db.js        # Database connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helpers (matcher, audit, mailer)
│   └── seed.js            # Manual seeding script
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React app
│   │   ├── api.js         # API client
│   │   └── assets/        # Static files
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:

- Check the API documentation above
- Review environment configuration
- Ensure MongoDB and SMTP are properly configured
  | POST | `/api/auth/reset-password` | Reset password with token |

### User Management

| Method | Endpoint        | Description                                |
| ------ | --------------- | ------------------------------------------ |
| PATCH  | `/api/users/me` | Update profile and recalculate eligibility |

### Scheme Eligibility

| Method | Endpoint                | Description                                     |
| ------ | ----------------------- | ----------------------------------------------- |
| GET    | `/api/schemes/eligible` | Get eligible and potential schemes with reasons |

### Document Audit

| Method | Endpoint                  | Description                     |
| ------ | ------------------------- | ------------------------------- |
| POST   | `/api/audit/audit-upload` | Upload and audit document image |

## User Flow

1. **Registration**: User provides details, selects government ID type → Document auto-added to profile
2. **Email Verification**: Click verification link to activate account
3. **Login**: Authenticate with verified credentials
4. **Eligibility Check**: View matched schemes (eligible + potential with reasons)
5. **Document Verification**: Upload document images for OCR audit → Verified documents enable more schemes
6. **Profile Updates**: Modify details to improve eligibility matches

## Database Schema

### User Model

- Personal info (name, email, age, gender, caste, income, location)
- Authentication (password hash, email verification status)
- Documents (held: self-declared, verified: audited)
- Government ID (type and number)

### Scheme Model

- Scheme details (name, department, state, description)
- Eligibility criteria (age range, income limit, gender, caste)
- Required documents array
- Application link

## Project Structure

```
rakshak-welfare/
├── backend/
│   ├── app.js              # Main server with auto-seeding
│   ├── config/db.js        # Database connection
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── utils/             # Helpers (matcher, audit, mailer)
│   └── seed.js            # Manual seeding script
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main React app
│   │   ├── api.js         # API client
│   │   └── assets/        # Static files
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or issues:

- Check the API documentation above
- Review environment configuration
- Ensure MongoDB and SMTP are properly configured
