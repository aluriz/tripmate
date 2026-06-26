import { supabase } from "./supabase.js";

/**
 * Procesa el hash de Supabase después del magic link
 */
export async function handleAuthRedirect() {
  const hash = window.location.hash;

  // Si viene token en la URL, Supabase v2 lo detecta solo
  if (hash.includes("access_token")) {
    console.log("Magic link detectado");

    // Esperamos a que Supabase procese la sesión
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Limpiamos la URL
    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );
  }
}

/**
 * Login por email
 */
export async function loginWithEmail(email) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "https://aluriz.github.io/tripmate/"
    }
  });
}

/**
 * Logout
 */
export async function logout() {
  return await supabase.auth.signOut();
}
