import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { resend, EMAIL_FROM } from "@/lib/resend";

// Use a standard PrismaClient for auth (Neon adapter can cause issues with Better-Auth)
const prisma = new PrismaClient();

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 6,
        sendResetPassword: async ({ user, url }) => {
            try {
                await resend.emails.send({
                    from: EMAIL_FROM,
                    to: user.email,
                    subject: "Reset your Tarifyx password",
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                            <div style="text-align: center; margin-bottom: 32px;">
                                <div style="display: inline-block; background: #0d9488; padding: 12px; border-radius: 12px;">
                                    <span style="color: white; font-size: 24px; font-weight: bold;">S</span>
                                </div>
                            </div>
                            <h2 style="color: #18181b; text-align: center; margin-bottom: 16px;">Reset your password</h2>
                            <p style="color: #64748b; text-align: center; line-height: 1.6; margin-bottom: 32px;">
                                We received a request to reset the password for <strong>${user.email}</strong>. 
                                Click the button below to choose a new password.
                            </p>
                            <div style="text-align: center; margin-bottom: 32px;">
                                <a href="${url}" style="display: inline-block; background: #0d9488; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="color: #94a3b8; font-size: 13px; text-align: center; line-height: 1.5;">
                                If you didn't request this, you can safely ignore this email. This link expires in 1 hour.
                            </p>
                            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;" />
                            <p style="color: #cbd5e1; font-size: 12px; text-align: center;">
                                © 2026 Tarifyx Inc.
                            </p>
                        </div>
                    `,
                });
            } catch (error) {
                console.error("[auth] Failed to send password reset email:", error);
                throw new Error("Failed to send password reset email");
            }
        },
    },
    advanced: {
        useSecureCookies: false, // Allow http for local dev
    },
});
