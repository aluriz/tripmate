import { supabase } from "./supabase.js";

/**
 * Captura el login desde el redirect de Supabase
 * (MUY IMPORTANTE para GitHub Pages + magic link)
 */
export async function handleAuthRedirect() {
  const { error } = await supabase.auth.getSessionFromUrl({
    storeSession: true,
  });

  if (error) {
    console.error("Error procesando login:", error.message);
    return null;
  }

  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

/**
 * Devuelve sesión actual
 */
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/**
 * Login por email (magic link)
 */
export async function loginWithEmail(email) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "https://aluriz.github.io/tripmate/",
    },
  });
}

/**
 * Logout
 */
export async function logout() {
  return await supabase.auth.signOut();
}
