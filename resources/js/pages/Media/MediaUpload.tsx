import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudUpload, CircleCheck, CircleX } from 'lucide-react';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { toast } from 'react-toastify';
import axios from 'axios';

interface MediaUploadProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MediaUpload({ isOpen, onOpenChange }: MediaUploadProps) {
  const [newFieldType, setNewFieldType] = useState(undefined);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="md:max-w-[600px] md:p-6"
        showClose={true}
        closeButtonClassName="!right-6 !top-6"
        onInteractOutside={false}
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
  );
}