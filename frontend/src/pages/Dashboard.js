import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [predictions, setPredictions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => { fetchStudents(); }, []);

    const fetchStudents = async () => {
        try {
            const response = await axiosInstance.get('students/');
            setStudents(response.data);
        } catch (err) {
            setError('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            try {
                await axiosInstance.delete(`students/${id}/delete/`);
                setStudents(students.filter(s => s.id !== id));
                const newPreds = { ...predictions };
                delete newPreds[id];
                setPredictions(newPreds);
            } catch (err) {
                setError('Failed to delete student');
            }
        }
    };

    const handlePredict = async (id) => {
        try {
            const response = await axiosInstance.post(`predict/${id}/`);
            setPredictions(prev => ({ ...prev, [id]: response.data }));
        } catch (err) {
            setError('Failed to get prediction');
        }
    };

    const handleLogout = () => { logout(); navigate('/login'); };

    const passCount = Object.values(predictions).filter(p => p.result === 'Pass').length;
    const failCount = Object.values(predictions).filter(p => p.result === 'Fail').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white border-b border-gray-200 px-6 py-3.5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                    <span className="font-semibold text-gray-800">Student Predictor</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">Welcome, <span className="font-medium text-gray-700">{user?.username}</span></span>
                    <button onClick={handleLogout} className="text-sm bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors">
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { label: 'Total students', value: students.length, color: 'text-gray-900' },
                        { label: 'Predicted pass', value: passCount, color: 'text-green-600' },
                        { label: 'At risk', value: failCount, color: 'text-red-600' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
                            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                            <p className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                        <h2 className="font-semibold text-gray-800">Students</h2>
                        <button
                            onClick={() => navigate('/students/add')}
                            className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            + Add student
                        </button>
                    </div>

                    {error && (
                        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="px-6 py-12 text-center text-gray-400 text-sm">Loading students...</div>
                    ) : students.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray-400 text-sm">
                            No students yet. Click "Add student" to get started.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-xs text-gray-400 uppercase tracking-wide">
                                    <th className="text-left px-6 py-3 font-medium">Name</th>
                                    <th className="text-left px-6 py-3 font-medium">Study hours</th>
                                    <th className="text-left px-6 py-3 font-medium">Attendance</th>
                                    <th className="text-left px-6 py-3 font-medium">Prev. grade</th>
                                    <th className="text-left px-6 py-3 font-medium">Prediction</th>
                                    <th className="text-left px-6 py-3 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-800">{student.name}</td>
                                        <td className="px-6 py-4 text-gray-600">{student.study_hours}h</td>
                                        <td className="px-6 py-4 text-gray-600">{student.attendance}%</td>
                                        <td className="px-6 py-4 text-gray-600">{student.previous_grade}%</td>
                                        <td className="px-6 py-4">
                                            {predictions[student.id] ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    predictions[student.id].result === 'Pass'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {predictions[student.id].result} · {predictions[student.id].confidence}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-300 text-xs">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => navigate(`/students/edit/${student.id}`)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">Edit</button>
                                                <button onClick={() => handlePredict(student.id)} className="text-green-600 hover:text-green-700 text-xs font-medium">Predict</button>
                                                <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-600 text-xs font-medium">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;