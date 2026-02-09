import { Suspense } from 'react';
import { FTAQualificationCalculator } from '@/features/compliance/components/FTAQualificationCalculator';
import { LoadingState } from '@/components/shared';

export default function FTACalculatorPage() {
    return (
        <Suspense fallback={<LoadingState />}>
            <FTAQualificationCalculator />
        </Suspense>
    );
}
