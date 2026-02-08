'use client';

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Checkbox, message, Tabs } from 'antd';
import { User, Lock, ArrowRight, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

export const LoginForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState<'signin' | 'signup'>('signin');
    const router = useRouter();
    const searchParams = useSearchParams();
    const [form] = Form.useForm();

    // Respect ?mode=signup from landing page CTA
    useEffect(() => {
        const urlMode = searchParams.get('mode');
        if (urlMode === 'signup') {
            setMode('signup');
        }
    }, [searchParams]);

    const onFinish = async (values: { email: string; password: string; name?: string; remember?: boolean }) => {
        setLoading(true);
        try {
            if (mode === 'signup') {
                const { data, error } = await authClient.signUp.email({
                    email: values.email,
                    password: values.password,
                    name: values.name || values.email.split('@')[0],
                });

                if (error) {
                    console.error('[LoginForm] sign_up_error', { ts: new Date().toISOString(), error });
                    message.error(error.message || 'Failed to create account');
                    return;
                }

                message.success('Account created! Let\'s classify your first product.');
                router.push('/onboarding');
            } else {
                const { data, error } = await authClient.signIn.email({
                    email: values.email,
                    password: values.password,
                });

                if (error) {
                    message.error(error.message || 'Invalid credentials');
                    return;
                }

                message.success('Welcome back to Tarifyx');
                router.push('/dashboard');
            }
        } catch (err) {
            console.error('[LoginForm] auth_error', { ts: new Date().toISOString(), error: err });
            message.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <Tabs
                activeKey={mode}
                onChange={(key) => setMode(key as 'signin' | 'signup')}
                centered
                items={[
                    { key: 'signin', label: 'Sign In' },
                    { key: 'signup', label: 'Create Account' },
                ]}
                className="mb-6"
            />

            <Form
                form={form}
                name="auth_form"
                initialValues={{ remember: true }}
                onFinish={onFinish}
                layout="vertical"
                size="large"
            >
                {mode === 'signup' && (
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'Please input your name!' }]}
                    >
                        <Input
                            prefix={<User size={18} className="text-slate-400" />}
                            placeholder="Full Name"
                            className="rounded-lg"
                        />
                    </Form.Item>
                )}

                <Form.Item
                    name="email"
                    rules={[
                        { required: true, message: 'Please input your email!' },
                        { type: 'email', message: 'Please enter a valid email!' }
                    ]}
                >
                    <Input
                        prefix={<Mail size={18} className="text-slate-400" />}
                        placeholder="Email address"
                        className="rounded-lg"
                    />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[
                        { required: true, message: 'Please input your password!' },
                        ...(mode === 'signup' ? [{ min: 8, message: 'Password must be at least 8 characters' }] : []),
                    ]}
                >
                    <Input.Password
                        prefix={<Lock size={18} className="text-slate-400" />}
                        placeholder={mode === 'signup' ? 'Password (8+ characters)' : 'Password'}
                        className="rounded-lg"
                    />
                </Form.Item>

                {mode === 'signin' && (
                    <Form.Item>
                        <div className="flex justify-between items-center">
                            <Form.Item name="remember" valuePropName="checked" noStyle>
                                <Checkbox>Remember me</Checkbox>
                            </Form.Item>
                        </div>
                    </Form.Item>
                )}

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        block
                        loading={loading}
                        icon={<ArrowRight size={18} />}
                        className="h-12 bg-teal-600 hover:bg-teal-500 border-none shadow-sm font-medium text-base"
                    >
                        {mode === 'signin' ? 'Sign In' : 'Create Account'}
                    </Button>
                </Form.Item>
            </Form>

            {mode === 'signup' && (
                <p className="text-center text-xs text-slate-400 mt-4">
                    Free plan includes 5 classifications/day. No credit card required.
                </p>
            )}
        </div>
    );
};
