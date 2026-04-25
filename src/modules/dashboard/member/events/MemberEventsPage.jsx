import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import EventCard from "../../events/EventCard";

export default function MemberEventsPage() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    const { data } = await supabase.from("events").select("*");
    setEvents(data || []);
  }

  return (
    <div className="p-6 grid grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          basePath="/member/events"
        />
      ))}
    </div>
  );
}