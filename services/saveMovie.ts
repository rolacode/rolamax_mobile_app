import axios from 'axios';

const BACKEND_URL = 'http://192.168.132.114:5000/api'; // Ensure this is correct

interface MovieDetailsData { // Add this interface if not already defined for use in saveMovie
    id: number;
    title: string;
    poster_path: string | null;
    overview?: string | null;
    release_date?: string;
}

interface MovieSavePayload {
    movie_id: number;
    title: string;
    poster_url?: string;
    overview?: string | null;
    release_date?: string;
}

interface SavedMovieDoc {
    _id: string; // MongoDB _id
    user: string;
    movie_id: number;
    title: string;
    poster_url?: string;
    overview?: string;
    release_date?: string;
    createdAt: string;
    updatedAt: string;
}

export const getSavedMovies = async (token: string): Promise<SavedMovieDoc[]> => {
    try {
        const response = await axios.get(`${BACKEND_URL}/savedMovie`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        // This is CRITICAL: Ensure an array is always returned
        return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.error('Error in getSavedMovies service:', error);
        // This is also CRITICAL: Always return an empty array on service error
        // to prevent `find` being called on `undefined` on the frontend.
        return [];
    }
};

export const saveMovie = async (movieData: MovieDetailsData, token: string): Promise<SavedMovieDoc> => {
    try {
        const payload: MovieSavePayload = {
            movie_id: movieData.id,
            title: movieData.title,
            poster_url: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : undefined,
            overview: movieData.overview,
            release_date: movieData.release_date,
        };

        console.log("Saving movie payload:", payload); // Debug: Check payload before sending

        const response = await axios.post(`${BACKEND_URL}/savedMovie/saved`, payload, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        });

        // *** CRITICAL FIX: Explicitly check response.data and its _id ***
        if (response.data && response.data._id) {
            console.log("Backend save response data:", response.data); // Debug: See what backend sends
            return response.data; // Return the saved movie document with its _id
        } else {
            console.error("Save movie response missing _id or data:", response.data);
            throw new Error('Backend did not return a valid saved movie object.');
        }

    } catch (error: any) {
        console.error('Error in saveMovie service:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to save movie on backend.');
        }
        throw new Error('Network error or unexpected issue while saving movie.');
    }
};

// @desc    Delete a saved movie
export const deleteSavedMovie = async (savedDocId: string, token: string): Promise<void> => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/savedMovie/saved/${savedDocId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        if (response.status !== 200) {
            throw new Error(response.data.message || 'Failed to delete movie on backend.');
        }
    } catch (error: any) {
        console.error('Error in deleteSavedMovie service:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response.data.message || 'Failed to delete movie.');
        }
        throw new Error('Network error or unexpected issue while deleting movie.');
    }
};