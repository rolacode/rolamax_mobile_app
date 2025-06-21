import {ID, Databases, Client, Query} from 'react-native-appwrite';

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);

const database = new Databases(client);

// Function to save movies
export const saveMovie = async (movie: any, userId: string) => {
    try {
        const res = await database.listDocuments(
            DATABASE_ID,
            COLLECTION_ID,
            [Query.equal('movie_id', movie.id), Query.equal('user_id', userId)]
        );
        if (res.total > 0) return; // Already saved

        await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            title: movie.title,
            poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
            movie_id: movie.id,
            user_id: userId, // this must match the field in your schema
            searchTerm: 'manual-save',
        });
        console.log(' Movie saved successfully');
    } catch (error) {
        console.error(' Error saving movie:', error);
    }
};
