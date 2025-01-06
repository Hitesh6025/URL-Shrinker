import express from 'express';
import { db } from "./config/database"
import { users } from './models/userModel';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import authRoutes from './routes/authRoutes';
import urlRoutes from './routes/urlRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import { rateLimits, shortUrls } from './models/urlModel';
import { urlLogs } from './models/logsModel';
import { setupSwaggerDocs } from './config/swagger';

const app = express();
const PORT = process.env.SERVER_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));

// defining apis
app.get("/", (req, res) => { res.sendFile(path.join(__dirname, "public", "index.html")) })
app.use('/auth', authRoutes);
app.use('/api', urlRoutes)
app.use('/api', analyticsRoutes)


// Swagger setup
setupSwaggerDocs(app, Number(PORT));

const initiateServer = async () => {
    try {

        // printing table's initial state
        // console.table(await db.select().from(users))
        // console.table(await db.select().from(shortUrls))
        // console.table(await db.select().from(rateLimits))
        // console.table(await db.select().from(urlLogs))

        app.listen(PORT, () => {
            console.log(`[SERVER] Server Running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("[SERVER] Error Starting The Server:", error);
    }
};
export { app }

initiateServer();
