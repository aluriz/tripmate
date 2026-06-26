import { supabase } from './supabase.js';
import { login, logout, getUser } from './auth.js';
import { db } from './db.js';
import { subscribeTrips, subscribeExpenses } from './realtime.js';

const app = document.getElementById('app');

let state = {
  user: null,
  trips: [],
  current: null,
  expenses: []
};

async function init() {
  state.user = await getUser();
  if (!state.user) return renderLogin();

  await loadTrips();
  subscribeTrips(state.user.id, loadTrips);

  render();
}

async function loadTrips() {
  state.trips = await db.getTrips(state.user.id);
  render();
}

function renderLogin() {
  app.innerHTML = `
    <h2>Login TripMate</h2>
    <input id="email" placeholder="email"/>
    <button onclick="doLogin()">Entrar</button>
  `;
}

window.doLogin = async () => {
  const email = document.getElementById('email').value;
  await login(email);
  alert("Revisa tu email 📩");
};

window.openTrip = async (id) => {
  state.current = state.trips.find(t => t.id === id);

  state.expenses = await db.getExpenses(id);

  subscribeExpenses(id, async () => {
    state.expenses = await db.getExpenses(id);
    render();
  });

  render();
};

window.createTrip = async () => {
  const name = prompt("Nombre viaje");

  await db.createTrip({
    id: crypto.randomUUID(),
    name,
    owner: state.user.id,
    created_at: Date.now()
  });
};

window.addExpense = async () => {
  const desc = prompt("Descripción");
  const amount = prompt("Importe");

  await db.addExpense({
    id: crypto.randomUUID(),
    trip_id: state.current.id,
    user_id: state.user.id,
    description: desc,
    amount: parseFloat(amount),
    created_at: Date.now()
  });
};

function render() {
  if (!state.user) return;

  if (!state.current) {
    app.innerHTML = `
      <h2>Mis viajes</h2>
      <button onclick="createTrip()">Nuevo viaje</button>

      ${state.trips.map(t => `
        <div class="card">
          <b>${t.name}</b>
          <button onclick="openTrip('${t.id}')">Abrir</button>
        </div>
      `).join('')}
    `;
    return;
  }

  app.innerHTML = `
    <h2>${state.current.name}</h2>

    <button onclick="addExpense()">Añadir gasto</button>
    <button onclick="state.current=null;render()">← Volver</button>

    <h3>Gastos</h3>

    ${state.expenses.map(e => `
      <div class="card">
        ${e.description} - ${e.amount}€
      </div>
    `).join('')}
  `;
}

init();
