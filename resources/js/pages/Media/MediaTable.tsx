import { MediaItem } from '@/types'; // define this if not already
// import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { toast } from 'react-toastify';import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDownIcon, CircleCheck, CircleX, CloudUpload, Copy, Download, EllipsisVertical, FolderPlus, ImagePlus, LayoutGrid, Link, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import Folder from '../../../../public/assets/images/folder.svg';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import deleteIcon from '../../../../public/assets/images/icons/delete-confirm.svg';
import download from '../../../../public/assets/images/icons/download.svg';
import profile from '../../../../public/assets/images/icons/profile1.svg';
import share from '../../../../public/assets/images/icons/share.svg';
import media from '../../../../public/assets/images/media.svg';
import { Checkbox } from '@/components/ui/checkbox';
import axios from 'axios';
import { router } from '@inertiajs/react';
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
        <div>
{/* {MediaItem.data.map((item, idx) => (
                            <div className="rounded-t-xl" key={idx}>
                                <img src={item.imageSrc} alt={item.title} className="bg-size-cover mb-4 w-full rounded-t-xl object-cover" />
                                <ul className="mb-2 flex items-start justify-between gap-3">
                                    <li onClick={uploadMediaUpload} className="cursor-pointer">
                                        <p className="font-tree-regular max-w-[180px] truncate text-sm text-font-secondary">{item.title}</p>
                                        <span className="text-[12px] text-grey1">
                                            {item.size} | {item.dimensions}
                                        </span>
                                    </li>
                                    <li>
                                        <div className="flex items-start gap-3">
                                            <div className="texxt-font-primary rounded-md border border-[#AAAAAA] px-[6px] py-1 text-[12px]">
                                                <p>{item.tag}</p>
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button
                                                        className="h-5 w-5 cursor-pointer outline-none [&>svg]:w-full [&>svg]:stroke-font-primary"
                                                        title="EllipsisVertical"
                                                        type="button"
                                                    >
                                                        <EllipsisVertical />
                                                    </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuPortal>
                                                    <DropdownMenuContent
                                                        className="absolute right-0 min-w-[120px] rounded-lg bg-black"
                                                        sideOffset={5}
                                                    >
                                                        <DropdownMenuGroup>
                                                            <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                <button
                                                                    className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                                                    title="Copy"
                                                                    type="button"
                                                                >
                                                                    <Pencil className="mr-2 text-white" />{' '}
                                                                    <span className="!text-nowrap">Edit</span>
                                                                </button>
                                                            </DropdownMenuItem>

                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                <button
                                                                    className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                                                    title="Copy"
                                                                    type="button"
                                                                >
                                                                    <Copy className="mr-2 text-white" />{' '}
                                                                    <span className="!text-nowrap">Copy link</span>
                                                                </button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                <button
                                                                    className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                                                    title="Download"
                                                                    type="button"
                                                                >
                                                                    <Download className="mr-2 text-white" /> Download
                                                                </button>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                <button
                                                                    className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                                                    title="Delete"
                                                                    type="button"
                                                                >
                                                                    <Trash2 className="mr-2 text-white" /> Delete
                                                                </button>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuGroup>
                                                    </DropdownMenuContent>
                                                </DropdownMenuPortal>
                                            </DropdownMenu>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        ))} */}
        </div>
        
    );
}
