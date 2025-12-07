# Building Your Own OAuth 2.0 Provider

You asked: *"If I want to create a service to verify like Google, what is it called?"*

It is called an **Identity Provider (IdP)** or an **Authorization Server**.

When you use "Login with Google", Google is the **IdP**. If you build this feature, *your* service becomes the IdP, allowing *other* apps (Clients) to log users in via your system.

## Core Components

To build this, you need to implement the **OAuth 2.0 Protocol**. You need at least two main endpoints:

### 1. The Authorization Endpoint (`GET /oauth/authorize`)
*   **Purpose**: The Client app redirects the user here.
*   **What it does**:
    1.  Checks if the user is logged in to *your* service.
    2.  Shows a "Consent Screen": *"App XYZ wants to access your profile. Allow?"*
    3.  If allowed, generates a temporary **Authorization Code**.
    4.  Redirects the user back to the Client's `redirect_uri` with the code.

### 2. The Token Endpoint (`POST /oauth/token`)
*   **Purpose**: The Client app talks to this endpoint directly (server-to-server).
*   **What it does**:
    1.  Receives the **Authorization Code** + **Client ID** + **Client Secret**.
    2.  Verifies the code is valid and belongs to that client.
    3.  Returns an **Access Token** (JWT).

## Data Models Needed

1.  **Client**: Stores `clientId`, `clientSecret`, `redirectUris`. (Who is allowed to use your login?)
2.  **AuthCode**: Stores `code`, `userId`, `clientId`, `expiresAt`. (Temporary codes)
3.  **AccessToken**: Stores `token`, `userId`, `clientId`, `expiresAt`.

## Example Flow

1.  **User** visits `ThirdPartyApp`.
2.  `ThirdPartyApp` redirects User to `YourService.com/oauth/authorize?client_id=123`.
3.  **User** logs in to `YourService` and clicks "Allow".
4.  `YourService` redirects User to `ThirdPartyApp.com/callback?code=abc`.
5.  `ThirdPartyApp` sends `code=abc` + `secret=shh` to `YourService.com/oauth/token`.
6.  `YourService` validates and returns `{ access_token: "xyz" }`.
7.  `ThirdPartyApp` uses `access_token` to fetch user profile.

---

## Interview Questions

### Q1: Why do we need an Authorization Code? Why not just return the Token directly?
**Answer:**
Security. The Authorization Code is sent via the browser URL (User Agent), which is less secure. If we sent the Access Token directly (Implicit Flow), it would be exposed in browser history/logs.
By exchanging the code for a token via a **back-channel** (server-to-server) POST request, the Access Token is never exposed to the browser or user.

### Q2: What is OpenID Connect (OIDC) in this context?
**Answer:**
If you just build OAuth 2.0, you are providing *Authorization* (access to API). If you want to provide *Authentication* (Login), you should implement OIDC.
OIDC adds an `id_token` (JWT) to the token response, which contains user info (name, email, picture). This standardizes how Clients read user identity.
