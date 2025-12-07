# Sessions (Stateful) vs. JWT (Stateless)

This project demonstrates the difference between **Traditional Server-Side Sessions** and **Stateless JWT Authentication**.

## 1. Quick Comparison

| Feature | JWT (Stateless) | Session (Stateful) |
| :--- | :--- | :--- |
| **State** | **Client-side**: Self-contained token. | **Server-side**: Stored in DB/Memory. |
| **Storage** | Client: `localStorage` or Cookie. | Server: MongoDB/Redis. Browser: Session ID Cookie. |
| **Revocation** | Difficult (needs blocklist). | Easy (just delete session from DB). |
| **Horizontal Scaling** | Easy (no shared state). | Requires shared store (e.g., Redis/Mongo). |
| **Bandwidth** | Higher (Token can be large). | Lower (Just a tiny Session ID). |

## 2. Testing Session Authentication

We have implemented standard session auth routes under `/session`.

### A. Login (Starts Session)
This will set a `connect.sid` cookie in your browser/client.
```bash
curl -v -X POST http://localhost:5000/session/login \
     -H "Content-Type: application/json" \
     -d '{"email": "test@example.com", "password": "password123"}'
```
*Response*: `Set-Cookie: connect.sid=...; HttpOnly`

### B. Access Protected Route
The browser will automatically send the `connect.sid` cookie.
```bash
curl -X GET http://localhost:5000/session/user \
     --cookie "connect.sid=<YOUR_SESSION_ID>"
```
*Response*: JSON with user data stored in the session.

### C. Logout (Destroys Session)
This deletes the session from MongoDB and clears the browser cookie.
```bash
curl -X POST http://localhost:5000/session/logout \
     --cookie "connect.sid=<YOUR_SESSION_ID>"
```

## 3. How it works code-side

1.  **Config**: `express-session` is configured with `connect-mongo` in `server.js`.
2.  **Login**: `req.session.user = user` saves data to MongoDB.
3.  **Middleware**: Checks if `req.session.user` exists.
4.  **Logout**: `req.session.destroy()` removes it from MongoDB.
