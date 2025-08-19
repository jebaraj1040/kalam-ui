import { Button } from '@/components/ui/button';
import React, {useState} from 'react';
import {router} from '@inertiajs/react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTitle} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-toastify';
import axios from 'axios';

interface FolderCreationFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FolderCreationForm({ isOpen, onOpenChange }: FolderCreationFormProps) {
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
        router.push("media");
        onOpenChange(false);
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