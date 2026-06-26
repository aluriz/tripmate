import { supabase } from './supabase.js';

export async function login(email) {
  return await supabase.auth.signInWithOtp({ email });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
