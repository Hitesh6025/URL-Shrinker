import express from 'express';
import { authenticateJWT } from '../middleware/authMiddleware';
import { handleAnalytics, handleOverallAnalytics, handleTopicAnalytics } from '../controllers/analyticsController';

const router = express.Router()

// router.use(authenticateJWT)

router.get('/analytics/overall', authenticateJWT, handleOverallAnalytics)
router.get('/analytics/:alias', handleAnalytics)
router.get('/analytics/topic/:topic', handleTopicAnalytics)

export default router;




// -----------------------------------------------------------------------------------------------------
// swagger docs
// -----------------------------------------------------------------------------------------------------

export const analyticsDoc = {

    '/api/analytics/{alias}': {
        get: {
            summary: 'Retrieve detailed analytics for a specific short URL',
            description: 'This endpoint provides insights into the performance of a specific short URL, including total clicks, unique user interactions, clicks by date, and analytics by operating system and device type.',
            tags: ['Analytics'],
            parameters: [
                {
                    name: 'alias',
                    in: 'path',
                    required: true,
                    description: 'The alias of the short URL for which analytics are being retrieved.',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Analytics data for the specified short URL.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    totalClicks: {
                                        type: 'integer',
                                        description: 'Total number of times the short URL has been accessed.',
                                    },
                                    uniqueUsers: {
                                        type: 'integer',
                                        description: 'Number of unique users who accessed the short URL.',
                                    },
                                    clicksByDate: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                date: {
                                                    type: 'string',
                                                    format: 'date',
                                                    description: 'Date of the clicks.',
                                                },
                                                clickCount: {
                                                    type: 'integer',
                                                    description: 'Total number of clicks for the short URL on this date.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing click count data for the past 7 days.',
                                    },
                                    osType: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                osName: {
                                                    type: 'string',
                                                    description: 'The name of the operating system (e.g., Windows, macOS, Linux, iOS, Android).',
                                                },
                                                uniqueClicks: {
                                                    type: 'integer',
                                                    description: 'Number of unique clicks for that operating system.',
                                                },
                                                uniqueUsers: {
                                                    type: 'integer',
                                                    description: 'Number of unique users for that operating system.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing analytics data categorized by operating system.',
                                    },
                                    deviceType: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                deviceName: {
                                                    type: 'string',
                                                    description: 'The type of device used (e.g., mobile, desktop).',
                                                },
                                                uniqueClicks: {
                                                    type: 'integer',
                                                    description: 'Number of unique clicks for that device type.',
                                                },
                                                uniqueUsers: {
                                                    type: 'integer',
                                                    description: 'Number of unique users for that device type.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing analytics data categorized by device type.',
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Invalid alias provided.',
                },
                404: {
                    description: 'Short URL not found.',
                },
                500: {
                    description: 'Internal server error, failed to retrieve analytics data.',
                }
            },
        },
    },

    // -----------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------

    '/api/analytics/topic/{topic}': {
        get: {
            summary: 'Retrieve analytics for all short URLs grouped under a specific topic',
            description: 'This endpoint provides analytics for all short URLs that belong to a specific topic, allowing users to evaluate the performance of their links categorized by topic.',
            tags: ['Analytics'],
            parameters: [
                {
                    name: 'topic',
                    in: 'path',
                    required: true,
                    description: 'The topic under which the short URLs are grouped for analytics.',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'Analytics data for all short URLs grouped under the specified topic.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    totalClicks: {
                                        type: 'integer',
                                        description: 'Total number of clicks across all URLs in the specified topic.',
                                    },
                                    uniqueUsers: {
                                        type: 'integer',
                                        description: 'Number of unique users who accessed URLs in the specified topic.',
                                    },
                                    clicksByDate: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                date: {
                                                    type: 'string',
                                                    format: 'date',
                                                    description: 'Date of the clicks.',
                                                },
                                                clickCount: {
                                                    type: 'integer',
                                                    description: 'Total number of clicks across all URLs for the given date.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing total click counts for all URLs in the specified topic, categorized by date.',
                                    },
                                    urls: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                shortUrl: {
                                                    type: 'string',
                                                    description: 'The generated short URL under the specified topic.',
                                                },
                                                totalClicks: {
                                                    type: 'integer',
                                                    description: 'Total number of clicks for the short URL.',
                                                },
                                                uniqueUsers: {
                                                    type: 'integer',
                                                    description: 'Number of unique users who accessed the short URL.',
                                                },
                                            },
                                        },
                                        description: 'An array of short URLs under the specified topic, each containing its individual click and unique user counts.',
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Invalid topic provided.',
                },
                404: {
                    description: 'No URLs found under the specified topic.',
                },
                500: {
                    description: 'Internal server error, failed to retrieve analytics data.',
                }
            },
        },
    },


    // -----------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------

    '/api/analytics/overall': {
        get: {
            summary: 'Retrieve overall analytics for all short URLs created by the authenticated user',
            description: 'This endpoint provides a comprehensive overview of all short URLs created by the authenticated user, including overall performance metrics such as total clicks, unique users, and system breakdowns by date, operating system, and device type.',
            tags: ['Analytics'],
            responses: {
                200: {
                    description: 'Overall analytics data for all short URLs created by the authenticated user.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    totalUrls: {
                                        type: 'integer',
                                        description: 'Total number of short URLs created by the authenticated user.',
                                    },
                                    totalClicks: {
                                        type: 'integer',
                                        description: 'Total number of clicks across all short URLs created by the user.',
                                    },
                                    uniqueUsers: {
                                        type: 'integer',
                                        description: 'Total number of unique users who accessed any of the user\'s short URLs.',
                                    },
                                    clicksByDate: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                date: {
                                                    type: 'string',
                                                    format: 'date',
                                                    description: 'Date of the clicks.',
                                                },
                                                clickCount: {
                                                    type: 'integer',
                                                    description: 'Total number of clicks across all URLs on the given date.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing total click counts for all URLs across different dates.',
                                    },
                                    osType: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                osName: {
                                                    type: 'string',
                                                    description: 'The name of the operating system (e.g., Windows, macOS, Linux, iOS, Android).',
                                                },
                                                uniqueClicks: {
                                                    type: 'integer',
                                                    description: 'Number of unique clicks for that OS.',
                                                },
                                                uniqueUsers: {
                                                    type: 'integer',
                                                    description: 'Number of unique users who clicked on the short URLs from that OS.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing unique clicks and users for each operating system.',
                                    },
                                    deviceType: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                deviceName: {
                                                    type: 'string',
                                                    description: 'The type of device used (e.g., mobile, desktop).',
                                                },
                                                uniqueClicks: {
                                                    type: 'integer',
                                                    description: 'Number of unique clicks for that device type.',
                                                },
                                                uniqueUsers: {
                                                    type: 'integer',
                                                    description: 'Number of unique users for that device type.',
                                                },
                                            },
                                        },
                                        description: 'An array of objects containing unique clicks and users for each device type.',
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Bad request, possibly missing or invalid authentication.',
                },
                401: {
                    description: 'Unauthorized access, authentication required.',
                },
            },
        },
    },

}
