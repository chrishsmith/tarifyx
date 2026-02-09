import { Suspense } from 'react';
import { DeniedPartySearch } from '@/features/compliance/components/DeniedPartySearch';
import { LoadingState } from '@/components/shared';

export default function DeniedPartyPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <DeniedPartySearch />
        </Suspense>
    );
}
