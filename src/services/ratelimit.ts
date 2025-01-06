import { db } from "../config/database";
import { rateLimits } from "../models/urlModel";
import { eq } from "drizzle-orm";
import { CommonResult } from "../types/types";

const MAX_URL_CREATION = 10;

const handleRateLimit = async (user_id: number): Promise<CommonResult> => {
    // implementing rate limit logic
    try {

        const rateLimitEntries = await db.select().from(rateLimits).where(eq(rateLimits.user_id, user_id));
        // console.log("ratelimit:", rateLimit.length <= 0)

        if (rateLimitEntries.length <= 0) {
            console.log("[DATABASE] Setting up new Rate-Limit Entries for User ID:", user_id)
            const rateLimitData = await db.insert(rateLimits).values({ user_id }).returning();
            return {
                success: true, message: `New Rate Limit Entries created for the user ${user_id}`, data: rateLimitData[0]
            }
        }
        if (rateLimitEntries.length > 0) {
            const now = new Date()
            const resetTime = new Date(rateLimitEntries[0].last_reset!.getTime() + 24 * 60 * 60 * 1000)
            // console.log("now vs reset time compare: ", now > resetTime)

            if (now >= resetTime) {
                const data = await db.update(rateLimits).set({ url_creation_count: 0, last_reset: now }).where(eq(rateLimits.user_id, user_id)).returning();
                console.log("[DATABASE] Rate Limit Reset ✔️ , for user ID:", user_id)
                console.table(data[0])
                return {
                    success: true,
                    message: "Rate limit reset successfully",
                    data: data[0]
                }
            }
            if (rateLimitEntries[0].url_creation_count! >= MAX_URL_CREATION) {
                console.log("[DATABASE] Aborting Query ✖️ , MAX_URL_CREATION limit exceeded")
                return {
                    success: false,
                    message: `Rate limit exceeded. You can only create ${MAX_URL_CREATION} short URLs per 24hr. Try again after ${resetTime}!.`,
                }

            }
        }

        return {
            success: true, message: "Rate limit not exceeded", data: rateLimitEntries[0]
        }
    }
    catch (error) {
        console.error("[DATABASE] Error Handling Rate Limit:", error);
        return {
            success: false,
            message: "Error Handling Rate Limit"
        }
    }
}

const updateRateLimit = async (user_id: number, rateLimit) => {
    try {
        await db.update(rateLimits).set({ url_creation_count: rateLimit.url_creation_count! + 1 }).where(eq(rateLimits.user_id, user_id));
        console.log("[DATABASE] Rate Limit Entries Updated ✔️ , for user ID:", user_id)
    }
    catch (error) {
        console.error("[DATABASE] Error Updating Rate Limit:", error);
    }
}

export { handleRateLimit, updateRateLimit };
