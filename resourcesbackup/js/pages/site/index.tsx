import AdminLayout from '@/layouts/admin-layout';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import DataTable from 'react-data-table-component';

type Site = {
    site_id: number;
    name: string;
    status: string;
};

type Props = {
    sites: {
        data: Site[];
        current_page: number;
        last_page: number;
    };
    breadcrumbs: BreadcrumbItem[];
};

export default function Index({ sites, breadcrumbs }: Props) {
    const columns = [
        {
            name: 'Site ID',
            selector: (row: any) => row.site_id,
            sortable: true,
        },
        {
            name: 'Name',
            selector: (row: any) => row.name,
            sortable: true,
        },
        {
            name: 'Status',
            selector: (row: any) => row.status,
            sortable: true,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sites" />

            <AdminLayout title="Site" description="Listing all Site">
                <div className="md:py-12">
                    <DataTable columns={columns} data={sites.data} pagination />
                </div>
            </AdminLayout>
        </AppLayout>
    );
}
