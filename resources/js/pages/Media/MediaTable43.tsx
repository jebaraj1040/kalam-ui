import { MediaItem } from '@/types'; // define this if not already
import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';

type MediaPagination = {
    data: MediaItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

type Props = {
    mediaItems: MediaPagination;
    getImageUrl: (item: MediaItem) => string;
};

export default function MediaIndex({ mediaItems, getImageUrl }: Props) {
    const [filterText, setFilterText] = useState('');

    const handleFilterChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setFilterText(newValue);
        console.log(e.target.value);
        try {
            const response = await axios.get('/media', {
              params: { searchString: newValue },
            });
        
            console.log('Filtered results:', response.data);
          } catch (error) {
            console.error('Error fetching filtered data:', error);
          }
    };

    const perPage = mediaItems.per_page;

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            const response = await axios.delete(`/media/${id}`);

            if (response.status === 200) {
                console.log('Deleted successfully');
                toast.success(`${response.data.message}`);
                router.reload({ only: ['mediaItems'] });
            }
        } catch (error) {
            console.error('Error deleting item:', error);
            toast.success('Error deleting item');
        }
    };

    const columns: TableColumn<MediaItem>[] = [
        {
            name: 'Name',
            selector: (row) => row.name,
            sortable: true,
        },
        {
            name: 'Path',
            selector: (row) => row.folder?.name || 'Unknown',
        },
        {
            name: 'Tags',
            selector: (row) => row.tagNames,
        },
        {
            name: 'Preview',
            cell: (row) => <img src={getImageUrl(row)} alt={row.name} width={80} height={80} className="rounded object-cover" />,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex gap-2">
                    <Link href={`/media/${row.id}/edit`} className="text-blue-600 underline">
                        Edit
                    </Link>
                    <button onClick={() => handleDelete(row.id)} className="text-red-600 underline">
                        Delete
                    </button>
                </div>
            ),
        },
    ];

    const handlePageChange = (page: number) => {
        router.get(route('admin.media.index'), { page }, { preserveState: true });
    };

    return (
        <div className="p-8">
            <div className="mb-4 flex justify-between">
                <input
                    type="text"
                    placeholder="Search media..."
                    className="rounded border px-3 py-2"
                    value={filterText}
                    onChange={handleFilterChange}
                />
            </div>

            <DataTable
                columns={columns}
                data={mediaItems.data}
                pagination
                paginationServer
                paginationTotalRows={mediaItems.total}
                paginationPerPage={perPage}
                paginationDefaultPage={mediaItems.current_page}
                onChangePage={handlePageChange}
                highlightOnHover
                striped
                noDataComponent="No media found"
            />
        </div>
    );
}
