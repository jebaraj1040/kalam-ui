import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useCallback, useRef, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';

import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTrigger } from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DropdownMenuItemIndicator } from '@radix-ui/react-dropdown-menu';
import { Archive, ArrowRightFromLine, ChevronDownIcon, Copy, EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import React from 'react';
import documentDownload from '../../../../public/assets/images/document-download.svg';
interface Template {
    id: number;
    template_name: string;
    status: string;
    // description: string;
    created_at: string;
    updated_at: string;
}

type Props = {
    templates: {
        data: Template[];
        current_page: number;
        last_page: number;
        per_page?: number;
    };
    breadcrumbs: BreadcrumbItem[];
};

export default function Index({ templates, breadcrumbs }: Props) {
    const [filterText, setFilterText] = useState(''); // Date checkbox
    const [fileName, setFileName] = useState(''); // File name state for the uploaded file
    const [checked, setCheckedDate] = React.useState(false);
    const [checkedArchived, setCheckedArchived] = React.useState(false);
    const handleChange = (checked: boolean) => {
        setCheckedDate(checked); // Update the checked state on checkbox toggle
    };
    const handleArchivedChange = (checked: boolean) => {
        setCheckedArchived(checked);
    };
    const [bookmarksChecked, setBookmarksChecked] = React.useState(false);

    const filteredItems = templates.data.filter(
        (item) => item.template_name.toLowerCase().includes(filterText.toLowerCase()) || item.status.toLowerCase().includes(filterText.toLowerCase()),
        // ||item.description.toLowerCase().includes(filterText.toLowerCase()),
    );

    const perPage = templates.per_page || 10;

    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this component?')) {
            router.delete(`/templates/${id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Deleted!');
                },
            });
        }
    };

    // Adds a new top-level schema
    const addSchema = useCallback(() => {
        // setSchema((prev) => [...prev, { id: uuidv4(), title: '', fields: [], children: [] }]);
        // setSchemaShow(true);
    }, []);

    const handleImport = () => {
        alert(1);
        window.location.href = '/template/import-json';
    };

    const handleExport = (id: number) => {
        window.location.href = `/template/${id}/export-json`;
    };
    //file upload logic
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCardClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // handle file upload logic here
            setFileName(file.name); // Update the file name state
            console.log('Selected file:', file);
        }
    };
    const handleFileDelete = () => {
        setFileName(''); // Clear the file name state
    };

    const columns: TableColumn<Template>[] = [
        // {
        //     name: '#',
        //     cell: (row, index) => {
        //         return (components.current_page - 1) * perPage + (index + 1);
        //     },
        //     sortable: true,
        //     width: '70px',
        // },
        {
            name: 'Name',
            selector: (row) => row.template_name,
            sortable: true,
        },
        {
            name: 'Status',
            cell: (row) => (
                <span
                    className={`font-tree-semibold flex items-center justify-center gap-1.5 rounded px-2 py-1 text-xs uppercase ${
                        row.status === 'Active' ? 'bg-[#E8F5E9] text-[#1B5E20]' : 'bg-[#FFEBEE] text-[#B71C1C]'
                    }`}
                >
                    <span className={`block h-1.5 w-1.5 rounded-full ${row.status === 'Active' ? 'bg-[#1B5E20]' : 'bg-[#B71C1C]'}`}></span>{' '}
                    {row.status}
                </span>
            ),
            sortable: true,
        },
        // {
        //     name: 'Description',
        //     selector: (row) => row.description,
        //     wrap: true,
        // },
        {
            name: 'Created By',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <span>Avinash sharma</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Created At',
            selector: (row) => new Date(row.created_at).toLocaleString(),
            sortable: true,
        },
        {
            name: 'Actions',
            cell: (row) => (
                <div>
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
                            <DropdownMenuContent className="absolute right-0 min-w-[120px] rounded-lg bg-black" sideOffset={5}>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <Link
                                            href={`/templates/${row.id}/edit`}
                                            className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                            title="Edit"
                                        >
                                            <Pencil className="mr-2 text-white" /> Edit
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <button
                                            onClick={() => handleExport(row.id)}
                                            className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                            title="Copy"
                                            type="button"
                                        >
                                            <ArrowRightFromLine className="mr-2 text-white" /> Export
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                            title="Copy"
                                            type="button"
                                        >
                                            <Copy className="mr-2 text-white" /> Duplicate
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <button
                                            onClick={() => handleDelete(row.id)}
                                            className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                            title="Copy"
                                            type="button"
                                        >
                                            <Archive className="mr-2 text-white" /> Archive
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <button
                                            onClick={() => handleDelete(row.id)}
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
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px',
        },
    ];

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Templates" />
                <div className="p-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h1 className="heading">Templates</h1>
                        <div className="flex items-center gap-1 lg:gap-4">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button variant={'secondary'} title="Import" type="button" className="font-tree-regular font-text-primary" onClick={handleFileDelete}>
                                        <img src={documentDownload} alt="download" className="h-5 w-5" /> Import
                                    </Button>
                                </DialogTrigger>
                                <DialogPortal>
                                    <DialogOverlay />
                                    <DialogContent
                                        className="md:max-w-[600px] md:p-10"
                                        showClose={true}
                                        closeButtonClassName="!right-2 !top-2 sm:!right-10 sm:!top-10"
                                    >
                                        <p className="font-tree-semibold mb-[2px] text-base leading-7 text-font-secondary md:text-lg">Import JSON</p>
                                        <p className="mb-6 text-xs leading-5 text-font-primary md:mb-8 md:text-sm">
                                            Upload a valid JSON file to import your template structure and content
                                        </p>
                                        <div className={`mb-6 md:mb-8 ${fileName ? '!mb-4' : ''}`}>
                                            <div className="cursor-pointer rounded-xl border border-dashed border-border bg-white p-5" onClick={handleCardClick}>
                                                <input
                                                    type="file"
                                                    accept=".json"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    style={{ display: 'none' }}
                                                />
                                                <div className="mx-auto flex max-w-[381px] flex-col items-center gap-y-1 hover:cursor-pointer">
                                                    <img src={documentDownload} alt="download" className="h-8 w-8" width={32} height={32} />
                                                    <p className="font-tree-medium text-sm leading-5">Upload JSON File</p>
                                                    <p className="text-center text-xs leading-4 text-font-primary">Supported format: .json</p>
                                                    <p className="text-center text-xs leading-4 text-font-primary">
                                                        Make sure your file follows the correct structure to avoid import issues.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {fileName && (
                                        <div className="w-auto md:max-w-[350px] mx-auto flex justify-between gap-3 items-center bg-sidebar-accent rounded-xl p-2 mb-6 md:mb-8">
                                            <p className="text-xs text-sidebar-accent-foreground font-tree-medium break-all">{fileName}</p>
                                            <button type="button" className="" onClick={handleFileDelete}>
                                                <Trash2 className="h-4 w-4 text-red cursor-pointer" />
                                            </button>
                                        </div>
                                        )}
                                        <div className="flex w-full justify-end gap-4 md:gap-6">
                                            <Button variant={'secondary'} title="Cancel" type="button" className="w-1/2 md:w-[134px]">
                                                Cancel{' '}
                                            </Button>
                                            <DialogClose asChild>
                                                <Button variant={'default'} title="Import" type="button" className="w-1/2 md:w-[134px]">
                                                    Import{' '}
                                                </Button>
                                            </DialogClose>
                                        </div>
                                    </DialogContent>
                                </DialogPortal>
                            </Dialog>
                            <Link href="/templates/create" className="button button-primary" title="Create New Component">
                                <span className="button-icon">+</span> Create New Template
                            </Link>
                        </div>
                    </div>

                    <div className="mb-5 flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search by components,type"
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

                            {/* <Button variant={'outline'} title="Filters" type="button" className="font-tree-regular font-text-primary">
                                Filters <SlidersHorizontal />
                            </Button> */}
                        </div>
                    </div>

                    {columns.length == 0 && (
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
                            <p className="font-tree-semibold mb-2 text-xl text-font-secondary">Let’s build your first template</p>
                            <p className="font-tree-regular mb-5 w-full text-sm text-font-primary md:max-w-[20%]">
                                You haven’t created any templates yet. Start by combining saved components to build reusable templates
                            </p>
                            <Link href="/templates/create" className="button button-primary" title="Create New Component">
                                <span className="button-icon">+</span> Create New Template
                            </Link>
                        </div>
                    )}

                    {columns.length > 0 && (
                        <DataTable
                            columns={columns}
                            data={filteredItems}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No components found"
                            className="customTable"
                        />
                    )}
                </div>

                {/* <div className="p-8">
                    <h1 className="mb-4 text-2xl font-bold">Templates</h1>

                    <div className="mb-4 flex items-center justify-between">
                        <Link
                            href="/templates/create"
                            className="inline-block rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
                        >
                            + Create Template
                        </Link>

                        <input
                            type="text"
                            placeholder="Search templates..."
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
                        noDataComponent="No templates found"
                    />
                </div> */}

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant={'default'} title="No" type="button" className="w-1/2 md:w-[120px]">
                            popup{' '}
                        </Button>
                    </DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent className="sm:max-w-[388px] sm:p-8" showClose={true} closeButtonClassName="">
                            <p className="mb-6 text-base leading-6 font-semibold text-font-secondary">
                                Add a note for this version <span className="text-base leading-[140%] font-medium text-font-primary">(optional)</span>
                            </p>
                            <div className="mb-6">
                                <textarea
                                    data-type="input"
                                    className="min-h-[96px] w-full rounded-2xl border border-border px-4 py-[14px] text-sm leading-5 text-font-secondary"
                                    name="messagebox"
                                    id="messagebox"
                                    placeholder="Enter your comments here"
                                ></textarea>
                            </div>
                            <div className="flex w-full justify-between gap-4 md:gap-6">
                                <DialogClose asChild>
                                    <Button variant={'secondary'} title="Cancel" type="button" className="w-1/2">
                                        Cancel{' '}
                                    </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button variant={'default'} title="Save" type="button" className="w-1/2">
                                        Save{' '}
                                    </Button>
                                </DialogClose>
                            </div>
                        </DialogContent>
                    </DialogPortal>
                </Dialog>
            </AppLayout>
        </>
    );
}
