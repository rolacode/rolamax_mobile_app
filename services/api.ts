export const TMDB_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
       accept: 'application/json',
       // Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`
    }
}

export const fetchMovies = async ({ query }: { query: string }) => {
    const endPoint = query
        ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&api_key=${TMDB_CONFIG.API_KEY}`
        : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&api_key=${TMDB_CONFIG.API_KEY}`;

    const response = await fetch(endPoint, {
        method: 'GET',
        headers: TMDB_CONFIG.headers,
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(`Failed to fetch movies: ${errorMsg}`);
    }

    const data = await response.json();
    return data.results;
};


export const fetchMovieDetails = async (movieId: string): Promise<MovieDetails> => {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
            {
                method: 'GET',
                headers: TMDB_CONFIG.headers,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch movie details');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
