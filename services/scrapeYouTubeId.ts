import axios from 'axios';
import cheerio from 'cheerio-without-node-native';
import type { Element } from 'domhandler'; // 👈 FIXED type import

export const scrapeBestYouTubeId = async (query: string): Promise<string | null> => {
    try {
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}+full+movie`;
        const { data } = await axios.get(searchUrl);

        const $ = cheerio.load(data);

        const initialDataScript = $('script')
            .filter(function (this: Element, _i: number, _el: Element): boolean {
                const content = $(this).html();
                return !!content && content.includes('var ytInitialData');
            })
            .first()
            .html();

        if (!initialDataScript) return null;

        const jsonText = initialDataScript.split(' = ')[1]?.replace(/;$/, '');
        if (!jsonText) return null;

        const ytData = JSON.parse(jsonText);

        const contents = ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents;

        const firstVideoRenderer = contents?.flatMap((section: any) =>
            section?.itemSectionRenderer?.contents || []
        ).find((item: any) => item?.videoRenderer);

        const videoId = firstVideoRenderer?.videoRenderer?.videoId;

        return videoId || null;
    } catch (error) {
        console.error('❌ YouTube scraping failed:', error);
        return null;
    }
};
