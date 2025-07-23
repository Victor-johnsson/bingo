'use client';
import { updateSquare, fetchBingoData } from './api';
import { Question } from '../../models/models';
import React, { useState, useEffect } from 'react';
import nextConfig from '../../../../next.config';

// --- TYPE DEFINITIONS ---


// 3. Type for the data our component uses (camelCase)

interface SquareProps {
    data: Question;
    onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ data, onClick }) => {
    // REMOVED `w-48` to allow the grid to control the width for better responsiveness.
    const baseClasses =
        'h-48 p-4 rounded-lg border shadow-md flex flex-col justify-between cursor-pointer transition-transform hover:scale-105';
    const statusClasses = data.Answered
        ? 'bg-green-100 border-green-300 text-green-800'
        : 'bg-yellow-100 border-yellow-400 text-yellow-800';

    return (
        <div className={`${baseClasses} ${statusClasses}`} onClick={onClick}>
            <div>
                <h3 className="font-bold text-lg">{data.Name}</h3>
                <p className="text-sm mt-1">{data.Question}</p>
            </div>
            <p className="text-xs font-semibold">
                Status: {data.Answered ? 'Answered' : 'Not Answered'}
            </p>
        </div>
    );
};

// The QuestionGrid component now handles data fetching and state
export const QuestionGrid: React.FC = () => {
    // State for the component
    const [questions, setQuestions] = useState<Question[]>([]);
    const [boardTitle, setBoardTitle] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // useEffect hook to fetch data when the component mounts
    useEffect(() => {
        const loadData = async () => {
            try {
                const apiUrl = nextConfig.env?.VITE_API_BASE_URL;
                console.log(apiUrl);
                const response = await fetchBingoData(apiUrl!.toString());
                // Transform the API data (PascalCase) to our component data (camelCase)
                const transformedSquares = response.Squares.slice(0, 25).map((square) => ({
                    Name: square.Name,
                    Question: square.Question,
                    Answered: square.Answered,
                }));
                setQuestions(transformedSquares);
                setBoardTitle(response.Name);
            } catch (err) {
                setError('Failed to fetch bingo board data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []); // The empty array [] means this effect runs only once

    const handleSquareClick = async (clickedIndex: number) => {
        const clickedQuestion = questions[clickedIndex];
        console.log("Question: ", clickedQuestion);
        const apiUrl = nextConfig.env?.VITE_API_BASE_URL;

        const response = await updateSquare(apiUrl!.toString(), clickedQuestion);

        const transformedSquares = response.Squares.slice(0, 25).map((square) => ({
            Name: square.Name,
            Question: square.Question,
            Answered: square.Answered,
        }));
        setQuestions(transformedSquares);

    };

    // Conditional Rendering
    if (loading) {
        return <div className="text-center p-10">Loading Bingo Board...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">{boardTitle}</h1>
            {/* Use a flex container to center the grid on the page */}
            <div className="flex justify-center">
                {/* This div creates the 5x5 grid structure */}
                <div className="grid grid-cols-5 gap-4">
                    {questions.map((question, index) => (
                        <Square
                            key={question.Name}
                            data={question}
                            onClick={() => handleSquareClick(index)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
