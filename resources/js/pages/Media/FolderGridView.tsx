import { Plus } from 'lucide-react';
import folderPath from '../../../../public/assets/images/folder.svg';

interface FolderItem {
  title: string;
  fileCount: number;
  fileSize: string;
}

interface FolderGridViewProps {
  folders: FolderItem[];
  onCreateFolder: () => void;
}

export default function FolderGridView({ folders, onCreateFolder }: FolderGridViewProps) {
  return (
    <ul className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-7'>
      {folders.map((folder, index) => (
        <li key={index} className='flex items-center gap-4.5 px-4 py-5 border rounded-xl'>
          <img src={folderPath} alt={`Folder ${index}`} width={42} height={32} />
          <div>
            <p className="text-base font-tree-semibold mb-1">{folder?.title}</p>
            <p className="text-sm text-grey1 font-tree-regular">
              {folder?.fileCount} files | {folder?.fileSize}
            </p>
          </div>
        </li>
      ))}
      <li>
        <button 
          type='button' 
          title='Create Folder' 
          className='bg-accent flex flex-col items-center justify-center cursor-pointer px-4 py-5 border border-dashed border-[#E09C28] w-full h-full text-sm text-primary font-tree-semibold rounded-xl' 
          onClick={onCreateFolder}
        >
          <Plus className='w-5 h-5 mb-2' />
          <span>Create Folder</span>
        </button>
      </li>
    </ul>
  );
}