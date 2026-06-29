import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
const SUPABASE_URL = "https://oicztqxxgtnotlmglexp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pY3p0cXh4Z3Rub3RsbWdsZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0ODIxMzUsImV4cCI6MjA5ODA1ODEzNX0.GipSAoYdmwqRD8w14fmXlhJsxS7AZhqRNwi4HVhDuyw";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);