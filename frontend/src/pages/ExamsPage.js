import React, { useState, useEffect } from 'react';
import { examsAPI } from '../api/client';
import { Header, Sidebar } from '../components/Layout';
import { Plus, Edit2, Trash2, AlertCircle } from 'lucide-react';

export const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    exam_date: '',
    exam_time_start: '',
    exam_time_end: '',
    subject_code: '',
    subject_name: '',
    course_id: '',
    semester: '',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await examsAPI.getAll();
      setExams(response.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch exams');
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
      await examsAPI.create(formData);
      setFormData({
        exam_date: '',
        exam_time_start: '',
        exam_time_end: '',
        subject_code: '',
        subject_name: '',
        course_id: '',
        semester: '',
      });
      setShowForm(false);
      fetchExams();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create exam');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await examsAPI.delete(id);
        fetchExams();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete exam');
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
              <h1 className="text-3xl font-bold text-gray-900">Exams</h1>
              <button
                onClick={() => setShowForm(!showForm)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                New Exam
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
                <h2 className="text-xl font-semibold mb-4">Create New Exam</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      name="exam_date"
                      className="input"
                      value={formData.exam_date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                      type="time"
                      name="exam_time_start"
                      className="input"
                      value={formData.exam_time_start}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                      type="time"
                      name="exam_time_end"
                      className="input"
                      value={formData.exam_time_end}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Code</label>
                    <input
                      type="text"
                      name="subject_code"
                      className="input"
                      value={formData.subject_code}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject Name</label>
                    <input
                      type="text"
                      name="subject_name"
                      className="input"
                      value={formData.subject_name}
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
                    <button type="submit" className="btn-primary">Create Exam</button>
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
                <p className="text-gray-600">Loading exams...</p>
              </div>
            ) : exams.length === 0 ? (
              <div className="card text-center py-12">
                <p className="text-gray-600">No exams found. Create one to get started!</p>
              </div>
            ) : (
              <div className="table-responsive card">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Subject</th>
                      <th>Course</th>
                      <th>Time</th>
                      <th>Semester</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.map(exam => (
                      <tr key={exam.id}>
                        <td>{new Date(exam.exam_date).toLocaleDateString()}</td>
                        <td>{exam.subject_name}</td>
                        <td>{exam.course_name}</td>
                        <td>{exam.exam_time_start} - {exam.exam_time_end}</td>
                        <td>{exam.semester}</td>
                        <td>
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                            {exam.status}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(exam.id)}
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
