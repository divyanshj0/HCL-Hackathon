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

# HCL-Hackathon Frontend

## Overview

This frontend application provides user interfaces for patients and providers to register, log in, and manage their profiles and data. It interacts with the backend API documented above.

## Features

- **User Registration:** Patients and providers can create accounts.
- **User Login:** Secure authentication for both roles.
- **Profile Management:** View and update user profile information.
- **Role-Based Access:** Providers have access to additional features (e.g., patient management).

## Pages & Components

### 1. Registration Page
- Allows users to register as either a patient or provider.
- Provider registration requires specialization, hospital, and license number.

### 2. Login Page
- Authenticates users and stores JWT token for session management.

### 3. Profile Page
- Displays user information.
- Allows editing of profile details.

### 4. Provider Dashboard 
- Lists assigned patients.
- Displays patient details and allows management.

### 5. Patient Dashboard 
- Shows personal health goals and records.

## API Integration

- Uses the backend endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/user/profile`
- JWT token is stored in local storage or cookies and sent in the `Authorization` header for protected routes.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```
2. Start the development server:
   ```
   npm start
   ```
3. Configure the backend API URL in your environment or config files.

## Environment Variables

- `REACT_APP_API_URL`: Set this to your backend API base URL.

## Example API Usage

```javascript
// Register
fetch(`${process.env.REACT_APP_API_URL}/api/auth/register`, { ... })

// Login
fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, { ... })

// Get Profile
fetch(`${process.env.REACT_APP_API_URL}/api/user/profile`, {
  headers: { Authorization: `Bearer ${token}` }
})
```
### 🏠 Application Homepage

![Homepage View](screenshots/WhatsApp%20Image%202025-11-22%20at%2012.42.23_27b6aaf1.jpg)
