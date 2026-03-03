import React from 'react';
import { LoadingState } from '@/components/shared/LoadingState';

/**
 * Dashboard-level loading skeleton.
 * Shown automatically by Next.js during page transitions within the dashboard.
 */
export default function DashboardLoading() {
    return (
        <LoadingState
            fullHeight
            message="Loading..."
            size="large"
        />
    );
}
