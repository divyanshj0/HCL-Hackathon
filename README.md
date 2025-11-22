# HCL-Hackathon
# HCL-Hackathon

## API Endpoints & Responses

### Auth Routes

#### POST `/api/auth/register`
Registers a new user (Patient or Provider).

**Success Response:**
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "patient", // or "provider"
  "token": "jwt_token"
}
```

**Error Responses:**
```json
{ "message": "Please enter all required fields: name, email, phone, and password." }
{ "message": "User already exists" }
{ "message": "Please include specialization, hospital, and license number for doctor registration." }
{ "message": "Invalid user data" }
{ "message": "Server error during registration" }
```

---

#### POST `/api/auth/login`
Authenticates a user (Patient or Provider).

**Success Response:**
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "patient", // or "provider"
  "token": "jwt_token"
}
```

**Error Responses:**
```json
{ "message": "Access denied. Please log in through the provider portal." }
{ "message": "Invalid credentials or user not found" }
{ "message": "Server error during login" }
```

---

### Middleware Responses

#### Protected Route (using `protect` middleware)
If token is missing or invalid:
```json
{ "message": "Not authorized, token failed" }
{ "message": "Not authorized, no token" }
```

#### Provider-only Route (using `providerOnly` middleware)
If user is not a provider:
```json
{ "message": "Access restricted to healthcare providers" }
```

---

*Add more API endpoints and their responses here as you implement additional routes (e.g., patientRoute, providerRoutes).*# HCL-Hackathon

## API Endpoints & Responses

### Auth Routes

#### POST `/api/auth/register`
Registers a new user (Patient or Provider).

**Success Response:**
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "patient", // or "provider"
  "token": "jwt_token"
}
```

**Error Responses:**
```json
{ "message": "Please enter all required fields: name, email, phone, and password." }
{ "message": "User already exists" }
{ "message": "Please include specialization, hospital, and license number for doctor registration." }
{ "message": "Invalid user data" }
{ "message": "Server error during registration" }
```

---

#### POST `/api/auth/login`
Authenticates a user (Patient or Provider).

**Success Response:**
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "patient", // or "provider"
  "token": "jwt_token"
}
```

**Error Responses:**
```json
{ "message": "Access denied. Please log in through the provider portal." }
{ "message": "Invalid credentials or user not found" }
{ "message": "Server error during login" }
```

---

### Middleware Responses

#### Protected Route (using `protect` middleware)
If token is missing or invalid:
```json
{ "message": "Not authorized, token failed" }
{ "message": "Not authorized, no token" }
```

#### Provider-only Route (using `providerOnly` middleware)
If user is not a provider:
```json
{ "message": "Access restricted to healthcare providers" }
```

---

### Patient Routes

#### Example: GET `/api/patient/profile`
Fetches the profile of the authenticated patient.

**Success Response:**
```json
{
  "_id": "patient_id",
  "name": "Patient Name",
  "email": "patient@example.com",
  "phone": "1234567890",
  "role": "patient",
  "goals": [ /* array of patient goals */ ],
  "records": [ /* array of patient records */ ]
}
```

**Error Responses:**
```json
{ "message": "Patient not found" }
{ "message": "Not authorized, token failed" }
```

---

#### Example: PUT `/api/patient/profile`
Updates the profile of the authenticated patient.

**Success Response:**
```json
{
  "message": "Profile updated successfully",
  "patient": {
    "_id": "patient_id",
    "name": "Updated Name",
    "email": "updated@example.com",
    "phone": "1234567890"
  }
}
```

**Error Responses:**
```json
{ "message": "Update failed" }
{ "message": "Not authorized, token failed" }
```

---

### Provider Routes

#### Example: GET `/api/provider/profile`
Fetches the profile of the authenticated provider.

**Success Response:**
```json
{
  "_id": "provider_id",
  "name": "Provider Name",
  "email": "provider@example.com",
  "role": "provider",
  "specialization": "Cardiology",
  "hospital": "Hospital Name",
  "licenseNumber": "ABC123"
}
```

**Error Responses:**
```json
{ "message": "Provider not found" }
{ "message": "Not authorized, token failed" }
```

---

#### Example: GET `/api/provider/patients`
Fetches the list of patients assigned to the provider.

**Success Response:**
```json
[
  {
    "_id": "patient_id_1",
    "name": "Patient One",
    "email": "patient1@example.com"
  },
  {
    "_id": "patient_id_2",
    "name": "Patient Two",
    "email": "patient2@example.com"
  }
]
```

**Error Responses:**
```json
{ "message": "No patients found" }
{ "message": "Not authorized, token failed" }
```

---

*Note: The above patient and provider routes are examples. Please update with actual endpoints and responses as implemented in your codebase.*

---
