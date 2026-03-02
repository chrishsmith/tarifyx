import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
    console.warn('[resend] RESEND_API_KEY not set — email sending will fail');
}

export const resend = new Resend(RESEND_API_KEY);

export const EMAIL_FROM = process.env.EMAIL_FROM || 'Sourcify <noreply@sourcify.trade>';
