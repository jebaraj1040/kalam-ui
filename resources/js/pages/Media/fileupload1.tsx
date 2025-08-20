import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CloudUpload, CircleCheck, CircleX } from 'lucide-react';
import { toast } from 'react-toastify';

interface MediaUploadProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  tag?: string;
}

export default function MediaUpload({ isOpen, onOpenChange }: MediaUploadProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [newFieldType, setNewFieldType] = useState(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    const newFiles: UploadFile[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      // Check file size (25MB max)
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 25MB limit`);
        return;
      }

      // Check file type
      const validTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/svg+xml', 'image/webp', 'application/json'];
      if (!validTypes.includes(file.type)) {
        toast.error(`File ${file.name} is not a supported format`);
        return;
      }

      newFiles.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: 'pending',
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
    
    // Reset the input to allow selecting the same files again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      // Create a fake event to reuse the handleFileChange function
      const event = {
        target: {
          files: droppedFiles
        }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      
      handleFileChange(event);
    }
  };

  // Handle drag over (necessary for drop to work)
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Remove a file from the list
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  // Update tag for a file
  const updateTag = (id: string, tag: string) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === id ? { ...file, tag } : file
      )
    );
  };

  // Upload files (simulated with progress)
  const uploadFiles = async () => {
    // Filter out files that are already completed or uploading
    const filesToUpload = files.filter(file => file.status === 'pending');
    
    if (filesToUpload.length === 0) {
      toast.info('No files to upload');
      return;
    }

    // Update status to uploading
    setFiles(prev => 
      prev.map(file => 
        file.status === 'pending' ? { ...file, status: 'uploading' } : file
      )
    );

    // Simulate upload with progress
    for (const file of filesToUpload) {
      try {
        // Simulate progress
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise(resolve => setTimeout(resolve, 200));
          setFiles(prev => 
            prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            )
          );
        }
        
        // Mark as completed
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id ? { ...f, status: 'completed', progress: 100 } : f
          )
        );
        
      } catch (error) {
        setFiles(prev => 
          prev.map(f => 
            f.id === file.id ? { ...f, status: 'error' } : f
          )
        );
        toast.error(`Failed to upload ${file.file.name}`);
      }
    }
    
    toast.success('Files uploaded successfully');
  };

  // Close dialog and reset state
  const handleClose = () => {
    setFiles([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="md:max-w-[600px] md:p-6"
        showClose={true}
        closeButtonClassName="!right-6 !top-6"
        onInteractOutside={false}
      >
        <p className="font-tree-semibold mb-6 text-base leading-7 text-font-secondary md:text-lg">Upload</p>
        <div className={" w-full  mb-6 min-h-[135px] "}>
          <div 
            className="cursor-pointer rounded-xl border border-dashed border-border bg-grey py-8 px-6 w-full relative mb-4"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".png, .jpg, .jpeg, .gif, .svg, .webp, .json"
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
              onChange={handleFileChange}
            />
            <div className="mx-auto flex max-w-[381px] flex-col items-center hover:cursor-pointer">
              <CloudUpload className="h-7 w-7 mb-3.5 text-[#626262]" width={28} height={28} />
              <p className="font-tree-medium text-base text-font-secondary leading-5">Drag and drop files here or <span className="text-primary underline">Choose files</span></p>
            </div>
          </div>
          <div className='flex items-center justify-between w-full'>
            <p className='text-xs text-grey1 font-tree-regular'>Support formats: .png, .jpg, .svg, .webp</p>
            <p className='text-xs text-grey1 font-tree-regular'>Maximum size: 25 MB</p>
          </div>
        </div>
        
        {/* File list */}
        {files.length > 0 && (
          <ul className="flex flex-col gap-6">
            {files.map((file) => (
              <li key={file.id}>
                <div className='flex justify-between'>
                  <div className='flex gap-4 items-center'>
                    {/* Status icon based on file state */}
                    {file.status === 'completed' && (
                      <CircleCheck className='w-7 h-7 text-[#4CAF50]' />
                    )}
                    {file.status === 'uploading' && (
                      <div className="relative w-7 h-7">
                        <div className="w-7 h-7 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {file.status === 'error' && (
                      <CircleX className='w-7 h-7 text-red' />
                    )}
                    {file.status === 'pending' && (
                      <div className="w-7 h-7 rounded-full bg-grey"></div>
                    )}
                    
                    <div>
                      <p className='text-14 text-font-secondary'>{file.file.name}</p>
                      <p className='text-xs text-grey1'>{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      
                      {/* Progress bar for uploading files */}
                      {file.status === 'uploading' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 max-w-[200px]">
                          <div 
                            className="bg-primary h-1.5 rounded-full" 
                            style={{ width: `${file.progress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className='flex items-center gap-4'>
                    <Select 
                      value={file.tag} 
                      onValueChange={(value) => updateTag(file.id, value)}
                      disabled={file.status === 'uploading'}
                    >
                      <SelectTrigger className="h-9 w-[115px] bg-input justify-between text-sm">
                        <SelectValue placeholder="Select tag" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Image">Image</SelectItem>
                        <SelectItem value="Icon">Icon</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <button 
                      type="button" 
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <CircleX className="h-5 w-5 text-red cursor-pointer" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
        
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
            <Button variant={'secondary'} title="Cancel" type="button" className="w-1/2 md:w-[134px]" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              variant={'default'} 
              title="Upload" 
              type="button" 
              className="w-1/2 md:w-[134px]"
              onClick={uploadFiles}
              disabled={files.length === 0 || files.every(f => f.status === 'uploading' || f.status === 'completed')}
            >
              Upload
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}