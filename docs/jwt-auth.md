# JWT Authentication (JSON Web Tokens)

## Core Concepts

### What is JWT?
JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way for securely transmitting information between parties as a JSON object. This information can be verified and trusted because it is digitally signed.

### Structure
A JWT consists of three parts separated by dots (`.`): `Header.Payload.Signature`

1.  **Header**: Typically consists of two parts: the type of the token (`JWT`) and the signing algorithm (e.g., `HMAC SHA256` or `RSA`).
    ```json
    {
      "alg": "HS256",
      "typ": "JWT"
    }
    ```
2.  **Payload**: Contains the claims. Claims are statements about an entity (typically, the user) and additional data.
    *   *Registered claims*: Predefined claims (e.g., `iss` (issuer), `exp` (expiration time), `sub` (subject)).
    *   *Public claims*: Defined by JWT users.
    *   *Private claims*: Custom claims created to share information between parties.
    ```json
    {
      "sub": "1234567890",
      "name": "John Doe",
      "iat": 1516239022
    }
    ```
3.  **Signature**: To create the signature part you have to take the encoded header, the encoded payload, a secret, the algorithm specified in the header, and sign that.
    ```
    HMACSHA256(
      base64UrlEncode(header) + "." +
      base64UrlEncode(payload),
      secret)
    ```

### How it Works
1.  User signs in using username and password.
2.  Server verifies credentials and returns a signed JWT.
3.  Client stores the JWT (usually in LocalStorage or HttpOnly Cookie).
4.  For subsequent requests, the client sends the JWT in the `Authorization` header: `Authorization: Bearer <token>`.
5.  Server verifies the signature. If valid, access is granted.

---

## Interview Questions & Answers

### Q1: What is the difference between Session-based and Token-based authentication?
**Answer:**
*   **State**: Session-based is **stateful** (server keeps a record of the session). Token-based is **stateless** (server doesn't store the token; the token itself contains verification data).
*   **Scalability**: Token-based is easier to scale horizontally because any server can verify the token without checking a central session store (like Redis).
*   **Performance**: Session-based requires a database lookup for every request. Token-based only requires CPU for signature verification.
*   **Cross-Domain**: Cookies (sessions) don't work well across different domains (CORS issues). Tokens can be sent to any domain.

### Q2: Is information in a JWT encrypted?
**Answer:**
**No.** It is **encoded** (Base64Url), not encrypted. Anyone who intercepts the token can decode it and read the payload.
**Follow-up:** *What does this mean for developers?*
**Detail:** Never put sensitive information like passwords or credit card numbers in the JWT payload. If you need to hide data, you must use JWE (JSON Web Encryption) or encrypt the payload yourself.

### Q3: How do you handle JWT expiration and logout?
**Answer:**
*   **Expiration**: Set the `exp` claim. The server checks this on verification.
*   **Logout**: Since the server is stateless, it can't "delete" a token.
    *   *Client-side*: Simply remove the token from storage.
    *   *Server-side (Blacklisting)*: To force invalidation (e.g., account compromised), store the token ID (jti) in a Redis blacklist with a TTL equal to the token's remaining life. Middleware checks this blacklist.

### Q4: Where should you store JWTs on the frontend?
**Answer:**
*   **LocalStorage**: Easiest to implement. Vulnerable to **XSS** (Cross-Site Scripting). If an attacker runs JS on your page, they can steal the token.
*   **HttpOnly Cookie**: Secure against XSS (JS can't read it). Vulnerable to **CSRF** (Cross-Site Request Forgery).
**Best Practice:** Use HttpOnly Cookies with `SameSite=Strict` and CSRF tokens for maximum security. For mobile apps, secure storage (Keychain/Keystore) is used.

### Q5: What is a Refresh Token?
**Answer:**
A long-lived token used to obtain a new Access Token (which is short-lived).
**Flow:**
1.  Client gets Access Token (15 min) and Refresh Token (7 days).
2.  Access Token expires -> API returns 401.
3.  Client sends Refresh Token to `/refresh` endpoint.
4.  Server verifies Refresh Token (often checking a DB to see if it's revoked).
5.  Server issues new Access Token.
**Why?** Improves security. If Access Token is stolen, it's only valid briefly. If Refresh Token is stolen, the server can revoke it in the DB, blocking future access.

---

## Deep Dive: Security Best Practices

1.  **Always use HTTPS**: To prevent Man-in-the-Middle attacks.
2.  **Short Expiration**: Keep Access Tokens short (5-15 mins).
3.  **Algorithm Verification**: Explicitly check that the algorithm in the header matches what you expect (e.g., `HS256`) to prevent "None" algorithm attacks.
4.  **Validate Claims**: Always check `iss` (issuer) and `aud` (audience) if your architecture involves multiple services.

---

## Implementation Guide: HttpOnly Cookies

You asked: *"Do we need to do any change on backend for HttpOnly cookies?"*
**Answer: YES.**

Because `HttpOnly` cookies cannot be accessed by client-side JavaScript (to prevent XSS), the **Backend** must set the cookie in the response.

### 1. Backend Implementation (Express)

Instead of sending the token in the JSON body, you send it as a cookie.

```javascript
// Login Route
router.post('/login', async (req, res) => {
    // ... verify user ...
    
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // SET COOKIE
    res.cookie('token', token, {
        httpOnly: true, // CRITICAL: Prevents JS access
        secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
        sameSite: 'strict', // CSRF protection
        maxAge: 3600000 // 1 hour in milliseconds
    });

    res.json({ msg: 'Logged in successfully' });
});
```

### 2. Frontend Behavior

*   **Storage**: You do **NOT** write any code to store the token. The browser automatically receives the `Set-Cookie` header and stores it.
*   **Sending Requests**: You do **NOT** manually add the `Authorization` header. The browser automatically attaches the cookie to requests made to the same domain.
    *   *Note*: If your frontend and backend are on different domains (e.g., `localhost:3000` vs `localhost:5000`), you must set `withCredentials: true` in your AJAX requests (axios/fetch) and configure CORS on the backend to allow credentials.

### 3. Logout

Since the frontend cannot delete an HttpOnly cookie (it can't even see it), you must hit a backend endpoint to clear it.

```javascript
// Backend Logout Route
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ msg: 'Logged out' });
});
```
