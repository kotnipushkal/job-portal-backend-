# Job Portal Backend API

A secure, role-based REST API for a Job Portal, built with **Node.js, Express.js, and MongoDB**. Job Seekers can browse and apply to jobs, Employers can create and manage job postings, and Admins manage the platform.

## Tech Stack

| Layer                 | Technology            |
| ---------------------- | ---------------------- |
| Runtime                | Node.js                |
| Framework              | Express.js              |
| Database               | MongoDB                |
| ODM                     | Mongoose                |
| Authentication          | JWT (httpOnly cookie)   |
| Password security       | bcryptjs                |
| Validation              | express-validator        |
| API testing             | Postman                 |

## 1. Requirements to Download / Install

Before running this project, install:

1. **Node.js** (v18 or later) — includes npm. Download: https://nodejs.org
2. **MongoDB** — either:
   - **MongoDB Community Server** installed locally: https://www.mongodb.com/try/download/community, or
   - A free **MongoDB Atlas** cloud cluster: https://www.mongodb.com/cloud/atlas (no local install needed)
3. **Postman** — for API testing: https://www.postman.com/downloads
4. A code editor such as **VS Code** (optional but recommended): https://code.visualstudio.com

You do **not** need to install anything else globally — all Node dependencies are installed via `npm install` (see below), pulled from the `package.json` in this project:
`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cookie-parser`, `cors`, `dotenv`, `express-validator`, and `nodemon` (dev only).

## 2. Setup Instructions

```bash
# 1. Unzip / open the project folder, then install dependencies
npm install

# 2. Create your local .env file from the example
cp .env.example .env
# then open .env and fill in real values (see below)

# 3. Start MongoDB (skip if using Atlas)
# macOS/Linux example:
mongod
# Or just make sure your Atlas connection string is in .env

# 4. Run the server
npm run dev      # with nodemon (auto-restarts on changes)
# or
npm start        # plain node
```

The server starts at `http://localhost:5000` by default. Check it's alive:

```
GET http://localhost:5000/api/health
```

### Environment Variables (`.env`)

| Variable            | Description                                              |
| -------------------- | ---------------------------------------------------------- |
| `PORT`                | Port the server listens on (default `5000`)                |
| `NODE_ENV`            | `development` or `production`                              |
| `MONGO_URI`           | MongoDB connection string (local or Atlas)                  |
| `JWT_SECRET`          | Long random string used to sign JWTs — keep this secret     |
| `JWT_EXPIRES_IN`      | JWT lifetime, e.g. `7d`                                     |
| `COOKIE_EXPIRES_DAYS` | How many days the auth cookie stays valid                    |
| `CLIENT_ORIGIN`       | Allowed CORS origin(s), comma-separated                      |

**Never commit your real `.env` file** — it's already listed in `.gitignore`. Only `.env.example` (with placeholder values) is meant to be shared/submitted.

## 3. Project Structure

```
job-portal-backend/
├── config/
│   └── db.js                # MongoDB connection
├── controllers/
│   ├── authController.js    # register, login, logout, me
│   ├── userController.js    # view/update own profile
│   ├── jobController.js     # job CRUD
│   ├── applicationController.js
│   └── adminController.js
├── middleware/
│   ├── auth.js               # JWT verification (protect)
│   ├── role.js                # role-based authorization
│   ├── validate.js            # express-validator rule sets
│   └── errorHandler.js        # centralized error handling
├── models/
│   ├── User.js                # + embedded skills/education
│   ├── Job.js                 # references Employer (User)
│   └── Application.js         # references Job + Job Seeker (User)
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── jobRoutes.js
│   ├── applicationRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── ApiError.js
│   ├── asyncHandler.js
│   └── generateToken.js
├── postman/
│   └── Job-Portal-API.postman_collection.json
├── app.js                     # Express app + route wiring
├── server.js                  # entry point (connects DB, starts server)
├── .env.example
└── package.json
```

## 4. Roles & Responsibilities

| Role       | Responsibility                                                                 |
| ----------- | --------------------------------------------------------------------------------- |
| Job Seeker  | Creates a profile, browses jobs, applies to jobs, tracks application status         |
| Employer    | Posts and manages their own jobs, reviews applications received for those jobs       |
| Admin       | Manages all users and job postings, platform-level access                            |

## 5. API Overview

All endpoints are prefixed with `/api`. Protected routes require the `token` httpOnly cookie set at login (Postman's cookie jar handles this automatically if you enable it in Settings → General → "Automatically follow redirects" and cookies persistence is on by default for a collection run in the same session).

### Auth (`/api/auth`)
| Method | Route      | Access | Description                     |
| ------- | ----------- | ------- | ---------------------------------- |
| POST    | `/register` | Public  | Register as jobseeker/employer/admin |
| POST    | `/login`    | Public  | Login, sets JWT httpOnly cookie      |
| POST    | `/logout`   | Private | Clears the auth cookie               |
| GET     | `/me`       | Private | Get the logged-in user's own data    |

### Users (`/api/users`)
| Method | Route  | Access  | Description                    |
| ------- | ------- | -------- | ---------------------------------- |
| GET     | `/me`   | Private  | View own profile                   |
| PUT     | `/me`   | Private  | Update own profile (name/skills/experience/education/companyName) |

### Jobs (`/api/jobs`)
| Method | Route                | Access             | Description                              |
| ------- | ---------------------- | -------------------- | -------------------------------------------- |
| GET     | `/`                    | Private (any role)   | List jobs (Job Seekers only see `open` jobs) |
| GET     | `/employer/my-jobs`    | Private (Employer)    | List the logged-in employer's own jobs        |
| GET     | `/:id`                 | Private (any role)   | Get a single job by ID                        |
| POST    | `/`                    | Private (Employer)    | Create a job posting                          |
| PUT     | `/:id`                 | Private (Employer, owner) | Update own job posting                    |
| DELETE  | `/:id`                 | Private (Employer, owner) | Delete own job posting                    |

### Applications (`/api/applications`)
| Method | Route              | Access               | Description                             |
| ------- | -------------------- | ---------------------- | -------------------------------------------- |
| POST    | `/:jobId`            | Private (Job Seeker)   | Apply to a job (blocked if already applied)   |
| GET     | `/my`                | Private (Job Seeker)   | View own submitted applications + status      |
| GET     | `/job/:jobId`        | Private (Employer, job owner) | View applications received for a job   |
| PATCH   | `/:id/status`        | Private (Employer, job owner) | Update an application's status          |

### Admin (`/api/admin`)
| Method | Route                | Access | Description                    |
| ------- | ---------------------- | ------- | ---------------------------------- |
| GET     | `/users`               | Admin   | List all users                      |
| GET     | `/users/:id`           | Admin   | Get a user by ID                    |
| PATCH   | `/users/:id/status`    | Admin   | Set user status to active/suspended |
| DELETE  | `/users/:id`           | Admin   | Delete a user                       |
| GET     | `/jobs`                | Admin   | List all job postings               |
| GET     | `/jobs/:id`            | Admin   | Get a job posting by ID             |
| DELETE  | `/jobs/:id`            | Admin   | Remove a job posting                |

## 6. Database Design Notes

- **User** stores account, auth, role, and profile info. `password` has `select: false` so it's never returned by default, and is stripped explicitly before any response as an extra safeguard.
- **Job** references its **Employer** (`employer: ObjectId → User`) because a job has its own lifecycle and is queried/updated independently of the user.
- **Application** references both **Job** and the **Job Seeker** (`applicant`), with a compound unique index on `(job, applicant)` so a user cannot apply to the same job twice.
- **Embedded data**: `education` (array of sub-documents) and `skills` are embedded directly in the **User** document, since that data belongs to the user, has no independent identity, and is always read/updated together with the profile. Similarly, `Application` keeps a small `applicantSnapshot` (name/email/skills/experience at time of applying) embedded, so an employer sees the applicant's info as it was when they applied, even if the seeker edits their profile afterward.

## 7. Security Notes

- Passwords are hashed with bcrypt before saving; plain-text passwords are never stored or returned.
- JWT is issued on login/register and stored in an `httpOnly`, `sameSite=strict` cookie (and `secure` in production) — not accessible to client-side JavaScript.
- `middleware/auth.js` verifies the token on every protected route; `middleware/role.js` restricts routes to specific roles.
- Ownership checks (e.g., an Employer editing a job, or viewing applications) always compare against `req.user._id` from the verified token — never a client-supplied ID — preventing users from acting on resources they don't own.
- All secrets (JWT key, DB connection string) live in `.env`, which is git-ignored.

## 8. Testing with Postman

Import `postman/Job-Portal-API.postman_collection.json` into Postman. It includes:

- Public requests (register, login)
- Authenticated requests (me, profile update, logout)
- Role-protected requests for each role (Job Seeker / Employer / Admin)
- Negative test cases: no auth, invalid token, wrong-role access, duplicate application, resource-ownership violations, validation errors

**Tip:** Run requests in order within each folder (e.g., register → login → create job → apply) since later requests depend on IDs created earlier. Copy returned IDs into the `jobId` / `applicationId` / `userId` collection variables as you go.

## 9. Suggested Manual Test Flow

1. Register an Employer, a Job Seeker, and an Admin.
2. Log in as Employer → create a job → copy its `_id` into `jobId`.
3. Log in as Job Seeker → GET `/jobs` (should see the open job) → apply to it → try applying again (expect `409`).
4. Log in as Employer → GET `/applications/job/:jobId` → update the application's status.
5. Log in as Job Seeker → GET `/applications/my` → confirm the updated status shows.
6. Log in as Admin → list users/jobs, suspend a user, delete a job.
7. Log out and confirm `/auth/me` returns `401`.

---
Next stage (out of scope for this submission): AI integration into the backend.
