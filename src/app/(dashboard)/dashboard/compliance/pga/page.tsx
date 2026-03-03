import { Suspense } from 'react';
import { PGALookup } from '@/features/compliance/components/PGALookup';
import { LoadingState } from '@/components/shared';

export default function PGAPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <PGALookup />
        </Suspense>
    );
}
