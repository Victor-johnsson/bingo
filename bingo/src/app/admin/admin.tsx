'use client';
import nextConfig from '../../../next.config';
import { Question } from '../models/models';
import React, { useState, useEffect } from 'react';
import { addQuestion } from './api';




const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const question = formData.get('question') as string;
    console.log("Name: ", name);
    console.log("Question: ", question);

    const apiUrl = nextConfig.env?.VITE_API_BASE_URL;

    const response = await addQuestion(apiUrl!.toString(), {
        Name: name,
        Question: question,
        Answered: false,
    });
    console.log("Response: ", response);
};
// The QuestionGrid component now handles data fetching and state
export const QuestionForm: React.FC = () => {
    // State for the component
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // useEffect hook to hide the success message after 5 seconds
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                setSuccess(false);
            }, 5000);
            // Cleanup function to clear the timer if the component unmounts
            return () => clearTimeout(timer);
        }
    }, [success]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const question = formData.get('question') as string;

        try {
            const apiUrl = nextConfig.env?.VITE_API_BASE_URL;
            if (!apiUrl) {
                throw new Error('API URL is not configured.');
            }

            const response = await addQuestion(apiUrl.toString(), {
                Name: name,
                Question: question,
                Answered: false,
            });

            console.log('Response: ', response);
            setSuccess(true);
            (e.target as HTMLFormElement).reset(); // Reset form fields on success
        } catch (err: any) {
            const errorMessage =
                err.message || 'An unexpected error occurred. Please try again.';
            setError(errorMessage);
            console.error('Submission Error: ', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-xl rounded-xl bg-white p-8 shadow-2xl dark:bg-gray-800">
            <h2 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
                Ask a Question
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Your Name
                    </label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        disabled={loading}
                        className="block w-full rounded-md border-gray-300 bg-gray-50 p-3 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        placeholder="e.g., Jane Doe"
                    />
                </div>
                <div>
                    <label
                        htmlFor="question"
                        className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Your Question
                    </label>
                    <textarea
                        id="question"
                        name="question"
                        rows={4}
                        required
                        disabled={loading}
                        className="block w-full rounded-md border-gray-300 bg-gray-50 p-3 text-gray-900 shadow-sm transition focus:border-indigo-500 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                        placeholder="What would you like to know?"
                    ></textarea>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-base font-medium text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-400 dark:focus:ring-offset-gray-800"
                    >
                        {loading ? 'Submitting...' : 'Submit Question'}
                    </button>
                </div>
            </form>

            {/* Success Message */}
            {success && (
                <div
                    className="mt-4 rounded-md bg-green-100 p-4 text-center text-sm font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
                    role="alert"
                >
                    <p>Your question has been submitted successfully!</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div
                    className="mt-4 rounded-md bg-red-100 p-4 text-center text-sm font-medium text-red-800 dark:bg-red-900 dark:text-red-200"
                    role="alert"
                >
                    <p>{error}</p>
                </div>
            )}
        </div>
    );
};
