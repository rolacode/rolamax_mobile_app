import { Client, Databases, ID, Query, Account, Storage, Models } from 'react-native-appwrite';

export type TrendingMovie = Models.Document & {
    title: string;
    poster_url: string;
    count: number;
    movie_id: number;
    searchTerm: string;
};

const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID!;
const COLLECTION1_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION1_ID!;

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!);
const database = new Databases(client);
const account = new Account(client);

// ✅ Auth Methods
export const createUser = (email: string, password: string, name: string) =>
    account.create(ID.unique(), email, password, name);

export const loginUser = (email: string, password: string) =>
    account.createEmailPasswordSession(email, password);

export const getUser = () => account.get();

export const logoutUser = (p0: string) => account.deleteSession('current');

export const updateSearchCount = async (query: string, movie: Movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', query)
        ])

        if (result.documents.length > 0) {
            const existingMovie = result.documents[0];

            await database.updateDocument(
                DATABASE_ID,
                COLLECTION_ID,
                existingMovie.$id,
                {
                    count: existingMovie.count + 1,
                }
            )
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique() , {
                searchTerm: query,
                count: 1,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,
                movie_id: movie.id,
                title: movie.title,
            })
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const getTrendingMovies = async (): Promise<TrendingMovie[] | undefined> => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);

        return result.documents as TrendingMovie[]; // ✅ now safe
    } catch (error) {
        console.log(error);
        return undefined;
    }
};
