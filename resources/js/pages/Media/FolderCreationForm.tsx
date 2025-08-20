import { Button } from '@/components/ui/button';
import React, {useState} from 'react';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { toast } from 'react-toastify';
import axios from 'axios';
import FolderSelect from './FolderSelect';
import { Folder } from '@/types';

interface FolderCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onFolderChange:(status:boolean)=>void;
  folders:Folder[];
}

export default function FolderCreationForm({ isOpen, onOpenChange,onFolderChange,folders }: FolderCreationFormProps) {
  const [formData, setFormData] = useState({
    folderName: "",
    parent_folder_id: ""
  });
  const [errors, setErrors] = useState({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleFolderCreate = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await axios.post('/folder', formData);
      if (response.data.success) {
        toast.success(response.data.message);
        onOpenChange(false);
        onFolderChange(true);
      } else {
        toast.error(`Folder creation failed: ${response.data.message}`);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle className='mb-6'>New folder</DialogTitle>
        <form className="space-y-6" onSubmit={handleFolderCreate}>
          <Label htmlFor="folderName" className="sr-only">
            Folder name*
          </Label>
          <input
            id="folderName"
            type="text"
            value={formData.folderName}
            name="folderName"
            placeholder="Folder name*"
            autoComplete="off"
            className='form-input w-full'
            onChange={handleInputChange}
            required
          />
          <FolderSelect 
          folders={folders}
          value={formData.parent_folder_id}
          onChange={(value) => setFormData(prev => ({ ...prev, parent_folder_id: value ?? "" }))}
          placeholder="-- Select Parent Folder --"
                  />
          <InputError />
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="secondary" type='button' title='Cancel' className='w-[105px]'>
                Cancel
              </Button>
            </DialogClose>
            <Button variant={'default'} type='submit' title='Create' className='w-[105px]'>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}