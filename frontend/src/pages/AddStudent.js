import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const AddStudent = () => {
    const [form, setForm] = useState({
        name: '',
        study_hours: '',
        attendance: '',
        previous_grade: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('students/create/', form);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to add student. Please check your inputs.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Add Student</h2>
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    {[
                        { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. John Doe' },
                        { label: 'Study Hours (per day)', name: 'study_hours', type: 'number', placeholder: 'e.g. 6' },
                        { label: 'Attendance (%)', name: 'attendance', type: 'number', placeholder: 'e.g. 85' },
                        { label: 'Previous Grade (%)', name: 'previous_grade', type: 'number', placeholder: 'e.g. 72' },
                    ].map((field) => (
                        <div className="mb-4" key={field.name}>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.name}
                                value={form[field.name]}
                                onChange={handleChange}
                                placeholder={field.placeholder}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                    ))}
                    <div className="flex gap-3 mt-6">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Add Student
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddStudent;