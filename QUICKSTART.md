# Quick Start Guide

## 1. Start the Server

```bash
npm run dev
```

The server will start on http://localhost:3000

## 2. Test Authentication Flow

### Step 1: Sign Up a New User

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Sign up successful. Please check your email for confirmation.",
  "user": {...},
  "session": null
}
```

> ⚠️ **Note:** Check your email inbox for the confirmation email with OTP code.

---

### Step 2: Verify Email (Optional - if email confirmation is required)

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "123456"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "user": {...},
  "session": {...}
}
```

---

### Step 3: Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {...},
  "session": {...},
  "accessToken": "eyJhbGc...",
  "refreshToken": "v1.MR5..."
}
```

> 💾 **Save the `accessToken` for the next requests!**

---

### Step 4: Get Current User (Protected Route)

Replace `YOUR_ACCESS_TOKEN` with the token from login:

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "user": {
    "id": "...",
    "email": "test@example.com",
    "user_metadata": {
      "firstName": "Test",
      "lastName": "User"
    }
  }
}
```

---

### Step 5: Logout

```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Additional Endpoints

### Resend Confirmation Email

```bash
curl -X POST http://localhost:3000/api/auth/resend-confirmation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Refresh Access Token

```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Reset Password Request

```bash
curl -X POST http://localhost:3000/api/auth/reset-password-request \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

### Update Password

```bash
curl -X PUT http://localhost:3000/api/auth/update-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "newPassword": "newpassword456"
  }'
```

---

## Testing with Postman

1. Import the `postman_collection.json` file into Postman
2. Set the `baseUrl` variable to `http://localhost:3000`
3. After login, copy the `accessToken` and set it in the collection variables
4. Run the requests in order

---

## Troubleshooting

### Server won't start
- Make sure all dependencies are installed: `npm install`
- Check if port 3000 is available
- Verify your `.env` file is configured correctly

### Authentication fails
- Verify your Supabase credentials in `.env`
- Check if your Supabase project is active
- Make sure email confirmation is disabled in Supabase if you want to skip Step 2

### Email not received
- Check your spam folder
- Verify SMTP settings in Supabase dashboard
- For testing, you can disable email confirmation in Supabase settings

---

## Supabase Dashboard

To manage users and settings, visit your Supabase dashboard:
https://yqslcdzqgncweprfjpap.supabase.co

**Authentication Settings:**
- Go to Authentication → Settings
- Configure email templates
- Enable/disable email confirmation
- Set password requirements

---

## Next Steps

1. ✅ Test all authentication endpoints
2. ✅ Configure Supabase email templates
3. ✅ Set up your frontend to consume these APIs
4. ✅ Add more protected routes as needed
5. ✅ Implement user profile management
6. ✅ Add role-based access control (RBAC)

---

## Support

If you encounter any issues:
1. Check the server logs in the terminal
2. Verify Supabase dashboard for user status
3. Test with Postman to isolate frontend/backend issues
4. Review the README.md for detailed documentation
