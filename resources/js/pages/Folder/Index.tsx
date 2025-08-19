import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { useRef, useState } from 'react';
import { router } from '@inertiajs/react';

type Folder = {
    name: string;
    id: number;
    parentfolder: number | null;
    childfolder: number | null;
};
type Props = {
    breadcrumbs: BreadcrumbItem[];
    folders: Folder[];
};

const FileAndInputToggle = ({ breadcrumbs, folders }: Props) => {
    const [folderName, setfolderName] = useState('');
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
            formData.append('folder_path', folderName);

            if (selectedParentId !== null) {
                formData.append('parent_folder_id', selectedParentId.toString());
            }

            router.post('/folder', formData, {
                forceFormData: true,
                onSuccess: () => {
                    console.log('Upload successful');
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                },
                onFinish: () => {
                    console.log('Upload completed');
                },
            });
        } catch (error) {
            console.error('Error:', error);
        }
    };



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <div className="max-w-md space-y-4 rounded-xl bg-white p-6 shadow-md m-8">
                <input
                    type="text"
                    value={folderName}
                    onChange={(e) => setfolderName(e.target.value)}
                    placeholder="+ Create Folder"
                    className="w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <select
                    className='p-2 border-black-300'
                    value={selectedParentId ?? ''}
                    onChange={(e) => {
                        const value = e.target.value;
                        const parsedValue = value !== '' ? value : null;
                        console.log("Selected Folder ID:", parsedValue);
                        setSelectedParentId(parsedValue);
                    }}

                >
                    <option value="">-- Select Parent Folder --</option>
                    {folders.map((folder) => (
                        <option key={folder.id} value={folder.id.toString()}>
                            {folder.name}
                        </option>
                    ))}
                </select>


                <button
                    onClick={handleSubmit}
                    className="inline-block rounded bg-cyan-500 px-1 py-1 text-base text-white hover:bg-blue-700 ml-4"
                >
                    SUBMIT
                </button>
            </div>
        </AppLayout>
    );
};

export default FileAndInputToggle;
