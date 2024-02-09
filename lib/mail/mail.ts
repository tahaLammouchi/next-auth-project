import { Resend } from "resend";
import  nodemailer  from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
    }
});



const domain = process.env.NEXT_PUBLIC_APP_URL;


// Send a verification email to the user.
export async function sendVerificationEmail(email: string, token: string) {
    const confirmLink = `${domain}/auth/new-verification?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
    }

    await transporter.sendMail({
      ...mailOptions,
      subject: "Confirm your email",
      text: "This is a link to confirm your email.",
      html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`
    });
}

// Send password reset email
export async function sendPasswordResetEmail(email: string, token: string) {
    const confirmLink = `${domain}/auth/new-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
    }

    await transporter.sendMail({
      ...mailOptions,
      subject: "Reset your password",
      text: "This is a link to reset your password.",
      html: `<p>Click <a href="${confirmLink}">here</a> to reset your password.</p>`
    });
}

// Send two factor token email
export async function sendTwoFactorTokenEmail (email: string, token: string) {
    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Your two factor token",
        text: `Your two factor token is: ${token}`
        });
}
