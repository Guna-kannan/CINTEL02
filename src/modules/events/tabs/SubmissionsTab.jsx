import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export default function SubmissionsTab({ eventId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // form states
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState("");
  const [driveLink, setDriveLink] = useState("");

  useEffect(() => {
    if (eventId) fetchSubmissions();
  }, [eventId]);

  const fetchSubmissions = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("submissions")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error);
    } else {
      setSubmissions(data);
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!teamName || !driveLink) {
      alert("Team name and drive link required");
      return;
    }

    const membersArray = members
      ? members.split(",").map((m) => m.trim())
      : [];

    const { error } = await supabase.from("submissions").insert([
      {
        event_id: eventId, // 🔥 linking to event
        team_name: teamName,
        members_json: membersArray,
        drive_link: driveLink,
      },
    ]);

    if (error) {
      console.error("Insert error:", error);
      alert("Error submitting");
    } else {
      alert("Submitted successfully 🚀");

      // reset form
      setTeamName("");
      setMembers("");
      setDriveLink("");

      fetchSubmissions(); // refresh list
    }
  };

  if (loading) return <p>Loading submissions...</p>;

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Submissions</h2>

      {/* 🔥 ADD SUBMISSION FORM */}
      <div className="mb-6 p-4 border rounded-lg shadow-sm">
        <h3 className="font-semibold mb-3">Add Submission</h3>

        <input
          type="text"
          placeholder="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          type="text"
          placeholder="Members (comma separated)"
          value={members}
          onChange={(e) => setMembers(e.target.value)}
          className="border p-2 w-full mb-2 rounded"
        />

        <input
          type="text"
          placeholder="Drive Link"
          value={driveLink}
          onChange={(e) => setDriveLink(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </div>

      {/* 🔥 SUBMISSIONS LIST */}
      {submissions.length === 0 ? (
        <p className="text-gray-500">No submissions yet</p>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="p-4 border rounded-lg shadow-sm"
            >
              <h3 className="font-semibold">{sub.team_name}</h3>

              <p className="text-sm text-gray-500">
                Status: {sub.status}
              </p>

              <a
                href={sub.drive_link}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline text-sm"
              >
                View Submission
              </a>

              {/* Members */}
              <div className="text-sm mt-2">
                <p className="font-medium">Members:</p>
                <ul className="list-disc ml-5">
                  {sub.members_json?.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}