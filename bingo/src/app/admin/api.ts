import { Question} from '../models/models';

export const addQuestion = async (
    apiUrl: string, question: Question
): Promise<Question> => {

    try {
        // Make the network request to the provided URL
        const body = JSON.stringify(question);
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        const response = await fetch(apiUrl + "/questions", {
            method: 'POST',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);

        }

        const data: Question = await response.json();

        console.log('Data fetched successfully!');
        return data;
    } catch (error) {
        // Log and re-throw the error for the calling code to handle
        console.error('Failed to fetch bingo data:', error);
        throw error;
    }
};
