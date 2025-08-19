import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreatedByDropdown } from '@/components/ui/multi-select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { BreadcrumbItem } from '@/types';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Disclosure } from '@headlessui/react';
import { Head, router } from '@inertiajs/react';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { ChevronDown, ChevronUp, CircleX, EllipsisVertical, GripVertical, Trash2 } from 'lucide-react';
import * as React from 'react';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Types
interface ComponentItem {
    id: string; // Mongo ObjectId as string
    component_name: string;
    custom_label?: string;
    local_id: string; // UUID for frontend-only usage
    instance_id: string;
}

interface Template {
    id: string;
    template_name: string;
    status: string;
    components: {
        id: string;
        component_name: string;
        custom_label?: string;
        instance_id?: string;
    }[];
}

interface AvailableComponent {
    id: string;
    component_name: string;
}

interface Props {
    template: Template;
    availableComponents: AvailableComponent[];
    breadcrumbs: BreadcrumbItem[];
}

// Sortable item
function SortableItem({
    local_id,
    component_name,
    label,
    onRemove,
    onLabelChange,
}: {
    local_id: string;
    component_name: string;
    label?: string;
    onRemove: () => void;
    onLabelChange: (newLabel: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
        id: local_id,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="childCard mb-5 rounded-xl border-l-2 border-primary bg-grey p-4 last:mb-0">
            <Disclosure defaultOpen>
                {({ open }) => (
                    <div>
                        <div className="flex items-center justify-between">
                            <div {...attributes} {...listeners} className="flex cursor-move items-center gap-3 font-semibold">
                                <GripVertical className="h-4 w-4 text-gray-500" />
                                {component_name}
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    className="font-tree-semibold flex cursor-pointer items-center gap-1 text-red"
                                    onClick={onRemove}
                                    type="button"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                                <Disclosure.Button className="flex w-full justify-between text-left text-sm font-medium">
                                    <span>
                                        {open ? (
                                            <ChevronUp size={24} className="text-font-primary" />
                                        ) : (
                                            <ChevronDown size={24} className="text-font-primary" />
                                        )}
                                    </span>
                                </Disclosure.Button>
                            </div>
                        </div>

                        <Disclosure.Panel className="px-[30px] py-2">
                            {/* Label input */}
                            <input
                                type="text"
                                value={label || ''}
                                onChange={(e) => onLabelChange(e.target.value)}
                                placeholder="Enter custom label "
                                className="form-input w-1/3"
                            />
                        </Disclosure.Panel>
                    </div>
                )}
            </Disclosure>
        </div>
    );
}

export default function Edit({ template, availableComponents: availableComponentsFromServer, breadcrumbs }: Props) {
    const [templateName, setTemplateName] = useState(template.template_name);
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('');

    // Transform initial selected components
    const [selectedComponents, setSelectedComponents] = useState<ComponentItem[]>(() =>
        template.components.map((c) => ({
            id: c.id,
            component_name: c.component_name,
            custom_label: c.custom_label,
            local_id: uuidv4(),
            instance_id: c.instance_id || uuidv4(),
        })),
    );

    // Initially exclude already used components from available list
    const [availableComponents, setAvailableComponents] = useState<AvailableComponent[]>(() => {
        const selectedIds = new Set(template.components.map((c) => c.id));
        return availableComponentsFromServer.filter((c) => !selectedIds.has(c.id));
    });

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

    // Search state
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<AvailableComponent[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleSearchChange = (term: string) => {
        setSearchTerm(term);

        if (!term.trim()) {
            setSearchResults([]);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        fetch(`/components/active?search=${encodeURIComponent(term)}`, {
            signal: controller.signal,
        })
            .then((res) => res.json())
            .then((data) => {
                const mapped: AvailableComponent[] = data.map((c: any) => ({
                    id: c.id,
                    component_name: c.component_name,
                }));

                // You said you don't want to filter these — show all:
                setSearchResults(mapped);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error(err);
                }
            });
    };

    const handleAddComponent = (component: AvailableComponent) => {
        const newComp: ComponentItem = {
            id: component.id,
            component_name: component.component_name,
            local_id: uuidv4(),
            instance_id: uuidv4(),
        };

        setSelectedComponents((prev) => [...prev, newComp]);
        setAvailableComponents((prev) => prev.filter((c) => c.id !== component.id));
        setSearchResults([]);
        setSearchTerm('');
    };

    const handleRemoveComponent = (localId: string, componentId?: string) => {
        const updated = selectedComponents.filter((c) => c.local_id !== localId);

        // Only return to available if it was not duplicate
        const stillExists = updated.some((c) => c.id === componentId);

        if (!stillExists && componentId) {
            const original = availableComponentsFromServer.find((c) => c.id === componentId);
            if (original) {
                setAvailableComponents((prev) => {
                    const merged = [...prev, original];
                    return merged.filter((item, index, self) => self.findIndex((v) => v.id === item.id) === index);
                });
            }
        }

        setSelectedComponents(updated);
    };

    const handleLabelChange = (localId: string, newLabel: string) => {
        setSelectedComponents((prev) => prev.map((c) => (c.local_id === localId ? { ...c, custom_label: newLabel } : c)));
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = selectedComponents.findIndex((c) => c.local_id === active.id);
            const newIndex = selectedComponents.findIndex((c) => c.local_id === over?.id);
            setSelectedComponents(arrayMove(selectedComponents, oldIndex, newIndex));
        }
    };

    const cardComponents: any = [
        {
            id: 'comp1',
            component_name: 'Homepage V1',
            status: 'active',
            schema: [
                { id: 'schema1', title: 'Header' },
                { id: 'schema2', title: 'CTA' },
                { id: 'schema3', title: 'Hero' },
            ],
        },
        {
            id: 'comp2',
            component_name: 'Homepage V2',
            status: 'active',
            schema: [
                { id: 'schema1', title: 'Header' },
                { id: 'schema2', title: 'CTA' },
                { id: 'schema3', title: 'Hero' },
            ],
        },
        {
            id: 'comp3',
            component_name: 'Dashboard V3',
            status: 'active',
            schema: [
                { id: 'schema1', title: 'Header' },
                { id: 'schema2', title: 'CTA' },
                { id: 'schema3', title: 'Hero' },
            ],
        },
        {
            id: 'comp4',
            component_name: 'Services',
            status: 'active',
            schema: [
                { id: 'schema1', title: 'Header' },
                { id: 'schema2', title: 'CTA' },
                { id: 'schema3', title: 'Hero' },
            ],
        },
        {
            id: 'comp5',
            component_name: 'Homepage V5',
            status: 'archived',
            schema: [
                { id: 'schema1', title: 'Header' },
                { id: 'schema2', title: 'CTA' },
                { id: 'schema3', title: 'Hero' },
            ],
        },
        {
            id: 'comp6',
            component_name: 'Homepage V6',
            status: 'draft',
            schema: [
                { id: 'schema1', title: 'Header' },
                { id: 'schema2', title: 'CTA' },
                { id: 'schema3', title: 'Hero' },
            ],
        },
    ];
    const statusStyles: any = {
        active: {
            bg: 'bg-[#E8F5E9]',
            text: 'text-[#1B5E20]',
            dot: 'before:bg-[#1B5E20]',
        },
        archived: {
            bg: 'bg-[#FFEBEE]',
            text: 'text-[#B71C1C]',
            dot: 'before:bg-[#B71C1C]',
        },
        draft: {
            bg: 'bg-[#F6F1E0]',
            text: 'text-[#A75700]',
            dot: 'before:bg-[#A75700]',
        },
    };

    // Keep track of checked items by their id
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    // Toggle checkbox selection
    const toggleCheckbox = (id: string) => {
        setCheckedIds(
            (prev) =>
                prev.includes(id)
                    ? prev.filter((item) => item !== id) // uncheck
                    : [...prev, id], // check
        );
    };

    const handleSubmit = () => {
        const payload = {
            templateName,
            description,
            status,
            selectedComponents: selectedComponents.map((c) => ({
                id: c.id,
                component_name: c.component_name,
                custom_label: c.custom_label || null,
                instance_id: c.instance_id,
            })),
        };

        router.put(`/templates/${template.id}`, payload, {
            onSuccess: () => {
                console.log('Template updated');
            },
            onError: (err: any) => {
                if (err?.duplicate_instance_id) {
                    const regenerated = selectedComponents.map((c) => ({
                        ...c,
                        instance_id: uuidv4(),
                    }));
                    setSelectedComponents(regenerated);
                } else {
                    alert('Error updating template');
                }
            },
        });
    };

    const [value, setValue] = React.useState('English');

    const languageOptions = [
  { label: "English", value: "english" },
  { label: "Tamil", value: "tamil" },
  { label: "Hindi", value: "hindi" },
  { label: "Kannada", value: "kannada" },
  { label: "Malayalam", value: "malayalam" },
  { label: "Marathi", value: "marathi" },
  { label: "Telugu", value: "telugu" },
]

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Template" />

            <div className="flex items-center justify-between px-6 py-5">
                <p className="font-tree-regular text-base text-font-primary">
                    Templates <span className="font-tree-semibold">/ Edit templates</span>
                </p>
                <div className="flex gap-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="font-tree-medium text-sm text-[#CB6600]" aria-label="Customise options">
                                View Versions
                            </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuPortal>
                            <DropdownMenuContent className="min-w-[345px] rounded-lg bg-background p-6 pr-4" sideOffset={5}>
                                <div className="flex justify-between">
                                    <h2 className="font-tree-semibold mb-6 text-base text-font-primary">Versions History</h2>
                                    <CircleX className="text-font-primary" />
                                </div>
                                <DropdownMenu>
                                    <div className="scrollbar-thin max-h-[400px] overflow-y-auto">
                                        <ul className="pr-4">
                                            <li className="relative mb-5 after:absolute after:top-[35px] after:left-[20px] after:h-full after:w-[1px] after:bg-[#E1E1E1] after:content-[''] last:after:content-none">
                                                <div className="hover ml-15 flex items-center justify-between p-2">
                                                    <div>
                                                        <h3 className="active [.active]:text-dark text-xs [.active]:text-sm">Latest Version</h3>
                                                        <div className="text-xs text-font-primary">
                                                            Alex Morgan{' '}
                                                            <span className="font-tree-regular mr-2 ml-2 inline-block h-[6px] w-[6px] rounded-lg bg-[#E1E1E1]"></span>
                                                            <span className="text-xs">Just now</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    className="h-5 w-5 cursor-pointer outline-none [&>svg]:w-full [&>svg]:stroke-font-primary"
                                                                    title="EllipsisVertical"
                                                                    type="button"
                                                                >
                                                                    <EllipsisVertical className="text-[#898989]" />
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuPortal>
                                                                <DropdownMenuContent
                                                                    className="absolute right-0 w-[140px] rounded-lg bg-black"
                                                                    sideOffset={5}
                                                                >
                                                                    <DropdownMenuGroup>
                                                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                            <p className="font-tree-regular text-xs text-white">View this version</p>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                            <p className="font-tree-regular text-xs text-white">
                                                                                Restore this version
                                                                            </p>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                            <p className="font-tree-regular text-xs text-white">Copy Link</p>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuGroup>
                                                                </DropdownMenuContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <span className="active absolute top-0 flex h-[34px] w-[44px] items-center justify-center rounded-[50px] [.active]:bg-primary [.active]:text-white">
                                                    <span className="font-tree-semibold text-sm">v6.0</span>
                                                </span>
                                            </li>
                                            <li className="relative mb-5 after:absolute after:top-[35px] after:left-[20px] after:h-full after:w-[1px] after:bg-[#E1E1E1] after:content-[''] last:after:content-none">
                                                <div className="ml-15 flex items-center justify-between p-2">
                                                    <div className="hover:!bg-black">
                                                        <h3 className="text-xs text-font-primary">Latest Version</h3>
                                                        <div className="text-xs text-font-primary">
                                                            Alex Morgan{' '}
                                                            <span className="font-tree-regular mr-2 ml-2 inline-block h-[6px] w-[6px] rounded-lg bg-[#E1E1E1]"></span>
                                                            <span className="text-xs">Just now</span>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <button
                                                                    className="h-5 w-5 cursor-pointer outline-none [&>svg]:w-full [&>svg]:stroke-font-primary"
                                                                    title="EllipsisVertical"
                                                                    type="button"
                                                                >
                                                                    <EllipsisVertical className="text-[#898989]" />
                                                                </button>
                                                            </DropdownMenuTrigger>

                                                            <DropdownMenuPortal>
                                                                <DropdownMenuContent
                                                                    className="absolute right-0 w-[140px] rounded-lg bg-black"
                                                                    sideOffset={5}
                                                                >
                                                                    <DropdownMenuGroup>
                                                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                            <p className="font-tree-regular text-xs text-white">View this version</p>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                            <p className="font-tree-regular text-xs text-white">
                                                                                Restore this version
                                                                            </p>
                                                                        </DropdownMenuItem>
                                                                        <DropdownMenuSeparator />
                                                                        <DropdownMenuItem className="cursor-pointer focus:bg-[none]">
                                                                            <p className="font-tree-regular text-xs text-white">Copy Link</p>
                                                                        </DropdownMenuItem>
                                                                    </DropdownMenuGroup>
                                                                </DropdownMenuContent>
                                                            </DropdownMenuPortal>
                                                        </DropdownMenu>
                                                    </div>
                                                </div>

                                                <span className="absolute top-0 flex h-[34px] w-[44px] items-center justify-center rounded-[50px] bg-grey text-[#898989]">
                                                    <span className="font-tree-semibold text-sm">v6.0</span>
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </DropdownMenu>
                            </DropdownMenuContent>
                        </DropdownMenuPortal>
                    </DropdownMenu>

                    <Button
                        variant={'secondary'}
                        title="Cancel"
                        type="button"
                        className="w-[120px]"
                        onClick={() => router.visit(route('admin.templates.index'))}
                    >
                        Cancel{' '}
                    </Button>
                    <Button variant={'default'} title="Save" type="button" className="w-[120px]" onClick={handleSubmit}>
                        Save{' '}
                    </Button>
                </div>
            </div>
            <div className="grid h-full grid-cols-4 gap-6.5">
                <div className="pageLeft rounded-r-xl border border-l-0 border-border bg-grey p-4">
                    <p className="font-tree-semibold mb-4 text-lg text-font-secondary">1. General information</p>
                    <div className="mb-6">
                        <label className="font-tree-medium mb-3 block text-sm text-font-secondary">
                            Template Name <sup className="text-red">*</sup>
                        </label>
                        <input
                            value={templateName}
                            onChange={(e) => setTemplateName(e.target.value)}
                            className="form-input w-full"
                            placeholder="Enter template name"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="font-tree-medium mb-3 block text-sm text-font-secondary">
                            Status <sup className="text-red">*</sup>
                        </label>
                        <ToggleGroup type="single" variant={'outline'} value={status} onValueChange={(e) => setStatus(e)}>
                            <ToggleGroupItem value={'Active'}>Active</ToggleGroupItem>
                            <ToggleGroupItem value={'Archive'}>Archive</ToggleGroupItem>
                            <ToggleGroupItem value={'Draft'}>Draft</ToggleGroupItem>
                        </ToggleGroup>
                    </div>
                    
                    <div className="mb-6">
                        <label className="font-tree-medium mb-3 block text-sm text-font-secondary">Available Components</label>
                        <input
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="form-input w-full resize-none"
                            placeholder="Available Components"
                        />
                        {searchTerm.trim() && (
                            <div className="mt-2 rounded-xl border border-primary bg-white p-2">
                                {searchResults.length > 0 ? (
                                    searchResults.map((comp) => (
                                        <div key={comp.id} className="cursor-pointer p-2 hover:bg-gray-200" onClick={() => handleAddComponent(comp)}>
                                            {comp.component_name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No results found</div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mb-6">
                        <CreatedByDropdown values={languageOptions} />
                    </div>

                    <div className="mb-6">
                        <label className="font-tree-medium mb-3 block text-sm text-font-secondary">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input min-h-[100px] w-full resize-none"
                            placeholder="Describe this template"
                        />
                    </div>
                    {/* import component popup start */}
                    {/* <ImportComponents page={'templates'} /> */}
                    {/* import component popup end */}
                </div>
                <div className="pageRight col-span-3 rounded-l-xl border border-r-0 border-border bg-grey px-6 py-4">
                    <p className="font-tree-semibold mb-4 text-lg text-font-secondary">2. Templates</p>
                    <ToggleGroupPrimitive.Root
                        type="single"
                        value={value}
                        onValueChange={(val) => val && setValue(val)}
                        className="my-4 flex items-center gap-2"
                    >
                        <ToggleGroupPrimitive.Item
                            value="English"
                            className="rounded-[40px] border border-gray-300 bg-input px-3 py-[6px] !text-[12px] data-[state=on]:border-primary data-[state=on]:bg-[#FAF1E0] data-[state=on]:text-primary"
                        >
                            English
                        </ToggleGroupPrimitive.Item>
                        <ToggleGroupPrimitive.Item
                            value="tamil"
                            className="rounded-[40px] border border-gray-300 bg-input px-3 py-[6px] !text-[12px] data-[state=on]:border-primary data-[state=on]:bg-[#FAF1E0] data-[state=on]:text-primary"
                        >
                            Tamil
                        </ToggleGroupPrimitive.Item>
                        <ToggleGroupPrimitive.Item
                            value="hindi"
                            className="rounded-[40px] border border-gray-300 bg-input px-3 py-[6px] !text-[12px] data-[state=on]:border-primary data-[state=on]:bg-[#FAF1E0] data-[state=on]:text-primary"
                        >
                            Hindi
                        </ToggleGroupPrimitive.Item>
                    </ToggleGroupPrimitive.Root>
                    <div className="rounded-xl bg-background p-7">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={selectedComponents.map((c) => c.local_id)} strategy={verticalListSortingStrategy}>
                                {selectedComponents.map((c) => (
                                    <SortableItem
                                        key={`selected_${c.local_id}`}
                                        local_id={c.local_id}
                                        component_name={c.component_name}
                                        label={c.custom_label}
                                        onRemove={() => handleRemoveComponent(c.local_id, c.id)}
                                        onLabelChange={(newLabel) => handleLabelChange(c.local_id, newLabel)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>

            {/* <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Edit Template</h1>

                <div className="mb-6">
                    <label className="block text-sm font-medium">Template Name</label>
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="mt-1 w-full rounded border p-2"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium">Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 block w-full rounded border p-2">
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="mb-1 block font-medium">Available Components</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded border p-2"
                        placeholder="Search components..."
                    />

                    {searchTerm.trim() && (
                        <div className="mt-2 rounded border bg-gray-50 p-2">
                            {searchResults.length > 0 ? (
                                searchResults.map((comp) => (
                                    <div key={comp.id} className="cursor-pointer p-2 hover:bg-gray-200" onClick={() => handleAddComponent(comp)}>
                                        {comp.component_name}
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-gray-500">No results found</div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <h2 className="mb-2 text-lg font-semibold">Selected Components</h2>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={selectedComponents.map((c) => c.local_id)} strategy={verticalListSortingStrategy}>
                            {selectedComponents.map((c) => (
                                <SortableItem
                                    key={`selected_${c.local_id}`}
                                    local_id={c.local_id}
                                    component_name={c.component_name}
                                    label={c.custom_label}
                                    onRemove={() => handleRemoveComponent(c.local_id, c.id)}
                                    onLabelChange={(newLabel) => handleLabelChange(c.local_id, newLabel)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                <button onClick={handleSubmit} className="rounded bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600">
                    Update Template
                </button>
            </div> */}
        </AppLayout>
    );
}
