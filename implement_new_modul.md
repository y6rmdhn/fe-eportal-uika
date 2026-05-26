# Frontend React CRUD Implementation Guide

This guide provides instructions for building the React frontend CRUD interfaces for the newly created API endpoints in the Laravel backend.

## 1. API Endpoints Overview

All endpoints are protected by `jwt.verify` and `role:admin` middleware. They require the `Authorization: Bearer <token>` header. The base path is `/api/admins/`.

### App Modules
- **GET** `/api/admins/app-modules` - List all modules
- **POST** `/api/admins/app-modules` - Create a module (Body: `name`, `url`)
- **GET** `/api/admins/app-modules/{id}` - Get a single module
- **PUT** `/api/admins/app-modules/{id}` - Update a module (Body: `name`, `url`)
- **DELETE** `/api/admins/app-modules/{id}` - Delete a module

### Roles
- **GET** `/api/admins/roles` - List all roles
- **POST** `/api/admins/roles` - Create a role (Body: `name`, `guard_name` optional)
- **GET** `/api/admins/roles/{id}` - Get a single role
- **PUT** `/api/admins/roles/{id}` - Update a role (Body: `name`, `guard_name` optional)
- **DELETE** `/api/admins/roles/{id}` - Delete a role
- **POST** `/api/admins/roles/assign` - Assign a role to user(s) (Body: `{ "role_id": 2, "user_ids": ["user-uuid-1", "user-uuid-2"] }` or `{ "role_id": 2, "user_id": "user-uuid" }`)
- **POST** `/api/admins/roles/unassign` - Remove a role from user(s) (Body: `{ "role_id": 2, "user_ids": ["user-uuid-1", "user-uuid-2"] }` or `{ "role_id": 2, "user_id": "user-uuid" }`)

### Permissions
- **GET** `/api/admins/permissions` - List all permissions
- **POST** `/api/admins/permissions` - Create a permission (Body: `name`, `guard_name` optional)
- **GET** `/api/admins/permissions/{id}` - Get a single permission
- **PUT** `/api/admins/permissions/{id}` - Update a permission (Body: `name`, `guard_name` optional)
- **DELETE** `/api/admins/permissions/{id}` - Delete a permission

### Role Permissions Management
- **GET** `/api/admins/role-permissions?role_id={id}` - Get permissions assigned to a role
- **POST** `/api/admins/role-permissions/assign` - Assign permissions (Body: `role_id`, `permission_ids: []`)
- **POST** `/api/admins/role-permissions/unassign` - Unassign permissions (Body: `role_id`, `permission_ids: []`)
- **POST** `/api/admins/role-permissions/sync` - Sync (replace all) permissions (Body: `role_id`, `permission_ids: []`)

## 2. Frontend Structure Recommendations

### Data Fetching (React Query / Axios)
Create custom hooks for data fetching to keep components clean, similar to the existing `useLogin` hook pattern.

**Example: `src/hooks/AppModules/useAppModules.ts`**
- `useGetAppModules()`: fetches list of modules.
- `useCreateAppModule()`: mutates to create a new module.
- `useUpdateAppModule()`: mutates to update an existing module.
- `useDeleteAppModule()`: mutates to delete a module.

### UI Components

#### 1. List Views (Data Tables)
For each entity (App Modules, Roles, Permissions), create a table view with:
- Search and pagination (if needed).
- Actions column with "Edit" and "Delete" buttons.
- A "Create New" button at the top.

#### 2. Create/Edit Forms
Use Modals or separate pages for creating and editing.
- **App Module Form**: Inputs for `name` and `url`.
- **Role Form**: Input for `name`.
- **Permission Form**: Input for `name`.

#### 3. Role-Permission Management Interface
Create a specific interface for assigning permissions to roles.
- **View**: A "Manage Permissions" button on the Role list table.
- **UI**: A list of all available permissions with checkboxes.
- **Action**: When saving, gather all checked permission IDs and send a request to `/api/admins/role-permissions/sync` with `role_id` and `permission_ids` to fully update the role's permissions.

#### 4. Bulk User Role Assignment
Implement a mechanism to assign/unassign roles to users:
- **UI**: Checkbox selection in the User management table. Once users are selected, show a bulk action bar.
- **Assign action**: Open a modal to select a role. On submit, send a POST request to `/api/admins/roles/assign` with the `role_id` and `user_ids` (array of user UUIDs).
- **Unassign action**: Send a POST request to `/api/admins/roles/unassign` with the `role_id` and `user_ids` (array of user UUIDs).

## 3. Implementation Steps for the AI Agent

1. **Setup API Services**: Create the Axios API calls for the endpoints listed above in your API utility files. Ensure the authorization token is included (already handled by the Axios interceptor in `src/utils/network.ts`).
2. **Create Hooks**: Wrap the API calls in React Query custom hooks (`useQuery`, `useMutation`) for caching and state management.
3. **Build Components**:
   - `AppModuleList`, `AppModuleForm`
   - `RoleList`, `RoleForm`
   - `PermissionList`, `PermissionForm`
   - `RolePermissionManager`
4. **Setup Routes**: Add the new components to the React Router configuration in `App.tsx` or your routing file (e.g., `/admin/app-modules`, `/admin/roles`, `/admin/permissions`).
5. **Testing**: Verify that CRUD operations update the UI and correctly communicate with the backend. Handle loading states and display success/error toast notifications (using `react-hot-toast`).
