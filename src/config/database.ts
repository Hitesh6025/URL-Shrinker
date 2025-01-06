import { drizzle } from 'drizzle-orm/postgres-js';
import 'dotenv/config';
import postgres from 'postgres';

const db_connect = () => {
    try {
        if (!process.env.POSTGRES_HOST && !process.env.POSTGRES_PORT) {
            console.warn("WARNING: POSTGRES_HOST & PORT environment variables are not defined, continuing with default values. (localhost & 5432)");
        }
        const client = postgres({
            host: process.env.POSTGRES_HOST || "localhost",
            database: process.env.POSTGRES_DB || "BytesDB",
            username: process.env.POSTGRES_USER || "Bytes",
            port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
            password: process.env.POSTGRES_PASSWORD || "BytesPass",
            // debug: function(_, query) {
            //     console.log("[DATABASE] EXECUTED QUERY:", query);
            // },
        });

        // console.log("process.env.POSTGRES_URL", process.env.POSTGRES_HOST);
        const db = drizzle({ client: client });
        console.log("[DATABASE] db connection established successfully ✔️");
        return db
    }
    catch (error) {
        console.error(error);
        process.exit(1);
    }
}
const db = db_connect()

export { db };
