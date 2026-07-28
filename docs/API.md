# SentinelChain API Documentation

## Authentication Endpoints

### Register User
*   **POST** `/api/v1/auth/register`
*   **Body:** `{ "name": "John", "email": "john@example.com", "password": "...", "role": "investigator" }`
*   **Response:** `{ "token": "jwt...", "user": { "id": "...", "email": "..." } }`

### Login
*   **POST** `/api/v1/auth/login`
*   **Body:** `{ "email": "john@example.com", "password": "..." }`
*   **Response:** `{ "token": "jwt...", "user": { ... } }`

### Get Profile
*   **GET** `/api/v1/auth/profile`
*   **Headers:** `Authorization: Bearer <token>`
*   **Response:** `{ "id": "...", "email": "...", "role": "..." }`

## Evidence Endpoints

### Upload Evidence
*   **POST** `/api/v1/evidence/upload`
*   **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
*   **Body:** file (binary), `title`, `description`, `category`
*   **Response:** `{ "id": "...", "file_hash": "...", "ipfs_hash": "...", "status": "pending" }`

### Get Evidence List
*   **GET** `/api/v1/evidence`
*   **Query Params:** `status`, `category`, `page`, `limit`
*   **Response:** `{ "data": [ ... ], "total": 100 }`

### Verify Evidence
*   **POST** `/api/v1/evidence/:id/verify`
*   **Headers:** `Authorization: Bearer <token>`
*   **Body:** `{ "transaction_hash": "..." }`
*   **Response:** `{ "status": "verified" }`

## Verification Endpoints
*   **GET** `/api/v1/verification/:evidence_id` - Get verification history.

## Analytics Endpoints
*   **GET** `/api/v1/analytics/overview` - Get system stats (total evidence, verified count).

## User Management Endpoints
*   **GET** `/api/v1/users` - List users (Admin only).
*   **PUT** `/api/v1/users/:id/role` - Update user role.

## Error Codes
*   `400 Bad Request`: Invalid input data.
*   `401 Unauthorized`: Missing or invalid token.
*   `403 Forbidden`: Insufficient permissions (role).
*   `404 Not Found`: Resource does not exist.
*   `500 Server Error`: Internal server error.

## Rate Limiting
API requests are limited to 100 requests per minute per IP address. Authenticated users may have higher limits depending on their role.
