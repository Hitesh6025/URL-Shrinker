import { pgTable, text, varchar, serial, integer, jsonb, timestamp, inet, foreignKey } from 'drizzle-orm/pg-core';
import { shortUrls } from './urlModel';

const urlLogs = pgTable('url_logs', {
    id: serial('id').primaryKey(),
    ip_address: varchar('ip_address', { length: 255 }),
    user_agent: varchar('user_agent', { length: 255 }),
    short_url: varchar('short_url', { length: 255 }).references(() => shortUrls.short_url, { onDelete: 'cascade' }),
    created_at: timestamp('created_at').defaultNow(),
})

export { urlLogs }

