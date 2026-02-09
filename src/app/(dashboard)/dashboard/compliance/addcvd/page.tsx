import { Suspense } from 'react';
import { ADCVDLookup } from '@/features/compliance/components/ADCVDLookup';
import { LoadingState } from '@/components/shared';

export default function ADCVDPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <ADCVDLookup />
        </Suspense>
    );
}
