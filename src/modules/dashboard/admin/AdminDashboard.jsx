import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    events: 0,
    members: 0,
    tasks: 0,
    budget: 0,
  });

  const [recentEvents, setRecentEvents] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    const { data: events } = await supabase
      .from("events")
      .select("*");

    const { count: members } = await supabase
      .from("members")
      .select("*", { count: "exact", head: true });

    const { data: tasksData } = await supabase
      .from("tasks")
      .select("*");

    const spent = 49000;

    setStats({
      events: events?.length || 0,
      members: members || 0,
      tasks: tasksData?.length || 0,
      budget: spent,
    });

    setRecentEvents(events?.slice(0, 4) || []);
    setTasks(tasksData?.slice(0, 4) || []);
  }

  // 🔥 SAFE HELPERS
  const getEventName = (e) =>
    e.title || e.name || e.event_name || "Untitled Event";

  const getVolunteers = (e) =>
    e.volunteers_count || e.volunteers?.length || 0;

  const getProgress = (e) =>
    e.progress ?? e.completion ?? 50;

  const getTaskName = (t) =>
    t.title || t.name || "Untitled Task";

  const getPriorityColor = (priority) => {
    if (!priority) return "bg-yellow-100 text-yellow-600";
    if (priority.toLowerCase() === "high")
      return "bg-red-100 text-red-500";
    if (priority.toLowerCase() === "critical")
      return "bg-red-200 text-red-600";
    return "bg-yellow-100 text-yellow-600";
  };

  return (
    <div className="p-6 space-y-6">

      {/* 🔥 TOP CARDS */}
      <div className="grid grid-cols-4 gap-4">
        <Card title="Active Events" value={stats.events} color="blue" />
        <Card title="Total Members" value={stats.members} color="green" />
        <Card title="Tasks Completed" value={stats.tasks} color="purple" />
        <Card title="Budget Spent" value={`₹${stats.budget / 1000}k`} color="orange" />
      </div>

      {/* 🔥 GRID */}
      <div className="grid grid-cols-2 gap-6">

        {/* RECENT EVENTS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Recent Events</h3>

          {recentEvents.map((e) => (
            <div key={e.id} className="mb-4">
              <div className="flex justify-between">
                <span className="font-medium">
                  {getEventName(e)}
                </span>

                <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                  {e.status || "Active"}
                </span>
              </div>

              <p className="text-xs text-gray-500">
                {getVolunteers(e)} Volunteers
              </p>

              <div className="w-full bg-gray-200 h-2 rounded mt-2">
                <div
                  className="bg-blue-500 h-2 rounded"
                  style={{ width: `${getProgress(e)}%` }}
                />
              </div>

              <p className="text-xs text-right text-gray-500 mt-1">
                {getProgress(e)}% Complete
              </p>
            </div>
          ))}
        </div>

        {/* TASKS */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="font-semibold mb-4">Upcoming Tasks</h3>

          {tasks.map((t) => (
            <div key={t.id} className="flex justify-between mb-3">
              <div>
                <p className="text-sm">{getTaskName(t)}</p>
                <p className="text-xs text-gray-500">
                  Assigned to: {t.assigned_to || "User"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs">
                  {t.deadline
                    ? new Date(t.deadline).toLocaleDateString()
                    : "No date"}
                </p>

                <span
                  className={`text-xs px-2 py-1 rounded ${getPriorityColor(
                    t.priority
                  )}`}
                >
                  {t.priority || "Medium"}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 🔥 BUDGET */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="font-semibold mb-4">Budget Overview</h3>

        <div className="grid grid-cols-4 gap-4 text-sm">

          <div>
            <p>Total Budget</p>
            <h3 className="font-bold">₹125k</h3>
          </div>

          <div>
            <p>Total Spent</p>
            <h3 className="font-bold text-orange-500">₹49k</h3>
          </div>

          <div>
            <p>Pending</p>
            <h3 className="font-bold text-yellow-500">₹10k</h3>
          </div>

          <div>
            <p>Remaining</p>
            <h3 className="font-bold text-green-500">₹76k</h3>
          </div>

        </div>
      </div>

    </div>
  );
}

// 🔹 Card Component
function Card({ title, value, color }) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h2 className="text-xl font-bold">{value}</h2>
      </div>
      <div className={`p-3 rounded ${colors[color]}`} />
    </div>
  );
}