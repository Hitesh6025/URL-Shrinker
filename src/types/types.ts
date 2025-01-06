import { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload | string; // Add the `user` property
        }
    }
}

interface ShortenUrlRequest {
    longUrl: string;
    customAlias?: string;
    topic?: string;
}

type ShortUrlResult =
    | { success: true, message: string }
    | { success: false, error: string };

type CommonResult<T = any> = {
    success: boolean;
    message: string;
    data?: T;
};

export { ShortenUrlRequest, ShortUrlResult, CommonResult };
