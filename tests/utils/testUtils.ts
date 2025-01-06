import { db } from "../../src/config/database";
import { shortUrls, rateLimits } from "../../src/models/urlModel";
import { users } from "../../src/models/userModel";
import { urlLogs } from "../../src/models/logsModel";
import { createUser } from "../../src/services/userService";

export const insertDummyData = async () => {
    try {
        //clear the db
        await db.delete(users)
        await db.delete(shortUrls)
        await db.delete(rateLimits)
        await db.delete(urlLogs)
        console.log("[TEST] Database cleaned Successfully")


        // inserting user data
        await createUser("testmail@gmail.com")
        await createUser("testmail1@gmail.com")
        await createUser("testmail2@gmail.com")

        console.log("[TEST] User Data Inserted Successfully")
        console.table(await db.execute('select * from users'))

    } catch (error) {
        console.error("[TEST] Error inserting dummy data into Database:", error);
    }
}

