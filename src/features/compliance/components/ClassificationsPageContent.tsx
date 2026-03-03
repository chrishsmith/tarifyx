'use client';

import React, { useState } from 'react';
import { Tabs, Typography } from 'antd';
import { ArrowLeft, History, Bookmark, Zap } from 'lucide-react';
import { Button } from 'antd';
import { ClassificationsTable } from '@/features/compliance/components/ClassificationsTable';
import ClassificationV10LayoutB from '@/features/compliance/components/ClassificationV10LayoutB';
import { ClassificationResultDisplay } from '@/features/compliance/components/ClassificationResult';
import { SearchHistoryPanel } from '@/features/compliance/components/SearchHistoryPanel';
import { getClassificationById } from '@/services/classificationHistory';
import type { ClassificationResult } from '@/types/classification.types';

const { Title, Text } = Typography;

export const ClassificationsPageContent = () => {
    const [activeTab, setActiveTab] = useState('classify');
    const [viewingResult, setViewingResult] = useState<ClassificationResult | null>(null);

    const handleViewClassification = (id: string) => {
        const result = getClassificationById(id);
        if (result) {
            setViewingResult(result);
        }
    };

    const handleBackToList = () => {
        setViewingResult(null);
    };

    const items = [
        {
            key: 'classify',
            label: (
                <span className="flex items-center gap-2">
                    <Zap size={16} className="text-cyan-500" />
                    Classify
                </span>
            ),
            children: <ClassificationV10LayoutB />,
        },
        {
            key: 'history',
            label: (
                <span className="flex items-center gap-2">
                    <History size={16} className="text-slate-500" />
                    Search History
                </span>
            ),
            children: <SearchHistoryPanel />,
        },
        {
            key: 'saved',
            label: (
                <span className="flex items-center gap-2">
                    <Bookmark size={16} className="text-amber-500" />
                    Saved Products
                </span>
            ),
            children: viewingResult ? (
                <div>
                    <Button
                        type="text"
                        icon={<ArrowLeft size={16} />}
                        onClick={handleBackToList}
                        className="mb-4 text-teal-600 hover:text-teal-700"
                    >
                        Back to Saved Products
                    </Button>
                    <ClassificationResultDisplay
                        result={viewingResult}
                        onNewClassification={() => {
                            setViewingResult(null);
                            setActiveTab('classify');
                        }}
                    />
                </div>
            ) : (
                <ClassificationsTable onViewClassification={handleViewClassification} />
            ),
        },
    ];

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <Title level={2} className="!mb-1">Classifications</Title>
                    <Text type="secondary">Classify products, view history, and manage your product library.</Text>
                </div>
            </div>

            {/* Main Content Card */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100 w-full">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={items}
                    className="w-full [&_.ant-tabs-content]:w-full [&_.ant-tabs-tabpane]:w-full"
                />
            </div>

        </div>
    );
};
