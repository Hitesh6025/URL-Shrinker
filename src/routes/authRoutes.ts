import express from 'express';
import { handleLogin, handleGoogleCallback } from '../controllers/authController'

const router = express.Router()

router.get('/login', handleLogin)
router.get('/google', handleGoogleCallback)

export default router;




// -----------------------------------------------------------------------------------------------------
// swagger docs
// -----------------------------------------------------------------------------------------------------

export const loginDoc = {
    '/auth/login': {
        get: {
            summary: "Redirect to Google OAuth consent screen for login. [[ WARN ]] This endpoint is designed to be used in the Browser's search bar.",
            description: 'This endpoint redirects the user to the Google OAuth consent screen to authenticate and authorize the application.',
            tags: ['Authentication'],
            responses: {
                302: {
                    description: 'Redirect to Google OAuth consent screen',
                    headers: {
                        Location: {
                            description: 'The URL to the Google OAuth consent screen.',
                            schema: {
                                type: 'string',
                            },
                        },
                    },
                },
                500: {
                    description: 'Internal server error, failed to redirect to OAuth consent screen.',
                },
            },
        },
    },
}
