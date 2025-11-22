# HCL-Hackathon Backend

## Authentication Routes

### POST `/api/auth/register`
Registers a new user (Patient or Provider).

**Request Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "password": "yourpassword",
  "role": "patient", // or "provider"
  "specialization": "Cardiology",      // required for provider
  "hospital": "Hospital Name",         // required for provider
  "licenseNumber": "ABC123"            // required for provider
}
```

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

### POST `/api/auth/login`
Authenticates a user (Patient or Provider).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword",
  "role": "patient" // or "provider"
}
```

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

### GET `/api/user/profile`
Fetches the profile of the authenticated user (Patient or Provider).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response:**
```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "phone": "1234567890",
  "role": "patient", // or "provider"
  "specialization": "Cardiology",      // only for provider
  "hospital": "Hospital Name",         // only for provider
  "licenseNumber": "ABC123"            // only for provider
}
```

**Error Responses:**
```json
{ "message": "Not authorized, token failed" }
{ "message": "Not authorized, no token" }
{ "message": "User not found" }
```

---

