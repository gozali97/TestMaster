# Register Feature - Web Package

## ✅ Feature Implemented

Halaman register sudah ditambahkan ke package web dengan fitur lengkap.

## 📍 URL
```
http://localhost:3000/register
```

## 🎨 Features

### 1. **Complete Registration Form**
- Full Name input
- Email address input with validation
- Password input (minimum 6 characters)
- Confirm Password with matching validation
- Real-time validation
- Error messages display
- Loading state during submission

### 2. **Form Validation**
- ✅ All fields required
- ✅ Email format validation
- ✅ Password minimum 6 characters
- ✅ Password confirmation match
- ✅ Clear error messages

### 3. **UI/UX Features**
- Clean, modern design with Tailwind CSS
- Responsive layout
- Loading spinner during registration
- Error message display
- Social auth buttons (GitHub, Google) - UI only
- Link to login page
- Terms & Privacy links

### 4. **Auto-Login After Registration**
- Automatically logs in user after successful registration
- Stores JWT tokens in localStorage
- Redirects to dashboard

### 5. **API Integration**
- Connects to `http://localhost:3001/api/auth/register`
- Sends: `{ name, email, password }`
- Receives: `{ success, data: { user, tokens } }`
- Auto-generates organization name: `{name}'s Organization`

## 📁 Files Created

### Web Package
```
packages/web/src/app/(auth)/register/
└── page.tsx                    # Register page component
```

### API Package (Updated)
```
packages/api/src/modules/auth/
├── auth.controller.ts          # Updated with validation & auto org name
├── auth.routes.ts              # Already has /register route
```

## 🔧 API Endpoint

### POST `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Optional:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "organizationName": "My Company"  // Optional, auto-generates if not provided
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "ORG_ADMIN",
      "organizationId": 1
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Email already exists"
}
```

## 🔒 Validation Rules

### Backend (API)
- ✅ Email, password, name are required
- ✅ Password must be at least 6 characters
- ✅ Email must be unique
- ✅ Organization name auto-generated if not provided
- ✅ Password is hashed with bcrypt (12 rounds)
- ✅ JWT tokens generated automatically

### Frontend (Web)
- ✅ All fields required
- ✅ Email format validation (regex)
- ✅ Password minimum 6 characters
- ✅ Password and confirm password must match
- ✅ Shows specific error messages

## 🚀 How to Use

### 1. Start API Server
```bash
cd packages/api
npm run start:fresh
```

### 2. Start Web Server
```bash
cd packages/web
npm run dev
```

### 3. Access Register Page
```
http://localhost:3000/register
```

### 4. Fill Registration Form
1. Enter your full name
2. Enter email address
3. Create password (min 6 chars)
4. Confirm password
5. Click "Create Account"

### 5. After Registration
- You'll be automatically logged in
- Redirected to `/dashboard`
- Tokens saved in localStorage

## 🔄 User Flow

```
Register Page → Fill Form → Validate → Submit to API
                                            ↓
                                    Create Organization
                                            ↓
                                        Create User
                                            ↓
                                    Generate JWT Tokens
                                            ↓
                                    Return to Frontend
                                            ↓
                                    Store Tokens → Redirect to Dashboard
```

## 🎯 Features Details

### Auto Organization Creation
When user registers, system automatically creates:
- New Organization with name: `{userName}'s Organization`
- User role: `ORG_ADMIN`
- Plan: `FREE`

### Security
- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
  - Access Token: 15 minutes
  - Refresh Token: 7 days
- CORS enabled
- Helmet security headers

### Token Management
Tokens stored in localStorage:
```javascript
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

## 📊 Database Changes

When user registers, creates records in:

**Organizations Table:**
```sql
INSERT INTO organizations (name, plan) 
VALUES ('John Doe\'s Organization', 'FREE');
```

**Users Table:**
```sql
INSERT INTO users (email, passwordHash, name, role, organizationId)
VALUES ('john@example.com', '$2b$12$...', 'John Doe', 'ORG_ADMIN', 1);
```

## 🐛 Error Handling

### Frontend Errors
- Form validation errors (client-side)
- API connection errors
- Network errors
- Display user-friendly error messages

### Backend Errors
- Email already exists → 400
- Missing required fields → 400
- Password too short → 400
- Server errors → 500

## 🎨 UI Components

### Form Elements
- Text inputs with labels
- Password inputs with visibility toggle (can be added)
- Submit button with loading state
- Error alert box
- Social auth buttons (UI placeholder)
- Link to login page
- Terms & Privacy links

### Styling
- Tailwind CSS
- Responsive design
- Clean, modern look
- Focus states
- Hover effects
- Loading animations

## 🔗 Navigation

### From Register Page
- Click "Sign in" → Go to `/login`
- After successful registration → Auto redirect to `/dashboard`

### To Register Page
- From `/login` → Click "Sign up"
- Direct URL: `http://localhost:3000/register`

## 🧪 Testing

### Manual Testing Steps

1. **Valid Registration:**
   ```
   Name: Test User
   Email: test@example.com
   Password: test123
   Confirm: test123
   
   Expected: Success, redirect to dashboard
   ```

2. **Duplicate Email:**
   ```
   Email: (existing email)
   
   Expected: Error "Email already exists"
   ```

3. **Password Too Short:**
   ```
   Password: 12345
   
   Expected: Error "Password must be at least 6 characters"
   ```

4. **Password Mismatch:**
   ```
   Password: test123
   Confirm: test456
   
   Expected: Error "Passwords do not match"
   ```

5. **Invalid Email:**
   ```
   Email: notanemail
   
   Expected: Error "Please enter a valid email address"
   ```

6. **Missing Fields:**
   ```
   (Leave any field empty)
   
   Expected: Error "All fields are required"
   ```

## 📝 Future Enhancements

### Possible Improvements
1. ✨ Email verification
2. ✨ Password strength indicator
3. ✨ Show/hide password toggle
4. ✨ OAuth integration (Google, GitHub)
5. ✨ Organization name input (optional)
6. ✨ Captcha integration
7. ✨ Profile picture upload
8. ✨ Phone number field
9. ✨ Terms acceptance checkbox
10. ✨ Password requirements tooltip

## 🔐 Security Considerations

### Current Security Features
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ SQL injection protection (Sequelize ORM)

### Recommended Additions
- 📧 Email verification
- 🔒 Rate limiting on register endpoint
- 🤖 Captcha/reCAPTCHA
- 📱 2FA support
- 🔑 Password reset flow
- 📊 Login attempt tracking

## 💡 Tips

### For Users
1. Use strong passwords (6+ characters, mix of letters, numbers, symbols)
2. Use unique email for each service
3. Remember your credentials

### For Developers
1. Set JWT_SECRET in .env
2. Configure SMTP for email verification
3. Add rate limiting to prevent abuse
4. Monitor registration patterns
5. Log failed registration attempts

## 🔄 API Controller Updates

Added validation and auto-organization naming:

```typescript
// Before
const organization = await Organization.create({
  name: organizationName,  // Required field
  plan: 'FREE',
});

// After
const orgName = organizationName || `${name}'s Organization`;
const organization = await Organization.create({
  name: orgName,  // Auto-generated if not provided
  plan: 'FREE',
});
```

## ✅ Checklist

- ✅ Register page created at `/register`
- ✅ Form validation implemented
- ✅ API endpoint working
- ✅ Auto organization creation
- ✅ JWT token generation
- ✅ Auto-login after registration
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Link to login page

## 📞 Support

If you encounter issues:

1. **API not responding:**
   ```bash
   cd packages/api
   npm run start:fresh
   ```

2. **Web not loading:**
   ```bash
   cd packages/web
   npm run dev
   ```

3. **Database errors:**
   - Check database connection in `.env`
   - Run migrations: `npm run migrate`

4. **Token issues:**
   - Clear localStorage
   - Try registering again

---

**Status**: ✅ COMPLETE

Register feature fully implemented and ready to use!
