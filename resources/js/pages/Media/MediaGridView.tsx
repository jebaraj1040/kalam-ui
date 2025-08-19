import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EllipsisVertical, Pencil, Copy, Download, Trash2 } from 'lucide-react';

interface MediaItem {
  title: string;
  imageSrc: string;
  size: string;
  dimensions: string;
  tag: string;
}

interface MediaGridViewProps {
  mediaData: MediaItem[];
  onUploadMedia: () => void;
}

export default function MediaGridView({ mediaData, onUploadMedia }: MediaGridViewProps) {
  return (
    <div className="mt-6 grid grid-cols-1 items-center gap-6 xl:grid-cols-4">
      {mediaData.map((item, idx) => (
        <div className="rounded-t-xl" key={idx}>
          <img src={item.imageSrc} alt={item.title} className="bg-size-cover mb-4 w-full rounded-t-xl object-cover" />
          <ul className="mb-2 flex items-start justify-between gap-3">
            <li onClick={onUploadMedia} className="cursor-pointer">
              <p className="font-tree-regular max-w-[180px] truncate text-sm text-font-secondary">{item.title}</p>
              <span className="text-[12px] text-grey1">
                {item.size} | {item.dimensions}
              </span>
            </li>
            <li>
              <div className="flex items-start gap-3">
                <div className="texxt-font-primary rounded-md border border-[#AAAAAA] px-[6px] py-1 text-[12px]">
                  <p>{item.tag}</p>
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
                            title="Copy"
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
        </div>
      ))}
    </div>
  );
}