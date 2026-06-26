import { supabase } from './supabase.js';

export const db = {

  async getTrips(userId) {
    const { data } = await supabase
      .from('trips')
      .select('*')
      .eq('owner', userId);

    return data || [];
  },

  async createTrip(trip) {
    return await supabase.from('trips').insert(trip);
  },

  async getExpenses(tripId) {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('trip_id', tripId);

    return data || [];
  },

  async addExpense(exp) {
    return await supabase.from('expenses').insert(exp);
  }
};
