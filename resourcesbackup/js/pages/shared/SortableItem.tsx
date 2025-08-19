import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react'; // Optional: or use your own icon
import { PropsWithChildren } from 'react';

type Props = {
    id: string;
    className?:string;
};

export const SortableItem = ({ id, children ,className }: PropsWithChildren<Props>) => {
    const { attributes, listeners, setNodeRef, transform, transition , } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative mb-4 flex items-center gap-2 !w-full">
            {/* Drag Handle */}
            <div
                {...listeners}
                {...attributes}
                className={`absolute top-7 left-1 cursor-grab text-gray-400 hover:text-gray-600 ${className}` }
                title="Drag to reorder"
            >
                <GripVertical />
            </div>

            {children}
        </div>
    );
};
