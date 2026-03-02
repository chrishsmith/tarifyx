import React from 'react';
import { Metadata } from 'next';
import LoginPageContent from '@/features/auth/components/LoginPageContent';

export const metadata: Metadata = {
    title: 'Login - Tarifyx',
    description: 'Login to your Tarifyx account',
};

export default function LoginPage() {
    return <LoginPageContent />;
}
