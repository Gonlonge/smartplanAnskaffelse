# User Roles and Permissions

This document explains the user role system in Smartplan Procurement.

## Overview

The system uses a two-level permission system:
1. **Role** - Core permission level stored in database (`sender` or `receiver`)
2. **Admin Flag** - Additional permission flag (`isAdmin: true/false`)

## Role Types

### Sender (`role: "sender"`)

Users who create and manage tenders. This includes:
- **Project Owners** - Organizations that need construction work done
- **Advisors** - Consultants managing procurement on behalf of clients
- **Administrators** - System admins with elevated permissions

**Permissions:**
- Create and manage projects
- Create and manage tenders
- Invite suppliers to tenders
- Review and compare bids
- Award contracts
- Manage documentation
- Access reports and analytics

### Receiver (`role: "receiver"`)

Users who receive invitations and submit bids. This includes:
- **Suppliers** - Contractors and service providers
- **Subcontractors** - Companies bidding on specific work packages

**Permissions:**
- View invited tenders
- Ask questions about tenders
- Submit bids
- Track bid status
- Access awarded contracts
- View invitation history

## User Type Mapping (Registration)

During registration, users select a **User Type** which maps to roles:

| User Type | Role | isAdmin | Description |
|-----------|------|---------|-------------|
| `admin` | `sender` | `true` | System administrator with full access |
| `user` | `sender` | `false` | Regular sender (project owner, advisor) |
| `supplier` | `receiver` | `false` | Supplier/contractor who submits bids |

## Admin Permissions

Users with `isAdmin: true` have additional permissions:
- Can read all user profiles
- Can delete any tender (not just their own)
- Full system access for administrative tasks

## Role-Based Route Protection

Routes are protected using the `requireRole` prop in `ProtectedRoute`:

```jsx
// Only senders can access
<ProtectedRoute requireRole="sender">
  <TenderCreate />
</ProtectedRoute>

// Only receivers can access
<ProtectedRoute requireRole="receiver">
  <Invitations />
</ProtectedRoute>

// Any authenticated user can access
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## Firestore Security Rules

Firestore security rules use role-based checks:

- `isSender()` - Checks if user has `role == "sender"`
- `isReceiver()` - Checks if user has `role == "receiver"`
- `isAdmin()` - Checks if user has `isAdmin == true`

## Code References

- **Constants**: `src/constants/index.js` - `USER_ROLES` constant
- **Auth Service**: `src/api/authService.js` - User registration and role mapping
- **Auth Context**: `src/contexts/AuthContext.jsx` - User state management
- **Protected Routes**: `src/components/routes/ProtectedRoute.jsx` - Route protection
- **Firestore Rules**: `firestore.rules` - Database security rules

## Best Practices

1. **Always check roles, not user types** - Use `user.role` in code, not the registration `userType`
2. **Use constants** - Import `USER_ROLES` from constants instead of hardcoding strings
3. **Combine role + admin checks** - For admin-only features, check both `role === "sender"` and `isAdmin === true`
4. **Document role requirements** - Comment on components/pages that require specific roles

