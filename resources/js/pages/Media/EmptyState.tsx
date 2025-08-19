import { Button } from '@/components/ui/button';
import { ChevronDownIcon, FolderPlus, ImagePlus } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EmptyStateProps {
  onCreateFolder: () => void;
  onAddAssets: () => void;
}

export default function EmptyState({ onCreateFolder, onAddAssets }: EmptyStateProps) {
  return (
    <div className="m-auto flex w-full flex-col items-center justify-center text-center py-12">
      <div className="mb-8">
        <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M162.408 147.901C163.106 147.655 163.839 147.329 164.405 146.856C165.077 146.294 165.35 145.571 165.534 144.81C165.769 143.832 165.864 142.79 166.149 141.81C166.255 141.447 166.459 141.309 166.546 141.248C166.767 141.094 166.99 141.053 167.2 141.068C167.449 141.086 167.791 141.179 168.015 141.592C168.047 141.651 168.089 141.741 168.117 141.864C168.138 141.954 168.151 142.237 168.172 142.353C168.226 142.64 168.272 142.927 168.314 143.216C168.456 144.176 168.537 144.991 168.984 145.874C169.59 147.071 170.198 147.804 171.021 148.129C171.818 148.442 172.77 148.383 173.987 148.137C174.103 148.11 174.218 148.086 174.331 148.066C174.868 147.974 175.38 148.322 175.486 148.851C175.591 149.379 175.25 149.894 174.719 150.01C174.608 150.034 174.498 150.057 174.39 150.078C172.746 150.48 170.842 151.917 169.735 153.176C169.394 153.564 168.895 154.648 168.386 155.34C168.01 155.851 167.588 156.187 167.233 156.306C166.996 156.386 166.795 156.374 166.63 156.333C166.389 156.275 166.19 156.146 166.037 155.941C165.953 155.829 165.876 155.679 165.839 155.487C165.821 155.394 165.82 155.16 165.82 155.054C165.716 154.701 165.589 154.356 165.497 154C165.276 153.15 164.843 152.611 164.328 151.9C163.847 151.235 163.33 150.817 162.572 150.483C162.474 150.459 161.678 150.267 161.397 150.156C160.987 149.994 160.792 149.723 160.721 149.577C160.6 149.328 160.588 149.112 160.612 148.931C160.647 148.664 160.768 148.436 160.983 148.252C161.116 148.137 161.315 148.026 161.581 147.972C161.787 147.929 162.332 147.905 162.408 147.901ZM167.074 146.516C167.111 146.597 167.151 146.678 167.192 146.761C168.08 148.515 169.073 149.494 170.28 149.969L170.321 149.985C169.513 150.578 168.782 151.24 168.224 151.875C167.994 152.137 167.689 152.68 167.36 153.237C167.061 152.276 166.572 151.597 165.958 150.747C165.488 150.098 164.996 149.61 164.391 149.212C164.861 148.974 165.308 148.695 165.698 148.369C166.347 147.827 166.776 147.198 167.074 146.516Z"
            fill="#E1E1E1"
          />
          <ellipse cx="9.62347" cy="84.9218" rx="3.62347" ry="3.58363" fill="#E1E1E1" />
          <rect x="61.0879" y="63.2581" width="131.704" height="46.9557" rx="16" fill="#111111" />
          <rect x="115.455" y="79.4231" width="44.4119" height="6.15812" rx="3.07906" fill="#F7F7F7" />
          <rect x="72.5742" y="88.6602" width="87.5162" height="6.15812" rx="3.07906" fill="white" />
          <ellipse cx="175.946" cy="87.1208" rx="7.65723" ry="7.69765" fill="#FAF1E0" />
          <rect x="6" y="102.516" width="131.704" height="46.9557" rx="16" fill="#F3DBB0" />
          <rect x="38.9268" y="118.681" width="44.4119" height="6.15812" rx="3.07906" fill="#D27401" />
          <rect x="38.9268" y="127.918" width="87.5162" height="6.15812" rx="3.07906" fill="white" />
          <ellipse cx="25.1436" cy="126.379" rx="7.65723" ry="7.69765" fill="#D27401" />
        </svg>
      </div>
      <p className="font-semibold mb-2 text-xl text-font-secondary">No assets added yet</p>
      <p className="font-regular mb-6 w-full text-sm text-font-primary md:max-w-[300px]">
        Start by creating a new page using a saved template and reusable components
      </p>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={'default'} className='w-[151px]' title="Add New " type="button">
            <span className="button-icon">+</span> Add New
            <ChevronDownIcon className="ml-1 h-4.5 w-4.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent className="rounded-lg w-[151px] bg-black" sideOffset={5}>
            <DropdownMenuGroup>
              <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                <button
                  type='button'
                  className="flex cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                  title="Create folder" 
                  onClick={onCreateFolder}
                >
                  <FolderPlus className="mr-2 h-4 w-4 text-white" />
                  Create folder
                </button>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                <button
                  onClick={onAddAssets}
                  className="flex cursor-pointer items-center text-white hover:text-primary hover:*:text-primary [&>svg]:w-full"
                  title="Add assets"
                  type="button"
                >
                  <ImagePlus className="mr-2 h-4 w-4 text-white" />
                  Add assets
                </button>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
    </div>
  );
}