import AppLayout from '@/layouts/app-layout';
import MediaTable from '@/pages/Media//MediaTable';
import FolderCreationForm from '@/pages/Media/FolderCreationForm';
import UploadSection from '@/pages/Media/UploadSection';
import { BreadcrumbItem, Folder, ImageTag, MediaItem, OptionType } from '@/types';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { useRef, useState } from 'react';
import Modal from 'react-modal';
import { ActionMeta, MultiValue } from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Props = {
    breadcrumbs: BreadcrumbItem[];
    folders: Folder[];
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
Modal.setAppElement('#app');
const MediaDashboard = ({ breadcrumbs, folders, mediaItems, imageTags }: Props) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [folderName, setFolderName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [showTextInput, setShowTextInput] = useState(false);
    const [cdnUrl, setCdnUrl] = useState('');
    const [folderPathId, setFolderPathId] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);
    const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [newlyCreatedOptions, setNewlyCreatedOptions] = useState<string[]>([]);
    const [options, setOptions] = useState<OptionType[]>(imageTags.map((tag) => ({ value: tag.id, label: tag.tagname })));

    const getImageUrl = (item: MediaItem) => {
        if (item.folder?.name) {
            return `http://strapi-assets.dv/${item.folder.name}/${item.name}`;
        }
        return `/uploads/${item.name}`;
    };

    const handleFolderCreate = async () => {
        const formData = new FormData();
        formData.append('folder_path', folderName);
        if (selectedParentId) {
            formData.append('parent_folder_id', selectedParentId);
        }
        
        try {

            const response = await axios.post('/folder', formData);
            if (response.data.success) {
                toast.success('Folder created successfully!');
                console.log('Folder created successfully...');
                setFolderName('');
                setSelectedParentId(null);
                router.reload({ only: ['folders'] });
            } else {
                console.error('Folder creation failed:', response.data.message);
                toast.error(`Folder creation failed: ${response.data.message}`);
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    // === multiselect ===
    const handleChange = (newValue: MultiValue<OptionType>, _actionMeta: ActionMeta<OptionType>) => {
        setSelectedOptions([...newValue]);
    };
    // === File or CDN Upload ===
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

    const resetUploadFields = () => {
        setSelectedFile(null);
        setCdnUrl('');
        setFolderPathId('');
        setSelectedOptions([]);
        setNewlyCreatedOptions([]);
        // setIsUploadModalOpen(false);
    };
    console.log("folders data...",folders);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="flex justify-end gap-4 p-6">
                <button onClick={() => setIsFolderModalOpen(true)} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                    + Add new folder
                </button>
                <button onClick={() => setIsUploadModalOpen(true)} className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    + Add new assets
                </button>
            </div>
            <div id="root"></div>

            {/* Folder Modal */}
            <Modal
                isOpen={isFolderModalOpen}
                onRequestClose={() => {
                    if (folderName.trim() !== '' || selectedParentId !== null) {
                        const confirmClose = window.confirm('Changes will be lost. Do you want to close?');
                        if (!confirmClose) {
                            return;
                        } else {
                            setSelectedParentId('');
                            setFolderName('');
                        }
                    }
                    setIsFolderModalOpen(false);
                }}
                className="mx-auto mt-20 max-w-xl rounded bg-white p-6 shadow-xl outline-none"
                overlayClassName="fixed inset-0 bg-black/25 flex justify-center items-start z-40"
            >
                <FolderCreationForm
                    folderName={folderName}
                    setFolderName={setFolderName}
                    selectedParentId={selectedParentId}
                    setSelectedParentId={setSelectedParentId}
                    folders={folders}
                    handleFolderCreate={handleFolderCreate}
                />
            </Modal>

            {/* Upload Modal */}
            <Modal
                isOpen={isUploadModalOpen}
                onRequestClose={() => {
                    const hasUnsavedData =
                        selectedFile !== null ||
                        cdnUrl.trim() !== '' ||
                        selectedOptions.length > 0 ||
                        newlyCreatedOptions.length > 0 ||
                        folderPathId !== '';

                    if (hasUnsavedData) {
                        const confirmClose = window.confirm('Changes will be lost. Do you want to close?');
                        if (!confirmClose) return;

                        // Reset fields if user confirms
                        setSelectedFile(null);
                        setCdnUrl('');
                        setSelectedOptions([]);
                        setNewlyCreatedOptions([]);
                        setFolderPathId('');
                    }

                    setIsUploadModalOpen(false);
                }}
                className="mx-auto mt-20 max-w-xl rounded bg-white p-6 shadow-xl outline-none"
                overlayClassName="fixed inset-0 bg-black/25 flex justify-center items-start z-40"
            >
                <UploadSection
                    fileInputRef={fileInputRef}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    showTextInput={showTextInput}
                    setShowTextInput={setShowTextInput}
                    cdnUrl={cdnUrl}
                    setCdnUrl={setCdnUrl}
                    folderPathId={folderPathId}
                    setFolderPathId={setFolderPathId}
                    folders={folders}
                    options={options}
                    selectedOptions={selectedOptions}
                    setOptions={setOptions}
                    setSelectedOptions={setSelectedOptions}
                    newlyCreatedOptions={newlyCreatedOptions}
                    setNewlyCreatedOptions={setNewlyCreatedOptions}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                />
            </Modal>
            <MediaTable mediaItems={mediaItems} getImageUrl={getImageUrl}  />
            <ToastContainer position="top-right" autoClose={3000} />
        </AppLayout>
    );
};

export default MediaDashboard;
