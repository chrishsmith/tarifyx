'use client';

import React from 'react';
import { Card, Typography, Button, Divider, Tag } from 'antd';
import { User, Mail, Shield, Bell, CreditCard, LogOut } from 'lucide-react';
import { useSession, authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { LoadingState } from '@/components/shared/LoadingState';

const { Title, Text } = Typography;

export default function SettingsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await authClient.signOut();
        } catch (err) {
            console.error('[Settings] sign_out_error', { ts: new Date().toISOString(), error: err });
        } finally {
            router.push('/login');
        }
    };

    if (isPending) {
        return <LoadingState size="large" message="Loading settings..." />;
    }

    const user = session?.user;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Profile */}
            <Card className="border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <User size={20} className="text-teal-600" />
                    <Title level={4} className="!mb-0">Profile</Title>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                        <div>
                            <Text className="text-slate-500 text-sm block">Name</Text>
                            <Text strong>{user?.name || 'Not set'}</Text>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                        <div>
                            <Text className="text-slate-500 text-sm block">Email</Text>
                            <Text strong>{user?.email || 'Not set'}</Text>
                        </div>
                    </div>
                    <div className="flex items-center justify-between py-3">
                        <div>
                            <Text className="text-slate-500 text-sm block">Member since</Text>
                            <Text strong>
                                {user?.createdAt 
                                    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                                    : 'Unknown'
                                }
                            </Text>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Plan & Billing */}
            <Card className="border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <CreditCard size={20} className="text-teal-600" />
                    <Title level={4} className="!mb-0">Plan & Billing</Title>
                </div>

                <div className="flex items-center justify-between py-3">
                    <div>
                        <Text className="text-slate-500 text-sm block">Current plan</Text>
                        <div className="flex items-center gap-2 mt-1">
                            <Tag color="default" className="!m-0">Free</Tag>
                            <Text type="secondary" className="text-sm">5 classifications/day</Text>
                        </div>
                    </div>
                    <Button
                        type="primary"
                        style={{ backgroundColor: '#0D9488' }}
                        onClick={() => router.push('/pricing')}
                    >
                        Upgrade to Pro
                    </Button>
                </div>
            </Card>

            {/* Notifications */}
            <Card className="border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Bell size={20} className="text-teal-600" />
                    <Title level={4} className="!mb-0">Notifications</Title>
                </div>

                <div className="py-3">
                    <Text type="secondary">
                        Email notifications for tariff changes and compliance alerts will be available soon.
                        In-app alerts are active on your monitored products.
                    </Text>
                </div>
            </Card>

            {/* Security */}
            <Card className="border border-slate-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                    <Shield size={20} className="text-teal-600" />
                    <Title level={4} className="!mb-0">Security</Title>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-slate-100">
                        <div>
                            <Text strong className="block">Password</Text>
                            <Text type="secondary" className="text-sm">Last changed: Unknown</Text>
                        </div>
                        <Button type="default" disabled>
                            Change Password
                        </Button>
                    </div>

                    <Divider className="!my-2" />

                    <Button
                        danger
                        icon={<LogOut size={16} />}
                        onClick={handleSignOut}
                        className="flex items-center gap-2"
                    >
                        Sign Out
                    </Button>
                </div>
            </Card>
        </div>
    );
}
