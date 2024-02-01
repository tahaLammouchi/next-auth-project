import { newPassword } from '@/lib/actions/auth.actions';
import { UserRole } from "@prisma/client";
import * as z from "zod";

export const LoginSchema = z.object({
    email: z.string().nonempty({ message: "Email is required"}).email({ message: "Invalid email"}),
    password: z.string().nonempty({ message: "Password is required"}),
    code: z.optional(z.string().nonempty({ message: "Code is required"}))
});

export const RegisterSchema = z.object({
    email: z.string().nonempty({ message: "Email is required"}).email({ message: "Invalid email"}),
    password: z.string().nonempty({ message: "Password is required"}).min(6, { message: "Minimum 6 characters required"}),
    name: z.string().nonempty({ message: "Name is required"}).min(3, { message: "Minimum 3 characters required"})
});

export const ResetSchema = z.object({
    email: z.string().nonempty({ message: "Email is required"}).email({ message: "Invalid email"})
});

export const NewPasswordSchema = z.object({
    password: z.string().nonempty({ message: "Password is required"}).min(6, { message: "Minimum 6 characters required"}),
    confirmPassword: z.string().nonempty({ message: "Confirm password is required"}).min(6, { message: "Minimum 6 characters required"})
})
 .refine((data) => {
    if (data.password !== data.confirmPassword) {
        return false;
    }
        return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export const SettingsSchema = z.object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: z.enum([UserRole.ADMIN, UserRole.USER]),
    email: z.optional(z.string().email({ message: "Invalid email"})),
    password: z.optional(z.string()),
    newPassword: z.optional(z.string().min(6, { message: "Minimum 6 characters required"})),
    confirmNewPassword: z.optional(z.string())
}).refine((data) => {
    if (data.password && !data.newPassword) {
        return false;
    }
        return true;
}, {
    message: "New password is required",
    path: ["newPassword"]
})
.refine((data) => {
    if (data.newPassword && !data.password) {
        return false;
    }
        return true;
}, {
    message: "Password is required",
    path: ["password"]
})
.refine((data) => {
    if (data.newPassword && !data.confirmNewPassword) {
        return false;
    }
        return true;
}, {
    message: "Confirm new password is required",
    path: ["confirmNewPassword"]
})
.refine((data) => {
    if (data.newPassword !== data.confirmNewPassword) {
        return false;
    }
        return true;
}, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"]
});
