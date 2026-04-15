# Rakshak Welfare Frontend

This is the React + Vite frontend for the Rakshak Welfare platform.

## Run Locally

```bash
npm install
npm run dev
```

App URL: `http://localhost:5173`

## Build

```bash
npm run build
```

## Main Flows Implemented

- Login / Register
- Email verification (link-based)
- Forgot password and reset password (email-link based)
- Scheme eligibility and potential schemes view
- Document audit upload
- Profile update and scheme recalculation

## Notes

- API base URL can be configured with `VITE_API_BASE`.
- Backend must be running for all flows to work.
- Password inputs include eye-icon show/hide toggles.
