import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MediaItem } from '@/types';
import { EllipsisVertical, Pencil, Copy, Download, Trash2 } from 'lucide-react';
import DataTable from 'react-data-table-component';

type MediaPagination = {
    data: MediaItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
};
interface MediaGridViewProps {
  mediaData: MediaPagination;
  onUploadMedia: () => void;
}

export default function MediaGridView({ mediaData, onUploadMedia }: MediaGridViewProps) {
  return (
    <div className="mt-6 grid grid-cols-1 items-center gap-6 xl:grid-cols-4">
      {mediaData?.data?.map((item:any, idx:any) => (
        <div className="rounded-t-xl" key={idx}>
          <img src={item?.imageSrc||'/assets/images/no-image.svg'} alt={item?.name} className="bg-size-cover mb-4 w-full rounded-t-xl object-cover" />
          <ul className="mb-2 flex items-start justify-between gap-3">
            <li onClick={onUploadMedia} className="cursor-pointer">
              <p className="font-tree-regular max-w-[180px] truncate text-sm text-font-secondary">{item.title}</p>
              <span className="text-[12px] text-grey1">
                {item?.imageSize} | {item?.imageDimension}
              </span>
            </li>
            <li>
              <div className="flex items-start gap-3">
                <div className="texxt-font-primary rounded-md border border-[#AAAAAA] px-[6px] py-1 text-[12px]">
                  <p>{item.tagNames}</p>
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
      <div><nav class="sc-eVqvcJ cocSnr rdt_Pagination"><span class="sc-jytpVa sc-pYNGo ktpgmD irAvtw">Rows per page:</span><div class="sc-kjwdDK gzpBke"><select aria-label="Rows per page:" class="sc-cOpnSz ehyRh"><option value="10" selected="">10</option><option value="15">15</option><option value="20">20</option><option value="25">25</option><option value="30">30</option></select><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></div><span class="sc-jytpVa sc-eknHtZ ktpgmD ekcsgb">1-1 of 1</span><div class="sc-cdmAjP fbuBwg"><button id="pagination-first-page" type="button" aria-label="First Page" aria-disabled="true" disabled="" class="sc-bbbBoY dlOXOQ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z"></path><path fill="none" d="M24 24H0V0h24v24z"></path></svg></button><button id="pagination-previous-page" type="button" aria-label="Previous Page" aria-disabled="true" disabled="" class="sc-bbbBoY dlOXOQ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></button><button id="pagination-next-page" type="button" aria-label="Next Page" aria-disabled="true" disabled="" class="sc-bbbBoY dlOXOQ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path><path d="M0 0h24v24H0z" fill="none"></path></svg></button><button id="pagination-last-page" type="button" aria-label="Last Page" aria-disabled="true" disabled="" class="sc-bbbBoY dlOXOQ"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" role="presentation"><path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z"></path><path fill="none" d="M0 0h24v24H0V0z"></path></svg></button></div></nav></div>
      </div>
  );
}