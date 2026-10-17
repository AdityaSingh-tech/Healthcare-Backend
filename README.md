# Healthcare Backend (Node.js + Express + PostgreSQL)

REST API for managing patients, doctors and patient-doctor mappings, with JWT authentication.

**Stack:** Node.js, Express, Sequelize (ORM), PostgreSQL, JWT (`jsonwebtoken`), bcrypt, Joi validation.

## Setup

```bash
git clone <repo-url> && cd healthcare-backend
npm install
cp .env.example .env      # then fill in your values
createdb healthcare_db    # or create the database in pgAdmin
npm start                 # tables are created automatically on first run
```

### Environment variables (`.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | PostgreSQL connection |
| `DB_SSL` | `true` for hosted databases |
| `JWT_SECRET` | Secret used to sign tokens |
| `JWT_EXPIRES_IN` | Token lifetime (default `1d`) |

## API

All routes except `/api/auth/*` need `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register (`name`, `email`, `password`) |
| POST | `/api/auth/login/` | Login, returns JWT |
| POST | `/api/patients/` | Add patient |
| GET | `/api/patients/` | List patients created by the current user |
| GET/PUT/DELETE | `/api/patients/:id/` | Get / update / delete a patient (owner only) |
| POST | `/api/doctors/` | Add doctor |
| GET | `/api/doctors/` | List all doctors |
| GET | `/api/doctors/:id/` | Get a doctor |
| PUT/DELETE | `/api/doctors/:id/` | Update / delete (creator only) |
| POST | `/api/mappings/` | Assign doctor to patient (`patientId`, `doctorId`) |
| GET | `/api/mappings/` | All mappings for the current user's patients |
| GET | `/api/mappings/:patient_id/` | Doctors assigned to a patient |
| DELETE | `/api/mappings/:id/` | Remove a doctor from a patient |

### Example requests

```bash
curl -X POST localhost:5000/api/auth/register -H "Content-Type: application/json" \
  -d '{"name":"Aadi","email":"aadi@example.com","password":"password123"}'

curl -X POST localhost:5000/api/auth/login -H "Content-Type: application/json" \
  -d '{"email":"aadi@example.com","password":"password123"}'

curl -X POST localhost:5000/api/patients -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Ravi Kumar","age":34,"gender":"male","phone":"9876543210"}'

curl -X POST localhost:5000/api/doctors -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Dr. Mehta","specialization":"Cardiology","experienceYears":12}'

curl -X POST localhost:5000/api/mappings -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"patientId":1,"doctorId":1}'
```

## Design notes
- Passwords are hashed with bcrypt; they are never returned by the API.
- Patients are private to the user who created them; doctors are readable by all authenticated users but only editable by their creator.
- A doctor can be assigned to a patient only once (unique constraint + 409 response).
- Deleting a patient or doctor also removes its mappings.
- Errors use consistent JSON: `{ "error": "...", "details": [...] }` with proper 400/401/403/404/409 codes.
