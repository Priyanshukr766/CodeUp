# CodeUp Security Fix — Implementation Brief for AI Agent

## Context

This is the CodeUp project (React frontend + Express backend + Supabase/PostgreSQL).
Authentication is handled by Supabase Auth on the frontend. The backend uses
`supabaseAdmin` (a Supabase client initialized with the **service role key**,
which bypasses Row-Level Security entirely).

A security review found a critical authorization vulnerability that needs to be
fixed before this project is shared publicly. Please implement the fix described
below.

---

## Issue 1 (CRITICAL): Broken Object-Level Authorization / IDOR

### What's wrong

In `server/index.js`, there is **no authentication middleware** applied to any
route. Several endpoints accept a `userId` field directly from the request body
and use it — combined with `supabaseAdmin` (service role, bypasses RLS) — to
read and write data for that user ID, **without verifying that the request is
actually coming from that user**.

Affected endpoints:
- `POST /api/auth/sync` (`server/routes/auth.js`) — takes `{ userId, handle }`
  from `req.body`, updates `users.cf_handle` and upserts into
  `user_solved_problems` for that `userId`.
- `POST /api/ai/skill-gap` (`server/routes/ai.js`) — takes `{ userId, metrics }`
  from `req.body`, reads/writes `recommendation_cache` for that `userId`, and
  calls the Gemini API (billed to the server's `GEMINI_API_KEY`).
- `POST /api/ai/roadmap` (`server/routes/ai.js`) — same pattern, takes
  `{ userId, metrics, targetRating }`.

### Why this is a problem

Because `supabaseAdmin` uses the service role key, **Row-Level Security policies
do not apply** to these queries. The only thing protecting another user's data
is the assumption that callers will only ever send their *own* `userId`. There
is currently nothing enforcing that.

Concretely, this means:
1. Anyone who knows or obtains another user's `userId` (a UUID — these may be
   visible in frontend network requests, Supabase auth responses, or browser
   storage) can call these endpoints with that `userId` and:
   - Overwrite another user's Codeforces handle and solved-problems history
     (`/api/auth/sync`)
   - Read/overwrite another user's AI coaching cache (`/api/ai/skill-gap`,
     `/api/ai/roadmap`)
   - Trigger Gemini API calls under the server's API key/quota, attributed to
     an arbitrary `userId`, as many times as rate limits allow (potential
     quota exhaustion / cost issue for the project owner)

### How to fix it

**Goal:** Every route that currently trusts `req.body.userId` must instead
derive the user's identity from a verified Supabase session token sent by the
authenticated frontend. `req.body.userId` should be removed entirely from these
routes — the server should never trust a client-supplied user ID for
authorization decisions.

#### Step 1 — Create an authentication middleware

Create a new file `server/middleware/requireAuth.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

// A client configured with the ANON key is sufficient for verifying user JWTs.
// Do NOT use the service role key here.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

const supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Express middleware that verifies the Supabase access token sent in the
 * Authorization header (format: "Bearer <token>") and attaches the verified
 * user object to req.user. Rejects the request with 401 if the token is
 * missing or invalid.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header.' });
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  // Attach the verified user to the request for downstream handlers
  req.user = data.user; // req.user.id is the authenticated user's UUID
  next();
}
```

Notes:
- `SUPABASE_ANON_KEY` needs to be available as a server-side env var too (it's
  already used on the client — it's safe to also have it on the server; it's
  the anon/public key, not the service role key).
- `supabase.auth.getUser(token)` validates the JWT against Supabase and returns
  the user it belongs to — this is the standard way to verify a session token
  server-side.

#### Step 2 — Apply the middleware to the affected routes

In `server/index.js`, import the middleware:

```javascript
import { requireAuth } from './middleware/requireAuth.js';
```

Apply it to the routers that need it. Two options:

**Option A (recommended) — apply per-router, mounted with middleware:**

```javascript
app.use('/api/auth', requireAuth, authRouter);
app.use('/api/ai', requireAuth, aiRouter);
```

**Option B — apply inside each route file** if some routes in `auth.js` /
`ai.js` should remain public (check if that's the case — currently it doesn't
look like it is, since every route in both files uses `userId`).

#### Step 3 — Update the route handlers to use `req.user.id` instead of `req.body.userId`

In `server/routes/auth.js`, change:

```javascript
router.post('/sync', async (req, res) => {
  const { userId, handle } = req.body;

  if (!userId || !handle) {
    return res.status(400).json({ error: 'userId and handle are required.' });
  }
```

to:

```javascript
router.post('/sync', async (req, res) => {
  const userId = req.user.id; // from verified token, not the client
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ error: 'handle is required.' });
  }
```

Apply the same pattern in `server/routes/ai.js` for both `/skill-gap` and
`/roadmap`:

```javascript
// Before
const { userId, metrics } = req.body;
if (!userId || !metrics) { ... }

// After
const userId = req.user.id;
const { metrics } = req.body;
if (!metrics) { ... }
```

```javascript
// Before
const { userId, metrics, targetRating } = req.body;
if (!userId || !metrics || !targetRating) { ... }

// After
const userId = req.user.id;
const { metrics, targetRating } = req.body;
if (!metrics || !targetRating) { ... }
```

#### Step 4 — Update the frontend to send the access token

Wherever the frontend calls `/api/auth/sync`, `/api/ai/skill-gap`, or
`/api/ai/roadmap` (likely in `client/src`, using the `api.js` axios instance),
ensure the Supabase session's access token is attached as a Bearer token.

Example pattern (adjust to match how the Supabase client/session is accessed
in this codebase — likely `client/src/utils/supabase.js`):

```javascript
// Get the current session
const { data: { session } } = await supabase.auth.getSession();

// Attach to request
await api.post('/auth/sync', { handle }, {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
```

If `api.js` is a shared axios instance, consider adding an axios request
interceptor that automatically attaches the current session's access token to
every request, so this doesn't need to be repeated manually at every call site.

#### Step 5 — Remove `userId` from request bodies on the frontend

Update the frontend call sites for `/api/auth/sync`, `/api/ai/skill-gap`, and
`/api/ai/roadmap` to stop sending `userId` in the body at all (it's now derived
server-side from the verified token).

---

## Issue 2 (MEDIUM): No size limit on `tests` array in `/api/run`

### What's wrong

In `server/routes/run.js`, the `/api/run` endpoint accepts a `tests` array from
`req.body` and runs `Promise.all` over it, making one external API call to
OnlineCompiler.io per test case, with no upper bound on `tests.length`.

### Why this is a problem

A malicious or buggy client could send a very large `tests` array (e.g., 1000
entries), causing the server to fire 1000 concurrent requests to
OnlineCompiler.io for a single incoming request. This could:
- Exhaust the `OC_KEY` quota / hit OnlineCompiler.io's own rate limits
- Cause excessive memory/connection usage on the server for one request

### How to fix it

In `server/routes/run.js`, after the existing validation checks (where `tests`
is confirmed to be a non-empty array), add a maximum length check:

```javascript
const MAX_TEST_CASES = 20; // adjust based on realistic problem test-case counts

if (tests.length > MAX_TEST_CASES) {
  return res.status(400).json({
    error: `Too many test cases. Maximum allowed is ${MAX_TEST_CASES}.`
  });
}
```

Place this check alongside the existing validation block:

```javascript
if (!Array.isArray(tests) || tests.length === 0)
  return res.status(400).json({ error: 'tests array is required' });

// ADD HERE:
if (tests.length > MAX_TEST_CASES)
  return res.status(400).json({ error: `Too many test cases. Maximum allowed is ${MAX_TEST_CASES}.` });
```

---

## Summary of files to change

1. **New file:** `server/middleware/requireAuth.js` — JWT verification middleware
2. **Edit:** `server/index.js` — import and apply `requireAuth` to `/api/auth`
   and `/api/ai` routers; ensure `SUPABASE_ANON_KEY` is available as a server
   env var
3. **Edit:** `server/routes/auth.js` — use `req.user.id` instead of
   `req.body.userId` in `/sync`
4. **Edit:** `server/routes/ai.js` — use `req.user.id` instead of
   `req.body.userId` in `/skill-gap` and `/roadmap`
5. **Edit:** `server/routes/run.js` — add `MAX_TEST_CASES` check
6. **Edit (frontend):** wherever `/api/auth/sync`, `/api/ai/skill-gap`,
   `/api/ai/roadmap` are called — attach `Authorization: Bearer <access_token>`
   header from the current Supabase session, and remove `userId` from request
   bodies

After making these changes, test:
- Calling `/api/auth/sync`, `/api/ai/skill-gap`, `/api/ai/roadmap` **without**
  an Authorization header → should return 401
- Calling them **with** a valid logged-in session → should work as before, but
  now operate on the authenticated user's own data only
- Sending an oversized `tests` array to `/api/run` → should return 400