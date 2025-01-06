import { nanoid } from 'nanoid';
import { db } from '../config/database';
import { CommonResult } from '../types/types';
import { eq } from 'drizzle-orm';
import { handleRateLimit, updateRateLimit } from '../services/ratelimit';
import { shortUrls } from '../models/urlModel';

const createShortUrl = async (user_id: number, long_url: string, topic?: string): Promise<CommonResult> => {
    try {

        const results = await handleRateLimit(user_id)

        if (!results.success) {
            console.log("[SERVER]", results.message)
            return { success: false, message: results.message };
        }

        // Check if the long URL already exists in the database
        const existing_urls = await db.select().from(shortUrls).where(eq(shortUrls.long_url, long_url));
        // const url_exists = await db.$count(shortUrls, eq(shortUrls.long_url, long_url)) > 0;
        if (existing_urls.length > 0) {
            console.log("[DATABASE] Aborting Query. URL already shortened ✖️")
            return {
                success: true,
                message: `[DATABASE] Long URL already shortened ✔️ `,
                data: { short_url: existing_urls[0].short_url, created_at: existing_urls[0].created_at },
            };
        }

        // If not found, create a new short URL
        const randomId = nanoid(6);
        const data_inseted = await db.insert(shortUrls).values({ user_id, long_url, short_url: randomId, topic }).returning();
        // increment the rate limit counter
        await updateRateLimit(user_id, results.data);

        let message: string;
        if (topic)
            message = `[DATABASE] Short URL created successfully ✔️ : ${randomId} with topic: ${topic}`;
        else
            message = `[DATABASE] Short URL created successfully ✔️ : ${randomId}`;

        console.log(message)
        return { success: true, message: message, data: { short_url: data_inseted[0].short_url, created_at: data_inseted[0].created_at }, };

    } catch (error) {
        console.error('[DATABASE] Error handling short URL:', error);
        return { success: false, message: 'Unexpected error occurred.' };
    }
};


const createAliasedShortUrl = async (
    user_id: number,
    long_url: string,
    custom_alias: string,
    topic?: string
): Promise<CommonResult> => {
    try {
        // Attempt to insert the custom alias into the database
        const data_inseted = await db.insert(shortUrls).values({ short_url: custom_alias, long_url, topic, user_id }).returning();

        let message: string;
        if (topic)
            message = `[DATABASE] Short URL created successfully ✔️ : ${custom_alias} with topic: ${topic}`
        else
            message = `[DATABASE] Short URL created successfully ✔️ : ${custom_alias}`;

        console.log(message)
        return {
            success: true,
            message: message,
            data: {
                short_url: data_inseted[0].short_url,
                created_at: data_inseted[0].created_at
            }
        };

    } catch (error: any) {
        if (error.code === '23505') { // PostgreSQL unique violation error code
            console.log("[DATABASE] Aborting Query. duplicate alias detected ✖️")
            return { success: false, message: 'Conflict detected: Custom alias already exists. Retry with a different alias' };
        } else {
            return { success: false, message: 'Unexpected error occurred.' };
        }
    }
};


const findLongUrl = async (short_url: string): Promise<CommonResult<{ long_url: string }>> => {
    try {
        const results = await db.select({ long_url: shortUrls.long_url }).from(shortUrls).where(eq(shortUrls.short_url, short_url))

        if (results.length > 0) {
            return {
                success: true,
                message: "Found corresponding short_url ✔️",
                data: { long_url: results[0].long_url }
            }
        }
        return {
            success: false,
            message: `No Matching ShortUrl found for ${short_url} , please try creating one`
        }
    }
    catch (error) {
        console.error("[DATABASE] error occurred find short url: ", error)
        return {
            success: false,
            message: 'Error while finding short_url',
        }
    }
}

export { createShortUrl, createAliasedShortUrl, findLongUrl }
