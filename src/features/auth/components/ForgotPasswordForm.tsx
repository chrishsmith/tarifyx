'use client';

import React, { useState } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import { User, ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

const { Text } = Typography;

export const ForgotPasswordForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [form] = Form.useForm();

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            const { error } = await authClient.requestPasswordReset({
                email: values.email,
                redirectTo: '/reset-password',
            });

            if (error) {
                message.error(error.message || 'Failed to send reset email');
                return;
            }

            setSubmitted(true);
        } catch (err) {
            console.error('[ForgotPasswordForm] Unexpected error:', err);
            message.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="text-center py-4">
                <div className="bg-teal-50 p-4 rounded-xl mb-6 inline-block">
                    <Mail className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Check your email</h3>
                <Text type="secondary" className="block mb-6">
                    If an account exists with that email, we&apos;ve sent password reset instructions.
                    Check your inbox and spam folder.
                </Text>
                <Button
                    type="text"
                    onClick={() => {
                        setSubmitted(false);
                        form.resetFields();
                    }}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                >
                    Try a different email
                </Button>
                <div className="mt-4">
                    <Link href="/login" className="text-slate-500 hover:text-slate-700 text-sm inline-flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Back to sign in
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <Text type="secondary" className="block text-center mb-6">
                Enter your email address and we&apos;ll send you a link to reset your password.
            </Text>

            <Form
                form={form}
                name="forgot_password_form"
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                >
                    <Input
                        prefix={<User size={18} className="text-slate-400" />}
                        placeholder="Email address"
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
                        Send Reset Link
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
