import axios from 'axios';
import { db } from '../config/database'
import { urlLogs } from '../models/logsModel';
import { desc, eq, sql, between, and } from 'drizzle-orm';
import { UAParser } from 'ua-parser-js';
import { CommonResult } from '../types/types';
import { shortUrls } from '../models/urlModel';

const fetchGeoLocation = async (ip: string): Promise<any> => {
    try {
        const response = await axios.get(`https://ip-api.com/json/${ip}`);
        return response.data; // Returns geolocation data
    } catch (error) {
        console.error("[GeoLocation] Failed to fetch geolocation data:", error);
        return { error: "Geolocation not available" };
    }
};

const createLogs = async (ip_address: string, user_agent: string, short_url: string) => {
    try {
        // Fetch geolocation data using an API
        await db.insert(urlLogs).values({ ip_address, user_agent, short_url })
        console.log("[DATABASE] Logs created successfully ✔️");
        // console.log("[GeoLocation] Geolocation Data:", geolocation);
    } catch (error) {
        console.error("[DATABASE] Error handling logs:", error);
    }
}

const getTotalClicks = async (short_url: string) => {
    try {
        const results = await db.select().from(urlLogs).where(eq(urlLogs.short_url, short_url));
        return results.length;
    } catch (error) {
        console.error("[DATABASE] Error fetching total clicks:", error);
        return 0;
    }
}

const getUniqueUsers = async (short_url: string) => {
    try {
        const results = await db.selectDistinct({ ip: urlLogs.ip_address }).from(urlLogs).where(eq(urlLogs.short_url, short_url));
        return results.length;
    } catch (error) {
        console.error("[DATABASE] Error fetching unique users:", error);
        return 0;
    }
}

const getClicksByDate = async (short_url: string) => {
    try {
        const db_results = await db.select().from(urlLogs).where(and(between(urlLogs.created_at, sql`now() - interval '7 days'`, sql`now()`), eq(urlLogs.short_url, short_url))).orderBy(desc(urlLogs.created_at))
        // console.log(results)
        const result = db_results.reduce((acc: { date: string; totalClicks: number }[], log) => {
            const date = log.created_at!.toISOString().split('T')[0]; // Extract the date
            const existing = acc.find((item) => item.date === date);

            if (existing) {
                existing.totalClicks += 1; // Increment the count
            } else {
                acc.push({ date, totalClicks: 1 }); // Add a new entry
            }

            return acc;
        }, []);

        return result;

    } catch (error) {
        console.error("[DATABASE] Error fetching clicks by date:", error);
        return 0;
    }
}

const getDeviceStats = async (short_url: string) => {
    try {

        const db_results = await db.select().from(urlLogs).where(eq(urlLogs.short_url, short_url))
        const parser = new UAParser();
        const osMap = new Map();
        const deviceMap = new Map();

        db_results.forEach(log => {
            // Parse the OS from user_agent
            const osName = parser.setUA(log.user_agent!).getOS().name || 'Unknown';
            const deviceType = parser.setUA(log.user_agent!).getDevice().type || 'desktop';

            if (!osMap.has(osName)) {
                osMap.set(osName, { osName, uniqueClicks: new Set(), uniqueUsers: new Set() });
            }
            if (!deviceMap.has(deviceType)) {
                deviceMap.set(deviceType, { deviceName: deviceType, uniqueClicks: new Set(), uniqueUsers: new Set() });
            }

            const osData = osMap.get(osName);
            osData.uniqueClicks.add(log.id);
            osData.uniqueUsers.add(log.ip_address);

            const deviceData = deviceMap.get(deviceType);
            deviceData.uniqueClicks.add(log.short_url);
            deviceData.uniqueUsers.add(log.ip_address);
        });

        // Convert Map to array of objects
        return {
            osData:
                Array.from(osMap.values()).map(os => ({
                    osName: os.osName,
                    uniqueClicks: os.uniqueClicks.size,
                    uniqueUsers: os.uniqueUsers.size,
                })),
            deviceData:
                Array.from(deviceMap.values()).map(device => ({
                    deviceName: device.deviceName,
                    uniqueClicks: device.uniqueClicks.size,
                    uniqueUsers: device.uniqueUsers.size,
                }))
        }

    }
    catch (error) {
        console.error("[DATABASE] Error fetching clicks by date:", error);
        return {
            osData: [],
            deviceData: []
        };
    }

}

const getTopicStats = async (topic: string) => {
    try {
        const topic_exists = await db.select().from(shortUrls).where(eq(shortUrls.topic, topic))
        if (topic_exists.length <= 0) {
            return 0;
        }

        const leftjoin = await db.select().from(urlLogs).leftJoin(shortUrls, eq(shortUrls.short_url, urlLogs.short_url)).where(eq(shortUrls.topic, topic))
        // console.log(leftjoin)
        // console.log("total clicks:", leftjoin.length)
        const unique_users = new Set()
        const unique_short_urls = new Set()
        const result = leftjoin.reduce((acc: { date: string; totalClicks: number }[], log) => {
            const date = log.url_logs.created_at!.toISOString().split('T')[0]; // Extract the date
            const existing = acc.find((item) => item.date === date);

            unique_users.add(log.url_logs.ip_address)
            unique_short_urls.add(log.short_urls?.short_url)

            if (existing) {
                existing.totalClicks += 1; // Increment the count
            } else {
                acc.push({ date, totalClicks: 1 }); // Add a new entry
            }

            return acc;
        }, []);

        const result2 = leftjoin.reduce((acc: { shortUrl: string; totalClicks: number, uniqueUsers: string[] }[], log) => {
            const shortUrl = log.short_urls?.short_url!; // Extract the date
            const existing = acc.find((item) => item.shortUrl === shortUrl);
            // const existing_user = acc.find(item => item.uniqueUsers.includes(log.url_logs.ip_address!))

            // unique_users.add(log.url_logs.ip_address)
            // unique_short_urls.add(log.short_urls?.short_url)
            if (existing) {
                existing.totalClicks += 1; // Increment the count
                existing.uniqueUsers.push(log.url_logs.ip_address!)
            } else {
                acc.push({ shortUrl, totalClicks: 1, uniqueUsers: [] }); // Add a new entry
            }

            return acc;
        }, []);

        // console.log("unique users", unique_users.size)
        // console.log("date-clicks", result)
        // console.log("url-clicks", result2)
        // console.log("uu", unique_short_urls);


        return {
            totalClick: leftjoin.length,
            uniqueUsers: unique_users.size,
            clicksByDate: result,
            urls:
                Array.from(result2.values()).map(entry => {
                    // console.log(entry.shortUrl, entry.totalClicks, entry.uniqueUsers.length)
                    const shortUrl = entry.shortUrl
                    const totalClicks = entry.totalClicks
                    const uniqueUsers = new Set(entry.uniqueUsers)
                    return {
                        shortUrl, totalClicks, uniqueUsers: uniqueUsers.size
                    }
                })
        }

    }
    catch (error) {
        console.error("[DATABASE] Error fetching total clicks for a topic:", error);
        return 0
    }

}

const getOverallStats = async (user_id: number) => {
    try {

        const db_results = await db.select().from(urlLogs).leftJoin(shortUrls, eq(shortUrls.short_url, urlLogs.short_url)).where(eq(shortUrls.user_id, user_id))
        const shorturls_by_id = await db.select().from(shortUrls).where(eq(shortUrls.user_id, user_id))

        const unique_users = new Set()
        const result = db_results.reduce((acc: { date: string; totalClicks: number }[], log) => {
            const date = log.url_logs.created_at!.toISOString().split('T')[0]; // Extract the date
            const existing = acc.find((item) => item.date === date);

            unique_users.add(log.url_logs.ip_address)

            if (existing) {
                existing.totalClicks += 1; // Increment the count
            } else {
                acc.push({ date, totalClicks: 1 }); // Add a new entry
            }

            return acc;
        }, []);

        const parser = new UAParser();
        const osMap = new Map();
        const deviceMap = new Map();

        db_results.forEach(log => {
            // Parse the OS from user_agent
            const osName = parser.setUA(log.url_logs.user_agent!).getOS().name || 'Unknown';
            const deviceType = parser.setUA(log.url_logs.user_agent!).getDevice().type || 'desktop';

            if (!osMap.has(osName)) {
                osMap.set(osName, { osName, uniqueClicks: new Set(), uniqueUsers: new Set() });
            }
            if (!deviceMap.has(deviceType)) {
                deviceMap.set(deviceType, { deviceName: deviceType, uniqueClicks: new Set(), uniqueUsers: new Set() });
            }

            const osData = osMap.get(osName);
            osData.uniqueClicks.add(log.url_logs.id);
            osData.uniqueUsers.add(log.url_logs.ip_address);

            const deviceData = deviceMap.get(deviceType);
            deviceData.uniqueClicks.add(log.url_logs.short_url);
            deviceData.uniqueUsers.add(log.url_logs.ip_address);
        });

        // console.log("total urls", shorturls_by_id.length)
        // console.log("total click on all url", db_results.length)
        // console.log("unique user accessed urls", unique_users.size)
        // console.log("clicks by date", result)
        return {
            totalUrls: shorturls_by_id.length,
            totalClicks: db_results.length,
            uniqueUsers: unique_users.size,
            clicksByDate: result,
            osType:
                Array.from(osMap.values()).map(os => ({
                    osName: os.osName,
                    uniqueClicks: os.uniqueClicks.size,
                    uniqueUsers: os.uniqueUsers.size,
                })),
            deviceType:
                Array.from(deviceMap.values()).map(device => ({
                    deviceName: device.deviceName,
                    uniqueClicks: device.uniqueClicks.size,
                    uniqueUsers: device.uniqueUsers.size,
                }))
        }

    }
    catch (error) {
        console.error("[DATABASE] Error fetching overall stats:", error);
        return 0
    }
}

export { fetchGeoLocation, createLogs, getTotalClicks, getUniqueUsers, getClicksByDate, getDeviceStats, getTopicStats, getOverallStats }
