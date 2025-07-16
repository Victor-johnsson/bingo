'use client';
import { fetchBingoData } from './api';
import React, { useState, useEffect } from 'react';
import nextConfig from '../../../../next.config';

// --- TYPE DEFINITIONS ---

// 1. Type for a single square from the API response
interface ApiSquare {
  Name: string;
  Question: string;
  Answered: boolean;
}

// 2. Type for the full API response
interface ApiResponse {
  Name: string;
  Category: string;
  Squares: ApiSquare[];
}

// 3. Type for the data our component uses (camelCase)
interface QuestionData {
  name: string;
  question: string;
  answered: boolean;
}

// --- COMPONENTS ---

interface SquareProps {
  data: QuestionData;
  onClick: () => void;
}

const Square: React.FC<SquareProps> = ({ data, onClick }) => {
  // REMOVED `w-48` to allow the grid to control the width for better responsiveness.
  const baseClasses =
    'h-48 p-4 rounded-lg border shadow-md flex flex-col justify-between cursor-pointer transition-transform hover:scale-105';
  const statusClasses = data.answered
    ? 'bg-green-100 border-green-300 text-green-800'
    : 'bg-yellow-100 border-yellow-400 text-yellow-800';

  return (
    <div className={`${baseClasses} ${statusClasses}`} onClick={onClick}>
      <div>
        <h3 className="font-bold text-lg">{data.name}</h3>
        <p className="text-sm mt-1">{data.question}</p>
      </div>
      <p className="text-xs font-semibold">
        Status: {data.answered ? 'Answered' : 'Not Answered'}
      </p>
    </div>
  );
};

// The QuestionGrid component now handles data fetching and state
export const QuestionGrid: React.FC = () => {
  // State for the component
  const [questions, setQuestions] = useState<QuestionData[]>([]);
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
        const transformedSquares = response.Squares.slice(0,25).map((square) => ({
          name: square.Name,
          question: square.Question,
          answered: square.Answered,
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

  const handleSquareClick = (clickedIndex: number) => {
    const newQuestions = questions.map((question, index) => {
      if (index === clickedIndex) {
        return { ...question, answered: !question.answered }; // Now it toggles!
      }
      return question;
    });
    setQuestions(newQuestions);
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
              key={question.name}
              data={question}
              onClick={() => handleSquareClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
