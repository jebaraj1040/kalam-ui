import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import AppLayout from '@/layouts/app-layout';
import SchemaCard from '@/pages/shared/SchemaCard';
import { BreadcrumbItem, Field, FieldType } from '@/types';
import { closestCenter, DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Head, router } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ImportComponents from '../shared/ImportComponents';
import { SortableItem } from '../shared/SortableItem';
import TagInput from '../shared/TagsInput';


interface Schema {
    id: string;
    title: string;
    fields: Field[];
    children?: Schema[];
}

interface Component {
    id: string;
    component_name: string;
    status: string;
    description: string;
    schema: Schema[];
}

interface Tag {
    id: string;
    name: string;
    type: string;
}

type Props = {
    component_count: number;
    breadcrumbs: BreadcrumbItem[];
    tags: Tag[];
};

type Status = 'active' | 'archived' | 'draft';

export default function CreateComponent({ component_count, breadcrumbs, tags }: Props) {
    console.log(tags);
    const [componentName, setComponentName] = useState('');
    const [status, setStatus] = useState('Active');
    const [description, setDescription] = useState('');
    const [schema, setSchema] = useState<Schema[]>([]);
    const [existingComponents, setExistingComponents] = useState<Component[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [schemeShow, setSchemaShow] = useState(false);
    const [availableTags, setAvailableTags] = useState<Tag[]>(tags);
    const [createTags, setCreateTags] = useState<Tag[]>([]);
    const [existingTagIds, setExistingTagIds] = useState<string[]>([]);

    // Fetch existing components matching search term for import suggestions
    useEffect(() => {
        if (!searchTerm.trim()) {
            setExistingComponents([]);
            return;
        }

        setIsSearching(true);
        const controller = new AbortController();

        fetch(`/components/active?search=${encodeURIComponent(searchTerm)}`, { signal: controller.signal })
            .then((res) => res.json())
            .then((data) => setExistingComponents(data))
            .catch((err) => {
                if (err.name !== 'AbortError') console.error(err);
            })
            .finally(() => setIsSearching(false));

        return () => controller.abort();
    }, [searchTerm]);

    // Recursively updates a schema tree for a matching schema ID
    const updateSchemaArray = useCallback((items: Schema[], targetId: string, updater: (s: Schema) => Schema): Schema[] => {
        return items.map((s) => {
            if (s.id === targetId) return updater(s);
            if (s.children?.length) {
                return { ...s, children: updateSchemaArray(s.children, targetId, updater) };
            }
            return s;
        });
    }, []);

    // Adds a new top-level schema
    const addSchema = useCallback(() => {
        setSchema((prev) => [...prev, { id: uuidv4(), title: '', fields: [], children: [] }]);
        setSchemaShow(true);
    }, []);

    // Adds a subschema under a specified parent schema
    const addSubSchema = useCallback(
        (parentId: string) => {
            const newSub: Schema = { id: uuidv4(), title: '', fields: [], children: [] };
            setSchema((prev) => updateSchemaArray(prev, parentId, (s) => ({ ...s, children: [...(s.children || []), newSub] })));
        },
        [updateSchemaArray],
    );

    // Removes a schema (and any nested children) by ID
    const removeSchema = useCallback((schemaId: string) => {
        const removeNested = (items: Schema[]): Schema[] => {
            return items.filter((s) => s.id !== schemaId).map((s) => ({ ...s, children: s.children ? removeNested(s.children) : [] }));
        };
        setSchema((prev) => removeNested(prev));
    }, []);

    // Updates the title of a specific schema
    const updateSchemaTitle = useCallback(
        (schemaId: string, title: string) => {
            setSchema((prev) => updateSchemaArray(prev, schemaId, (s) => ({ ...s, title })));
        },
        [updateSchemaArray],
    );

    // check whether schema is rpeatable or not
    const updateSchemaRepeatable = useCallback(
        (schemaId: string, isRepeatable: boolean) => {
            setSchema((prev) =>
                updateSchemaArray(prev, schemaId, (s) => ({
                    ...s,
                    repeatable: isRepeatable,
                })),
            );
        },
        [updateSchemaArray],
    );

    // Adds a new field to a schema
    const addField = useCallback(
        (schemaId: string, type: FieldType = 'Text') => {
            let newField: Field;

            if (type === 'Image') {
                newField = {
                    id: uuidv4(),
                    type: 'Image',
                    key: 'image',
                    label: 'Image',
                    fields: [
                        { id: uuidv4(), type: 'Text', key: 'alt', label: 'Alt' },
                        { id: uuidv4(), type: 'Text', key: 'title', label: 'Title' },
                        // { id: uuidv4(), type: 'Text', key: 'img', label: 'Img' },
                    ],
                };
            } else if (type === 'Link') {
                newField = {
                    id: uuidv4(),
                    type: 'Link',
                    key: 'link',
                    label: 'Link',
                    fields: [
                        { id: uuidv4(), type: 'Text', key: 'href', label: 'Href' },
                        { id: uuidv4(), type: 'Text', key: 'rel', label: 'Rel' },
                        { id: uuidv4(), type: 'Text', key: 'title', label: 'Title' },
                        { id: uuidv4(), type: 'Text', key: 'target', label: 'Target' },
                    ],
                };
            } else {
                newField = {
                    id: uuidv4(),
                    type,
                    key: '',
                    label: '',
                };
            }

            setSchema((prev) =>
                updateSchemaArray(prev, schemaId, (s) => ({
                    ...s,
                    fields: [...s.fields, newField],
                })),
            );
        },
        [updateSchemaArray],
    );

    // Updates a field’s properties (key, label, type) in a schema
    const updateField = useCallback(
        (schemaId: string, fieldId: string, data: Partial<Field>) => {
            setSchema((prev) =>
                updateSchemaArray(prev, schemaId, (s) => ({
                    ...s,
                    fields: s.fields.map((f) => (f.id === fieldId ? { ...f, ...data } : f)),
                })),
            );
        },
        [updateSchemaArray],
    );

    // Removes a field from a schema
    const removeField = useCallback(
        (schemaId: string, fieldId: string) => {
            setSchema((prev) => updateSchemaArray(prev, schemaId, (s) => ({ ...s, fields: s.fields.filter((f) => f.id !== fieldId) })));
        },
        [updateSchemaArray],
    );

    // Imports schema and fields from an existing component into the current schema list
    const handleAddSchemaFromExisting = useCallback((comp: Component) => {
        console.log(comp);
        const clonedSchemas = cloneSchemaTree(comp.schema || []);
        setSchema((prev) => [...prev, ...clonedSchemas]);
        setSearchTerm('');
        setExistingComponents([]);
    }, []);

    const handleTagsChange = (newTags: Tag[]) => {
        setCreateTags(newTags);

        // Filter only tags that came from availableTags
        const availableIds = availableTags.map((tag) => tag.id);
        const selectedAvailableTagIds = newTags.filter((tag) => availableIds.includes(tag.id)).map((tag) => tag.id);

        setExistingTagIds(selectedAvailableTagIds);
    };

    // This will generate a deep copy of the entire imported schema tree
    function cloneSchemaTree(input: Schema[]): Schema[] {
        return input.map((node) => ({
            id: uuidv4(),
            title: node.title,
            fields: node.fields.map((f) => {
                const base = {
                    id: uuidv4(),
                    type: f.type,
                    key: f.key,
                    label: f.label,
                };

                if (f.type === 'Image') {
                    return {
                        ...base,
                        fields: [
                            { id: uuidv4(), type: 'Text', key: 'alt', label: 'Alt' },
                            { id: uuidv4(), type: 'Text', key: 'title', label: 'Title' },
                            // { id: uuidv4(), type: 'Text', key: 'img', label: 'Img' },
                        ],
                    };
                }

                if (f.type === 'Link') {
                    return {
                        ...base,
                        fields: [
                            { id: uuidv4(), type: 'Text', key: 'href', label: 'Href' },
                            { id: uuidv4(), type: 'Text', key: 'rel', label: 'Rel' },
                            { id: uuidv4(), type: 'Text', key: 'title', label: 'Title' },
                            { id: uuidv4(), type: 'Text', key: 'target', label: 'Target' },
                        ],
                    };
                }

                return base;
            }),
            children: node.children?.length ? cloneSchemaTree(node.children) : [],
        }));
    }

    // Validates the schema tree for required fields and titles, returning error messages
    const validateSchemas = useCallback((schemas: Schema[], path = ''): string[] => {
        const errors: string[] = [];
        schemas.forEach((s, idx) => {
            const label = s.title || `Schema ${idx + 1}`;
            const loc = path ? `${path} > ${label}` : label;
            if (!s.title.trim()) errors.push(`Schema title missing at: ${loc}`);
            s.fields.forEach((f, i) => {
                if (!f.key.trim()) errors.push(`Field ${i + 1} missing key in ${loc}`);
                if (!f.label.trim()) errors.push(`Field ${i + 1} missing label in ${loc}`);
            });
            if (s.children?.length) errors.push(...validateSchemas(s.children, loc));
        });
        return errors;
    }, []);

    // Handles drag and drop reordering of schemas
    const sensors = useSensors(
        useSensor(PointerSensor),
        // Optional: Add keyboard support
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = schema.findIndex((s) => s.id === active.id);
            const newIndex = schema.findIndex((s) => s.id === over?.id);

            setSchema((prev) => arrayMove(prev, oldIndex, newIndex));
        }
    };

    const reorderFields = useCallback(
        (schemaId: string, fromIndex: number, toIndex: number) => {
            setSchema((prev) =>
                updateSchemaArray(prev, schemaId, (s) => ({
                    ...s,
                    fields: arrayMove(s.fields, fromIndex, toIndex),
                })),
            );
        },
        [updateSchemaArray],
    );

    const reorderChildren = (schemaId: string, oldIndex: number, newIndex: number) => {
        setSchema((prevSchemas) => reorderInTree(prevSchemas, schemaId, oldIndex, newIndex));
    };

    function reorderInTree(tree: Schema[], schemaId: string, oldIndex: number, newIndex: number): Schema[] {
        return tree.map((s) => {
            if (s.id === schemaId && s.children) {
                const updated = [...s.children];
                const [moved] = updated.splice(oldIndex, 1);
                updated.splice(newIndex, 0, moved);
                return { ...s, children: updated };
            }
            if (s.children) {
                return { ...s, children: reorderInTree(s.children, schemaId, oldIndex, newIndex) };
            }
            return s;
        });
    }

    // Handles final submission of the component and schema to the server
    const handleSubmit = useCallback(() => {
        const errors = validateSchemas(schema);
        if (!componentName.trim()) errors.unshift('Component Name is required.');
        if (errors.length) return window.alert(errors.join('\n'));
        router.post(
            '/components',
            { componentName, status, description, tags: JSON.stringify(createTags), tag_ids: existingTagIds, schema: JSON.stringify(schema) },
            {
                onSuccess: () => console.log('Component created'),
                onError: (err) => {
                    console.error(err);
                    window.alert('Error saving component.');
                },
            },
        );
    }, [componentName, description, createTags, existingTagIds,schema, status, validateSchemas]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Components" />
            <div className="flex items-center justify-between px-6 py-5">
                <p className="font-tree-regular text-base text-font-primary">
                    Components <span className="font-tree-semibold">/ Component Builder</span>
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
                            Component Name <sup className="text-red">*</sup>
                        </label>
                        <input
                            value={componentName}
                            onChange={(e) => setComponentName(e.target.value)}
                            className="form-input w-full"
                            placeholder="Enter component name"
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
                        <label className="font-tree-medium mb-3 block text-sm text-font-secondary">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input min-h-[100px] w-full resize-none"
                            placeholder="Describe this component"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="font-tree-medium mb-3 flex items-center gap-1 text-sm text-font-secondary">
                            Add tags
                            <span>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4" />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" align="start" sideOffset={5}>
                                            Add relevant tags or component references to improve discoverability
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </span>
                        </label>
                        {/* <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="form-input min-h-[100px] w-full resize-none"
                            placeholder="Add relevant tags"
                        /> */}
                        <TagInput
                            availableTags={availableTags} // optional existing tag list
                            value={createTags}
                            onChange={handleTagsChange}
                        />
                    </div>
                    {/* import component popup start */}
                    <ImportComponents
                        page={'components'}
                        handleAddSchemaFromExisting={(components) => {
                            const combinedSchema = components.flatMap((comp) => comp.schema);
                            setSchema(combinedSchema); // or append to existing schema
                            setSchemaShow(true);
                        }}
                    />
                    {/* import component popup end */}
                </div>
                <div className="pageRight col-span-3 rounded-l-xl border border-r-0 border-border bg-grey px-6 py-4">
                    <div className="mb-4 flex items-center justify-between">
                        <p className="font-tree-semibold mb-4 text-lg text-font-secondary">2. Schema Builder</p>
                        {schemeShow && (
                            <Button variant={'default'} onClick={addSchema} title="Add First Schema Block" type="button">
                                + Add Schema Block{' '}
                            </Button>
                        )}
                    </div>

                    {!schemeShow && (
                        <div className="flex w-full flex-col items-center justify-center text-center">
                            <span>
                                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
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
                            </span>
                            <p className="font-tree-semibold mb-2 text-xl text-font-secondary">No schema blocks added yet</p>
                            <p className="font-tree-regular mb-5 text-sm text-font-primary">
                                A schema block lets you define reusable sets of <br /> fields for your component.
                            </p>
                            <Button variant={'default'} onClick={addSchema} title="Add First Schema Block" type="button">
                                + Add First Schema Block{' '}
                            </Button>
                        </div>
                    )}

                    {schemeShow && (
                        <div>
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={schema.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                                    {schema.map((s) => (
                                        
                                        <SortableItem key={s.id} id={s.id}>
                                            {/* <GripVertical /> */}
                                            <SchemaCard
                                                schema={s}
                                                reorderFields={reorderFields}
                                                reorderChildren={reorderChildren}
                                                updateSchemaTitle={updateSchemaTitle}
                                                updateSchemaRepeatable={updateSchemaRepeatable}
                                                addSubSchema={addSubSchema}
                                                removeSchema={removeSchema}
                                                addField={addField}
                                                updateField={updateField}
                                                removeField={removeField}
                                            />
                                            
                                        </SortableItem>
                                    ))}
                                </SortableContext>
                            </DndContext>
                        </div>
                    )}
                </div>
            </div>

            {/* {component_count !== 0 && (
                    <div className="mb-6">
                        <label className="mb-1 block text-sm font-tree-medium">Import Schema From Existing Component</label>
                        <input
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="mb-2 w-full rounded border p-2"
                        />
                        {searchTerm.trim() && (
                            <div className="max-h-40 overflow-y-auto rounded border bg-white shadow">
                                {isSearching ? (
                                    <div className="p-2 text-gray-500">Loading...</div>
                                ) : existingComponents.length ? (
                                    existingComponents.map((c) => (
                                        <div
                                            key={c.id}
                                            onClick={() => handleAddSchemaFromExisting(c)}
                                            className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                        >
                                            {c.component_name}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-2 text-gray-500">No results</div>
                                )}
                            </div>
                        )}
                    </div>
                )} */}

            {/* <button onClick={addSchema} className="mb-6 rounded bg-yellow-500 px-4 py-2 text-white">
                    Add Schema
                </button> */}

            {/* {schema.map((s) => (
                    <SchemaCard
                        key={s.id}
                        schema={s}
                        updateSchemaTitle={updateSchemaTitle}
                        updateSchemaRepeatable={updateSchemaRepeatable}
                        addSubSchema={addSubSchema}
                        removeSchema={removeSchema}
                        addField={addField}
                        updateField={updateField}
                        removeField={removeField}
                    />
                ))} */}

            {/* <div className="mt-6 flex gap-4">
                    <button onClick={() => router.visit(route('admin.components.index'))} className="rounded bg-gray-300 px-4 py-2">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} className="rounded bg-yellow-500 px-4 py-2 text-white">
                        Create
                    </button>
                </div> */}
        </AppLayout>
    );
}
