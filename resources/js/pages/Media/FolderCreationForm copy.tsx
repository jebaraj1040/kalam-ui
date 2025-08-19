import { Folder } from '@/types';
import FolderSelect from '@/pages/Media/FolderSelect';
type FolderCreationFormProps = {
    folderName: string;
    setFolderName: (name: string) => void;
    selectedParentId: string | null;
    setSelectedParentId: (id: string | null) => void;
    folders: Folder[];
    handleFolderCreate: () => void;
};

const FolderCreationForm = ({
    folderName,
    setFolderName,
    selectedParentId,
    setSelectedParentId,
    folders,
    handleFolderCreate,
}: FolderCreationFormProps) => (
    <div className="rounded-xl bg-white p-6 shadow-md w-lg">
        <h2 className="mb-4 text-lg font-semibold">Create Folder</h2>
        <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            placeholder="New Folder Name"
            className="mb-3 w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
        <FolderSelect
            folders={folders}
            value={selectedParentId ?? ''}
            onChange={(val: string | null) => setSelectedParentId(val || null)}
            placeholder="-- Select Parent Folder --"
        />

        <button onClick={handleFolderCreate} className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
            Create Folder
        </button>
    </div>
);
export default FolderCreationForm;
