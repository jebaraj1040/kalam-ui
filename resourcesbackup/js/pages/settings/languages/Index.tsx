import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

interface Language {
    id: string;
    name: string;
    code: string;
    default: boolean;
}

type Props = {
    languages: {
        total: number | undefined;
        data: Language[];
        current_page: number;
        last_page: number;
        per_page?: number;
    };
    breadcrumbs: BreadcrumbItem[];
    filters: {
        search?: string;
    };
};

export default function Index({ languages, breadcrumbs, filters }: Props) {
    const [filterText, setFilterText] = useState(filters?.search || '');

    // const perPage = languages.per_page || 10;

    const filteredItems = languages.data;

    const handleStatusChange = (selectedId: string) => {
        router.patch(
            `/settings/languages/${selectedId}/set-default`,
            {},
            {
                preserveState: true,
            },
        );
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this language?')) {
            router.delete(`/languages/${id}`);
        }
    };

    const columns: TableColumn<Language>[] = [
        // {
        //     name: '#',
        //     cell: (row) => (
        //         <span title={row.id} className="font-mono text-xs">
        //             {row.id.slice(0, 2)}...{row.id.slice(-2)}
        //         </span>
        //     ),
        //     width: '120px',
        // },
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Code',
            selector: (row) => row.code,
            sortable: true,
        },
        {
            name: 'Default',
            cell: (row) => (
                <label className="flex items-center gap-2">
                    <input type="radio" name="defaultStatus" checked={row.default === true} onChange={() => handleStatusChange(row.id)} />
                </label>
            ),
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex gap-2">
                    <Link href={`/settings/languages/${row.id}/edit`} className="rounded bg-yellow-500 px-2 py-1 text-xs text-white">
                        Edit
                    </Link>
                    <button onClick={() => handleDelete(row.id)} className="rounded bg-red-600 px-2 py-1 text-xs text-white">
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Languages" />
            <SettingsLayout>
                <div className="space-y-6">
                    <h1 className="mb-4 text-2xl font-bold">Languages</h1>

                    <div className="mb-4 flex items-center justify-between">
                        {/* <Link href="/settings/languages/create" className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                            + Add Language
                        </Link> */}

                        <input
                            type="text"
                            placeholder="Search languages..."
                            className="w-1/3 rounded border px-4 py-2"
                            value={filterText}
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setFilterText(newValue);
                                router.get('/settings/languages', { search: newValue }, { preserveState: true });
                            }}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        pagination
                        paginationServer
                        paginationTotalRows={languages.total}
                        onChangePage={(page) => {
                            router.get('/settings/languages', { page, search: filterText }, { preserveState: true });
                        }}
                        striped
                        responsive
                        highlightOnHover
                        noDataComponent="No languages found"
                    />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
