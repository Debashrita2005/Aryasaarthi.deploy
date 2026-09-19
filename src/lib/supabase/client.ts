import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

/**
 * Supabase Browser/Server Client
 * Used for:
 * 1. Citizen document uploads (Aadhaar, Caste Certificate, Project Proposal) to Supabase Storage
 * 2. Real-time scheme change notification subscriptions via WebSockets
 * 3. Direct queries if preferred
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
