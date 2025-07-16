'use client';
import { getEnvironmentData } from "worker_threads";
import { QuestionGrid } from "./square/square";
import { fetchBingoData } from "./square/api";


const question1 = {
    name: 'History',
    question: 'Who was the first person on the moon?',
    answered: false,
};

const question2 = {
    name: 'Science',
    question: 'What is the chemical symbol for water?',
    answered: false,
};
export default function Home() {



    return (
        <div>

            <QuestionGrid  />
        </div>)
}
