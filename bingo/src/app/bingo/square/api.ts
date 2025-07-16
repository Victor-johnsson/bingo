// api.ts

interface Board {

    Name: string;
    Category: string;
    Squares: Question[];

}
interface Question {
  Name: string;
  Question: string;
  Answered: boolean;
}

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
    const response = await fetch(apiUrl + "/board/test");

    // Check if the request was successful (status in the 200-299 range)
    if (!response.ok) {
      // If not, throw an error with the status text
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Parse the JSON body of the response
    const data: Board = await response.json();

    console.log('Data fetched successfully!');
    return data;
  } catch (error) {
    // Log and re-throw the error for the calling code to handle
    console.error('Failed to fetch bingo data:', error);
    throw error;
  }
};

// --- Example Usage ---

// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// const BINGO_API_URL =
//   'https://api.example.com/bingo/developer-tropes'; // <-- Replace with your real URL
//
// // You can use the function with .then() and .catch()
// fetchBingoData(BINGO_API_URL)
//   .then((bingoData) => {
//     console.log('Bingo Board Name:', bingoData.Name);
//     // Now you can use the data to render your bingo board
//         return bingoData;
//   })
//   .catch((error) => {
//     console.error('An error occurred while loading the bingo board.');
//     // Handle the error, e.g., show an error message to the user
//   });
