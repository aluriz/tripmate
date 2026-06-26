import { supabase } from "./supabase.js";
import { handleAuthRedirect, getSession, loginWithEmail, logout } from "./auth.js";

/**
 * Estado global mínimo de auth
 */
let currentUser = null;

/**
 * INICIALIZACIÓN PRINCIPAL
 */
async function initApp() {
  try {
    // 1. Captura redirect de Supabase (magic link)
    await handleAuthRedirect();

    // 2. Recupera sesión activa
    const session = await getSession();

    if (session?.user) {
      currentUser = session.user;
      console.log("✅ Usuario logueado:", currentUser.email);

      startTripMateApp();
    } else {
      console.log("🔒 Usuario no logueado");
      renderLogin();
    }

    // 3. Listener de cambios de auth (multi-tab / refresh)
    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        currentUser = session.user;
        startTripMateApp();
      } else {
        currentUser = null;
        renderLogin();
      }
    });

  } catch (err) {
    console.error("Error inicializando app:", err);
    renderLogin();
  }
}

/**
 * LOGIN UI SIMPLE
 */
function renderLogin() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="max-width:400px;margin:100px auto;text-align:center">
      <h1>✈️ TripMate</h1>
      <p>Inicia sesión para continuar</p>

      <input id="email" type="email" placeholder="tu@email.com"
        style="padding:10px;width:100%;margin-top:10px"/>

      <button id="loginBtn"
        style="padding:10px;width:100%;margin-top:10px">
        Enviar enlace
      </button>
    </div>
  `;

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value;

    if (!email) return alert("Introduce un email");

    const { error } = await loginWithEmail(email);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Revisa tu correo 📩");
    }
  };
}

/**
 * APP PRINCIPAL (TU APLICACIÓN REAL)
 * Aquí conectas tu código actual de TripMate
 */
function startTripMateApp() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div style="padding:20px">
      <h2>✈️ TripMate</h2>
      <p>Bienvenido ${currentUser.email}</p>

      <button id="logoutBtn">Cerrar sesión</button>

      <hr/>

      <div id="tripApp">
        <!-- AQUÍ MONTAS TU APP ACTUAL -->
        App cargada correctamente 🚀
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").onclick = async () => {
    await logout();
  };

  // 👉 aquí puedes llamar a tu render original si lo tienes separado:
  // initTripMateUI();
}

/**
 * BOOT
 */
initApp();
