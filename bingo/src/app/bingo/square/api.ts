// api.ts
//
import { getISOWeek } from 'date-fns';
import { Board, Question } from '../../models/models';


/**
 * Fetches bingo data from the API.
 * @param apiUrl The URL of the API endpoint to fetch data from.
 * @returns A promise that resolves with the ApiResponse.
 * @throws Will throw an error if the network request fails or the server
 * responds with an error status.
 */

export const fetchBingoData = async (
    apiUrl: string,
): Promise<Board> => {
    console.log('Fetching data from API...');

    try {
        // Make the network request to the provided URL
        const currentWeek = getISOWeek(new Date());


        const response = await fetch(apiUrl + "/board/" + currentWeek);

        // Check if the request was successful (status in the 200-299 range)
        if (!response.ok) {
            // If not, throw an error with the status text
            throw new Error(`HTTP error! Status: ${response.status}`);
        }


        // console.log("Response: ", await response.text());
        // Parse the JSON body of the response
        const data: Board = await response.json();

        console.log("Board data: ", data);
        return data;
    } catch (error) {
        // Log and re-throw the error for the calling code to handle
        console.error('Failed to fetch bingo data:', error);
        throw error;
    }
};

export const updateSquare = async (
    apiUrl: string, question: Question
): Promise<Board> => {

    try {
        // Make the network request to the provided URL
        question.Answered = true;
        const body = JSON.stringify(question);
        const headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        };
        const response = await fetch(apiUrl + "/board/test", {
            method: 'PUT',
            headers: headers,
            body: body,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);

        }

        const data: Board = await response.json();

        console.log('Data fetched successfully!');
        return data;
    } catch (error) {
        // Log and re-throw the error for the calling code to handle
        console.error('Failed to fetch bingo data:', error);
        throw error;
    }
};
