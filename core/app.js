import { supabase } from "./supabase.js";

/* =========================
STATE
========================= */
const state = {
  user: null,
  trips: [],
  currentTrip: null,
  expenses: [],
  files: []
};

/* =========================
INIT
========================= */
window.addEventListener("DOMContentLoaded", init);

async function init() {
  const { data } = await supabase.auth.getSession();
  state.user = data.session?.user || null;

  supabase.auth.onAuthStateChange((_e, session) => {
    state.user = session?.user || null;
    render();
  });

  if (state.user) await loadTrips();

  render();
}

/* =========================
AUTH
========================= */
async function login(email) {
  await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: "https://aluriz.github.io/tripmate/"
    }
  });

  alert("Revisa tu email 📩");
}

async function logout() {
  await supabase.auth.signOut();
}

/* =========================
TRIPS
========================= */
async function loadTrips() {
  const { data } = await supabase
    .from("trips")
    .select("*")
    .order("created_at", { ascending: false });

  state.trips = data || [];
}

async function createTrip() {
  const name = prompt("Nombre del viaje");

  const { data, error } = await supabase
    .from("trips")
    .insert({
      name,
      owner_id: state.user.id
    })
    .select()
    .single();

  if (error) return alert(error.message);

  state.trips.unshift(data);
  render();
}

async function selectTrip(id) {
  state.currentTrip = id;

  await loadExpenses();
  await loadFiles();

  subscribeRealtime(id);

  render();
}

/* =========================
EXPENSES
========================= */
async function loadExpenses() {
  const { data } = await supabase
    .from("expenses")
    .select("*")
    .eq("trip_id", state.currentTrip);

  state.expenses = data || [];
}

async function addExpense() {
  const description = prompt("Descripción");
  const amount = parseFloat(prompt("Importe"));

  await supabase.from("expenses").insert({
    trip_id: state.currentTrip,
    description,
    amount,
    user_id: state.user.id
  });

  loadExpenses();
}

/* =========================
FILES (Storage)
========================= */
async function uploadFile(file) {
  const path = `${state.currentTrip}/${Date.now()}-${file.name}`;

  await supabase.storage
    .from("trip-files")
    .upload(path, file);

  const { data } = supabase.storage
    .from("trip-files")
    .getPublicUrl(path);

  await supabase.from("files").insert({
    id: crypto.randomUUID(),
    trip_id: state.currentTrip,
    name: file.name,
    url: data.publicUrl,
    user_id: state.user.id
  });

  loadFiles();
}

async function loadFiles() {
  const { data } = await supabase
    .from("files")
    .select("*")
    .eq("trip_id", state.currentTrip);

  state.files = data || [];
}

/* =========================
REALTIME
========================= */
function subscribeRealtime(tripId) {
  supabase.removeAllChannels();

  supabase.channel("expenses")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "expenses",
      filter: `trip_id=eq.${tripId}`
    }, loadExpenses)
    .subscribe();

  supabase.channel("files")
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "files",
      filter: `trip_id=eq.${tripId}`
    }, loadFiles)
    .subscribe();
}

/* =========================
UI SIMPLE MVP
========================= */
function render() {
  const el = document.getElementById("app");

  if (!state.user) {
    el.innerHTML = `
      <h2>Login</h2>
      <input id="email" placeholder="email"/>
      <button onclick="login()">Entrar</button>
    `;

    window.login = () => {
      login(document.getElementById("email").value);
    };

    return;
  }

  el.innerHTML = `
    <button onclick="logout()">Logout</button>

    <h2>Trips</h2>

    ${state.trips.map(t => `
      <div class="card" onclick="selectTrip('${t.id}')">
        ${t.name}
      </div>
    `).join("")}

    <button onclick="createTrip()">+ Trip</button>

    <hr/>

    <h3>Expenses</h3>

    ${state.expenses.map(e => `
      <div class="card">${e.description} - ${e.amount}€</div>
    `).join("")}

    <button onclick="addExpense()">+ Expense</button>

    <hr/>

    <h3>Files</h3>

    <input type="file" id="file"/>
    <button onclick="upload()">Upload</button>

    ${state.files.map(f => `
      <div class="card">
        <a href="${f.url}" target="_blank">${f.name}</a>
      </div>
    `).join("")}
  `;

  window.logout = logout;
  window.createTrip = createTrip;
  window.selectTrip = selectTrip;
  window.addExpense = addExpense;

  window.upload = async () => {
    const file = document.getElementById("file").files[0];
    if (file) uploadFile(file);
  };
}