// services/api.ts (or services/movies.ts)
const BACKEND_URL = 'http://192.168.132.114:5000/api';

export const getTrendingMovies = async () => {
    const res = await fetch(`${BACKEND_URL}/movie/trending`);
    if (!res.ok) throw new Error('Failed to fetch trending movies');
    return res.json();
};
