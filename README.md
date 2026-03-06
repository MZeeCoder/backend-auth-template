# Vymio Backend API

Backend API with Supabase authentication system.

## Features

- ✅ User Sign Up
- ✅ User Login
- ✅ Email Verification (OTP)
- ✅ Resend Confirmation Email
- ✅ User Logout
- ✅ Get Current User
- ✅ Refresh Access Token
- ✅ Password Reset Request
- ✅ Update Password
- ✅ JWT Token Authentication Middleware
- ✅ Email Verification Middleware

## Tech Stack

- Node.js
- Express.js
- Supabase (Authentication & Database)
- dotenv (Environment variables)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the values with your Supabase credentials

3. Start the development server:
```bash
npm run dev
```

4. Start the production server:
```bash
npm start
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret-key
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

### Public Routes (No Authentication Required)

#### 1. Sign Up
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### 2. Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 3. Verify Email
```
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "token": "123456"
}
```

#### 4. Resend Confirmation Email
```
POST /api/auth/resend-confirmation
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### 5. Refresh Token
```
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "your-refresh-token"
}
```

#### 6. Reset Password Request
```
POST /api/auth/reset-password-request
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Protected Routes (Authentication Required)

All protected routes require the `Authorization` header:
```
Authorization: Bearer <access-token>
```

#### 7. Get Current User
```
GET /api/auth/me
Authorization: Bearer <access-token>
```

#### 8. Logout
```
POST /api/auth/logout
Authorization: Bearer <access-token>
```

#### 9. Update Password
```
PUT /api/auth/update-password
Authorization: Bearer <access-token>
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

#### 10. Get Profile (Requires Email Verification)
```
GET /api/auth/profile
Authorization: Bearer <access-token>
```

### Health Check
```
GET /health
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "error": {...}
}
```

## Project Structure

```
vymio-backend/
├── src/
│   ├── config/
│   │   └── supabase.js          # Supabase client configuration
│   ├── controllers/
│   │   └── authController.js     # Authentication controllers
│   ├── middleware/
│   │   └── authMiddleware.js     # Authentication middleware
│   ├── routes/
│   │   └── authRoutes.js         # Authentication routes
│   ├── services/
│   │   └── authService.js        # Authentication service layer
│   └── index.js                  # Main application file
├── .env                          # Environment variables (not in git)
├── .env.example                  # Environment variables template
├── .gitignore
├── package.json
└── README.md
```

## Authentication Flow

### Sign Up Flow
1. User submits email and password
2. Backend creates user in Supabase
3. Supabase sends confirmation email with OTP
4. User verifies email using OTP
5. User can now log in

### Login Flow
1. User submits email and password
2. Backend verifies credentials with Supabase
3. Returns access token and refresh token
4. Client stores tokens for subsequent requests

### Protected Route Access
1. Client sends request with access token in Authorization header
2. Middleware verifies token with Supabase
3. If valid, request proceeds; otherwise, returns 401

## Middleware

### `verifyToken`
Verifies JWT token from Supabase and attaches user to request object.

### `requireEmailVerified`
Ensures user's email is verified before accessing the route.

### `optionalAuth`
Optional authentication that doesn't fail if no token is provided.

## Error Handling

All errors are caught and returned with appropriate HTTP status codes:
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Security Features

- Helmet.js for security headers
- CORS configuration
- JWT token validation
- Password minimum length requirement
- Secure token refresh mechanism

## Development

Run with auto-reload:
```bash
npm run dev
```

## Testing

You can test the API using tools like:
- Postman
- Insomnia
- cURL
- Thunder Client (VS Code extension)

## License

ISC
