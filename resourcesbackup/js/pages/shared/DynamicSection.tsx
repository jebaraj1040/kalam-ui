import { Field } from '@/types';
import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import FieldOptionsRenderer from './FieldOptionsRenderer';

// export interface Field {
//     type: string;
//     key: string;
//     label: string;
//     _id?: string;
// }

export interface SchemaSection {
    title: string;
    fields: Field[];
    children?: SchemaSection[];
    repeatable?: boolean;
    id: string;
}

interface Props {
    section: SchemaSection;
    data: any;
    setData: (data: any) => void;
}

const DynamicSection: React.FC<Props> = ({ section, data, setData }) => {
    const sectionId = section.id;
    const sectionInstances = data[sectionId] || [];

    // Auto-add one instance if section is not repeatable
    useEffect(() => {
        if (!section.repeatable && sectionInstances.length === 0) {
            // Delay until after render
            setTimeout(() => {
                handleAdd();
            }, 0);
        }
    }, []);

    const handleAdd = () => {
        const newInstance: any = { _uid: uuidv4() };

        section.fields.forEach((field) => {
            newInstance[field.key] = '';
        });

        section.children?.forEach((child) => {
            newInstance[child.id] = [];
        });

        setData({
            ...data,
            [sectionId]: [...sectionInstances, newInstance],
        });
    };

    const handleRemove = (index: number) => {
        const newInstances = [...sectionInstances];
        newInstances.splice(index, 1);
        setData({
            ...data,
            [sectionId]: newInstances,
        });
    };

    const handleFieldChange = (instanceIndex: number, fieldKey: string, value: string) => {
        const newInstances = [...sectionInstances];
        newInstances[instanceIndex][fieldKey] = value;
        setData({
            ...data,
            [sectionId]: newInstances,
        });
    };

    const setChildData = (instanceIndex: number, childData: any) => {
        const newInstances = [...sectionInstances];
        newInstances[instanceIndex] = {
            ...newInstances[instanceIndex],
            ...childData,
        };
        setData({
            ...data,
            [sectionId]: newInstances,
        });
    };

    return (
        <div >
            <h3 className='font-tree-medium text-[16px] mb-4'>
                {section.title} {section.repeatable ? '(Repeatable)' : ''}
            </h3>

            {sectionInstances.map((instance: any, i: number) => (
                <div key={instance._uid} >
                    {/* old */}
                    {/* {section.fields.map((field) => (
                        <div key={field._id || field.key} style={{ marginBottom: 8 }}>
                            <label style={{ fontWeight: 'bold' }}>{field.label}</label>
                            <input
                                type="text"
                                value={instance[field.key] || ''}
                                onChange={(e) => handleFieldChange(i, field.key, e.target.value)}
                                style={{ width: '100%', border: '1px solid #ccc', borderRadius: 4, padding: 4 }}
                            />
                        </div>
                    ))} */}
                    {section.fields.map((field) => (
                        <div key={field.id || field.key} style={{ marginBottom: 8 }}>
                            <FieldOptionsRenderer
                                field={field}
                                value={instance[field.key]}
                                onChange={(val) => handleFieldChange(i, field.key, val)}
                            />
                        </div>
                    ))}

                    {section.children?.map((child) => (
                        <DynamicSection
                            key={`${instance._uid}-${child.id}`}
                            section={child}
                            data={instance}
                            setData={(childData) => {
                                const updatedInstance = {
                                    ...instance,
                                    ...childData,
                                };
                                setChildData(i, updatedInstance);
                            }}
                        />
                    ))}

                    {section.repeatable && (
                        <button style={{ color: 'red', fontSize: 12 }} onClick={() => handleRemove(i)}>
                            Remove
                        </button>
                    )}
                </div>
            ))}

            {section.repeatable && (
                <button style={{ color: 'blue', marginTop: 8 }} onClick={handleAdd}>
                    + Add {section.title}
                </button>
            )}
        </div>
    );
};

export default DynamicSection;
