import { useParams } from "react-router-dom";
import { useState } from "react";

import MemberOverviewTab from "./tabs/MemberOverviewTab";
import MemberTasksTab from "./tabs/MemberTasksTab";
import MemberTicketsTab from "./tabs/MemberTicketsTab";

export default function MemberEventDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "tasks", label: "Tasks" },
    { key: "tickets", label: "Tickets" },
  ];

  return (
    <div className="p-6">

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded ${
              activeTab === t.key ? "bg-indigo-600 text-white" : "bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && <MemberOverviewTab eventId={id} />}
      {activeTab === "tasks" && <MemberTasksTab eventId={id} />}
      {activeTab === "tickets" && <MemberTicketsTab eventId={id} />}

    </div>
  );
}