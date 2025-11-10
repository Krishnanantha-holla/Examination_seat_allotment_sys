import { useState, FormEvent } from 'react';
import Layout from '../components/Layout';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function StudentPage() {
  const [usn, setUsn] = useState('');
  const [loading, setLoading] = useState(false);
  const [seatInfo, setSeatInfo] = useState<any>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.get(`/seating/student?usn=${usn}`);
      setSeatInfo(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Seat information not found');
      setSeatInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Student Seat Information</h1>
          <p className="mt-2 text-gray-600">Enter your USN to view your exam seat details</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <div>
              <label htmlFor="usn" className="block text-sm font-medium text-gray-700 mb-2">
                USN (University Seat Number)
              </label>
              <input
                id="usn"
                type="text"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
                placeholder="e.g., 1CS21CS001"
                className="input"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'View Seat Details'}
            </button>
          </form>
        </div>

        {seatInfo && (
          <div className="card print:shadow-none" id="seat-ticket">
            <div className="border-b border-gray-200 pb-4 mb-6">
              <h2 className="text-2xl font-bold text-center text-primary-600">
                Examination Seat Ticket
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Student Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-700">USN</dt>
                    <dd className="mt-1 text-lg font-mono font-bold">{seatInfo.student.usn}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Name</dt>
                    <dd className="mt-1 text-lg">{seatInfo.student.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Course</dt>
                    <dd className="mt-1">{seatInfo.student.course.name}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-4">Exam Details</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Exam</dt>
                    <dd className="mt-1">{seatInfo.exam.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Date</dt>
                    <dd className="mt-1">{new Date(seatInfo.exam.date).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-700">Time</dt>
                    <dd className="mt-1">
                      {new Date(seatInfo.exam.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {' - '}
                      {new Date(seatInfo.exam.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="mt-8 p-6 bg-primary-50 rounded-lg border-2 border-primary-200">
              <h3 className="text-lg font-bold text-primary-900 mb-4">Seating Information</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-primary-700">Classroom</dt>
                  <dd className="mt-1 text-2xl font-bold text-primary-900">{seatInfo.classroom.name}</dd>
                  <dd className="text-sm text-primary-600">{seatInfo.classroom.floor}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-primary-700">Bench Number</dt>
                  <dd className="mt-1 text-2xl font-bold text-primary-900">{seatInfo.benchNumber}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-primary-700">Seat Position</dt>
                  <dd className="mt-1 text-2xl font-bold text-primary-900">{seatInfo.position}</dd>
                </div>
              </dl>
            </div>

            {seatInfo.classroom.invigilators && seatInfo.classroom.invigilators.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Invigilator</h3>
                <p className="text-gray-900">{seatInfo.classroom.invigilators[0].invigilator.name}</p>
              </div>
            )}

            <div className="mt-8 flex justify-center print:hidden">
              <button onClick={handlePrint} className="btn-primary">
                Print Seat Ticket
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded print:break-before-auto">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Please carry this seat ticket along with your ID card on the day of examination.
                Report to the examination hall at least 15 minutes before the scheduled time.
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #seat-ticket, #seat-ticket * {
            visibility: visible;
          }
          #seat-ticket {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </Layout>
  );
}
