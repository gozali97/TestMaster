# 🚀 Quick Register Guide - TestMaster

## ✅ What's New

Register feature telah ditambahkan ke TestMaster Web!

**URL**: `http://localhost:3000/register`

## 🎯 Quick Start

### 1. Start Servers

**Terminal 1 - API:**
```bash
cd packages/api
npm run start:fresh
```

**Terminal 2 - Web:**
```bash
cd packages/web
npm run dev
```

### 2. Access Register Page
```
http://localhost:3000/register
```

### 3. Fill Form
- **Full Name**: Your name
- **Email**: Valid email address
- **Password**: Min 6 characters
- **Confirm Password**: Must match

### 4. Submit
Click "Create Account" → Auto login → Redirect to dashboard

## 📁 Files Created/Updated

### New Files
```
packages/web/src/app/(auth)/register/
└── page.tsx                           # Register page

packages/web/src/lib/
└── auth.ts                            # Auth service (reusable)

Documentation/
├── WEB_REGISTER_FEATURE.md           # Full documentation
└── QUICK_REGISTER_GUIDE.md           # This file
```

### Updated Files
```
packages/api/src/modules/auth/
└── auth.controller.ts                 # Added validation & auto org name
```

## 🔑 Key Features

✅ **Complete Form** with validation  
✅ **Email uniqueness** check  
✅ **Password validation** (min 6 chars)  
✅ **Auto-login** after registration  
✅ **Auto organization** creation  
✅ **JWT tokens** stored automatically  
✅ **Error handling** with clear messages  
✅ **Loading states** during submission  
✅ **Responsive design** for all devices  

## 🎨 UI Features

- Clean, modern design
- Real-time validation
- Password strength hint
- Social auth buttons (UI only)
- Link to login page
- Terms & Privacy placeholders

## 🔐 Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens with expiration
- Input validation (frontend & backend)
- SQL injection protection

## 🐛 Common Issues & Solutions

### ❌ "Email already exists"
**Solution**: Use different email or login with existing account

### ❌ "Password must be at least 6 characters"
**Solution**: Use longer password

### ❌ "Passwords do not match"
**Solution**: Retype confirm password correctly

### ❌ API not responding
**Solution**:
```bash
cd packages/api
npm run start:fresh
```

### ❌ Page not found
**Solution**: Make sure web server is running on port 3000
```bash
cd packages/web
npm run dev
```

## 📊 What Happens When You Register?

1. **Fill form** → Submit
2. **Frontend validation** → Check all fields
3. **Send to API** → POST /api/auth/register
4. **Create organization** → `{name}'s Organization`
5. **Create user** → With hashed password
6. **Generate tokens** → JWT access & refresh
7. **Return to frontend** → With tokens & user data
8. **Store tokens** → localStorage
9. **Redirect** → `/dashboard`

## 🔄 Using Auth Service (for Developers)

```typescript
import { AuthService } from '@/lib/auth';

// Register
const result = await AuthService.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123'
});

if (result.success) {
  AuthService.storeTokens(
    result.data.tokens.accessToken,
    result.data.tokens.refreshToken
  );
  router.push('/dashboard');
}

// Check authentication
if (AuthService.isAuthenticated()) {
  // User is logged in
}

// Logout
AuthService.logout();

// Make authenticated API call
const data = await AuthService.apiRequest('/api/projects');
```

## 🧪 Test Registration

Try these test cases:

### ✅ Valid Registration
```
Name: Test User
Email: test@example.com
Password: test123
Confirm: test123

Expected: ✅ Success, redirect to /dashboard
```

### ❌ Duplicate Email
```
Email: (use same email twice)

Expected: ❌ "Email already exists"
```

### ❌ Short Password
```
Password: 123

Expected: ❌ "Password must be at least 6 characters"
```

### ❌ Password Mismatch
```
Password: test123
Confirm: test456

Expected: ❌ "Passwords do not match"
```

## 🎯 Next Steps

After successful registration:
1. ✅ User automatically logged in
2. ✅ Redirected to dashboard
3. ✅ Can access all features
4. ✅ Organization created automatically

## 📖 Full Documentation

For detailed information, see:
- **WEB_REGISTER_FEATURE.md** - Complete feature documentation
- **API_BUG_FIX.md** - API fixes applied
- **API_PORT_CONFLICT_FIX.md** - Port management

## 💡 Pro Tips

### For Users
1. Use strong, unique passwords
2. Keep your credentials safe
3. Use real email for verification (future feature)

### For Developers
1. Use `AuthService` for all auth operations
2. Check authentication with `AuthService.isAuthenticated()`
3. Handle token refresh automatically
4. Add email verification for production
5. Consider rate limiting for register endpoint

## 🔗 Navigation Flow

```
Landing Page → Register → Dashboard
     ↓           ↓
   Login   ←  Already have account?
```

## ✨ Features Coming Soon

Future enhancements:
- 📧 Email verification
- 🔑 Password reset
- 👁️ Show/hide password
- 💪 Password strength meter
- 🔐 2FA support
- 🌐 OAuth (Google, GitHub)
- 🖼️ Profile picture upload

---

## ⚡ Quick Commands Reference

```bash
# Start API
cd packages/api && npm run start:fresh

# Start Web
cd packages/web && npm run dev

# Stop API
cd packages/api && npm run stop

# Rebuild API
cd packages/api && npm run build

# Access Register
http://localhost:3000/register
```

---

**Status**: ✅ READY TO USE

Register feature complete and tested!
