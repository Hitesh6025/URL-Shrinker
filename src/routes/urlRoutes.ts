import express from 'express';
import { handleShort, handleShortRedirect } from '../controllers/urlController';
import { authenticateJWT } from '../middleware/authMiddleware';

const router = express.Router()

// router.use(authenticateJWT)
router.post('/shorten', authenticateJWT, handleShort)
router.get('/shorten/:alias', handleShortRedirect)

export default router;




// -----------------------------------------------------------------------------------------------------
// swagger docs
// -----------------------------------------------------------------------------------------------------
export const shortenDoc = {
    '/api/shorten': {
        post: {
            summary: 'Create a new short URL',
            tags: ['URL Shortening'],
            security: [
                {
                    BearerAuth: [],
                },
            ],
            requestBody: {
                required: true,
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                longUrl: {
                                    type: 'string',
                                    description: 'The original URL to be shortened.',
                                },
                                customAlias: {
                                    type: 'string',
                                    description: 'A custom alias for the short URL.',
                                },
                                topic: {
                                    type: 'string',
                                    description: 'The category under which the short URL is grouped.',
                                },
                            },
                            required: ['longUrl'],
                        },
                    },
                },
            },
            responses: {
                201: {
                    description: 'Short URL created successfully.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    message: {
                                        type: 'string',
                                    },
                                    shortUrl: {
                                        type: 'string',
                                    },
                                    createdAt: {
                                        type: 'string',
                                        format: 'date-time',
                                    },
                                },
                            },
                        },
                    },
                },
                400: {
                    description: 'Invalid input data.',
                },
                404: {
                    description: 'User Not Found.',
                },
                429: {
                    description: 'Rate limit exceeded.',
                },
            },
        },
    },

    // -----------------------------------------------------------------------------------------------------
    // -----------------------------------------------------------------------------------------------------

    '/api/shorten/{alias}': {
        get: {
            summary: "Redirect to the original long URL. [[ WARN ]] This endpoint is designed to be used in the Browser's search bar",
            tags: ['URL Shortening'],
            parameters: [
                {
                    name: 'alias',
                    in: 'path',
                    required: true,
                    description: 'The alias of the short URL to be redirected.',
                    schema: {
                        type: 'string',
                    },
                },
            ],
            responses: {
                200: {
                    description: 'The original long URL.',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    longUrl: {
                                        type: 'string',
                                        description: 'The original long URL.',
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
            },
        },
    },
};

