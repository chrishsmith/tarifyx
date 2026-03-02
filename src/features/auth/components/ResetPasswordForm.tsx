'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

const { Text } = Typography;

const MIN_PASSWORD_LENGTH = 6;

export const ResetPasswordForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const onFinish = async (values: { password: string }) => {
        if (!token) {
            message.error('Invalid or missing reset token. Please request a new link.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await authClient.resetPassword({
                newPassword: values.password,
                token,
            });

            if (error) {
                message.error(error.message || 'Failed to reset password');
                return;
            }

            setSuccess(true);
        } catch (err) {
            console.error('[ResetPasswordForm] Unexpected error:', err);
            message.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="text-center py-4">
                <h3 className="text-lg font-semibold text-red-600 mb-2">Invalid Reset Link</h3>
                <Text type="secondary" className="block mb-6">
                    This password reset link is invalid or has expired. Please request a new one.
                </Text>
                <Link href="/forgot-password">
                    <Button type="primary" className="bg-teal-600 hover:bg-teal-500 border-none">
                        Request New Link
                    </Button>
                </Link>
            </div>
        );
    }

    if (success) {
        return (
            <div className="text-center py-4">
                <div className="bg-teal-50 p-4 rounded-xl mb-6 inline-block">
                    <CheckCircle className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Password reset successful</h3>
                <Text type="secondary" className="block mb-6">
                    Your password has been updated. You can now sign in with your new password.
                </Text>
                <Button
                    type="primary"
                    onClick={() => router.push('/login')}
                    className="bg-teal-600 hover:bg-teal-500 border-none shadow-lg shadow-teal-600/30 font-medium"
                >
                    Sign In
                </Button>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Text type="secondary" className="block text-center mb-6">
                Enter your new password below.
            </Text>

            <Form
                name="reset_password_form"
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Please enter a new password!' },
                        { min: MIN_PASSWORD_LENGTH, message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
                    ]}
                >
                    <Input.Password
                        prefix={<Lock size={18} className="text-slate-400" />}
                        placeholder="New password"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                        { required: true, message: 'Please confirm your password!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Passwords do not match'));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<Lock size={18} className="text-slate-400" />}
                        placeholder="Confirm new password"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        className="h-12 bg-teal-600 hover:bg-teal-500 border-none shadow-lg shadow-teal-600/30 font-medium text-base"
                    >
                        Reset Password
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center">
                <Link href="/login" className="text-slate-500 hover:text-slate-700 text-sm inline-flex items-center gap-1">
                    <ArrowLeft size={14} />
                    Back to sign in
                </Link>
            </div>
        </div>
    );
};
