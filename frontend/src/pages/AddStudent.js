import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

const AddStudent = () => {
    const [form, setForm] = useState({ name: '', study_hours: '', attendance: '', previous_grade: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axiosInstance.post('students/create/', form);
            navigate('/dashboard');
        } catch (err) {
            setError('Failed to add student. Please check your inputs.');
        }
    };

    const fields = [
        { label: 'Full name', name: 'name', type: 'text', placeholder: 'e.g. John Doe', hint: null },
        { label: 'Study hours per day', name: 'study_hours', type: 'number', placeholder: 'e.g. 6', hint: '1–10 hours' },
        { label: 'Attendance', name: 'attendance', type: 'number', placeholder: 'e.g. 85', hint: 'Percentage (0–100)' },
        { label: 'Previous grade', name: 'previous_grade', type: 'number', placeholder: 'e.g. 72', hint: 'Percentage (0–100)' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    ← Back to dashboard
                </button>

                <div className="bg-white rounded-2xl border border-gray-200 p-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-1">Add student</h1>
                    <p className="text-gray-500 text-sm mb-6">Enter the student's details to generate a prediction</p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-5">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.name}>
                                <div className="flex justify-between items-baseline mb-1.5">
                                    <label className="text-sm font-medium text-gray-700">{field.label}</label>
                                    {field.hint && <span className="text-xs text-gray-400">{field.hint}</span>}
                                </div>
                                <input
                                    type={field.type}
                                    name={field.name}
                                    value={form[field.name]}
                                    onChange={handleChange}
                                    placeholder={field.placeholder}
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                                    required
                                />
                            </div>
                        ))}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                            >
                                Add student
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddStudent;