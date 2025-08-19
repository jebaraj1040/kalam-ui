import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';

interface Revision {
    id: string;
    revision_number: number;
    changes: string[];
    created_at: string;
}

interface PageData {
    id: string;
    page_name: string;
}

interface Props {
    page: PageData;
    revisions: Revision[];
    breadcrumbs: BreadcrumbItem[];
}

export default function Revisions({ page, revisions, breadcrumbs }: Props) {
    console.log(page, 'revision', revisions);
    const handleRevert = (revisionId: string) => {
        if (!confirm('Are you sure you want to revert to this revision?')) return;

        router.post(
            route('admin.pages.revertRevision', {
                page: page.id,
                revision: revisionId,
            }),
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Revisions for ${page.page_name}`} />

            <div className="p-6">
                <h1 className="mb-4 text-2xl font-bold">Revisions for: {page.page_name}</h1>

                <div className="rounded bg-white p-4 shadow">
                    <table className="w-full table-auto text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="p-2">Revision #</th>
                                <th className="p-2">Created At</th>
                                <th className="p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {revisions.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-500">
                                        No revisions found.
                                    </td>
                                </tr>
                            ) : (
                                revisions.map((rev) => (
                                    <tr key={rev.id} className="border-b">
                                        <td className="p-2 font-bold">#{rev.revision_number}</td>
                                        <td className="p-2">
                                            <ul className="ml-4 list-disc text-sm">
                                                {rev.changes.map((change, idx) => (
                                                    <li key={idx}>{change}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="p-2 text-sm text-gray-600">{rev.created_at}</td>
                                        <td className="p-2">
                                            <button className="text-blue-600 hover:underline" onClick={() => handleRevert(rev.id)}>
                                                Revert
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
