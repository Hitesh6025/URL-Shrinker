import "dotenv/config"
import { Request, Response } from 'express';
import { getClicksByDate, getDeviceStats, getOverallStats, getTopicStats, getTotalClicks, getUniqueUsers } from "../services/analytics";
import { findLongUrl } from "../services/urlService";
import { findUserByEmail, getUserId } from "../services/userService";
import { redis } from "../config/redis";

const handleAnalytics = async (req: Request, res: Response) => {
    try {
        const alias = req.params.alias
        if (!alias) {
            res.status(400).json({ message: "No short_url provided in the params" })
            return
        }

        let analytics_stats = {}
        const redis_analytics_lookup = await redis.get(`${alias}_analytics`)

        if (redis_analytics_lookup) {
            console.log("[SERVER] Found in Redis Cache, skipping Database Lookup")
            analytics_stats = JSON.parse(redis_analytics_lookup)
        }
        else {
            console.log("[SERVER] Not Found in Redis Cache, Fetching from Database")
            const short_url_exists = await findLongUrl(alias);
            if (!short_url_exists.success) {
                res.status(404).json({ message: "Short URL not found" })
                return
            }

            const totalClicks = await getTotalClicks(alias)
            const uniqueUsers = await getUniqueUsers(alias)
            const clicksByDate = await getClicksByDate(alias)
            const stats = await getDeviceStats(alias)
            const osType = stats?.osData
            const deviceType = stats?.deviceData

            analytics_stats = { totalClicks, uniqueUsers, clicksByDate, osType, deviceType }
            await redis.set(`${alias}_analytics`, JSON.stringify(analytics_stats), 'EX', 60 * 60 * 24) // 24 hours
        }
        // console.log({
        //     total_clicks,
        //     unique_users,
        //     clicks_by_date,
        // })
        // console.log(stats?.osData)
        // console.log(stats?.deviceData)

        res.status(200).json(analytics_stats)
        console.log("[SERVER] Analytics Data sent ✔️")
    }
    catch (error) {
        console.log("[SERVER] Error handling Analytics :", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const handleTopicAnalytics = async (req: Request, res: Response) => {
    try {
        const topic = req.params.topic
        if (!topic) {
            res.status(400).json({ message: "No short_url provided in the params" })
            return
        }

        let topic_stats = {}
        const redis_topic_analytics_lookup = await redis.get(`${topic}_topic_analytics`)

        if (redis_topic_analytics_lookup) {
            console.log("[SERVER] Found in Redis Cache, skipping Database Lookup")
            topic_stats = JSON.parse(redis_topic_analytics_lookup)
        }
        else {
            console.log("[SERVER] Not Found in Redis Cache, Fetching from Database")
            const topic_data = await getTopicStats(topic);
            if (topic_stats === 0) {
                res.status(404).json({ message: "Topic stats not found" })
                return
            }

            topic_stats = topic_data
            await redis.set(`${topic}_topic_analytics`, JSON.stringify(topic_stats), 'EX', 60 * 60 * 24) // 24 hours
        }

        res.status(200).json(topic_stats)
        console.log("[SERVER] Topic Analytics Data sent ✔️")

    }
    catch (error) {
        console.log("[SERVER] Error handling Topic Analytics :", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

const handleOverallAnalytics = async (req: Request, res: Response) => {
    try {
        const user = req.user as { email?: string }; // Type-casting the payload
        const userEmail = user?.email;
        if (!userEmail) {
            res.status(400).json({ message: 'User email not found in token' });
            return;
        }

        let overall_stats = {}
        const redis_overall_analytics_lookup = await redis.get(`${userEmail}_overall`)

        if (redis_overall_analytics_lookup) {
            console.log("[SERVER] Found in Redis Cache, skipping Database Lookup")
            overall_stats = JSON.parse(redis_overall_analytics_lookup)
        }
        else {
            console.log("[SERVER] Not Found in Redis Cache, Fetching from Database")
            const user_id = await getUserId(userEmail)
            if (!user_id.success) {
                res.status(404).json({ message: user_id.message })
                return
            }

            const overall_data = await getOverallStats(user_id.data!)
            if (overall_data === 0) {
                res.status(404).json({ message: "Overall stats not found" })
                return
            }

            overall_stats = overall_data
            await redis.set(`${userEmail}_overall`, JSON.stringify(overall_stats), 'EX', 60 * 60 * 24) // 24 hours
        }

        res.status(200).json(overall_stats)
        console.log("[SERVER] Overall Analytics sent for user :", userEmail)

    }
    catch (error) {
        console.log("[SERVER] Error handling Overall Analytics :", error)
        res.status(500).json({ message: "Internal Server Error" })
    }
}

export { handleAnalytics, handleTopicAnalytics, handleOverallAnalytics }
