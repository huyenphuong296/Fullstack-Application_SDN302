# Fullstack-Application_SDN302

A Fullstack Quiz-Application built with Node.js, Express, MongoDB, React, and Redux. Features user authentication, quiz management, question CRUD, and an interactive quiz interface.

**SDN302 – Assignment 4: Full-stack application**

- **backend/** – Node.js, Express, MongoDB (Mongoose), Passport + JWT
- **frontend/** – React, Redux Toolkit, React Router, Bootstrap 5 (Vite)

## Demo accounts (created by `npm run seed`)

| Username | Password | Role |
|---|---|---|
| Mary | 123 | Admin – manage questions & quizzes |
| John | 123 | User – take quizzes |

New accounts created from the Register page are always normal users.

## Run locally

Requires Node.js 20+ and MongoDB running on `127.0.0.1:27017`.

```bash
cd backend
cp .env.example .env      # then edit SECRET_KEY
npm install
npm run seed              # demo accounts + sample quiz
npm run dev               # http://localhost:5000
```

```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:5000
npm install
npm run dev               # http://localhost:5173
```

## REST API

All endpoints except signup/login need `Authorization: Bearer <token>`.

| Method | Endpoint | Who |
|---|---|---|
| POST | `/users/signup` · `/users/login` | anyone |
| GET | `/users/me` | logged in |
| GET | `/users` | admin |
| GET | `/quizzes` · `/quizzes/:id` | logged in (answers hidden for users) |
| POST | `/quizzes/:id/submit` `{ answers: { questionId: index } }` | logged in |
| POST · PUT · DELETE | `/quizzes` · `/quizzes/:id` | admin |
| GET | `/questions` · `/questions/:id` | logged in (answers hidden for users) |
| POST · PUT · DELETE | `/questions` · `/questions/:id` | admin |

## Deploy

MongoDB Atlas (database) → Render (backend) → Vercel (frontend).

### 1. MongoDB Atlas
1. Create a free M0 cluster.
2. **Database Access** → add a database user (username + password).
3. **Network Access** → add `0.0.0.0/0` (Render has no fixed IP).
4. **Connect → Drivers** → copy the connection string and add the database name:
   `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/Assignment4?retryWrites=true&w=majority`
5. Seed it once from your machine:
   ```bash
   cd backend
   MONGODB_URI="<atlas uri>" npm run seed
   ```
   (PowerShell: `$env:MONGODB_URI="<atlas uri>"; npm run seed`)

### 2. Render – backend
New → **Web Service** → connect the GitHub repo:

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | Free |

Environment variables: `MONGODB_URI` (Atlas URI), `SECRET_KEY` (long random string),
`CORS_ORIGIN` (the Vercel URL, set after step 3). Render sets `PORT` itself.

Check: opening `https://<service>.onrender.com/` shows `{"status":"ok",...}`.

### 3. Vercel – frontend
Add New → Project → import the same repo:

| Setting | Value |
|---|---|
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Environment Variable | `VITE_API_URL=https://<service>.onrender.com` |

`frontend/vercel.json` rewrites every path to `index.html`, so refreshing `/dashboard/quiz` works.

### 4. Connect them
Put the Vercel URL (e.g. `https://assignment4-xyz.vercel.app`) into Render's `CORS_ORIGIN`
and save – Render redeploys automatically.

> The free Render instance sleeps after ~15 minutes without traffic; the first request
> afterwards takes ~50 seconds. Open the backend URL a minute before a demo.
