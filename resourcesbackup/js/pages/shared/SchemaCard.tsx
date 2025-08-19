// import { Field } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FieldType, SchemaCardProps } from '@/types';
import { DndContext, DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Disclosure } from '@headlessui/react';
import { ChevronDown, ChevronUp, GripVertical, Plus, Trash2 } from 'lucide-react';
import { memo, useState } from 'react';
import FieldOptionsSchemaRenderer from './FieldOptionsSchemaRenderer';
import { SortableItem } from './SortableItem';

// import FieldOptionsRenderer from './FieldOptionsRenderer';

// Types for schema and fields
// export type FieldType = 'Text' | 'Markup' | 'Image' | 'Link';

// export interface Field {
//     id: string;
//     type: FieldType;
//     key: string;
//     label: string;
// }

// export interface Schema {
//     id: string;
//     title: string;
//     repeatable?: boolean;
//     fields: Field[];
//     children?: Schema[];
// }

// export interface SchemaCardProps {
//     schema: Schema;
//     updateSchemaTitle: (schemaId: string, title: string) => void;
//     updateSchemaRepeatable: (schemaId: string, isRepeatable: boolean) => void;
//     addSubSchema: (parentId: string) => void;
//     removeSchema: (schemaId: string) => void;
//     addField: (schemaId: string) => void;
//     updateField: (schemaId: string, fieldId: string, data: Partial<Field>) => void;
//     removeField: (schemaId: string, fieldId: string) => void;
// }

const SchemaCard = memo(function SchemaCard({
    schema,
    reorderFields,
    reorderChildren,
    updateSchemaTitle,
    updateSchemaRepeatable,
    addSubSchema,
    removeSchema,
    addField,
    updateField,
    removeField,
}: SchemaCardProps) {
    const [newFieldType, setNewFieldType] = useState<FieldType>('Text');

    const sensors = useSensors(useSensor(PointerSensor));

    const handleFieldDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = schema.fields.findIndex((f) => f.id === active.id);
        const newIndex = schema.fields.findIndex((f) => f.id === over.id);

        if (oldIndex === -1 || newIndex === -1) return;

        reorderFields(schema.id, oldIndex, newIndex);
    };

    const handleChildrenDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = schema.children?.findIndex((child) => child.id === active.id) ?? -1;
        const newIndex = schema.children?.findIndex((child) => child.id === over.id) ?? -1;

        if (oldIndex === -1 || newIndex === -1) return;

        reorderChildren(schema.id, oldIndex, newIndex);
    };

    return (
        <>
            <div className="mt-2 mb-4 rounded-xl bg-background py-4 px-10 !w-full" key={schema.id}>
                <div className="mb-5 flex items-center justify-between">
                    <input
                        type="text"
                        value={schema.title}
                        onChange={(e) => updateSchemaTitle(schema.id, e.target.value)}
                        placeholder="Enter title here"
                        className="form-input w-1/3"
                    />
                    <div className="divide flex items-center space-x-3 divide-x-2 divide-border">
                        <div className="checkbox-wrap flex items-center space-x-4 pr-3">
                            {/* <div className="checkBox flex items-center gap-3">
                                <Checkbox id={`required${schema.id}`}></Checkbox>
                                <label htmlFor={`required${schema.id}`} className="text-sm text-font-secondary">
                                    Required
                                </label>
                            </div> */}
                            <div className="checkBox flex items-center gap-3">
                                <Checkbox
                                    id={`repeat${schema.id}`}
                                    checked={Boolean(schema.repeatable)}
                                    onCheckedChange={(checked) => updateSchemaRepeatable(schema.id, Boolean(checked))}
                                ></Checkbox>
                                <label htmlFor={`repeat${schema.id}`}>Repeatable</label>
                            </div>
                        </div>

                        <div className="button-wrap flex items-center space-x-4">
                            <button
                                onClick={() => addSubSchema(schema.id)}
                                className="font-tree-semibold flex cursor-pointer items-center gap-1 text-primary"
                                type="button"
                                title="Add Sub Schema"
                            >
                                <Plus className="h-5 w-5" />
                                Add Sub Schema
                            </button>
                            <button
                                onClick={() => removeSchema(schema.id)}
                                className="font-tree-semibold flex cursor-pointer items-center gap-1 text-red"
                                type="button"
                                title="Delete"
                            >
                                <Trash2 className="h-5 w-5" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* {schema.fields.map((f) => (
                <div key={f.id} className="mb-2 flex gap-2">
                    <select
                        value={f.type}
                        onChange={(e) =>
                            updateField(schema.id, f.id, {
                                type: e.target.value as FieldType,
                            })
                        }
                        className="rounded border p-2"
                    >
                        <option value="Text">Text</option>
                        <option value="Markup">Markup</option>
                        <option value="Image">Image</option>
                        <option value="Link">Link</option>
                    </select>
                    <input
                        placeholder="Key"
                        value={f.key}
                        onChange={(e) => updateField(schema.id, f.id, { key: e.target.value })}
                        className="rounded border p-2"
                    />
                    <input
                        placeholder="Label"
                        value={f.label}
                        onChange={(e) => updateField(schema.id, f.id, { label: e.target.value })}
                        className="flex-1 rounded border p-2"
                    />
                    <button onClick={() => removeField(schema.id, f.id)} className="text-red-600">
                        Delete
                    </button>
                </div>
            ))}
            <button onClick={() => addField(schema.id)} className="mt-2 rounded bg-green-500 px-3 py-1 text-white">
                Add Field
            </button> */}

                {/* Existing Fields */}
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                    <SortableContext items={schema.fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                        {schema.fields.map((f) => (
                            <SortableItem key={f.id} id={f.id} className='!left-0 !top-0 relative !flex'>
                                <div className="flex items-center gap-3 !w-full">
                                    <div key={f.id} className="flex !w-full items-center gap-5">
                                        <span className="flex h-12 w-[110px] min-w-[110px] items-center bg-input rounded-xl border border-border py-2.5 pr-4 pl-3 text-sm font-medium text-font-secondary">
                                            {f.type}
                                        </span>
                                        <FieldOptionsSchemaRenderer field={f} onUpdate={(data) => updateField(schema.id, f.id, data)} />
                                        <button
                                            onClick={() => removeField(schema.id, f.id)}
                                            className="flex h-12 w-9 min-w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-red"
                                            type="button"
                                            title="delete"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                                {/* <div key={f.id} className="mb-4 flex items-center gap-5">
                                    <span className="flex h-12 w-[110px] min-w-[110px] items-center rounded-xl border border-border py-2.5 pr-4 pl-3 text-sm font-medium text-font-secondary">
                                        {f.type}
                                    </span>
                                    <FieldOptionsSchemaRenderer field={f} onUpdate={(data) => updateField(schema.id, f.id, data)} />
                                    <button
                                        onClick={() => removeField(schema.id, f.id)}
                                        className="flex h-12 w-9 min-w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-red"
                                        type="button"
                                        title="delete"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div> */}
                            </SortableItem>
                        ))}
                    </SortableContext>
                </DndContext>

                {/* Add Field Dropdown */}
                <div className="mt-4 flex items-center gap-5">
                    <Select value={newFieldType} onValueChange={(e) => setNewFieldType(e as FieldType)}>
                        <SelectTrigger className="h-12 w-[110px] bg-input">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Text">Text</SelectItem>
                            <SelectItem value="Markup">Markup</SelectItem>
                            <SelectItem value="Image">Image</SelectItem>
                            <SelectItem value="Link">Link</SelectItem>
                        </SelectContent>
                    </Select>
                    {/* <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value as FieldType)} className="rounded border p-2">
                    <option value="Text">Text</option>
                    <option value="Markup">Markup</option>
                    <option value="Image">Image</option>
                    <option value="Link">Link</option>
                </select> */}
                    <button
                        onClick={() => addField(schema.id, newFieldType)}
                        className="flex h-12 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-primary"
                        type="button"
                        title="Add"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                {schema.children?.length > 0 && (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleChildrenDragEnd}>
                        <SortableContext items={schema.children.map((c) => c.id)} strategy={verticalListSortingStrategy}>
                            {schema.children.map((child) => (
                                <SortableItem key={child.id} id={child.id}>
                                    <div className="childCard mt-4 ml-8 rounded-xl !w-full border-l-2 border-primary bg-grey p-4 !left-0">
                                        <div className="flsex items-center">
                                            <Disclosure defaultOpen>
                                                {({ open }) => (
                                                    <>
                                                        <Disclosure.Button className="flex w-full justify-between text-left text-sm font-medium">
                                                            
                                                                <span className="font-tree-medium text-sm">{child.title || 'Untitled'}</span>
                                                           
                                                            <span>
                                                                {open ? (
                                                                    <ChevronUp size={24} className="text-font-primary" />
                                                                ) : (
                                                                    <ChevronDown size={24} className="text-font-primary" />
                                                                )}
                                                            </span>
                                                        </Disclosure.Button>

                                                        <Disclosure.Panel className="py-2">
                                                            <SchemaCard
                                                                schema={child}
                                                                updateSchemaTitle={updateSchemaTitle}
                                                                updateSchemaRepeatable={updateSchemaRepeatable}
                                                                addSubSchema={addSubSchema}
                                                                removeSchema={removeSchema}
                                                                addField={addField}
                                                                updateField={updateField}
                                                                removeField={removeField}
                                                                reorderFields={reorderFields}
                                                                reorderChildren={reorderChildren}
                                                            />
                                                        </Disclosure.Panel>
                                                    </>
                                                )}
                                            </Disclosure>
                                        </div>
                                    </div>
                                </SortableItem>
                            ))}
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </>
    );
});

export default SchemaCard;
