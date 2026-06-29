import { supabase } from "./supabase.js";

/**
 * REALTIME SUBSCRIPTIONS (TRIPS)
 */
export function subscribeToTrips(onChange) {
  const channel = supabase
    .channel("trips-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "trips"
      },
      (payload) => {
        onChange(payload);
      }
    )
    .subscribe();

  return channel;
}

/**
 * REALTIME EXPENSES (LO SIGUIENTE QUE USAREMOS)
 */
export function subscribeToExpenses(tripId, onChange) {
  const channel = supabase
    .channel("expenses-realtime")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "expenses",
        filter: `trip_id=eq.${tripId}`
      },
      (payload) => {
        onChange(payload);
      }
    )
    .subscribe();

  return channel;
}
