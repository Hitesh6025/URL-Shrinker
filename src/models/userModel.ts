import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

const users = pgTable("users", {
    id: serial("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    refresh_token: text("refresh_token"),
    created_at: timestamp('created_at').defaultNow(),
});


export { users }

