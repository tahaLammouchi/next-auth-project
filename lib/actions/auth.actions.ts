"use server"

import * as z from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { signIn, signOut } from "@/auth";
import { LoginSchema, NewPasswordSchema, RegisterSchema, ResetSchema } from "../validations/index";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { AuthError } from "next-auth";
import { getUserByEmail } from "./user.actions";
import { sendPasswordResetEmail, sendTwoFactorTokenEmail, sendVerificationEmail } from "../mail";
import { db } from "../db";


// Login
export async function login (values: z.infer<typeof LoginSchema>, callbackUrl?: string) {
    const validatedFields = LoginSchema.safeParse(values);

    if(!validatedFields.success) {
        return { error: "Invalid fields" };
    }
 
    const { email, password, code } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser || !existingUser.email || !existingUser.password) {
        return { error: "Email does not exist!" };
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);

        await sendVerificationEmail(email, verificationToken.token);

        return { success: "Confirmation email sent!" };
    }

    if (existingUser.isTwoFactorEnabled) {
        if (code){
            const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);

            if (!twoFactorToken || twoFactorToken.token !== code) {
                return { error: "Invalid code!" };
            }

            const hasExpired = new Date (twoFactorToken.expires) < new Date();

            if (hasExpired) {
                return { error: "Code has expired!" };
            }

            await db.twoFactorToken.delete({
                where: {
                    id: twoFactorToken.id,
                }
            });

            const existingTwoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);

            if (existingTwoFactorConfirmation) {
                await db.twoFactorConfirmation.delete({
                    where: {
                        id: existingTwoFactorConfirmation.id,
                    }
                });
            }

            await db.twoFactorConfirmation.create({
                data: {
                    userId: existingUser.id,
                }
            });
            

        } else {
            const twoFactorToken = await generateTwoFactorToken(existingUser.email);

            await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

            return { twoFactor: true }
        }
    }

    try {
        await signIn("credentials", {
             email,
             password,
             redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials!" };
                default:
                    return { error: "Something went wrong!" };
            }
        }
        throw error;
    }
}

// Logout
export async function logout () {
    // some server stuff 
    await signOut();
}

// Register
export async function register (values: z.infer<typeof RegisterSchema>) {
    const validatedFields = RegisterSchema.safeParse(values);

    if(!validatedFields.success) {
        return { error: "Invalid fields" };
    }
    const { name, email, password} = validatedFields.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email);

    if(existingUser) {
        return { error: "Email already in use !" };
    }

    await db.user.create({
        data: {
            name: name,
            email: email,
            password: hashedPassword,
        }
    });

    const VerificationToken = await generateVerificationToken(email);
    // TODO: Send verification token email
    await sendVerificationEmail(email, VerificationToken.token);


    return { success: "Confirmation email sent!" };
}

// Generate verification token
export async function generateVerificationToken(email: string) {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    
    const existingToken = await getVerificationTokenByEmail(email);

    if(existingToken){
        await db.verificationToken.delete({
            where: { id: existingToken.id }
        });
    }

    const verificationToken = await db.verificationToken.create({
        data: {
            email: email,
            token: token,
            expires: expires
        }
    });
    return verificationToken;
}

// Get verification token by email
export async function getVerificationTokenByEmail(email: string) {
    try {
        const verificiationToken = await db.verificationToken.findFirst({
            where: { email: email}
        });
        return verificiationToken;
    } catch (error) {
        return null;
    }
}

// Get verification token by token
export async function getVerificationTokenByToken(token: string) {
    try {
        const verificiationToken = await db.verificationToken.findFirst({
            where: { token: token}
        });
        return verificiationToken;
    } catch (error) {
        return null;
    }
}

// Verify user email by token
export async function newVerification (token: string) {
    const existingToken = await getVerificationTokenByToken(token);

    if(!existingToken) {
        return { error: "Token does not exist!" };
    }

    const hasExpired  = new Date(existingToken.expires) < new Date();
    
    if(hasExpired) {
        return { error: "Token has expired!" };
    }

    const existingUser = await getUserByEmail(existingToken.email);

    if(!existingUser) {
        return { error: "Email does not exist!" };
    }

    await db.user.update({
        where: {
            id: existingUser.id,
        },
        data: {
            emailVerified: new Date(),
            email: existingToken.email,
        }
    });

    await db.verificationToken.delete({
        where: {
            id: existingToken.id,
        }
    });

    return { success: "Email verified!" };
}

// Reset
export async function reset (values: z.infer<typeof ResetSchema>) {
    const validatedFields = ResetSchema.safeParse(values);

    if(!validatedFields.success) {
        return { error: "Invalid fields" };
    }

    const { email } = validatedFields.data;

    const existingUser = await getUserByEmail(email);

    if (!existingUser) {
        return { error: "Email not found!" };
    }

    const passwordResetToken = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);

    return { success: "Password reset email sent!" };
}

export async function newPassword(values: z.infer<typeof NewPasswordSchema>, token: string | null) {    
    if (!token) {
        return { error: "Missing token!" };
    }

    const validatedFields = NewPasswordSchema.safeParse(values);

    if(!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(token);

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    const hasExpired  = new Date(existingToken.expires) < new Date();

    if(hasExpired) {
        return { error: "Token has expired!" };
    }

    const exisitingUser = await getUserByEmail(existingToken.email);
    
    if (!exisitingUser) {
        return { error: "Email does not exist!" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.update({
        where: {
            id: exisitingUser.id,
        },
        data: {
            password: hashedPassword,
        }
    });

    await db.passwordResetToken.delete({
        where: {
            id: existingToken.id,
        }
    });

    return { success: "The password updated successfully" };
}

// Generate password reset token
export async function generatePasswordResetToken (email: string) {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000);
    
    const existingToken = await getPasswordResetTokenByEmail(email);

    if(existingToken){
        await db.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    const passwordResetToken = await db.passwordResetToken.create({
        data: {
            email: email,
            token: token,
            expires: expires
        }
    });
    return passwordResetToken;
}

// Get password reset token by token
export async function getPasswordResetTokenByToken (token: string) {
  try {
    const passwordResetToken = await db.passwordResetToken.findUnique({
        where: { token: token,},
        });

    return passwordResetToken;
  } catch (error) {
    return null;
  }
}

// Get password reset token by email
export async function getPasswordResetTokenByEmail (email: string) {
    try {
      const passwordResetToken = await db.passwordResetToken.findFirst({
          where: { email: email},
          });

      return passwordResetToken;
    } catch (error) {
      return null;
    }
}

//Generate two factor token
export async function generateTwoFactorToken (email: string) {
    const token = crypto.randomInt(100_000, 1_000_000).toString();
    const expires = new Date(new Date().getTime() + 15 * 60 * 1000);


    const existingToken = await getTwoFactorTokenByEmail(email);

    if(existingToken){
        await db.twoFactorToken.delete({
            where: { id: existingToken.id }
        });
    }

    const twoFactorToken = await db.twoFactorToken.create({
        data: {
            email: email,
            token: token,
            expires: expires
        }
    });
    return twoFactorToken;
}

// Get two factor token by token
export async function getTwoFactorTokenByToken (token: string) {
    try {
      const twoFactorToken = await db.twoFactorToken.findUnique({
          where: { token: token},
          });

      return twoFactorToken;
    } catch (error) {
      return null;
    }
}

// Get two factor token by email
export async function getTwoFactorTokenByEmail (email: string) {
    try {
      const twoFactorToken = await db.twoFactorToken.findFirst({
          where: { email: email},
          });

      return twoFactorToken;
    } catch (error) {
      return null;
    }
}

// Get two factor token by userId
export async function getTwoFactorConfirmationByUserId (userId: string) {
    try {
        const twoFactorConfirmation = await db.twoFactorConfirmation.findUnique({ where: { userId: userId} });
        return twoFactorConfirmation;
    } catch (error) {
      return null;
    }
}
