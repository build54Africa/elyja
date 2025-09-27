"use client";

import { useEffect, useState } from "react";

interface CallWithUser {
  id: string;
  user: { phone: string };
  status: string;
  startedAt: string;
}

interface EscalationWithCall {
  id: string;
  call: { user: { phone: string } };
  counselor: { name?: string };
  counselorId: string;
  notes?: string;
  escalatedAt: string;
}

interface Counselor {
  id: string;
  name: string;
  phone: string;
  status: string;
  specialties: string[];
  license?: string;
  bio?: string;
}

interface DashboardData {
  recentCalls: CallWithUser[];
  moodTrends: { date: string; averageMood: number }[];
  escalations: EscalationWithCall[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCounselor, setNewCounselor] = useState({
    name: "",
    phone: "",
    email: "",
    specialties: "",
    license: "",
    bio: "",
  });

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then(setData);
    loadCounselors();
  }, []);

  const loadCounselors = async () => {
    const res = await fetch("/api/counselors");
    if (res.ok) {
      const data = await res.json();
      setCounselors(data);
    }
  };

  const updateCounselorStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/counselors/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      loadCounselors();
    }
  };

  const addCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/counselors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newCounselor,
        specialties: newCounselor.specialties.split(",").map((s) => s.trim()),
      }),
    });
    if (res.ok) {
      setNewCounselor({
        name: "",
        phone: "",
        email: "",
        specialties: "",
        license: "",
        bio: "",
      });
      setShowAddForm(false);
      loadCounselors();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "busy":
        return "bg-red-100 text-red-800";
      case "offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-8">Counselor Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Calls</h2>
          <ul className="space-y-2">
            {data.recentCalls.map((call) => (
              <li key={call.id} className="p-4 border rounded">
                <p>User: {call.user.phone}</p>
                <p>Status: {call.status}</p>
                <p>Started: {new Date(call.startedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Mood Trends</h2>
          <div className="space-y-2">
            {data.moodTrends.map((trend) => (
              <div key={trend.date} className="flex items-center">
                <span className="w-20">{trend.date}</span>
                <div className="flex-1 bg-gray-200 rounded h-4">
                  <div
                    className="bg-blue-500 h-4 rounded"
                    style={{ width: `${(trend.averageMood / 10) * 100}%` }}
                  ></div>
                </div>
                <span className="ml-2">{trend.averageMood.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Recent Escalations</h2>
          <ul className="space-y-2">
            {data.escalations.map((esc) => (
              <li key={esc.id} className="p-4 border rounded">
                <p>User: {esc.call.user.phone}</p>
                <p>Counselor: {esc.counselor.name || esc.counselorId}</p>
                <p>Notes: {esc.notes}</p>
                <p>Escalated: {new Date(esc.escalatedAt).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Counselors</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {showAddForm ? "Cancel" : "Add Counselor"}
            </button>
          </div>

          {showAddForm && (
            <form
              onSubmit={addCounselor}
              className="mb-6 p-4 border rounded bg-gray-50"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={newCounselor.name}
                  onChange={(e) =>
                    setNewCounselor({ ...newCounselor, name: e.target.value })
                  }
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newCounselor.phone}
                  onChange={(e) =>
                    setNewCounselor({ ...newCounselor, phone: e.target.value })
                  }
                  className="p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newCounselor.email}
                  onChange={(e) =>
                    setNewCounselor({ ...newCounselor, email: e.target.value })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Specialties (comma separated)"
                  value={newCounselor.specialties}
                  onChange={(e) =>
                    setNewCounselor({
                      ...newCounselor,
                      specialties: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="License"
                  value={newCounselor.license}
                  onChange={(e) =>
                    setNewCounselor({
                      ...newCounselor,
                      license: e.target.value,
                    })
                  }
                  className="p-2 border rounded"
                />
                <textarea
                  placeholder="Bio"
                  value={newCounselor.bio}
                  onChange={(e) =>
                    setNewCounselor({ ...newCounselor, bio: e.target.value })
                  }
                  className="p-2 border rounded"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add Counselor
              </button>
            </form>
          )}

          <div className="space-y-4">
            {counselors.map((counselor) => (
              <div
                key={counselor.id}
                className="p-4 border rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{counselor.name}</p>
                  <p className="text-sm text-gray-600">{counselor.phone}</p>
                  <p className="text-sm text-gray-500">
                    {counselor.specialties.join(", ")}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-2 py-1 rounded text-sm ${getStatusColor(
                      counselor.status
                    )}`}
                  >
                    {counselor.status}
                  </span>
                  <div className="space-x-1">
                    <button
                      onClick={() =>
                        updateCounselorStatus(counselor.id, "available")
                      }
                      className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                    >
                      Available
                    </button>
                    <button
                      onClick={() =>
                        updateCounselorStatus(counselor.id, "busy")
                      }
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      Busy
                    </button>
                    <button
                      onClick={() =>
                        updateCounselorStatus(counselor.id, "offline")
                      }
                      className="bg-gray-500 text-white px-2 py-1 rounded text-xs hover:bg-gray-600"
                    >
                      Offline
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
