import "dotenv/config"
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.REDIRECT_URI) {
    console.error("Missing environment variables for Google OAuth2");
    process.exit(1);
}

const oauthClient = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.REDIRECT_URI,
);
const scopes = ["profile", "email"];


const getConsentUrl = () =>
    oauthClient.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

const getTokens = async (code: string) => {
    const { tokens } = await oauthClient.getToken(code);
    return {
        idToken: tokens.id_token!,
        // accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token!,
    };
}

const getNewIdToken = async (refreshToken: string) => {
    oauthClient.setCredentials({ refresh_token: refreshToken });
    const tokens = await oauthClient.refreshAccessToken();
    return tokens.credentials.id_token;
}

const getUserInfo = async (idToken: string) => {
    try {
        const ticket = await oauthClient.verifyIdToken({ idToken });
        const payload = ticket.getPayload();
        return {
            userId: payload?.sub,
            email: payload?.email,
            name: payload?.name,
        }
    }
    catch (error) {
        console.error("[SERVER.AUTH] Error verifying ID token:", error);
        return null;
    }
}

const generateJWT = (payload: { id: string, email: string }) => {
    return jwt.sign(payload, process.env.JWT_SECRET!);
}

export { oauthClient, getConsentUrl, getTokens, getNewIdToken, getUserInfo, generateJWT };

