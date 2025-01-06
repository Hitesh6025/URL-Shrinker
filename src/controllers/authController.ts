import "dotenv/config"
import { Request, Response } from 'express';
import open from 'open';
import { generateJWT, getConsentUrl, getTokens, getUserInfo } from "../services/authService";
import { createUser } from "../services/userService";

const handleLogin = async (req: Request, res: Response) => {
    const consentUrl = getConsentUrl();

    // open(consentUrl).then(() => {
    //     console.log('[SERVER.AUTH] Opened browser for Google Sign-In. Complete the process there.');
    // });

    console.log('[SERVER.AUTH] if you made request from curl or postman, visit the following link in browser: "', consentUrl, '"');
    // res.send('Opened browser for Google Sign-In. Complete the process there.\nOR\nvisit the following link: "' + consentUrl + '"');
    res.redirect(consentUrl)
}

const handleGoogleCallback = async (req: Request, res: Response) => {
    const code = req.query.code;

    try {
        if (!code) {
            res.status(400).send('Error: No code provided.');
            return
        }

        if (typeof code !== 'string') {
            res.status(400).send('Invalid code parameter.');
            return
        }

        const { idToken, refreshToken } = await getTokens(code)
        const data = await getUserInfo(idToken)

        if (!data) {
            console.error('[SERVER.AUTH] Error Retrieving User Info.');
            return
        }
        else {
            console.log('[SERVER.AUTH] Logged-in User Info:', data);
            createUser(data.email!, data.name, refreshToken)
            const jwtToken = generateJWT({ id: data.userId!, email: data.email! })

            res.status(201).send(
                `
                <html>
                <head>
                    <title>Authentication Successful</title>
                </head>
                <body>
                    <h1>${'Authentication successful ✔️'}</h1>
                    <h3>${'Copy your JWT token and use it as a Bearer for short & analytics APIs.'}</h3>
                    <p>Your JWT Token: <strong>${jwtToken}</strong></p>
                </body>
                </html>
                `
            )
        }

        // res.status(201).send({
        //     message: 'Authentication successful ✔️ , copy your JWT token and use it as a Bearer for short & analytics APIs.',
        //     jwtToken: generateJWT({ id: data.userId!, email: data.email! })
        // })

    } catch (error) {
        console.error('[SERVER.AUTH] Error exchanging code for tokens:', error);
        res.status(500).send('Error during authentication.');
    }
}

export { handleLogin, handleGoogleCallback }
