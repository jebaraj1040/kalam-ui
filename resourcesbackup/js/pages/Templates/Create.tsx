import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import { PageProps, type BreadcrumbItem } from '@/types';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Disclosure } from '@headlessui/react';
import { Head, router } from '@inertiajs/react';
import { ChevronDown, ChevronUp, GripVertical, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImportComponents from '../shared/ImportComponents';

// Types

interface ComponentItem {
    _id: string;
    component_name: string;
    original_id?: string;
    custom_label?: string;
    instance_id?: string;
}

interface Props extends PageProps {
    components: {
        id: string;
        component_name: string;
    }[];
    breadcrumbs: BreadcrumbItem[];
}

// Sortable Item

function SortableItem({
    id,
    component_name,
    label,
    onRemove,
    onLabelChange,
}: {
    id: string;
    component_name: string;
    label?: string;
    onRemove: () => void;
    onLabelChange: (newLabel: string) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

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
                            
                            <div {...attributes} {...listeners} className="cursor-move font-semibold flex gap-3 flex-start">
                                <GripVertical />
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
                        <Disclosure.Panel className="py-2 px-[30px]">
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

// Main Page

export default function Create({ components, breadcrumbs }: Props) {
    // Initial list
    const mappedComponents: ComponentItem[] = components.map((c) => ({
        _id: c.id,
        component_name: c.component_name,
    }));

    const [status, setStatus] = useState<string>('Active');
    const [templateName, setTemplateName] = useState('');
    const [availableComponents, setAvailableComponents] = useState<ComponentItem[]>(mappedComponents);
    const [selectedComponents, setSelectedComponents] = useState<ComponentItem[]>([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
    const [description, setDescription] = useState('');

    // Search logic
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<ComponentItem[]>([]);
    const abortControllerRef = useRef<AbortController | null>(null);

    const handleLabelChange = (id: string, newLabel: string) => {
        setSelectedComponents((prev) => prev.map((c) => (c._id === id ? { ...c, custom_label: newLabel } : c)));
    };

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
                const mapped = data.map((c: any) => ({
                    _id: c.id,
                    component_name: c.component_name,
                }));

                // Remove already selected ones:
                // const filtered = mapped.filter((comp) => !selectedComponents.some((sel) => sel.original_id === comp._id));

                setSearchResults(mapped);
            })
            .catch((err) => {
                if (err.name !== 'AbortError') {
                    console.error(err);
                }
            });
    };

    const handleAddComponent = (component: ComponentItem) => {
        const uniqueId = `${component._id}_${uuidv4()}`;
        setSelectedComponents((prev) => [
            ...prev,
            {
                _id: uniqueId,
                original_id: component._id,
                component_name: component.component_name,
                instance_id: uuidv4(), // Generate instance ID here
            },
        ]);
        setAvailableComponents((prev) => prev.filter((c) => c._id !== component._id));
        setSearchResults([]);
        setSearchTerm('');
    };

    const handleRemoveComponent = (id: string, originalId?: string) => {
        const updated = selectedComponents.filter((c) => c._id !== id);
        const stillExists = updated.some((c) => c.original_id === originalId);

        if (!stillExists && originalId) {
            const originalComponent = mappedComponents.find((c) => c._id === originalId);
            if (originalComponent) {
                setAvailableComponents((prev) => {
                    const merged = [...prev, originalComponent];
                    return merged.filter((item, index, self) => self.findIndex((v) => v._id === item._id) === index);
                });
            }
        }

        setSelectedComponents(updated);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = selectedComponents.findIndex((c) => c._id === active.id);
            const newIndex = selectedComponents.findIndex((c) => c._id === over?.id);
            setSelectedComponents(arrayMove(selectedComponents, oldIndex, newIndex));
        }
    };

    const handleSubmit = () => {
        const payload = {
            templateName,
            status,
            description,
            selectedComponents: selectedComponents.map((c) => ({
                id: c.original_id,
                component_name: c.component_name,
                custom_label: c.custom_label || null,
                instance_id: c.instance_id, // Include instance ID
            })),
        };
        router.post('/templates', payload, {
            onError: (errors) => {
                if (errors.duplicate_instance_id) {
                    // Regenerate all instance_ids on duplicate error
                    const regenerated = selectedComponents.map((c) => ({
                        ...c,
                        instance_id: uuidv4(),
                    }));
                    setSelectedComponents(regenerated);
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Templates" />
            <div className="flex items-center justify-between px-6 py-5">
                <p className="font-tree-regular text-base text-font-primary">
                    Templates <span className="font-tree-semibold">/ Create Template</span>
                </p>
                <div className="flex gap-4">
                    <Button
                        variant={'secondary'}
                        title="Cancel"
                        type="button"
                        className="w-[120px]"
                        onClick={() => router.visit(route('admin.components.index'))}
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
                            <div className="mt-2  rounded-xl border border-primary bg-input p-2">
                                {searchResults.length > 0 ? (
                                    searchResults.map((comp) => (
                                        <div key={comp._id} className="cursor-pointer p-2 hover:text-primary" onClick={() => handleAddComponent(comp)}>
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
                        <label className="font-tree-medium mb-3 block text-sm text-font-secondary">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input min-h-[100px] w-full resize-none"
                            placeholder="Describe this template"
                        />
                    </div>
                    {/* import component popup start */}
                    {/* <ImportComponents page={'templates'} handleAddComponent={handleAddComponent} /> */}
                    {/* import component popup end */}
                </div>
                <div className="pageRight col-span-3 rounded-l-xl border border-r-0 border-border bg-grey px-6 py-4">
                    <p className="font-tree-semibold mb-4 text-lg text-font-secondary">2. Components</p>

                    <div className="rounded-xl bg-background p-7">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                            <SortableContext items={selectedComponents.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                                {selectedComponents.map((c) => (
                                    <SortableItem
                                        key={`selected_${c._id}`}
                                        id={c._id}
                                        component_name={c.component_name}
                                        label={c.custom_label}
                                        onRemove={() => handleRemoveComponent(c._id, c.original_id)}
                                        onLabelChange={(newLabel) => handleLabelChange(c._id, newLabel)}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    </div>
                </div>
            </div>
            {/* <div className="p-4">
                <h1 className="mb-4 text-2xl font-bold">Create Template</h1>

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
                                    <div key={comp._id} className="cursor-pointer p-2 hover:bg-gray-200" onClick={() => handleAddComponent(comp)}>
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
                        <SortableContext items={selectedComponents.map((c) => c._id)} strategy={verticalListSortingStrategy}>
                            {selectedComponents.map((c) => (
                                <SortableItem
                                    key={`selected_${c._id}`}
                                    id={c._id}
                                    component_name={c.component_name}
                                    label={c.custom_label}
                                    onRemove={() => handleRemoveComponent(c._id, c.original_id)}
                                    onLabelChange={(newLabel) => handleLabelChange(c._id, newLabel)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>

                <button onClick={handleSubmit} className="rounded bg-yellow-500 px-4 py-2 text-white">
                    Create Template
                </button>
            </div> */}
        </AppLayout>
    );
}
