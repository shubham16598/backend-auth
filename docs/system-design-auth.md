# Advanced Authentication & Authorization for System Design

While we have covered the basics (JWT, OAuth, IdP), System Design interviews often dig deeper. Here are the missing critical concepts you should know.

## 1. Authorization Models (RBAC vs ABAC)

**Question:** *How do you handle permissions? (e.g., Admin can delete, User can only read)*

### Role-Based Access Control (RBAC)
*   **Concept**: Assign permissions to **Roles** (Admin, Editor, Viewer), and assign Roles to **Users**.
*   **Database Schema**:
    *   `Users` table
    *   `Roles` table (`id`, `name`, `permissions`)
    *   `UserRoles` table (Many-to-Many mapping)
*   **Pros**: Simple, easy to audit.
*   **Cons**: Can lead to "Role Explosion" if you need very specific permissions (e.g., "Can edit only posts created by their team").

### Attribute-Based Access Control (ABAC)
*   **Concept**: Permissions are granted based on attributes (User attributes, Resource attributes, Environment).
*   **Example Policy**: *User can edit Document IF (User.Department == Document.Department) AND (Time is 9am-5pm).*
*   **Pros**: Extremely flexible.
*   **Cons**: Complex to implement and audit.

## 2. Token Revocation Strategies

**Question:** *JWTs are stateless. How do you ban a user immediately?*

1.  **Short Expiration + Refresh Tokens**: (Standard) Access token expires in 5 mins. User is banned when they try to refresh. *Lag time: 5 mins.*
2.  **Blacklist (Denylist)**: Store revoked JWT IDs (`jti`) in Redis with TTL = Token Expiry. Middleware checks Redis on every request. *Instant but adds state.*
3.  **Token Versioning**: Add a `token_version` integer to the User table and the JWT payload.
    *   When User changes password/logout -> Increment `user.token_version`.
    *   Middleware: `if (jwt.version < user.token_version) throw Error`.
    *   *Pros*: Instant, no Redis needed. *Cons*: DB lookup on every request (unless cached).

## 3. Single Sign-On (SSO)

**Question:** *How does logging into Gmail also log me into YouTube?*

*   **Central Authentication Service (CAS)**: A central domain (`accounts.google.com`) holds the session cookie.
*   **Flow**:
    1.  User visits `youtube.com`. No session.
    2.  Redirect to `accounts.google.com`.
    3.  `accounts.google.com` sees its own cookie -> User is logged in.
    4.  Redirect back to `youtube.com` with an artifact (ticket/token).
    5.  `youtube.com` validates artifact and sets its own session cookie.

## 4. Multi-Factor Authentication (MFA/2FA)

**Question:** *How to design 2FA?*

*   **TOTP (Time-based One-Time Password)**: Google Authenticator.
    *   Server and Client share a **Secret Key** (exchanged via QR code once).
    *   Algorithm: `Hash(Secret + CurrentTime)` -> 6 digit code.
    *   Server verifies by running same hash.
*   **SMS/Email**: Send random code via external provider (Twilio/SendGrid). *Less secure (SIM swapping).*

## 5. API Security

*   **Rate Limiting**: Prevent brute force login attacks (e.g., 5 attempts per minute). Use Redis Token Bucket algorithm.
*   **API Keys**: For service-to-service auth. Keys should be hashed in DB (like passwords).
*   **Mutual TLS (mTLS)**: For high-security internal microservices. Client and Server verify each other's certificates.
