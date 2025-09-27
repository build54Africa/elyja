"use client";

import { useState, useEffect } from "react";

interface Counselor {
  id: string;
  name: string | null;
  phone: string | null;
  status: string;
  isAvailable: boolean;
  specialties: string[];
  license?: string | null;
  bio?: string | null;
}

interface NewCounselorForm {
  name: string;
  phone: string;
  specialties: string;
  license: string;
  bio: string;
}

export default function Dashboard() {
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newCounselor, setNewCounselor] = useState<NewCounselorForm>({
    name: "",
    phone: "",
    specialties: "",
    license: "",
    bio: "",
  });

  useEffect(() => {
    loadCounselors();
  }, []);

  const loadCounselors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/counselors");
      if (response.ok) {
        const data = await response.json();
        setCounselors(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to load counselors");
      }
    } catch (error) {
      console.error("Failed to load counselors:", error);
      setError("Failed to load counselors. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const addCounselor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const specialties = newCounselor.specialties
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);
      const response = await fetch("/api/counselors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCounselor,
          specialties,
        }),
      });
      if (response.ok) {
        const newCounselorData = await response.json();
        setCounselors((prev) => [...prev, newCounselorData]);
        setNewCounselor({
          name: "",
          phone: "",
          specialties: "",
          license: "",
          bio: "",
        });
        setShowAddForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to add counselor");
      }
    } catch (error) {
      console.error("Failed to add counselor:", error);
      setError("Failed to add counselor. Please try again.");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/counselors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (response.ok) {
        const updatedCounselor = await response.json();
        setCounselors((prev) =>
          prev.map((c) => (c.id === id ? updatedCounselor : c))
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Failed to update status:", error);
      setError("Failed to update status. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Counselor Management Dashboard
        </h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <strong>Error: </strong>
            {error}
            <button
              className="ml-4 bg-red-100 hover:bg-red-200 text-red-800 font-semibold py-1 px-3 rounded text-sm"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showAddForm ? "Cancel" : "Add New Counselor"}
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Add New Counselor</h2>
            <form onSubmit={addCounselor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  value={newCounselor.name}
                  onChange={(e) =>
                    setNewCounselor((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={newCounselor.phone}
                  onChange={(e) =>
                    setNewCounselor((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Specialties (comma-separated)
                </label>
                <input
                  type="text"
                  value={newCounselor.specialties}
                  onChange={(e) =>
                    setNewCounselor((prev) => ({
                      ...prev,
                      specialties: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  placeholder="Anxiety, Depression, PTSD"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  License
                </label>
                <input
                  type="text"
                  value={newCounselor.license}
                  onChange={(e) =>
                    setNewCounselor((prev) => ({
                      ...prev,
                      license: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Bio
                </label>
                <textarea
                  value={newCounselor.bio}
                  onChange={(e) =>
                    setNewCounselor((prev) => ({
                      ...prev,
                      bio: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add Counselor
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Counselors</h2>

          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">Loading counselors...</p>
            </div>
          )}

          {!isLoading && counselors.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              No counselors registered
            </p>
          )}

          {!isLoading && counselors.length > 0 && (
            <div className="space-y-4">
              {counselors.map((counselor) => (
                <div key={counselor.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {counselor.name || "Unnamed Counselor"}
                      </h3>
                      <p className="text-sm text-gray-600">{counselor.phone}</p>
                      {counselor.specialties &&
                        counselor.specialties.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Specialties: {counselor.specialties.join(", ")}
                          </p>
                        )}
                      {counselor.license && (
                        <p className="text-sm text-gray-500">
                          License: {counselor.license}
                        </p>
                      )}
                      {counselor.bio && (
                        <p className="text-sm text-gray-500">
                          Bio: {counselor.bio}
                        </p>
                      )}
                    </div>
                    <div className="ml-4">
                      <select
                        value={counselor.status}
                        onChange={(e) =>
                          updateStatus(counselor.id, e.target.value)
                        }
                        className="border border-gray-300 rounded px-3 py-1 text-sm"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="offline">Offline</option>
                      </select>
                      <div
                        className={`mt-2 px-3 py-1 rounded-full text-sm font-medium inline-block ${
                          counselor.isAvailable
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {counselor.isAvailable ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* System Status */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {isLoading
                  ? "..."
                  : counselors.filter((c) => c.isAvailable).length}
              </div>
              <p className="text-gray-600">Available Counselors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {isLoading ? "..." : counselors.length}
              </div>
              <p className="text-gray-600">Total Counselors</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">✓</div>
              <p className="text-gray-600">AI System Active</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
