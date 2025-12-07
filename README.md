# Backend Auth Practice: JWT & Google OAuth

This project demonstrates how to implement authentication in Node.js using JWT (JSON Web Tokens) and Google OAuth 2.0 with Passport.js.

## Documentation & Concepts

We have detailed guides and interview preparation materials in the `docs/` folder:

*   **[JWT Authentication Guide](docs/jwt-auth.md)**: Covers JWT structure, security, storage strategies, and interview questions.
*   **[Google OAuth 2.0 Guide](docs/google-oauth.md)**: Covers OAuth flow, roles, OpenID Connect, and Passport.js details.
*   **[Building an OAuth Provider](docs/oauth-provider.md)**: How to build your own "Login with X" service.
*   **[Sessions vs JWT](docs/session-vs-jwt.md)**: Comparison of Stateful vs Stateless auth.
*   **[Advanced System Design Concepts](docs/system-design-auth.md)**: RBAC, ABAC, Revocation, SSO, MFA.

## Quick Start

### Prerequisites
*   Node.js
*   MongoDB
*   Google Cloud Credentials (for OAuth)

### Installation
```bash
npm install
```

### Configuration
Create a `.env` file:
```env
MONGO_URI=mongodb://localhost:27017/auth-practice
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
PORT=5000
```

### Run
```bash
npm run dev
```
