import { supabase } from "./supabase.js";

const state = {
  user: null,
  loading: true,
  trips: []
};

document.addEventListener("DOMContentLoaded", async () => {
  await boot();
});

/**
 * BOOT
 */
async function boot() {
  renderLoading();

  // limpiar redirect hash de magic link
  if (window.location.hash.includes("access_token")) {
    await supabase.auth.getSession();
    window.history.replaceState({}, document.title, "/tripmate/");
  }

  const { data: { session } } = await supabase.auth.getSession();

  state.user = session?.user || null;
  state.loading = false;

  supabase.auth.onAuthStateChange((_event, session) => {
    state.user = session?.user || null;
    render();
  });

  render();
}

/**
 * RENDER CENTRAL (IMPORTANTE)
 */
function render() {
  if (state.loading) return renderLoading();
  if (!state.user) return renderLogin();
  return renderApp();
}

/**
 * LOGIN
 */
function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div style="max-width:400px;margin:60px auto;text-align:center">
      <h1>TripMate</h1>

      <input id="email" placeholder="tu@email.com" />

      <button onclick="sendMagicLink()">Enviar enlace</button>
    </div>
  `;
}

/**
 * APP
 */
function renderApp() {
  document.getElementById("app").innerHTML = `
    <div style="max-width:900px;margin:20px auto">

      <h2>Hola 👋 ${state.user.email}</h2>

      <button onclick="logout()">Cerrar sesión</button>

      <hr/>

      <h3>Tus viajes</h3>

      <div id="trips">
        ${state.trips.length
          ? state.trips.map(t => `
            <div class="card">
              <b>${t.name}</b><br/>
              ${t.destination || ""}
            </div>
          `).join("")
          : "<p>No hay viajes aún</p>"
        }
      </div>

      <button onclick="createTrip()">+ Crear viaje</button>

    </div>
  `;

  loadTrips();
}

/**
 * LOAD TRIPS (SIN RE-RENDER LOOP)
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

  // SOLO ACTUALIZAMOS DOM, NO re-render completo
  const container = document.getElementById("trips");
  if (container) {
    container.innerHTML = state.trips.length
      ? state.trips.map(t => `
        <div class="card">
          <b>${t.name}</b><br/>
          ${t.destination || ""}
        </div>
      `).join("")
      : "<p>No hay viajes aún</p>";
  }
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

  await loadTrips();
};

/**
 * LOGIN MAGIC LINK
 */
window.sendMagicLink = async function () {
  const email = document.getElementById("email").value;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "https://aluriz.github.io/tripmate/"
    }
  });

  if (error) alert(error.message);
  else alert("Revisa tu email 📩");
};

/**
 * LOGOUT
 */
window.logout = async function () {
  await supabase.auth.signOut();
  state.user = null;
  render();
};

/**
 * UI
 */
function renderLoading() {
  document.getElementById("app").innerHTML = `
    <div style="text-align:center;margin-top:80px">
      <h3>Loading TripMate...</h3>
    </div>
  `;
}
