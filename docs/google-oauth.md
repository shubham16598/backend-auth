# Google OAuth 2.0 Authentication

## Core Concepts

### What is OAuth 2.0?
OAuth 2.0 is an industry-standard protocol for authorization. It focuses on client developer simplicity while providing specific authorization flows for web applications, desktop applications, mobile phones, and living room devices.

### Roles
1.  **Resource Owner**: The user who authorizes an application to access their account.
2.  **Client**: The application (your backend/frontend) attempting to access the user's account.
3.  **Resource Server**: The server hosting the user's data (e.g., Google API).
4.  **Authorization Server**: The server verifying the user's identity and issuing tokens (e.g., Google Accounts).

### The Authorization Code Flow (Used in this project)
This is the most common flow for server-side applications.

1.  **Authorization Request**: The client redirects the user to the Authorization Server (Google) with:
    *   `client_id`
    *   `redirect_uri` (callback URL)
    *   `response_type=code`
    *   `scope` (e.g., profile, email)
2.  **User Consent**: User logs in and approves permissions.
3.  **Authorization Grant**: Google redirects the user back to the `redirect_uri` with a temporary `code`.
4.  **Token Request**: The client sends the `code` + `client_secret` to Google's token endpoint.
5.  **Access Token**: Google validates the code and returns an `access_token` (and optionally `refresh_token` and `id_token`).
6.  **Access Resource**: The client uses the `access_token` to fetch user profile data.

---

## Interview Questions & Answers

### Q1: What is the difference between Authentication and Authorization?
**Answer:**
*   **Authentication (Who you are)**: Verifying the identity of a user (e.g., Login with password).
*   **Authorization (What you can do)**: Verifying if the user has permission to access a resource (e.g., OAuth scopes).
*   *Analogy*: Authentication is showing your ID at the building entrance. Authorization is your key card working only for the 3rd floor.

### Q2: Why do we need a Callback URL?
**Answer:**
The Callback URL (Redirect URI) is where the Authorization Server sends the user after they approve the request.
*   **Security**: It must be pre-registered in the OAuth provider's console (Google Cloud Console) to prevent attackers from redirecting the authorization code to their own malicious server.

### Q3: What is the `state` parameter in OAuth?
**Answer:**
It is a random string sent by the client during the initial authorization request and returned unchanged by the provider in the callback.
*   **Purpose**: To prevent **CSRF** (Cross-Site Request Forgery) attacks.
*   **How**: The client verifies that the returned `state` matches the one it generated. If an attacker tricks a user into clicking a link to link *their* Google account to the *victim's* session, the state check will fail.

### Q4: What is OpenID Connect (OIDC)?
**Answer:**
OAuth 2.0 is for *authorization*. OpenID Connect is a thin layer on top of OAuth 2.0 specifically for *authentication*.
*   **Key Difference**: OAuth gives you an `access_token` to *act* on behalf of the user. OIDC gives you an `id_token` (a JWT) that contains information *about* the user (identity).
*   *In our project*: When we ask for `scope: ['profile', 'email']`, we are effectively using OIDC features to identify the user.

### Q5: How would you handle a mobile app needing Google Login?
**Answer:**
You should **not** embed a web view for login (security risk).
1.  Use the native OS browser (SFSafariViewController / Chrome Custom Tabs) to perform the OAuth flow.
2.  Use Deep Linking (Custom URL Scheme) for the callback (e.g., `myapp://callback`) to return control to the app.
3.  Or, use the "PKCE" (Proof Key for Code Exchange) extension to secure the flow on public clients (mobile apps) that can't safely hide a `client_secret`.

---

## Deep Dive: Passport.js Internals

*   **Strategies**: Passport uses the Strategy pattern. Each provider (Google, Facebook, Local) is a separate strategy.
*   **Serialization**: `passport.serializeUser` determines what data from the user object should be stored in the session (usually just the ID).
*   **Deserialization**: `passport.deserializeUser` uses that ID to fetch the full user object from the DB on each request, attaching it to `req.user`.
