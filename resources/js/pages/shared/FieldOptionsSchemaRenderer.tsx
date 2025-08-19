import { Field } from '@/types';

type Props = {
    field: Field;
    onUpdate: (data: Partial<Field>) => void;
};

export default function FieldOptionsSchemaRenderer({ field, onUpdate }: Props) {
    return (
        <div className="flex w-full flex-col gap-2">
            <div className="flex gap-5">
                <input placeholder="Key" value={field.key} onChange={(e) => onUpdate({ key: e.target.value })} className="form-input w-1/2" />
                <input placeholder="Label" value={field.label} onChange={(e) => onUpdate({ label: e.target.value })} className="form-input w-full" />
            </div>

            {/* 👇 Show nested field editing if field.fields exist */}
            {field.fields?.length > 0 && (
                <div className="mt-4 ml-6 border-l-2 border-primary rounded-xl p-4 bg-grey">
                    {field.fields.map((subField, idx) => (
                        <div key={subField.id} className="mb-2 flex gap-2">
                            <input
                                placeholder="Sub Key"
                                value={subField.key}
                                onChange={(e) => {
                                    const updatedFields = [...(field.fields || [])];
                                    updatedFields[idx] = { ...updatedFields[idx], key: e.target.value };
                                    onUpdate({ fields: updatedFields });
                                }}
                                disabled={field.type === 'Image' || field.type === 'Link'}
                                className="form-input"
                            />
                            <input
                                placeholder="Sub Label"
                                value={subField.label}
                                onChange={(e) => {
                                    const updatedFields = [...(field.fields || [])];
                                    updatedFields[idx] = { ...updatedFields[idx], label: e.target.value };
                                    onUpdate({ fields: updatedFields });
                                }}
                                disabled={field.type === 'Image' || field.type === 'Link'}
                                className="form-input"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
