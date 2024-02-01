"use server"

import * as z from "zod";
import { db } from "../db";
import bcrypt from "bcryptjs";
import { SettingsSchema } from "../validations";
import { currentUser } from "../auth";
import { getUserByEmail, getUserById } from "./user.actions";
import { generateVerificationToken } from "./auth.actions";
import { sendVerificationEmail } from "../mail";

export async function settings (values: z.infer<typeof SettingsSchema>) {
    const validatedFields = SettingsSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields"};
    }
    
    const user = await currentUser();

    if (!user) {
        return { error: "Unauthorized" }
    }
    
    const cuurentUserInDatabase = await getUserById(user.id);

    if (!cuurentUserInDatabase) {
        return { error: "Unauthorized" }
    }

    if (user.isOAuth){
        values.email = undefined;
        values.password = undefined;
        values.newPassword = undefined;
        values.isTwoFactorEnabled = undefined;
    }

    if (values.email && values.email !== user.email) {
        const existingUser = await getUserByEmail(values.email);

        if (existingUser && existingUser.id !== user.id) {
            return { error: "Email already in use!" };
        }

        const verificatonToken = await generateVerificationToken(values.email);
        await sendVerificationEmail(verificatonToken.email, verificatonToken.token);

        return { success: "Verification email sent!" };
    }

    if (values.password && values.newPassword && cuurentUserInDatabase.password) {
        const passwordsMatch = await bcrypt.compare(
          values.password,
          cuurentUserInDatabase.password,
        );
    
        if (!passwordsMatch) {
          return { error: "Incorrect password!" };
        }
    
        const hashedPassword = await bcrypt.hash(
          values.newPassword,
          10,
        );
        values.password = hashedPassword;
        values.newPassword = undefined;
      }
    
      const updatedUser = await db.user.update({
        where: { id: cuurentUserInDatabase.id },
        data: {
          ...values,
        }
      });


    await db.user.update({
        where: {
            id: user.id,
        },
        data: {
            ...values,
        }
    });

    return { success: "Settings Updated!" };
}