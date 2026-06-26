import { supabase } from "./supabase.js";
import {
  handleAuthRedirect,
  loginWithEmail,
  logout
} from "./auth.js";

let currentUser = null;
let currentTrip = null;
let trips = [];

async function loadTrips() {
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  trips = data || [];
}

async function createTrip(name) {
  const { data, error } = await supabase
    .from("trips")
    .insert([
      {
        name,
        user_id: currentUser.id
      }
    ])
    .select()
    .single();

  if (error) {
    alert(error.message);
    return;
  }

  trips.unshift(data);
  currentTrip = data;
  renderApp();
}

async function addFlight() {
  if (!currentTrip) return;

  const origin = prompt("Origen");
  const destination = prompt("Destino");
  const airline = prompt("Compañía");
  const booking_ref = prompt("Localizador");

  if (!origin || !destination) return;

  const { error } = await supabase.from("flights").insert([
    {
      trip_id: currentTrip.id,
      origin,
      destination,
      airline,
      booking_ref
    }
  ]);

  if (error) alert(error.message);
}

async function getFlights(tripId) {
  const { data } = await supabase
    .from("flights")
    .select("*")
    .eq("trip_id", tripId);

  return data || [];
}

function renderLoading() {
  document.getElementById("app").innerHTML = `
    <div style="padding:40px;text-align:center">
      Cargando...
    </div>
  `;
}

function renderLogin() {
  document.getElementById("app").innerHTML = `
    <div style="padding:40px;text-align:center">
      <h1>✈️ TripMate</h1>

      <input id="email" type="email" placeholder="Tu email"
      style="padding:12px;width:100%;margin-top:20px"/>

      <button id="loginBtn">Entrar</button>
    </div>
  `;

  document.getElementById("loginBtn").onclick = async () => {
    const email = document.getElementById("email").value.trim();

    if (!email) return;

    const { error } = await loginWithEmail(email);

    if (error) alert(error.message);
    else alert("Revisa tu correo.");
  };
}

async function renderApp() {
  await loadTrips();

  let html = `
    <div style="padding:20px">
      <h2>✈️ TripMate</h2>
      <p>${currentUser.email}</p>

      <button id="logoutBtn">Cerrar sesión</button>
      <button id="newTripBtn">+ Nuevo viaje</button>
      <hr/>
  `;

  if (!trips.length) {
    html += `
      <div class="card">
        No tienes viajes aún
      </div>
    `;
  }

  for (const trip of trips) {
    const flights = await getFlights(trip.id);

    html += `
      <div class="card">
        <h3>${trip.name}</h3>

        <button onclick="window.openTrip('${trip.id}')">
          Abrir
        </button>

        <button onclick="window.addFlightToTrip('${trip.id}')">
          + Vuelo
        </button>

        ${flights.map(f => `
          <div class="card">
            ✈️ ${f.origin} → ${f.destination}
            <br>
            ${f.airline || ""}
            <br>
            ${f.booking_ref || ""}
          </div>
        `).join("")}
      </div>
    `;
  }

  html += `</div>`;

  document.getElementById("app").innerHTML = html;

  document.getElementById("logoutBtn").onclick = async () => {
    await logout();
  };

  document.getElementById("newTripBtn").onclick = async () => {
    const name = prompt("Nombre del viaje");
    if (name) await createTrip(name);
  };
}

window.openTrip = (tripId) => {
  currentTrip = trips.find(t => t.id === tripId);
};

window.addFlightToTrip = async (tripId) => {
  currentTrip = trips.find(t => t.id === tripId);
  await addFlight();
  renderApp();
};

async function initApp() {
  renderLoading();

  await handleAuthRedirect();

  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (session?.user) {
    currentUser = session.user;
    renderApp();
  } else {
    renderLogin();
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      currentUser = session.user;
      renderApp();
    } else {
      renderLogin();
    }
  });

  supabase
    .channel("tripmate-live")
    .on(
      "postgres_changes",
      { event: "*", schema: "public" },
      () => {
        renderApp();
      }
    )
    .subscribe();
}

initApp();
