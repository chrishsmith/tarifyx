'use client';

import React from 'react';
import { ErrorState } from '@/components/shared/ErrorState';

/**
 * Dashboard-level error boundary.
 * Catches unhandled errors in any dashboard page/route.
 * Next.js automatically wraps pages in this boundary.
 */
export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    React.useEffect(() => {
        console.error('[DashboardError] unhandled_error', {
            ts: new Date().toISOString(),
            message: error.message,
            digest: error.digest,
        });
    }, [error]);

    return (
        <ErrorState
            fullHeight
            title="Something went wrong"
            message="An unexpected error occurred. Please try again or contact support if the problem persists."
            onRetry={reset}
            retryText="Try Again"
        />
    );
}
