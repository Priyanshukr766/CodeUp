import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// A client configured with the ANON key is sufficient for verifying user JWTs.
// Do NOT use the service role key here.
let supabaseAuthClient = null;

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

  // Lazy initialization of the auth client
  if (!supabaseAuthClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[requireAuth] CRITICAL: SUPABASE_ANON_KEY or SUPABASE_URL is missing in environment variables.');
      return res.status(500).json({ error: 'Server authentication configuration is missing.' });
    }
    
    supabaseAuthClient = createClient(supabaseUrl, supabaseAnonKey);
  }

  const { data, error } = await supabaseAuthClient.auth.getUser(token);

  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired session token.' });
  }

  // Attach the verified user to the request for downstream handlers
  req.user = data.user; // req.user.id is the authenticated user's UUID
  next();
}
