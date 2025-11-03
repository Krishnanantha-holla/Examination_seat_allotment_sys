import React, { useState, useEffect } from 'react';
import { classroomsAPI } from '../api/client';
import { Header, Sidebar } from '../components/Layout';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

export const ClassroomsPage = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    floor_id: '',
    classroom_number: '',
    classroom_code: '',
    total_benches: '',
    capacity: '3',
  });

  useEffect(() => {
    fetchClassrooms();
  }, []);

  const fetchClassrooms = async () => {
    try {
      setLoading(true);
      const response = await classroomsAPI.getAll();
      setClassrooms(response.data);
      
      // Extract unique floors
      const uniqueFloors = [...new Set(response.data.map(c => ({
        id: c.floor_id,
        floor_number: c.floor_number,
        floor_name: c.floor_name
      })))];
      setFloors(uniqueFloors);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch classrooms');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await classroomsAPI.create(formData);
      setFormData({
        floor_id: '',
        classroom_number: '',
        classroom_code: '',
        total_benches: '',
        capacity: '3',
      });
      setShowForm(false);
      fetchClassrooms();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create classroom');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure? This will delete all benches in this classroom.')) {
      try {
        await classroomsAPI.delete(id);
        fetchClassrooms();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete classroom');
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Classrooms</h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                New Classroom
              </button>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {showForm && (
              <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4">Create New Classroom</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <select
                      name="floor_id"
                      className="input"
                      value={formData.floor_id}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Floor</option>
                      {floors.map(floor => (
                        <option key={floor.id} value={floor.id}>
                          Floor {floor.floor_number}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classroom Number</label>
                    <input
                      type="text"
                      name="classroom_number"
                      className="input"
                      placeholder="101"
                      value={formData.classroom_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classroom Code</label>
                    <input
                      type="text"
                      name="classroom_code"
                      className="input"
                      placeholder="F1C101"
                      value={formData.classroom_code}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Benches</label>
                    <input
                      type="number"
                      name="total_benches"
                      className="input"
                      value={formData.total_benches}
                      onChange={handleChange}
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity per Bench</label>
                    <select
                      name="capacity"
                      className="input"
                      value={formData.capacity}
                      onChange={handleChange}
                    >
                      <option value="1">1 Student</option>
                      <option value="2">2 Students</option>
                      <option value="3">3 Students</option>
                    </select>
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <button type="submit" className="btn-primary">Create Classroom</button>
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-600">Loading classrooms...</p>
              </div>
            ) : classrooms.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">No classrooms found. Create one to get started!</p>
              </div>
            ) : (
              <div className="table-responsive card">
                <table>
                  <thead>
                    <tr>
                      <th>Floor</th>
                      <th>Classroom</th>
                      <th>Code</th>
                      <th>Benches</th>
                      <th>Capacity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {classrooms.map(classroom => (
                      <tr key={classroom.id}>
                        <td>Floor {classroom.floor_number}</td>
                        <td>{classroom.classroom_number}</td>
                        <td>{classroom.classroom_code}</td>
                        <td>{classroom.total_benches}</td>
                        <td>{classroom.capacity} students</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(classroom.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
