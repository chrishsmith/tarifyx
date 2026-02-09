import { redirect } from 'next/navigation';

// Redirect to classify page with bulk mode
export default function BulkClassifyRedirect() {
    redirect('/dashboard/import/analyze?mode=bulk');
}
