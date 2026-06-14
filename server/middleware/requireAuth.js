import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

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
