# BadFish Auth setup

## 1. Backend environment
Create `server/.env` from `server/.env.example`:

```env
PORT=5005
MONGODB_URI=your_mongodb_connection_string
SECRET_TOKEN=use-a-long-random-secret-here
CLIENT_ORIGIN=http://localhost:5173
```

## 2. Install and run backend

```bash
cd server
npm install
npm run dev
```

Expected:

```text
MongoDB connected
BadFish auth server running at http://localhost:5005
```

Check `http://localhost:5005/api/health`.

## 3. Frontend environment
Create `.env` in the project root:

```env
VITE_API_URL=http://localhost:5005/api
```

Then:

```bash
npm install
npm run dev
```

## Auth flow
- `POST /api/auth/signup` creates the user and hashes the password with bcrypt.
- `POST /api/auth/login` validates credentials and returns a JWT.
- The client stores the JWT as `badfish_token`.
- `GET /api/auth/verify` validates the session on page reload.
- Protected requests send `Authorization: Bearer <token>`.
- Logout removes the token.
- A `401` clears an expired/invalid local session.
- Helmet adds security response headers; CORS permits the configured client origin.
