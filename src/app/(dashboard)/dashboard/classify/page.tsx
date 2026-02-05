import { redirect } from 'next/navigation';

// Redirect /dashboard/classify to /dashboard/import/analyze
// Main classification entry point is Import Intelligence
export default function ClassifyRedirect() {
    redirect('/dashboard/import/analyze');
}
