import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const metadata: Metadata = {
    title: 'Reset Password - Sourcify',
    description: 'Set a new password for your Sourcify account',
};

export default function ResetPasswordPage() {
    return (
        <AuthLayout
            title="Reset password"
            subtitle="Choose a new password for your account."
        >
            <Suspense fallback={<div className="text-center py-8 text-slate-400">Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </AuthLayout>
    );
}
