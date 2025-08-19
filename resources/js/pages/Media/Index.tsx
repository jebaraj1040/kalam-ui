import { Button } from '@/components/ui/button';
import React, { useRef, useState,Component } from 'react';
import AppLayout from '@/layouts/app-layout';
import { Head, router, usePage } from '@inertiajs/react';
import {
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
import DataTable, { TableColumn } from 'react-data-table-component';
import deleteIcon from '../../../../public/assets/images/icons/delete-confirm.svg';
import download from '../../../../public/assets/images/icons/download.svg';
import profile from '../../../../public/assets/images/icons/profile1.svg';
import share from '../../../../public/assets/images/icons/share.svg';
import media from '../../../../public/assets/images/media.svg';
import { Checkbox } from '@/components/ui/checkbox';
import {BreadcrumbItem, ImageTag, MediaItem, OptionType } from '@/types';
import { toast } from 'react-toastify';
import axios from 'axios';



type MediaProps = {
    pages: any; // Replace 'any' with the actual type if available
    breadcrumbs: any; // Replace 'any' with the actual type if available
    folders: any;
    mediaItems: MediaPagination;
    imageTags: ImageTag[];
};
type MediaPagination = {
    data: MediaItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
export default function Media({ pages, breadcrumbs }: MediaProps) {
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showTextInput, setShowTextInput] = useState(false);
    const [cdnUrl, setCdnUrl] = useState('');
    const [folderPathId, setFolderPathId] = useState<string | null>(null);
    const [folderName, setFolderName] = useState('');
    const [isCreateFolder, setCreateFolder] = useState(false);
    const [isMediaUpload, setMediaUpload] = useState(false);
    const [isFolderCreate, setFolderCreate] = useState(false);
    const [isUploadPopup, setUploadPopup] = useState(false);
    const [newFieldType, setNewFieldType] = useState(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [isGridView, setIsGridView] = useState(true);
    const openCreateDialog = () => setCreateFolder(true);
    const openMediaUpload = () => setMediaUpload(true);
    const uploadMediaUpload = () => setUploadPopup(true);
    const [errors, setErrors]: any = useState({});
    const [options, setOptions] = useState<OptionType[]>(imageTags.map((tag) => ({ value: tag.id, label: tag.tagname })));
    const [formData, setFormData] = useState({
    folderName: "",
    parent_folder_id:""
  })

    const getImageUrl = (item: MediaItem) => {
            if (item.folder?.name) {
                return `http://strapi-assets.dv/${item.folder.name}/${item.name}`;
            }
            return `/uploads/${item.name}`;
        };
    const handleFolderCreate = async (event:any) => {
         event.preventDefault();
            try {
                const response = await axios.post('/folder', formData);
                if (response.data.success) {
                    toast.success(response.data.message);
                    router.push("media");
                    // router.reload({ only: ['folders'] });
                } else {
                    console.error('Folder creation failed:', response.data.message);
                    toast.error(`Folder creation failed: ${response.data.message}`);
                }
            } catch (error) {
                console.error('Error creating folder:', error);
            }
        };
        
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = {
        ...formData,
        [name]: value,
    };
    setFormData(updatedFormData);
    };
    const handleSubmit = () => {
        const selectedTagIds = selectedOptions.map((opt) => opt.value);
        if (!selectedFile && !cdnUrl) {
            alert('No file or CDN URL provided.');
            return;
        }

        // const formData = new FormData();

        if (selectedFile) {
            uploadFileToServer(selectedFile);
        } else if (cdnUrl) {
            fetch(cdnUrl)
                .then((res) => res.blob())
                .then((blob) => {
                    const filename = cdnUrl.split('/').pop() || 'cdn-upload.jpg';
                    const file = new File([blob], filename, { type: blob.type });
                    uploadFileToServer(file);
                })
                .catch((err) => {
                    alert('Failed to load image from CDN URL.');
                    console.error('CDN fetch error:', err);
                });
        } else {
            alert('Please select a file or enter a CDN URL.');
        }
        return;
    };
    // const uploadFileToServer = async (fileToUpload: File) => {
    //         const selectedTagIds = selectedOptions.map((opt) => opt.value);
    //         const formData = new FormData();
    //         formData.append('file', fileToUpload);
    //         if (folderPathId !== null) {
    //             formData.append('folder_path_id', folderPathId);
    //         }
    
    //         formData.append('image_tags', JSON.stringify(selectedTagIds));
    //         formData.append('New_image_tags', JSON.stringify(newlyCreatedOptions));
    
    //         try {
    //             const response = await axios.post('/media', formData);
    //             if (response.data.success) {
    //                 console.log('Upload successful...');
    //                 toast.success('assets added  successfully!');
    //                 resetUploadFields();
    //                 router.reload({ only: ['mediaItems'] });
    //             } else {
    //                 toast.error(`asset creation failed`,response.data.message);
    //                 console.error('Upload failed:', response.data.message);
    //             }   
    //         } catch (error) {
    //             toast.error(`failed to add assets`);
    //             console.error('Error during upload:', error);
    //         }
    //     };
        const CreateFolders = [
        {
            title: 'Novac home page',
            fileCount: 5,
            fileSize: '2 MB',
        },
        {
            title: 'Solutions',
            fileCount: 5,
            fileSize: '2 MB',
        },
        {
            title: 'STATIM',
            fileCount: 5,
            fileSize: '2 MB',
        }
        ,
        {
            title: 'Novac Ziva',
            fileCount: 5,
            fileSize: '2 MB',
        }
    ];

    const MediaData = [
        {
            title: 'Home page banner_1.webp',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
        {
            title: 'Augmented Reality.svg',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
        {
            title: 'Improved Operationa.svg',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
        {
            title: 'Loan Origination Systems - A Complete Guide',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
        {
            title: 'Home page banner_1.webp',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
        {
            title: 'Home page banner_1.webp',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },

        {
            title: 'Home page banner_1.webp',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
        {
            title: 'Home page banner_1.webp',
            imageSrc: media,
            size: '30 MB',
            dimensions: '320x500 | 5 hours ago',
            tag: 'Image',
        },
    ];
    const uploadFileToServer = async (fileToUpload: File) => {
        const selectedTagIds = selectedOptions.map((opt) => opt.value);
        const formData = new FormData();
        formData.append('file', fileToUpload);
        if (folderPathId !== null) {
            formData.append('folder_path_id', folderPathId);
        }

        formData.append('image_tags', JSON.stringify(selectedTagIds));
        formData.append('New_image_tags', JSON.stringify(newlyCreatedOptions));

        try {
            const response = await axios.post('/media', formData);
            if (response.data.success) {
                console.log('Upload successful...');
                toast.success('assets added  successfully!');
                resetUploadFields();
                router.reload({ only: ['mediaItems'] });
            } else {
                toast.error(`asset creation failed`,response.data.message);
                console.error('Upload failed:', response.data.message);
            }   
        } catch (error) {
            toast.error(`failed to add assets`);
            console.error('Error during upload:', error);
        }
    };

    const columns: TableColumn<Component>[] = [
        {
            name: 'FILE NAME',
            cell: (row) => (
                <div className="flex cursor-pointer items-center gap-2.5">
                    <Checkbox   
                        className="data-[state=checked]:bg-primary"
                        tickClassName="!text-white"
                        id="user"
                        name="user"
                        checked={checkedIds.includes(row.title)}
                        
                        tabIndex={3}
                    />
                    <p onClick={openCreateDialog}>Home page banner_1.webp</p>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'FILE SIZE',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <span>298 KB</span>
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
            name: 'Created By',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <img src={profile} alt="download" />
                    <span>Avinash sharma</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'SIZE',
            cell: (row) => (
                <div className="flex items-center gap-2.5">
                    <span>320x320</span>
                </div>
            ),
            sortable: true,
        },
        {
            name: 'Tags',
            cell: (row) => <span className="rounded-sm bg-[#EEEEEE] p-2">Image</span>,
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
                                            href={`/components/edit`}
                                            className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                            title="Edit"
                                        >
                                            <Pencil className="mr-2 text-white" /> Edit
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <button
                                            // onClick={() => handleDelete(row.id)}
                                            className="flex h-5 w-5 cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                            title="Copy"
                                            type="button"
                                        >
                                            <Copy className="mr-2 text-white" /> <span className="!text-nowrap">Copy link</span>
                                        </button>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                        <button
                                            // onClick={() => handleDelete(row.id)}
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
                                            // onClick={() => handleDelete(row.id)}
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
                                <DialogTitle className="mb-4 text-center text-sm leading-[140%] font-medium text-font-secondary sm:mb-8 sm:text-base md:text-xl">
                                    Are you sure you want to delete this component?
                                </DialogTitle>
                                {/* Your dialog content goes here */}
                                <div className="flex w-full justify-center gap-4 md:gap-6">
                                    <Button
                                        variant={'secondary'}
                                        title="yes"
                                        type="button"
                                        className="w-1/2 md:w-[120px]"
                                        //  onClick={confirmDelete}
                                    >
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
                </div>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '150px',
        },
    ];


console.log("isfolder create..",isCreateFolder);

    return (
        <>
            <AppLayout breadcrumbs={breadcrumbs}>
                <Head title="Pages" />
                <div className="p-8">
                    <div className="mb-5 flex items-center justify-between">
                        <h1 className="heading">All folder </h1>
                    </div>
                    {!isFolderCreate && <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-7'>
                        {CreateFolders.map((folder, index) => (
                            <li key={index} className='flex items-center gap-4.5 px-4 py-5 border rounded-xl'>
                                <img src={Folder} alt={`Folder ${index}`} width={42} height={32} />
                                <div >
                                    <p className="text-base font-tree-semibold mb-1">{folder.title}</p>
                                    <p className="text-sm text-grey1 font-tree-regular">
                                        {folder.fileCount} files | {folder.fileSize}
                                    </p>
                                </div>
                            </li>
                        ))}
                        <li>
                            <button type='button' title='Create Folder' className='bg-accent flex flex-col items-center justify-center cursor-pointer px-4 py-5  border border-dashed border-[#E09C28] w-full h-full text-sm text-primary font-tree-semibold rounded-xl' onClick={openCreateDialog}>
                                <Plus className='w-5 h-5 mb-2' />
                                <span>Create Folder</span>
                            </button>
                        </li>
                    </ul>
                    }
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="heading">All assets</h2>
                        <Button variant={'default'} type='button' onClick={openMediaUpload} title="Add Assets">
                            <span className="button-icon">+</span> Add Assets
                        </Button>
                    </div>
                    <div className="mb-4 flex items-center justify-between">
                        <input
                            type="text"
                            placeholder="Search by file name"
                            className="form-input h-10 w-full lg:max-w-[356px] bg-[url('asset/images/icons/search.svg')] bg-[14px_center] bg-no-repeat pl-10"
                        />
                        <div className='flex items-center gap-4'>
                            <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e)}>
                                <SelectTrigger className="h-10 bg-input justify-between text-sm font-tree-medium data-[state=open]:bg-sidebar-background">
                                    <SelectValue placeholder="Recent" className='text-font-primary' />
                                </SelectTrigger>
                                <SelectContent className='bg-black text-white rounded-lg [box-shadow:0px_2px_4px_0px_#11111105]'>
                                    <SelectItem value="Recent" className='focus:bg-transparent border-b border-[#313131]'>Recent</SelectItem>
                                    <SelectItem value="Last 7 days" className='focus:bg-transparent border-b border-[#313131]'>Last 7 days</SelectItem>
                                    <SelectItem value="Last 30 days" className='focus:bg-transparent border-b border-[#313131]'>Last 30 days</SelectItem>
                                    <SelectItem value="This year (2025)" className='focus:bg-transparent border-b border-[#313131]'>This year (2025)</SelectItem>
                                    <SelectItem value="Last year (2024)" className='focus:bg-transparent'>Last year (2024)</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e)}>
                                <SelectTrigger className="h-10 bg-input justify-between text-sm font-tree-medium data-[state=open]:bg-sidebar-background">
                                    <SelectValue placeholder="File type" className='text-font-primary' />
                                </SelectTrigger>
                                <SelectContent className='bg-black text-white rounded-lg [box-shadow:0px_2px_4px_0px_#11111105]'>
                                    <SelectItem value="Webp" className='focus:bg-transparent border-b border-[#313131]'>Webp</SelectItem>
                                    <SelectItem value="Jpg" className='focus:bg-transparent border-b border-[#313131]'>Jpg</SelectItem>
                                    <SelectItem value="Png" className='focus:bg-transparent border-b border-[#313131]'>Png</SelectItem>
                                    <SelectItem value="Gif" className='focus:bg-transparent border-b border-[#313131]'>Gif</SelectItem>
                                    <SelectItem value="Svg" className='focus:bg-transparent'>Svg</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e)}>
                                <SelectTrigger className="h-10 bg-input justify-between text-sm font-tree-medium data-[state=open]:bg-sidebar-background">
                                    <SelectValue placeholder="Tags" className='text-font-primary' />
                                </SelectTrigger>
                                <SelectContent className='bg-black text-white rounded-lg [box-shadow:0px_2px_4px_0px_#11111105]'>
                                    <SelectItem value="Image" className='focus:bg-transparent border-b border-[#313131]'>Image</SelectItem>
                                    <SelectItem value="Icon" className='focus:bg-transparent border-b border-[#313131]'>Icon</SelectItem>
                                    <SelectItem value="Svg" className='focus:bg-transparent'>Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className='flex p-2 border border-border rounded-lg bg-background '>
                                <button type='button' title='grid' className={`p-1 w-6 h-6 rounded-lg  text-font-primary cursor-pointer ${isGridView ? 'bg-border' : 'bg-transparent'}`} onClick={() => setIsGridView(true)}>
                                    <LayoutGrid className='size-4' />
                                </button>
                                <span className='mx-1 text-border'>|</span>
                                <button type='button' title='table' className={`p-1 w-6 h-6 rounded-lg  text-font-primary cursor-pointer ${!isGridView ? 'bg-border' : 'bg-transparent'}`} onClick={() => setIsGridView(false)}>
                                    <ListTodo className='size-4' />
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* Media Grid */}
                    {isGridView && <div className="mt-6 grid grid-cols-1 items-center gap-6 xl:grid-cols-4">
                        {MediaData.map((item, idx) => (
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
                        ))}
                    </div>}
                    {/* Media Table */}
                    {!isGridView && <div className="mt-10">
                        <DataTable
                            columns={columns}
                            data={columns}
                            pagination
                            highlightOnHover
                            striped
                            responsive
                            noDataComponent="No components found"
                            className="customTable"
                        />
                    </div>}



                    {!isFolderCreate && <div className="m-auto flex w-full flex-col items-center justify-center text-center">
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
                        <p className="font-tree-semibold mb-2 text-xl text-font-secondary">No assests added yet</p>
                        <p className="font-tree-regular mb-5 w-full text-sm text-font-primary md:max-w-[20%]">
                            Start by creating a new page using a saved template and reusable components
                        </p>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant={'default'}
                                    className='w-[151px]'
                                    title="Add New "
                                    type="button"
                                >
                                    <span className="button-icon">+</span> Add New
                                    <ChevronDownIcon className="ml-1 h-4.5 w-4.5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuContent className="rounded-lg w-[151px] bg-black" sideOffset={5}>
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                            <button type='button'
                                                className=" flex  cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                                title="Create folder" onClick={openCreateDialog}>
                                                <FolderPlus className="mr-2 h-4 w-4 text-white" />
                                                Create folder
                                            </button>

                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                            <button
                                                onClick={openMediaUpload}
                                                className="flex  cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                                                title="Copy"
                                                type="button"
                                            >
                                                <ImagePlus className="mr-2 h-4 w-4 text-white" />
                                                Add assets
                                            </button>
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenuPortal>
                        </DropdownMenu>







                    </div>
                    }

                </div>



                {/* Create Folder */}
                <Dialog open={isCreateFolder} onOpenChange={setCreateFolder} >
                    <DialogContent>
                        <DialogTitle className='mb-6'>New folder</DialogTitle>

                        <form className="space-y-6" onSubmit={handleFolderCreate}>

                            <Label htmlFor="password" className="sr-only">
                                Folder name*
                            </Label>

                            <input
                                id="folderName"
                                type="text"
                                value={formData?.folderName}
                                name="folderName"
                                placeholder="Folder name*"
                                autoComplete="current-password"
                                className='form-input w-full'
                                onChange={handleInputChange}
                            />

                            <InputError />


                            <DialogFooter className="gap-2">
                                <DialogClose asChild>
                                    <Button variant="secondary" type='button' title='Cancel' className='w-[105px]'>
                                        Cancel
                                    </Button>
                                </DialogClose>

                                <Button variant={'default'} asChild type='button' title='Create' className='w-[105px]' onClick={() => setFolderCreate(true)}>
                                    <button type="submit">Create</button>
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
                {/* Media Upload */}
                <Dialog open={isMediaUpload} onOpenChange={setMediaUpload} >

                    <DialogContent
                        className="md:max-w-[600px] md:p-6"
                        showClose={true}
                        closeButtonClassName="!right-6 !top-6 "
                        onInteractOutside={false}  // Prevent close on overlay click
                    >
                        <p className="font-tree-semibold mb-6 text-base leading-7 text-font-secondary md:text-lg">Upload</p>

                        <div className={" w-full  mb-6 min-h-[135px] "}>
                            <div className="cursor-pointer rounded-xl border border-dashed border-border bg-grey py-8 px-6 w-full relative mb-4" >
                                <input
                                    type="file"
                                    accept=".png, .jpg, .jpeg, .gif, .svg, .webp, .json"
                                    className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                                />
                                <div className="mx-auto flex max-w-[381px] flex-col items-center hover:cursor-pointer">
                                    <CloudUpload className="h-7 w-7 mb-3.5 text-[#626262]" width={28} height={28} />
                                    <p className="font-tree-medium text-base text-font-secondary leading-5">Drag and drop file here or <span className="text-primary underline">Choose file</span></p>
                                </div>
                            </div>
                            <div className='flex items-center justify-between w-full'>
                                <p className='text-xs text-grey1 font-tree-regular'>Support formats: .png, .jpg, .svg, .webp</p>
                                <p className='text-xs text-grey1 font-tree-regular'>Maximum size: 25 MB</p>
                            </div>
                        </div>

                        <ul className="flex flex-col gap-6">
                            <li>
                                <div className='flex justify-between'>
                                    <div className='flex gap-4 items-center'>
                                        <CircleCheck className='w-7 h-7 text-[#4CAF50]' />
                                        <div>
                                            <p className='text-14 text-font-secondary  '>Loan Origination Systems .png </p>
                                            <p className='text-xs text-grey1  '>30 MB  |  320x500</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e)}>
                                            <SelectTrigger className="h-9 w-[115px] bg-input justify-between text-sm">
                                                <SelectValue placeholder="Select tag" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Image">Image</SelectItem>
                                                <SelectItem value="Icon">Icon</SelectItem>
                                                <SelectItem value="Video">Video</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <button type="button" className="">
                                            <CircleX className="h-5 w-5 text-red cursor-pointer" />
                                        </button>
                                    </div>
                                </div>
                            </li>
                            <li>
                                <div className='flex justify-between'>
                                    <div className='flex gap-4 items-center'>
                                        <svg
                                            className="animate-spin h-7 w-7 text-primary " viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-50"
                                                cx="24"
                                                cy="24"
                                                r="20"
                                                stroke="trasparent"
                                                strokeWidth="50"
                                            />
                                            <path
                                                className=""
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>
                                        <div>
                                            <p className='text-14 text-font-secondary  '>Loan Origination Systems .png </p>
                                            <p className='text-xs text-grey1  '>30 MB  |  320x500</p>
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-4'>
                                        <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e)}>
                                            <SelectTrigger className="h-9 w-[115px] bg-input justify-between text-sm">
                                                <SelectValue placeholder="Select tag" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Image">Image</SelectItem>
                                                <SelectItem value="Icon">Icon</SelectItem>
                                                <SelectItem value="Video">Video</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <button type="button" className="">
                                            <CircleX className="h-5 w-5 text-red cursor-pointer" />
                                        </button>
                                    </div>
                                </div>
                            </li>


                        </ul>

                        <div className="flex w-full justify-between gap-4 md:gap-6 mt-8">
                            <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e)}>
                                <SelectTrigger className="h-10 w-[150px] bg-input justify-between text-sm">
                                    <SelectValue placeholder="Map location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Image">Image</SelectItem>
                                    <SelectItem value="Icon">Icon</SelectItem>
                                    <SelectItem value="Video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                            <div className='flex items-center gap-4 md:gap-6 '>
                                <Button variant={'secondary'} title="Cancel" type="button" className="w-1/2 md:w-[134px]">
                                    Cancel{' '}
                                </Button>
                                <DialogClose asChild>
                                    <Button variant={'default'} title="Upload" type="button" className="w-1/2 md:w-[134px]">
                                        Upload{' '}
                                    </Button>
                                </DialogClose>
                            </div>

                        </div>
                    </DialogContent>

                </Dialog>
                {/* UploadMedia */}
                {/* //modal */}
                <Dialog open={isUploadPopup} onOpenChange={setUploadPopup}>
                    <DialogPortal>
                        <DialogOverlay />
                        <DialogContent className="sm:p-8 md:max-w-[712px]" showClose={true} closeButtonClassName="">
                            <p className="mb-6 text-base leading-6 font-semibold text-font-secondary">Home page banner_1.webp</p>
                            <div className="flex flex-col items-start gap-6 md:flex-row">
                                <div className="rounded-t-xl">
                                    <img src={media} alt="download " className="bg-size-cover mb-4 w-full rounded-t-xl object-cover" />
                                    <ul className="flex items-start justify-between gap-3">
                                        <li>
                                            <p className="font-tree-regular text-sm text-font-secondary">Home page banner_1.webp</p>
                                            <span className="text-[12px] text-grey1">30 MB | 320x500</span>
                                        </li>
                                        <li>
                                            <div className="flex items-center gap-2">
                                                <div className="texxt-font-primary rounded-md border border-[#AAAAAA] px-[6px] py-1 text-[12px]">
                                                    <p>Image</p>
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
                                                                        // onClick={() => handleDelete(row.id)}
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
                                                                        // onClick={() => handleDelete(row.id)}
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
                                                                        // onClick={() => handleDelete(row.id)}
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
                                    <div className="mt-2 flex cursor-pointer items-center gap-2">
                                        <img src={download} alt="download" />
                                        <img src={share} alt="share" />
                                    </div>
                                </div>
                                <ul>
                                    <li>
                                        <span className="text-[12px] text-font-primary">File Name</span>
                                        <p className="mt-1 max-w-[280px] truncate text-sm text-font-secondary"> Home page banner_1.webp </p>
                                    </li>
                                    <li className="mt-[20px]">
                                        <span className="text-[12px] text-font-primary">Alternative text</span>
                                        <p className="mt-1 text-sm text-[#AAAAAA]"> No item</p>
                                    </li>
                                    <li className="mt-[20px]">
                                        <span className="text-[12px] text-font-primary">Caption</span>
                                        <p className="mt-1 text-sm text-font-secondary"> No item</p>
                                    </li>
                                    <li className="mt-[20px]">
                                        <span className="text-[12px] text-font-primary">Tag</span>
                                        <p className="mt-1 text-sm text-font-secondary"> Image</p>
                                    </li>
                                    <li className="mt-[20px]">
                                        <span className="text-[12px] text-font-primary">location</span>
                                        <p className="mt-1 text-sm text-font-secondary">Novac Home page</p>
                                    </li>
                                </ul>
                            </div>
                            <div className="mt-8 flex !w-full justify-center gap-4 md:justify-end md:gap-6">
                                <DialogClose asChild>
                                    <Button variant={'secondary'} title="Cancel" type="button" className="w-full max-w-[134px]">
                                        Replace Media{' '}
                                    </Button>
                                </DialogClose>
                                <DialogClose asChild>
                                    <Button variant={'default'} title="Save" type="button" className="w-full max-w-[134px]">
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