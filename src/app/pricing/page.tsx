import { Metadata } from 'next';
import { PricingPageContent } from './PricingPageContent';

export const metadata: Metadata = {
    title: 'Pricing - Tarifyx',
    description: 'Simple, transparent pricing. Classification is free. Optimization is Pro.',
};

export default function PricingPage() {
    return <PricingPageContent />;
}


