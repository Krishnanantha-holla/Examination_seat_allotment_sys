import React, { useState, useEffect } from 'react';
import { studentsAPI } from '../api/client';
import { Header, Sidebar } from '../components/Layout';
import { Plus, Upload, Edit2, Trash2, AlertCircle } from 'lucide-react';

export const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);
  const [formData, setFormData] = useState({
    usn: '',
    full_name: '',
    email: '',
    course_id: '',
    semester: '',
  });
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await studentsAPI.getAll();
      setStudents(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch students');
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
      await studentsAPI.create(formData);
      setFormData({
        usn: '',
        full_name: '',
        email: '',
        course_id: '',
        semester: '',
      });
      setShowForm(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create student');
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setError('Please select a file');
      return;
    }

    try {
      const response = await studentsAPI.uploadCSV(uploadFile);
      setError('');
      alert(`Successfully uploaded ${response.data.uploadedCount} students!`);
      setUploadFile(null);
      setUploadMode(false);
      fetchStudents();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to upload CSV');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await studentsAPI.delete(id);
        fetchStudents();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete student');
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
            <div className="flex justify-between items-center mb-6 gap-2">
              <h1 className="text-3xl font-bold text-gray-900">Students</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowForm(!showForm);
                    setUploadMode(false);
                  }}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={20} />
                  Add Student
                </button>
                <button
                  onClick={() => {
                    setUploadMode(!uploadMode);
                    setShowForm(false);
                  }}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Upload size={20} />
                  Upload CSV
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {showForm && (
              <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">USN</label>
                    <input
                      type="text"
                      name="usn"
                      className="input"
                      placeholder="1PG20CS001"
                      value={formData.usn}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="full_name"
                      className="input"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      className="input"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course ID</label>
                    <input
                      type="number"
                      name="course_id"
                      className="input"
                      value={formData.course_id}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                    <input
                      type="number"
                      name="semester"
                      className="input"
                      value={formData.semester}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="flex gap-2 md:col-span-2">
                    <button type="submit" className="btn-primary">Add Student</button>
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

            {uploadMode && (
              <div className="card mb-6">
                <h2 className="text-xl font-semibold mb-4">Upload Students from CSV</h2>
                <form onSubmit={handleFileUpload}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">CSV File</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="input"
                      required
                    />
                    <p className="text-gray-600 text-sm mt-2">
                      Format: usn, full_name, email, course_code, semester
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button type="submit" className="btn-primary">Upload CSV</button>
                    <button
                      type="button"
                      onClick={() => setUploadMode(false)}
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
                <p className="text-gray-600">Loading students...</p>
              </div>
            ) : students.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">No students found. Add one to get started!</p>
              </div>
            ) : (
              <div className="table-responsive card">
                <table>
                  <thead>
                    <tr>
                      <th>USN</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Course</th>
                      <th>Semester</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(student => (
                      <tr key={student.id}>
                        <td>{student.usn}</td>
                        <td>{student.full_name}</td>
                        <td>{student.email}</td>
                        <td>{student.course_code}</td>
                        <td>{student.semester}</td>
                        <td>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
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
