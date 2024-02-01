"use server"

import { db } from "../db";

// Get user by email
export async function getUserByEmail(email: string) {
    try {
        const user = await db.user.findUnique({
            where: {
                email: email,
            }
        });
        return user;
    } catch (error) {
        return null;
    }
}

// Get user by id
export async function getUserById(id: string) {
    try {
        const user = await db.user.findUnique({
            where: {
                id: id,
            }
        });
        return user;
    } catch (error) {
        return null;
    }
}

// Get account by user id
export async function getAccountByUserId (userId: string) {
    try {
        const account = await db.account.findFirst({
            where: {
                userId: userId,
            }
        });
        return account;
    } catch (error) {
        return null;
    }
}

