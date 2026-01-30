# AI Fitness Backend API

Production-ready REST API for the AI Fitness application. Built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication**: JWT-based auth with secure password hashing.
- **Authorization**: Role-based access control (User/Admin) and resource ownership validation.
- **Validation**: Strict request validation using Joi.
- **Security**: Helmet, CORS, Rate Limiting, XSS protection, NoSQL injection sanitization.
- **Error Handling**: Centralized error handling with standardized JSON responses.
- **Pagination**: Consistent pagination for list endpoints.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Joi
- **Security**: Helmet, xss-clean, express-mongo-sanitize, bcryptjs
- **Logging**: Winston, Morgan
- **Documentation**: Postman Collection

## 📦 Environment Setup

1. **Clone the repository**
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Configure Environment**:
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URL=mongodb://localhost:27017/ai-fitness
   JWT_SECRET=your_super_secret_key_change_this
   JWT_ACCESS_EXPIRATION_MINUTES=30
   NODE_ENV=development
   ```
4. **Run the server**:
   ```bash
   npm run dev
   ```

## 🔐 Auth Flow

1. **Sign Up**: `POST /auth/signup` - Creates user (Role: 'user' by default).
2. **Log In**: `POST /auth/login` - Returns JWT Access Token.
3. **Authenticated Requests**: Add header `Authorization: Bearer <your_token>`.

## 📡 API Structure & Rate Limiting

- **Base URL**: `/api` (Health), Root `/` others.
- **Rate Limits**:
  - Global: 100 requests / 15 mins per IP.
  - Auth Routes: 5 requests / 15 mins per IP.

### Main Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/signup` | Register new user | Public |
| POST | `/auth/login` | Login user | Public |
| POST | `/workouts/plan` | Create workout plan | User |
| GET | `/workouts/plan` | Get active plan | User |
| POST | `/workouts/log` | Log a workout | User |
| GET | `/workouts/log` | Get logs (paginated) | User |
| GET | `/admin/users` | List all users | Admin |

## ⚠️ Error Format

All errors follow a standard JSON format:

```json
{
  "success": false,
  "message": "Error description here",
  "stack": "Stack trace (development only)"
}
```

**Common Status Codes:**
- `400`: Bad Request (Validation failed)
- `401`: Unauthorized (Missing/Invalid Token)
- `403`: Forbidden (Role mismatch or Resource ownership)
- `404`: Not Found
- `409`: Conflict (Duplicate resource)
- `429`: Too Many Requests (Rate limit hit)
- `500`: Internal Server Error

## 📄 Pagination Strategy

List endpoints (`/workouts/log`, `/admin/users`) support pagination via query params:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response Metadata:**
```json
{
  "page": 1,
  "limit": 10,
  "total": 50,
  "totalPages": 5,
  "data": [...]
}
```
