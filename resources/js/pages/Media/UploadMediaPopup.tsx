import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogClose, DialogPortal, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Pencil, Copy, Download, Trash2, EllipsisVertical } from 'lucide-react';

interface UploadMediaPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadMediaPopup({ isOpen, onOpenChange }: UploadMediaPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="sm:p-8 md:max-w-[712px]" showClose={true} closeButtonClassName="">
          <p className="mb-6 text-base leading-6 font-semibold text-font-secondary">Home page banner_1.webp</p>
          <div className="flex flex-col items-start gap-6 md:flex-row">
            <div className="rounded-t-xl">
              <img 
                src="/assets/images/media.svg" 
                alt="Media preview" 
                className="bg-size-cover mb-4 w-full rounded-t-xl object-cover" 
              />
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
                                title="Edit"
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
              <div className="mt-2 flex cursor-pointer items-center gap-2">
                <img src="/assets/images/icons/download.svg" alt="download" />
                <img src="/assets/images/icons/share.svg" alt="share" />
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
  );
}