import { db } from "../config/database";
import { eq } from "drizzle-orm";
import { CommonResult } from "../types/types";
import { users } from "../models/userModel";

const createUser = async (email: string, name?: string, refresh_token?: string) => {
    try {
        const result = await findUserByEmail(email);
        if (result.success)
            if (result.data.length > 0) {
                console.error("[DATABASE] Aborting Query ✖️");
                console.log("[DATABASE] User Already REGISTERED, Continuing with previous data....");
                return;
            }
            else {
                console.log("[DATABASE] Creating New User....");
                const new_user = await db.insert(users).values({ email, name, refresh_token }).returning();
                console.log("[DATABASE] New User REGISTERED ✔️");
                return new_user;
            }
    }
    catch (error) {
        console.error("[DATABASE] Error Creating User:", error);
    }
};

const findUserByEmail = async (email: string): Promise<CommonResult> => {
    try {
        const user = await db.select().from(users).where(eq(users.email, email));
        return { success: true, message: "[DATABASE] User Found ✔️", data: user };
    }
    catch (error) {
        console.error("[DATABASE] Error Finding User:", error);
        return { success: false, message: "[DATABASE] User Not Found ✖️, Please login." };
    }
}

const getUserId = async (email: string) => {
    try {
        const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
        return { success: true, message: "[DATABASE] User Found ✔️", data: user[0].id };
    }
    catch (error) {
        console.error("[DATABASE] Error Finding User:", error);
        return { success: false, message: "[DATABASE] User Not Found ✖️ , login to create one." };
    }
}

export { createUser, findUserByEmail, getUserId };
