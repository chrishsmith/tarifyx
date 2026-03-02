'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';

export default function LoginPageContent() {
    const searchParams = useSearchParams();
    const isSignup = searchParams.get('mode') === 'signup';

    return (
        <AuthLayout
            title={isSignup ? 'Create your account' : 'Welcome back'}
            subtitle={isSignup
                ? 'Start classifying products and calculating import costs for free.'
                : 'Enter your credentials to access your global trade intelligence.'
            }
        >
            <LoginForm />
        </AuthLayout>
    );
}
