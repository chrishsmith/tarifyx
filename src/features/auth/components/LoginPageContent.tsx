'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

function LoginPageInner() {
    const searchParams = useSearchParams();
    const isSignup = searchParams.get('mode') === 'signup';

    return (
        <AuthLayout
            title={isSignup ? 'Create your account' : 'Welcome back'}
            subtitle={isSignup ? 'Get started with AI-powered trade intelligence.' : 'Enter your credentials to access your trade intelligence.'}
        >
            <LoginForm />
        </AuthLayout>
    );
}

export default function LoginPageContent() {
    return (
        <Suspense fallback={<AuthLayout title="Loading..." subtitle=""><div /></AuthLayout>}>
            <LoginPageInner />
        </Suspense>
    );
}
