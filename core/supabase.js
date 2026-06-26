import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://oicztqxxgtnotlmglexp.supabase.co";

// Tu publishable key (anon/public key moderna)
const SUPABASE_ANON_KEY = "sb_publishable_snae7lZbK79TP7OyluC7gg_rg28FPLP";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
