import { supabase } from "./supabase.js";

/**
 * APP STATE
 */
const state = {
  user: null,
  loading: true,
  trips: []
};

/**
 * INIT APP
 */
document.addEventListener("DOMContentLoaded", async () => {
  await initApp();
});

/**
 * BOOTSTRAP
 */
async function initApp() {
  try {
    renderLoading();

    // 1. Capturar sesión desde redirect (MAGIC LINK FIX CRÍTICO)
    const { data: urlSession } = await supabase.auth.getSession();

    // 2. Si no hay sesión, intentar recuperar sesión activa
    const { data: { session } } = await supabase.auth.getSession();

    state.user = session?.user || null;

    // 3. Escuchar cambios auth en tiempo real
    supabase.auth.onAuthStateChange((_event, session) => {
      state.user = session?.user || null;
      route();
    });

    state.loading = false;

    // 4. Primera ruta
    route();

  } catch (err) {
    console.error("INIT ERROR:", err);
    renderError(err.message);
  }
}

/**
 * ROUTER SIMPLE
 */
function route() {
  if (state.loading) return renderLoading();

  if (!state.user) {
    return renderLogin();
  }

  return renderApp();
}

/**
 * LOGIN UI
 */
function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div style="max-width:400px;margin:60px auto;text-align:center">
      <h1>TripMate</h1>
      <p>Inicia sesión con tu email</p>

      <input id="email" placeholder="tu@email.com"
        style="padding:10px;width:100%;margin-top:10px"/>

      <button onclick="sendMagicLink()"
        style="margin-top:10px;width:100%">
        Enviar enlace
      </button>
    </div>
  `;
}

/**
 * APP PRINCIPAL
 */
function renderApp() {
  document.getElementById("app").innerHTML = `
    <div style="max-width:900px;margin:20px auto">
      <h2>Hola 👋 ${state.user.email}</h2>

      <button onclick="logout()">Cerrar sesión</button>

      <hr/>

      <h3>Tus viajes</h3>

      <div id="trips">
        ${state.trips.length ? state.trips.map(t => `
          <div class="card">
            <b>${t.name}</b><br/>
            ${t.destination || ""}
          </div>
        `).join("") : "<p>No hay viajes aún</p>"}
      </div>

      <button onclick="createTrip()">+ Crear viaje</button>
    </div>
  `;

  loadTrips();
}

/**
 * LOAD TRIPS (SUPABASE)
 */
async function loadTrips() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  state.trips = data || [];
  renderApp();
}

/**
 * CREATE TRIP
 */
window.createTrip = async function () {
  const name = prompt("Nombre del viaje:");
  if (!name) return;

  const { error } = await supabase.from("trips").insert({
    id: crypto.randomUUID(),
    name,
    owner_id: state.user.id,
    created_at: Date.now()
  });

  if (error) {
    alert(error.message);
    return;
  }

  loadTrips();
};

/**
 * MAGIC LINK LOGIN
 */
window.sendMagicLink = async function () {
  const email = document.getElementById("email").value;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "https://aluriz.github.io/tripmate/"
    }
  });

  if (error) {
    alert(error.message);
  } else {
    alert("Revisa tu email 📩");
  }
};

/**
 * LOGOUT
 */
window.logout = async function () {
  await supabase.auth.signOut();
  state.user = null;
  route();
};

/**
 * UI HELPERS
 */
function renderLoading() {
  document.getElementById("app").innerHTML = `
    <div style="text-align:center;margin-top:80px">
      <h3>Loading TripMate...</h3>
    </div>
  `;
}

function renderError(msg) {
  document.getElementById("app").innerHTML = `
    <div style="color:red;text-align:center;margin-top:80px">
      Error: ${msg}
    </div>
  `;
}
