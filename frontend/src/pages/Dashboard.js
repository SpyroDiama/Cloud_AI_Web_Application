import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axiosInstance from '../api/axios';

const Dashboard = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

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
            } catch (err) {
                setError('Failed to delete student');
            }
        }
    };

    const handlePredict = async (id) => {
        try {
            const response = await axiosInstance.post(`predict/${id}/`);
            alert(`Prediction: ${response.data.result} (Confidence: ${(response.data.confidence * 100).toFixed(1)}%)`);
        } catch (err) {
            setError('Failed to get prediction');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Navbar */}
            <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-blue-600">Student Predictor</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600 text-sm">Welcome, {user?.username}</span>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                    >
                        Logout
                    </button>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Students</h2>
                    <button
                        onClick={() => navigate('/students/add')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                        + Add Student
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Table */}
                {loading ? (
                    <p className="text-gray-500">Loading students...</p>
                ) : students.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                        No students yet. Click "Add Student" to get started.
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Study Hours</th>
                                    <th className="px-6 py-3">Attendance %</th>
                                    <th className="px-6 py-3">Previous Grade</th>
                                    <th className="px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            {student.name}
                                        </td>
                                        <td className="px-6 py-4">{student.study_hours}</td>
                                        <td className="px-6 py-4">{student.attendance}%</td>
                                        <td className="px-6 py-4">{student.previous_grade}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/students/edit/${student.id}`)}
                                                    className="text-blue-600 hover:underline text-xs"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handlePredict(student.id)}
                                                    className="text-green-600 hover:underline text-xs"
                                                >
                                                    Predict
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="text-red-600 hover:underline text-xs"
                                                >
                                                    Delete
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
        </div>
    );
};

export default Dashboard;