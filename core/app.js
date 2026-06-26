import { supabase } from "./supabase.js";
import {
  handleAuthRedirect,
  loginWithEmail,
  logout
} from "./auth.js";

let currentUser = null;

function renderLoading() {
  document.getElementById("app").innerHTML = `
    <div style="text-align:center;padding:60px">
      <h2>TripMate</h2>
      <p>Comprobando sesión...</p>
    </div>
  `;
}

function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div style="max-width:400px;margin:80px auto;text-align:center">
      <h1>✈️ TripMate</h1>
      <p>Accede con tu email</p>

      <input id="email" type="email"
        placeholder="tu@email.com"
        style="padding:12px;width:100%;margin-top:10px" />

      <button id="loginBtn"
        style="padding:12px;width:100%;margin-top:12px">
        Enviar enlace
      </button>
    </div>
  `;

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value.trim();

    if (!email) {
      alert("Introduce un email");
      return;
    }

    const { error } = await loginWithEmail(email);

    if (error) {
      alert(error.message);
    } else {
      alert("Te hemos enviado un enlace al correo.");
    }
  };
}

function renderApp() {
  document.getElementById("app").innerHTML = `
    <div style="padding:20px">
      <h2>✈️ TripMate</h2>
      <p>Bienvenido ${currentUser.email}</p>

      <button id="logoutBtn">Cerrar sesión</button>

      <hr/>

      <div class="card">
        App cargada correctamente 🚀
      </div>
    </div>
  `;

  document.getElementById("logoutBtn").onclick = async () => {
    await logout();
  };
}

async function initApp() {
  renderLoading();

  await handleAuthRedirect();

  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    console.error(error);
    renderLogin();
    return;
  }

  if (session?.user) {
    currentUser = session.user;
    renderApp();
  } else {
    renderLogin();
  }

  supabase.auth.onAuthStateChange((event, session) => {
    console.log("Auth event:", event);

    if (session?.user) {
      currentUser = session.user;
      renderApp();
    } else {
      currentUser = null;
      renderLogin();
    }
  });
}

initApp();
