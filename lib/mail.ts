import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const domain = process.env.NEXT_PUBLIC_APP_URL;

// Send a verification email to the user.
export async function sendVerificationEmail(email: string, token: string) {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Confirm your email",
        html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
    });
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
    const confirmLink = `${domain}/auth/new-password?token=${token}`;

    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${confirmLink}">here</a> to reset your password.</p>`

    });
}

// Send two factor token email
export async function sendTwoFactorTokenEmail (email: string, token: string) {
    await resend.emails.send({
        from: "onboarding@resend.dev",
        to: email,
        subject: "Your two factor token",
        html: `<p>Your two factor token is: ${token}</p>`
    });
}
