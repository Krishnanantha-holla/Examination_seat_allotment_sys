import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

// Students Tab Component
function StudentsTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [search]);

  const fetchStudents = async () => {
    try {
      const response = await api.get(`/students?search=${search}`);
      setStudents(response.data.students);
    } catch (error) {
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
      fetchStudents();
    } catch (error) {
      toast.error('Failed to delete student');
    }
  };

  if (loading) return <div className="text-center py-12">Loading...</div>;

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Students</h2>
        <input
          type="text"
          placeholder="Search by USN or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input w-64"
        />
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">USN</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {students.map((student) => (
              <tr key={student.id}>
                <td className="px-6 py-4 whitespace-nowrap font-mono">{student.usn}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{student.course?.code}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDelete(student.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// CSV Import Tab
function ImportCSVTab() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const response = await api.post('/students/import-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setResults(response.data);
      toast.success(`Imported ${response.data.success.length} students`);
      setFile(null);
    } catch (error) {
      toast.error('Failed to import CSV');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Import Students from CSV</h2>
      
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h3 className="font-semibold mb-2">CSV Format:</h3>
        <code className="text-sm">usn,name,contact,email,courseCode,examCode,subjectCodes</code>
        <p className="text-sm text-gray-600 mt-2">
          Example: 1CS21CS001,John Doe,9876543210,john@example.com,CSE,MID-SEM-2024,"MATH101,PHY101"
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="input"
          />
        </div>
        
        <button
          type="submit"
          disabled={!file || uploading}
          className="btn-primary disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload CSV'}
        </button>
      </form>

      {results && (
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">
              Successfully processed: {results.success.length}
            </h3>
          </div>
          
          {results.errors.length > 0 && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <h3 className="font-semibold text-red-800 mb-2">
                Errors: {results.errors.length}
              </h3>
              <div className="text-sm space-y-1">
                {results.errors.slice(0, 5).map((err: any, idx: number) => (
                  <div key={idx} className="text-red-700">
                    {err.row.usn}: {err.error}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Seating Planner Tab
function SeatingPlannerTab() {
  const [exams, setExams] = useState<any[]>([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exams');
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to fetch exams');
    }
  };

  const handleGenerate = async () => {
    if (!selectedExam) return;

    setGenerating(true);
    try {
      const response = await api.post('/seating/plan', {
        examId: selectedExam,
      });
      
      toast.success(`Generated seating for ${response.data.statistics.totalAssignments} students`);
      
      if (response.data.conflicts.length > 0) {
        toast(`${response.data.conflicts.length} conflicts detected`, { icon: '⚠️' });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate seating');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">Generate Seating Plan</h2>
      
      <div className="space-y-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Exam
          </label>
          <select
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            className="input"
          >
            <option value="">-- Select Exam --</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.name} - {new Date(exam.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleGenerate}
          disabled={!selectedExam || generating}
          className="btn-primary disabled:opacity-50"
        >
          {generating ? 'Generating...' : 'Generate Seating Plan'}
        </button>
      </div>
    </div>
  );
}

export default function StaffDashboard() {
  const location = useLocation();
  const tab = location.pathname.split('/')[2] || 'students';

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Staff Dashboard</h1>

        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <Link
              to="/staff/students"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'students'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Students
            </Link>
            <Link
              to="/staff/import"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'import'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Import CSV
            </Link>
            <Link
              to="/staff/seating"
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                tab === 'seating'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Seating Planner
            </Link>
          </nav>
        </div>

        <Routes>
          <Route index element={<StudentsTab />} />
          <Route path="students" element={<StudentsTab />} />
          <Route path="import" element={<ImportCSVTab />} />
          <Route path="seating" element={<SeatingPlannerTab />} />
        </Routes>
      </div>
    </Layout>
  );
}
