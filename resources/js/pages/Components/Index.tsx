import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, ArrowRightFromLine, CheckIcon, ChevronDownIcon, Component, Copy, EllipsisVertical, Pencil, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import documentDownload from '../../../../public/assets/images/document-download.svg';
import deleteIcon from '../../../../public/assets/images/icons/delete-confirm.svg';
import profile from '../../../../public/assets/images/icons/profile1.svg';
// import successIcon from "../../../../public/assets/images/icons/success.gif"

interface UserDetails {
    name: string;
    email: string;
}

interface Component {
    id: string;
    component_name: string;
    status: string;
    get_user_details: UserDetails;
    // description: string;
    created_at: string;
    updated_at: string;
}

type Props = {
    components: {
        data: Component[];
        current_page: number;
        last_page: number;
        per_page?: number;
    };
    breadcrumbs: BreadcrumbItem[];
};

export default function Index({ components, breadcrumbs }: Props) {
    const [filterText, setFilterText] = useState('');
    const [checkedArchived, setCheckedArchived] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [issuccessOpen, setIsSuccessOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [profileDetails, setProfileDetails] = useState<Map<string, string>>(new Map([]));
    const [status, setStatus] = useState<Map<string, string>>(new Map([]));
    const [selectedUserNameId, setSelecteduserNameId] = useState<Set<string>>(new Set([]));
    const [selectedStatus, setSelectedstatusId] = useState<Set<string>>(new Set([]));

    useEffect(() => {
        const newProfileMap = new Map<string, string>();
        const newStatusMap = new Map<string, string>();
        components.data.forEach((comp) => {
            newProfileMap.set(comp.get_user_details.name, comp.id);
            newStatusMap.set(comp.status, comp.id);
        });
        setProfileDetails(newProfileMap);
        setStatus(newStatusMap);
    }, [components]);

    const toggleCheckbox = (id: string, type: string) => {
        if (type === 'name') {
            setSelecteduserNameId((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }
                return newSet;
            });
        }
        if (type === 'status') {
            setSelectedstatusId((prev) => {
                const newSet = new Set(prev);
                if (newSet.has(id)) {
                    newSet.delete(id);
                } else {
                    newSet.add(id);
                }
                return newSet;
            });
        }
    };

    // console.log(setSelecteduserNameId);

    const handleArchivedChange = (checked: boolean) => {
        setCheckedArchived(checked);
    };

    const filteredItems = components.data.filter(
        (item) =>
            item.component_name.toLowerCase().includes(filterText.toLowerCase()) || item.status.toLowerCase().includes(filterText.toLowerCase()),
        // ||item.description.toLowerCase().includes(filterText.toLowerCase()),
    );

    const perPage = components.per_page || 10;

    const handleDelete = (id: string) => {
        setSelectedId(id);
        setIsDialogOpen(true);
    };

    // Confirm delete:
    const confirmDelete = () => {
        if (selectedId !== null) {
            router.delete(`/components/${selectedId}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsDialogOpen(false);
                    console.log('Deleted!');
                },
            });
            setIsDialogOpen(false);
            setSelectedId(null);
        }
    };

    const handleImport = () => {
        window.location.href = '/component/import-json';
    };

    const handleExport = (id: string) => {
        window.location.href = `/component/${id}/export-json`;
    };

    const columns: TableColumn<Component>[] = [
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
            selector: (row) => row.component_name,
            sortable: true,
        },

        // {
        //     name: 'Description',
        //     selector: (row) => row.description,
        //     wrap: true,
        // },
        {
            name: 'COMPONENTS',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <span>03</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'LAST UPDATED',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <span>5 hours ago</span>
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
            name: 'Created By',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <img src={profile} alt="download" />
                    <span>{row.get_user_details?.name ?? 'Unknown'}</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'VERSION',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <span>v2.0</span>
                </div>
            ),
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
                                            href={`/components/${row.id}/edit`}
                                            className=" flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
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
                                            // onClick={() => handleDelete(row.id)}
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
                                            // onClick={() => handleDelete(row.id)}
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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild></DialogTrigger>
                        <DialogPortal>
                            <DialogOverlay />
                            <DialogContent className="sm:max-w-[388px] sm:p-8" showClose={false}>
                                <div className="mx-auto mb-4 sm:mb-8">
                                    <img
                                        src={deleteIcon}
                                        className="h-[138px] w-40 lg:h-[163px] lg:w-[167px]"
                                        width={167}
                                        height={163}
                                        alt="delete"
                                    />
                                </div>
                                <DialogTitle className="mb-4  text-center text-sm leading-[140%] font-medium text-font-secondary sm:mb-8 sm:text-base md:text-xl">
                                    Are you sure you want to delete this component?
                                </DialogTitle>
                                {/* Your dialog content goes here */}
                                <div className="flex w-full justify-center gap-4 md:gap-6">
                                    <Button variant={'secondary'} title="yes" type="button" className="w-1/2 md:w-[120px]" onClick={confirmDelete}>
                                        yes{' '}
                                    </Button>
                                    <DialogClose asChild>
                                        <Button variant={'default'} title="No" type="button" className="w-1/2 md:w-[120px]">
                                            No{' '}
                                        </Button>
                                    </DialogClose>
                                </div>
                            </DialogContent>
                        </DialogPortal>
                    </Dialog>
                    {/* <Dialog open={issuccessOpen} onOpenChange={setIsSuccessOpen}>
                    <DialogTrigger asChild></DialogTrigger>
                    <DialogPortal>
                        <DialogOverlay />
                            <DialogContent className="sm:max-w-[388px] sm:p-8" showClose={false}>
                                <div className='mx-auto mb-4 sm:mb-8'>
                                    <img src={successIcon} alt='success' width={160} height={160} className="w-40 h-40" />
                                </div>
                                <DialogTitle className="text-sm sm:text-base md:text-xl text-center
                                        mb-[2px] font-medium text-font-secondary leading-[140%] mb-4 sm:mb-8">component is successfully deleted </DialogTitle>
                            </DialogContent>
                    </DialogPortal>
                </Dialog> */}
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
                <Head title="Components" />
                <div className="p-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h1 className="heading">Components</h1>
                        <div className="flex items-center gap-1 lg:gap-4">
                            <Button
                                variant={'secondary'}
                                title="Import"
                                type="button"
                                onClick={handleImport}
                                className="font-tree-regular font-text-primary"
                            >
                                <img src={documentDownload} alt="download" className="h-5 w-5" /> Import
                            </Button>
                            <Link href="/components/create" className="button button-primary" title="Create New Component">
                                <span className="button-icon">+</span> Create New Component
                            </Link>
                        </div>
                    </div>

                    <div className="mb-4 flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search components..."
                            className="form-input h-10 w-1/3 bg-[url('asset/images/icons/search.svg')] bg-input bg-[14px_center] bg-no-repeat pl-10"
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
                                    <DropdownMenuContent className="min-w-[120px] rounded-lg bg-[#1a1a1a] p-4" sideOffset={5}>
                                        <input
                                            type="text"
                                            placeholder="Search profiles"
                                            className="form-input mb-4 h-10 max-w-[194px] bg-transparent bg-[url('asset/images/icons/search.svg')] bg-[14px_center] bg-no-repeat pl-10 text-white placeholder-[#898989]"
                                        />
                                        {profileDetails.size > 0 ? (
                                            [...profileDetails].map(([uname, id]) => (
                                                <DropdownMenuCheckboxItem
                                                    key={uname}
                                                    className="group relative mb-2 flex h-[25px] items-center rounded-[3px] px-[5px] text-[13px] leading-none text-white select-none last:mb-0"
                                                    checked={selectedUserNameId.has(uname)}
                                                    onCheckedChange={() => toggleCheckbox(uname, 'name')}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`h-5 w-5 rounded border border-[#898989] ${
                                                                selectedUserNameId.has(uname) ? 'bg-primary' : 'bg-transparent'
                                                            }`}
                                                        >
                                                            {selectedUserNameId.has(uname) && <CheckIcon className="size-4" />}
                                                        </div>
                                                        <div className="ml-3 flex items-center">
                                                            <img
                                                                src="asset/images/icons/profile-1.webp"
                                                                alt="profile"
                                                                className="mr-2 h-5 w-5 rounded-lg"
                                                            />
                                                            {uname ?? 'Unknown'}
                                                        </div>
                                                    </div>
                                                </DropdownMenuCheckboxItem>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-400">No creators found</div>
                                        )}
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
                                        <ChevronDownIcon className="ml-1 h-4.5 w-4.5" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuPortal>
                                    <DropdownMenuContent className="min-w-[120px] rounded-lg bg-black p-4" sideOffset={5}>
                                        <DropdownMenuLabel className="font-tree-regular px-0 py-3 text-sm text-[#898989]">
                                            Select status
                                        </DropdownMenuLabel>
                                        {status.size > 0 ? (
                                            [...status].map(([sname, id]) => (
                                                <DropdownMenuCheckboxItem
                                                    key={sname}
                                                    className="group relative mb-2 flex h-[25px] items-center rounded-[3px] px-[5px] text-[13px] leading-none text-white select-none last:mb-0"
                                                    checked={selectedStatus.has(sname)}
                                                    onCheckedChange={() => toggleCheckbox(sname, 'status')}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`h-5 w-5 rounded border border-[#898989] ${
                                                                selectedStatus.has(sname) ? 'bg-primary' : 'bg-transparent'
                                                            }`}
                                                        >
                                                            {selectedStatus.has(sname) && <CheckIcon className="size-4" />}
                                                        </div>
                                                        <div className="ml-3 flex items-center">
                                                            {sname ?? 'Unknown'}
                                                        </div>
                                                    </div>
                                                </DropdownMenuCheckboxItem>
                                            ))
                                        ) : (
                                            <div className="text-sm text-gray-400">No status found</div>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenuPortal>
                            </DropdownMenu>
                            {/* <Button variant={'outline'} title='Filters' type='button' >Filters <SlidersHorizontal /></Button> */}
                        </div>
                    </div>
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
                </div>
            </AppLayout>
        </>
    );
}
