// src/services/searchHistoryService.ts
import axios from 'axios';

const BACKEND_URL = 'http://192.168.132.114:5000/api'; // Use your actual IP or env var

interface HistoryItemFromBackend {
    _id: string; // MongoDB document ID
    user: string; // User's MongoDB ID
    movie_id: number; // TMDB movie ID
    title: string;
    poster_url?: string;
    timestamp: string; // ISO string date
}

/**
 * Logs a movie watch event to the user's search/watch history via the backend.
 * This is the function that was missing.
 * @param movieData The movie details to log.
 * @param token The user's JWT authentication token.
 * @throws An error if logging fails.
 */
export const logSearchHistory = async (movieData: { movie_id: number; title: string; poster_url?: string }, token: string) => {
    try {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

        // This endpoint should be POST /api/search-log as per your backend routes
        const response = await axios.post(`${BACKEND_URL}/search/search-log`, movieData, config);

        console.log('✅ Movie watch logged successfully:', response.data.message);
        return response.data;
    } catch (error) {
        console.error('❌ Error logging movie watch:', error);
        if (axios.isAxiosError(error) && error.response) {
            console.error('Backend Error Response:', error.response.data);
            throw new Error(error.response.data.message || 'Failed to log movie watch.');
        } else {
            throw new Error('An unexpected error occurred while logging movie watch');
        }
    }
};


export const getWatchHistory = async (token: string): Promise<HistoryItemFromBackend[]> => {
    try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const response = await axios.get(`${BACKEND_URL}/search/search-history`, config);
        return response.data.history; // Make sure this matches your backend response structure
    } catch (error) {
        console.error('Error fetching watch history:', error);
        throw error;
    }
};

export const deleteWatchHistoryItem = async (id: string, token: string) => {
    try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const response = await axios.delete(`${BACKEND_URL}/search/search-history/${id}`, config);
        return response.data;
    } catch (error) {
        console.error('Error deleting watch history item:', error);
        throw error;
    }
};

export const clearAllWatchHistory = async (token: string) => {
    try {
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        const response = await axios.delete(`${BACKEND_URL}/search/search-history/clear`, config);
        return response.data;
    } catch (error) {
        console.error('Error clearing all watch history:', error);
        throw error;
    }
};