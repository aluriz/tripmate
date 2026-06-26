import { supabase } from './supabase.js';

export function subscribeTrips(userId, callback) {
  return supabase
    .channel('trips')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'trips',
        filter: `owner=eq.${userId}`
      },
      payload => callback(payload)
    )
    .subscribe();
}

export function subscribeExpenses(tripId, callback) {
  return supabase
    .channel('expenses')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'expenses',
        filter: `trip_id=eq.${tripId}`
      },
      payload => callback(payload)
    )
    .subscribe();
}
