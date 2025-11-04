import React, { useState } from 'react';
import axios from 'axios';

export const StudentPortalPage = () => {
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const handleLookup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setData(null);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/public/student-lookup`, {
        params: { usn }
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="card w-full max-w-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Seating Lookup</h1>
          <p className="text-gray-600">Enter your USN to view your seating information</p>
        </div>

        <form onSubmit={handleLookup} className="flex gap-3 mb-6">
          <input
            className="input flex-1"
            placeholder="Enter your USN"
            value={usn}
            onChange={(e) => setUsn(e.target.value)}
            required
          />
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Checking...' : 'View'}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">{error}</div>
        )}

        {data && (
          <div className="space-y-6">
            <div className="card bg-gray-50">
              <h2 className="font-semibold mb-2">Profile</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div><span className="text-gray-600">Name:</span> {data.student.full_name}</div>
                <div><span className="text-gray-600">USN:</span> {data.student.usn}</div>
                <div><span className="text-gray-600">Course:</span> {data.student.course_code} - {data.student.course_name}</div>
                <div><span className="text-gray-600">Semester:</span> {data.student.semester}</div>
              </div>
            </div>

            <div>
              <h2 className="font-semibold mb-2">Seating Allocations</h2>
              {data.allocations.length === 0 ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm">
                  No seating allocation found yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {data.allocations.map((a) => (
                    <div key={a.allocation_id} className="card">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div><span className="text-gray-600">Subject:</span> {a.subject_code || ''} {a.subject_name || ''}</div>
                        <div><span className="text-gray-600">Date:</span> {a.exam_date}</div>
                        <div><span className="text-gray-600">Time:</span> {a.exam_time_start} - {a.exam_time_end}</div>
                        <div><span className="text-gray-600">Room:</span> {a.room_number} (Floor {a.floor_id})</div>
                        <div><span className="text-gray-600">Bench:</span> {a.bench_number}</div>
                        <div><span className="text-gray-600">Seat:</span> {a.seat_number}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
