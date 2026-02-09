import { Suspense } from 'react';
import { LoadingState } from '@/components/shared/LoadingState';
import { CostMap } from '@/features/intelligence/components/CostMap';

export const metadata = {
    title: 'Global Cost Map | Tarifyx',
    description: 'Interactive map showing landed cost by country for any HTS code',
};

export default function CostMapPage() {
    return (
        <Suspense fallback={<LoadingState fullHeight message="Loading cost map..." />}>
            <CostMap />
        </Suspense>
    );
}
