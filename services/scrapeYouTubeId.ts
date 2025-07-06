import axios from 'axios';

const BACKEND_URL = 'http://192.168.132.114:5000/api'; // Ensure this is correct

// *** CRITICAL FIX: Add 'token' as a parameter to the function ***
export const scrapeBestYouTubeId = async (query: string, token: string): Promise<string | null> => {
    try {
        const response = await axios.post(
            `${BACKEND_URL}/search/scrape-youtube`, // Ensure this URL is correct as per your backend routes
            { query },
            { // *** CRITICAL FIX: Add headers with Authorization token ***
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Send the authentication token here
                },
            }
        );

        // ... (rest of the logic for handling response.data)
        if (response.data && response.data.videoId) {
            return response.data.videoId;
        } else {
            console.warn('Backend found no suitable YouTube video for query:', query, response.data.message);
            throw new Error(response.data.message || 'No suitable full movie found on YouTube for the given query.');
        }

    } catch (error: any) {
        console.error('Error in scrapeBestYouTubeId service:', error);
        if (axios.isAxiosError(error) && error.response) {
            // This is where the backend's "Not authorized, token missing" message will be caught
            throw new Error(error.response.data.message || 'YouTube scraping failed on backend.');
        }
        throw new Error('Network error or unexpected issue during YouTube scraping.');
    }
};