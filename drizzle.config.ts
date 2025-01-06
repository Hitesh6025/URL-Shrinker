// import { defineConfig } from 'drizzle-kit'

// // via connection params
// export default defineConfig({
//     dialect: "postgresql",
//     dbCredentials: {
//         host: "pgdb",
//         port: 5432,
//         user: "Bytes",
//         password: "BytesPass",
//         database: "BytesDB",
//     },
//     schema: ["./src/models/*"]
// })


import { defineConfig } from 'drizzle-kit'
import "dotenv/config"

// via connection params
export default defineConfig({
    dialect: "postgresql",
    dbCredentials: {
        host: process.env.POSTGRES_HOST || "pgdb",
        port: process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432,
        user: process.env.POSTGRES_USER || "Bytes",
        password: process.env.POSTGRES_PASSWORD || "BytesPass",
        database: process.env.POSTGRES_DB || "BytesDB",
    },
    schema: ["./src/models/*"]
})
