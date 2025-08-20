import { Component, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, } from '@/components/ui/dialog';
import { ChevronDownIcon, CircleCheck, CircleX, CloudUpload, Copy, Download, EllipsisVertical, FolderPlus, ImagePlus, LayoutGrid, Link, ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DataTable, { TableColumn } from 'react-data-table-component';
// Import components
import { Folder, FolderItem, ImageTag, MediaItem } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import FolderGridView from './FolderGridView';
import FolderCreationForm from './FolderCreationForm';
import axios from 'axios';
import { toast } from 'react-toastify';
import MediaUpload from './MediaUpload';

type MediaProps = {
  pages: any;
  breadcrumbs: any;
  mediaItems: MediaPagination;
  imageTags: ImageTag[];
  folders:Folder[];
};
type MediaPagination = {
    data: MediaItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};

export default function Media({ pages, breadcrumbs, mediaItems, imageTags,folders }: MediaProps) {
  const [isCreateFolder, setCreateFolder] = useState(false);
  const [isMediaUpload, setMediaUpload] = useState(false);
  const [isUploadPopup, setUploadPopup] = useState(false);
  const [newFieldType, setNewFieldType] = useState(undefined);
  const [isGridView, setIsGridView] = useState(true);
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [folderData, setFolderData] = useState<FolderItem[]>([]);
  const [folderStatus,setFolderStatus] = useState(false);

  const openCreateDialog = () => setCreateFolder(true);
  const openMediaUpload = () => setMediaUpload(true);
  const openUploadPopup = () => setUploadPopup(true);

  // Sample media data
  const mediaData = [
    {
      id: '1',
      title: 'Home page banner_1.webp',
      imageSrc: '/assets/images/media.svg',
      size: '30 MB',
      dimensions: '320x500 | 5 hours ago',
      tag: 'Image',
      name: 'Home page banner_1.webp'
    },
    {
      id: '2',
      title: 'Augmented Reality.svg',
      imageSrc: '/assets/images/media.svg',
      size: '30 MB',
      dimensions: '320x500 | 5 hours ago',
      tag: 'Image',
      name: 'Augmented Reality.svg'
    },
    {
      id: '3',
      title: 'Improved Operationa.svg',
      imageSrc: '/assets/images/media.svg',
      size: '30 MB',
      dimensions: '320x500 | 5 hours ago',
      tag: 'Image',
      name: 'Improved Operationa.svg'
    },
    {
      id: '4',
      title: 'Loan Origination Systems - A Complete Guide',
      imageSrc: '/assets/images/media.svg',
      size: '30 MB',
      dimensions: '320x500 | 5 hours ago',
      tag: 'Image',
      name: 'Loan Origination Systems - A Complete Guide'
    }
  ];
  useEffect(() => {
      fetchFolderList();
    },[folderStatus]);
  const fetchFolderList = async () => {
    try {
      const response = await axios.get('/fetch-folder-list');
      if (response.data.success) {
        setFolderData(response?.data?.folderList?.folders);
      } else {
        toast.error(`Folder creation failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  console.log("current foldersfdasfajflksalfkjlsdakf...",folders);

  // const CreateFolders = [
  //       {
  //           title: 'Novac home page',
  //           fileCount: 5,
  //           fileSize: '2 MB',
  //       },
  //       {
  //           title: 'Solutions',
  //           fileCount: 5,
  //           fileSize: '2 MB',
  //       },
  //       {
  //           title: 'STATIM',
  //           fileCount: 5,
  //           fileSize: '2 MB',
  //       }
  //       ,
  //       {
  //           title: 'Novac Ziva',
  //           fileCount: 5,
  //           fileSize: '2 MB',
  //       }
  //   ];

  // Table columns
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



  return (
    <>
      <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Media" />
        <div className="p-8">
          <div className="mb-5 flex items-center justify-between">
            <h1 className="heading">All folders</h1>
          </div>
          
          <FolderGridView 
            folders={folderData} 
            onCreateFolder={openCreateDialog} 
          />
          
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
              className="form-input h-10 w-full lg:max-w-[356px] bg-[url('/assets/images/icons/search.svg')] bg-[14px_center] bg-no-repeat pl-10"
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
                  <SelectItem value="Video" className='focus:bg-transparent'>Video</SelectItem>
                </SelectContent>
              </Select>
              <div className='flex p-2 border border-border rounded-lg bg-background '>
                <button type='button' title='grid' className={`p-1 w-6 h-6 rounded-lg text-font-primary cursor-pointer ${isGridView ? 'bg-border' : 'bg-transparent'}`} onClick={() => setIsGridView(true)}>
                  <LayoutGrid className='size-4' />
                </button>
                <span className='mx-1 text-border'>|</span>
                <button type='button' title='table' className={`p-1 w-6 h-6 rounded-lg text-font-primary cursor-pointer ${!isGridView ? 'bg-border' : 'bg-transparent'}`} onClick={() => setIsGridView(false)}>
                  <ListTodo className='size-4' />
                </button>
              </div>
            </div>
          </div>
          
          {/* Media Grid */}
          {/* {isGridView && (
            <MediaGridView 
              mediaData={mediaData} 
              onUploadMedia={openUploadPopup} 
            />
          )} */}
          
          {/* Media Table */}
          {!isGridView && (
            <div className="mt-10">
              <DataTable
                columns={columns}
                data={mediaData}
                pagination
                highlightOnHover
                striped
                responsive
                noDataComponent="No media items found"
                className="customTable"
              />
            </div>
          )}
          
          {/* <EmptyState 
            onCreateFolder={openCreateDialog}
            onAddAssets={openMediaUpload}
          /> */}
        </div>

        {/* Modal components */}
        <FolderCreationForm 
          isOpen={isCreateFolder} 
          onOpenChange={setCreateFolder}
          onFolderChange={setFolderStatus}
          folders={folders}
        />
        
        <MediaUpload 
          isOpen={isMediaUpload} 
          onOpenChange={setMediaUpload} 
        />
        
        {/* <UploadMediaPopup 
          isOpen={isUploadPopup} 
          onOpenChange={setUploadPopup} 
        /> */}
      </AppLayout>
    </>
  );
}