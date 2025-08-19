import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItemIndicator,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuTrigger,
} from '@radix-ui/react-dropdown-menu';
import { ChevronDownIcon } from 'lucide-react';
import React, { useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import documentDownload from '../../../../public/assets/images/document-download.svg';

interface Page {
    page_slug: any;
    description: any;
    template_id: any;
    components: any;
    raw_components: any;
    id: number;
    page_name: string;
    status: string;
    template: {
        id: string;
        template_name: string;
    };
    created_at: string;
    updated_at: string;
}

type Props = {
    pages: {
        data: Page[];
        current_page: number;
        last_page: number;
        per_page?: number;
    };
    breadcrumbs: BreadcrumbItem[];
};

export default function Index({ pages, breadcrumbs }: Props) {
    const [filterText, setFilterText] = useState('');

    const filteredItems = pages.data.filter(
        (item) =>
            item.page_name.toLowerCase().includes(filterText.toLowerCase()) ||
            item.template.template_name.toLowerCase().includes(filterText.toLowerCase()),
    );

    const perPage = pages.per_page || 10;

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this page?')) {
            router.delete(`/pages/${id}`);
        }
    };

    const [bookmarksChecked, setBookmarksChecked] = React.useState(false);

    const columns: TableColumn<Page>[] = [
        // {
        //     name: '#',
        //     cell: (row, index) => {
        //         // console.log(row);
        //         return (pages.current_page - 1) * perPage + (index + 1);
        //     },
        //     sortable: true,
        //     width: '70px',
        // },
        {
            name: 'Name',
            selector: (row) => row.page_name,
            sortable: true,
        },
        {
            name: 'Template',
            selector: (row) => row?.template?.template_name,
            wrap: true,
        },
        // {
        //     name: 'Status',
        //     cell: (row) => (
        //         <span
        //             className={`rounded px-2 py-1 text-xs font-semibold ${
        //                 row.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
        //             }`}
        //         >
        //             {row.status}
        //         </span>
        //     ),
        //     sortable: true,
        // },
        {
            name: 'Created At',
            selector: (row) => new Date(row.created_at).toLocaleString(),
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div className="flex flex-wrap gap-2">
                    <Link href={`/pages/${row.id}/edit`} className="rounded bg-yellow-500 px-3 py-1 text-xs text-white hover:bg-yellow-600">
                        Edit
                    </Link>
                    <button
                        onClick={() => window.open(`/pages/${row.id}/export-xml`, '_blank')}
                        className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                    >
                        Export XML
                    </button>
                    <Link href={`/pages/${row.id}/revisions`} className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600">
                        Revisions
                    </Link>
                    <button onClick={() => handleDelete(row.id)} className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700">
                        Delete
                    </button>
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
        },
    ];

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Pages" />
                <div className="p-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h1 className="heading">Pages</h1>
                        <div className="flex items-center gap-4">
                            <Button variant={'secondary'} title="Import" type="button" className="font-tree-regular font-text-primary">
                                <img src={documentDownload} alt="download" className="h-[20px] w-[20px]" /> Import
                            </Button>
                            <Link href="/pages/create" className="button button-primary" title="Create New Component">
                                <span className="button-icon">+</span> Create New Page
                            </Link>
                        </div>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search components..."
                            className="form-input h-10 w-1/3 bg-[url('asset/images/icons/search.svg')] bg-[14px_center] bg-no-repeat pl-10"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="font-tree-medium flex min-w-[92px] items-center rounded-xl border border-border bg-input px-4 py-[10px] text-left text-sm text-font-primary outline-none"
                                        aria-label="Customise options"
                                    >
                                        Created by
                                        <ChevronDownIcon className="ml-[4px] h-[18px] w-[18px]" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuPortal>
                                    <DropdownMenuContent className="min-w-[120px] rounded-lg bg-black p-4" sideOffset={5}>
                                        <input
                                            type="text"
                                            placeholder="Search profiles"
                                            className="form-input mb-4 h-10 max-w-[194px] bg-transparent bg-[url('asset/images/icons/search.svg')] bg-[14px_center] bg-no-repeat pl-10 text-white placeholder-[#898989]"
                                        />
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3 flex items-center">
                                                    <img src="asset/images/icons/profile-1.webp" alt="profile" className="mr-2 h-5 w-5 rounded-lg" />
                                                    Avinash sharma
                                                </span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3 flex items-center">
                                                    <img src="asset/images/icons/profile-2.webp" alt="profile" className="mr-2 h-5 w-5 rounded-lg" />
                                                    Hema singh
                                                </span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3 flex items-center">
                                                    <img src="asset/images/icons/profile-3.webp" alt="profile" className="mr-2 h-5 w-5 rounded-lg" />
                                                    Risabh Gera
                                                </span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3 flex items-center">
                                                    <img src="asset/images/icons/profile-2.webp" alt="profile" className="mr-2 h-5 w-5 rounded-lg" />
                                                    Hema singh
                                                </span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenuPortal>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button
                                        className="font-tree-medium active relative flex min-w-[92px] items-center rounded-xl border border-border bg-input px-4 py-[10px] text-left text-sm text-font-primary outline-none before:absolute before:-top-[5px] before:right-[15px] before:h-3 before:w-3 before:rounded-[50px] before:bg-[#B71C1C] active:before:content-['']"
                                        aria-label="Customise options"
                                    >
                                        Status
                                        <ChevronDownIcon className="ml-[4px] h-[18px] w-[18px]" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuPortal>
                                    <DropdownMenuContent className="min-w-[120px] rounded-lg bg-black p-4" sideOffset={5}>
                                        <DropdownMenuLabel className="font-tree-regular px-0 py-3 text-sm text-[#898989]">
                                            Select status
                                        </DropdownMenuLabel>
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3">Active</span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3">Archived</span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                        <DropdownMenuCheckboxItem
                                            className="group relative mb-2 flex h-[25px] items-center rounded-[3px] pr-[5px] pl-[25px] text-[13px] leading-none text-white select-none last:mb-0"
                                            checked={bookmarksChecked}
                                            onCheckedChange={setBookmarksChecked}
                                        >
                                            <DropdownMenuItemIndicator>
                                                <span className="ml-3">Draft</span>
                                            </DropdownMenuItemIndicator>
                                        </DropdownMenuCheckboxItem>
                                    </DropdownMenuContent>
                                </DropdownMenuPortal>
                            </DropdownMenu>
                            {/* <Button variant={'outline'} title='Filters' type='button' >Filters <SlidersHorizontal /></Button> */}
                        </div>
                    </div>

                </div>
                <div className="m-auto flex w-full flex-col items-center justify-center text-center">
                        <span>
                            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path
                                    fill-rule="evenodd"
                                    clip-rule="evenodd"
                                    d="M162.408 147.901C163.106 147.655 163.839 147.329 164.405 146.856C165.077 146.294 165.35 145.571 165.534 144.81C165.769 143.832 165.864 142.79 166.149 141.81C166.255 141.447 166.459 141.309 166.546 141.248C166.767 141.094 166.99 141.053 167.2 141.068C167.449 141.086 167.791 141.179 168.015 141.592C168.047 141.651 168.089 141.741 168.117 141.864C168.138 141.954 168.151 142.237 168.172 142.353C168.226 142.64 168.272 142.927 168.314 143.216C168.456 144.176 168.537 144.991 168.984 145.874C169.59 147.071 170.198 147.804 171.021 148.129C171.818 148.442 172.77 148.383 173.987 148.137C174.103 148.11 174.218 148.086 174.331 148.066C174.868 147.974 175.38 148.322 175.486 148.851C175.591 149.379 175.25 149.894 174.719 150.01C174.608 150.034 174.498 150.057 174.39 150.078C172.746 150.48 170.842 151.917 169.735 153.176C169.394 153.564 168.895 154.648 168.386 155.34C168.01 155.851 167.588 156.187 167.233 156.306C166.996 156.386 166.795 156.374 166.63 156.333C166.389 156.275 166.19 156.146 166.037 155.941C165.953 155.829 165.876 155.679 165.839 155.487C165.821 155.394 165.82 155.16 165.82 155.054C165.716 154.701 165.589 154.356 165.497 154C165.276 153.15 164.843 152.611 164.328 151.9C163.847 151.235 163.33 150.817 162.572 150.483C162.474 150.459 161.678 150.267 161.397 150.156C160.987 149.994 160.792 149.723 160.721 149.577C160.6 149.328 160.588 149.112 160.612 148.931C160.647 148.664 160.768 148.436 160.983 148.252C161.116 148.137 161.315 148.026 161.581 147.972C161.787 147.929 162.332 147.905 162.408 147.901ZM167.074 146.516C167.111 146.597 167.151 146.678 167.192 146.761C168.08 148.515 169.073 149.494 170.28 149.969L170.321 149.985C169.513 150.578 168.782 151.24 168.224 151.875C167.994 152.137 167.689 152.68 167.36 153.237C167.061 152.276 166.572 151.597 165.958 150.747C165.488 150.098 164.996 149.61 164.391 149.212C164.861 148.974 165.308 148.695 165.698 148.369C166.347 147.827 166.776 147.198 167.074 146.516Z"
                                    fill="#E1E1E1"
                                />
                                <ellipse cx="9.62347" cy="84.9218" rx="3.62347" ry="3.58363" fill="#E1E1E1" />
                                <rect x="61.0879" y="63.2581" width="131.704" height="46.9557" rx="16" fill="#111111" />
                                <rect x="115.455" y="79.4231" width="44.4119" height="6.15812" rx="3.07906" fill="#F7F7F7" />
                                <rect x="72.5742" y="88.6602" width="87.5162" height="6.15812" rx="3.07906" fill="white" />
                                <ellipse cx="175.946" cy="87.1208" rx="7.65723" ry="7.69765" fill="#FAF1E0" />
                                <rect x="6" y="102.516" width="131.704" height="46.9557" rx="16" fill="#F3DBB0" />
                                <rect x="38.9268" y="118.681" width="44.4119" height="6.15812" rx="3.07906" fill="#D27401" />
                                <rect x="38.9268" y="127.918" width="87.5162" height="6.15812" rx="3.07906" fill="white" />
                                <ellipse cx="25.1436" cy="126.379" rx="7.65723" ry="7.69765" fill="#D27401" />
                            </svg>
                        </span>
                        <p className="font-tree-semibold mb-2 text-xl text-font-secondary">No pages created yet</p>
                        <p className="font-tree-regular mb-5 w-full text-sm text-font-primary md:max-w-[20%]">
                            Start by creating a new page using a saved template and reusable components
                        </p>
                        {/* <Button variant={'default'} onClick={addSchema} title="Create New Template" type="button">
                                            + Create New Template{' '}
                                        </Button> */}

                        <Link href="/pages/create" className="button button-primary" title="Create New Component">
                            <span className="button-icon">+</span> Create New Page
                        </Link>
                    </div>

                {/* <div className="p-8">
                    <h1 className="mb-4 text-2xl font-bold">Pages</h1>

                    <div className="mb-4 flex items-center justify-between">
                        <Link href="/pages/create" className="inline-block rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                            + Create Page
                        </Link>

                        <input
                            type="text"
                            placeholder="Search pages..."
                            className="w-1/3 rounded border border-gray-300 px-4 py-2"
                            value={filterText}
                            onChange={(e) => setFilterText(e.target.value)}
                        />
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredItems}
                        pagination
                        highlightOnHover
                        striped
                        responsive
                        noDataComponent="No pages found"
                    />
                </div> */}
            </AppLayout>
        </>
    );
}
