import React from 'react';
import { Metadata } from 'next';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const metadata: Metadata = {
    title: 'Forgot Password - Tarifyx',
    description: 'Reset your Tarifyx account password',
};

export default function ForgotPasswordPage() {
    return (
        <AuthLayout
            title="Forgot password?"
            subtitle="No worries, we'll send you reset instructions."
        >
            <ForgotPasswordForm />
        </AuthLayout>
    );
}
