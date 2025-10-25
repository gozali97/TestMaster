# Organization Name Error Fix

## 🐛 Error yang Terjadi

```
notNull Violation: Organization.name cannot be null
```

## 🔍 Penyebab

Error ini terjadi karena saat membuat user baru (register), sistem juga membuat Organization baru. Field `name` pada table `organizations` memiliki constraint `NOT NULL`, tetapi nilai yang dikirim ternyata null atau empty.

### Root Cause:
1. Frontend mengirim `{ name, email, password }` 
2. Backend mencoba generate organization name dari field `name`
3. Jika `name` undefined/null/empty, organization name jadi null
4. Database reject karena constraint NOT NULL

## ✅ Solusi yang Diterapkan

### 1. Improved Validation & Fallback Logic

Updated `auth.controller.ts` dengan multiple fallback:

```typescript
// Generate organization name with extra safety check
let orgName: string;

if (organizationName && organizationName.trim() !== '') {
  // Prioritas 1: Gunakan organizationName jika ada
  orgName = organizationName.trim();
} else if (name && name.trim() !== '') {
  // Prioritas 2: Generate dari name user
  orgName = `${name.trim()}'s Organization`;
} else {
  // Prioritas 3: Fallback default
  orgName = 'My Organization';
}

// Extra check sebelum create
if (!orgName || orgName === '') {
  throw new Error('Organization name cannot be empty');
}
```

### 2. Added Debug Logging

```typescript
console.log('Register request body:', { 
  email, 
  name, 
  hasPassword: !!password, 
  organizationName 
});

console.log('Creating organization with name:', orgName);
console.log('Organization created successfully:', organization.id, organization.name);
```

### 3. Enhanced Error Handling

- Validation sebelum create Organization
- Clear error message jika name masih empty
- Catch and log errors dengan detail

## 🎯 Apa itu Organization Name?

**Organization (Organisasi)** adalah konsep multi-tenancy dalam TestMaster:

### Purpose:
- Setiap user belongs to satu Organization
- Organization memiliki:
  - Multiple users (team members)
  - Projects
  - Test cases
  - Subscriptions/Plans (FREE, PROFESSIONAL, ENTERPRISE)
  - Settings

### Default Behavior:
Saat user register:
1. Sistem create Organization baru otomatis
2. Organization name = `{UserName}'s Organization`
3. User role = `ORG_ADMIN` (owner)
4. Plan = `FREE`

### Example:
```
User: John Doe
Email: john@example.com

→ Creates Organization:
  - Name: "John Doe's Organization"
  - Plan: FREE
  - Admin: John Doe
```

## 📊 Database Structure

### Organizations Table
```sql
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,        -- Organization name
  plan ENUM('FREE', 'PROFESSIONAL', 'ENTERPRISE') DEFAULT 'FREE',
  settings JSON DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Users Table (Relation)
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('ORG_ADMIN', 'MEMBER', 'VIEWER') DEFAULT 'MEMBER',
  organization_id INT NOT NULL,      -- Foreign key to organizations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);
```

## 🔄 Registration Flow

### 1. User Submits Register Form
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### 2. Backend Process
```typescript
// Step 1: Validate input
if (!email || !password || !name) {
  return error;
}

// Step 2: Check email uniqueness
const existingUser = await User.findOne({ where: { email } });
if (existingUser) {
  return error('Email already exists');
}

// Step 3: Generate organization name
const orgName = name ? `${name}'s Organization` : 'My Organization';

// Step 4: Create organization
const organization = await Organization.create({
  name: orgName,
  plan: 'FREE',
});

// Step 5: Hash password & create user
const passwordHash = await bcrypt.hash(password, 12);
const user = await User.create({
  email,
  passwordHash,
  name,
  role: 'ORG_ADMIN',
  organizationId: organization.id,
});

// Step 6: Generate JWT tokens
const tokens = generateTokens(user);

// Step 7: Return response
return { user, tokens };
```

### 3. Database Result
```sql
-- Insert into organizations table
INSERT INTO organizations (name, plan) 
VALUES ('John Doe\'s Organization', 'FREE');

-- Insert into users table
INSERT INTO users (email, password_hash, name, role, organization_id)
VALUES ('john@example.com', '$2b$12$...', 'John Doe', 'ORG_ADMIN', 1);
```

## 🎨 Frontend Registration

### Register Page Sends:
```typescript
const response = await fetch('http://localhost:3001/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',          // Required
    email: 'john@example.com',  // Required
    password: 'password123',    // Required
    // organizationName: optional, akan auto-generated
  }),
});
```

### Optional: Custom Organization Name
User bisa specify custom organization name:
```typescript
body: JSON.stringify({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  organizationName: 'Acme Corporation',  // Custom name
}),
```

Result:
- Organization name = "Acme Corporation" (custom)
- User name = "John Doe"
- User role = ORG_ADMIN

## 🔐 Why Organizations?

### Multi-Tenancy Benefits:
1. **Team Collaboration**
   - Multiple users in one organization
   - Share projects and test cases
   - Role-based access control

2. **Data Isolation**
   - Each organization has separate data
   - No data leak between organizations
   - Secure multi-tenant architecture

3. **Subscription Management**
   - Per-organization pricing
   - Upgrade/downgrade plans
   - Usage limits per organization

4. **Enterprise Features**
   - Custom branding per organization
   - Organization-level settings
   - Audit logs per organization

## 📝 Organization Name Rules

### Validation Rules:
- ✅ Cannot be null or empty
- ✅ Max 255 characters
- ✅ Can contain letters, numbers, spaces, special chars
- ✅ Trimmed (spaces at start/end removed)

### Auto-Generation Logic:
```typescript
if (organizationName provided) {
  use organizationName
} else if (userName provided) {
  use "{userName}'s Organization"
} else {
  use "My Organization" (last resort)
}
```

### Examples:
| User Name | Organization Name (Optional) | Result |
|-----------|------------------------------|--------|
| John Doe | - | John Doe's Organization |
| Jane Smith | Acme Corp | Acme Corp |
| Test User | null | Test User's Organization |
| (empty) | - | My Organization |

## 🧪 Testing

### Test Case 1: Normal Registration
```bash
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123"
}

Expected:
✅ Organization: "Test User's Organization"
✅ User role: ORG_ADMIN
✅ Plan: FREE
```

### Test Case 2: Custom Organization Name
```bash
POST /api/auth/register
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "test123",
  "organizationName": "My Company"
}

Expected:
✅ Organization: "My Company"
✅ User role: ORG_ADMIN
```

### Test Case 3: Empty Name (Edge Case)
```bash
POST /api/auth/register
{
  "name": "",
  "email": "test@example.com",
  "password": "test123"
}

Expected:
❌ Error: "Email, password, and name are required"
```

## 🚀 Future Enhancements

### Possible Improvements:
1. **Invite Team Members**
   - Existing organization can invite users
   - Multiple users per organization
   - Different roles (ADMIN, MEMBER, VIEWER)

2. **Organization Settings**
   - Custom logo
   - Color theme
   - Email domain restrictions

3. **Transfer Ownership**
   - Change organization admin
   - Reassign resources

4. **Organization Dashboard**
   - View all members
   - Manage permissions
   - View usage statistics

5. **Multiple Organizations**
   - User can belong to multiple organizations
   - Switch between organizations

## 🔧 Troubleshooting

### If you still get the error:

1. **Check request body:**
   ```javascript
   console.log('Request body:', req.body);
   ```

2. **Verify name field:**
   ```javascript
   console.log('Name:', name, 'Type:', typeof name);
   ```

3. **Check database constraints:**
   ```sql
   DESCRIBE organizations;
   ```

4. **View logs:**
   API akan log ke console:
   ```
   Register request body: { email: '...', name: '...', ... }
   Creating organization with name: ...
   Organization created successfully: 1 Test User's Organization
   ```

5. **Clear and restart:**
   ```bash
   cd packages/api
   npm run clean
   npm run build
   npm run start:fresh
   ```

## ✅ Status

**Error Fixed**: ✅

Dengan update ini:
- Organization name tidak akan pernah null
- Ada 3 level fallback (custom → auto-generated → default)
- Extra validation sebelum database insert
- Debug logging untuk troubleshooting
- Clear error messages

## 📞 Need Help?

Jika masih ada masalah:
1. Check API logs di console
2. Verify request body dikirim dengan benar
3. Check database schema untuk table organizations
4. Run migrations jika belum: `npm run migrate`

---

**Updated**: Organization name generation logic improved with multiple fallbacks and validation.
