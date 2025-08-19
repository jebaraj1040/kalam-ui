// FieldOptionsRenderer.tsx
import { Field } from '@/types'; // or where you define Field
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react'; // or your Tiptap/CKEditor setup

type Props = {
    field: Field;
    value: any;
    onChange: (value: any) => void;
};

export default function FieldOptionsRenderer({ field, value, onChange }: Props) {
    switch (field.type) {

        
        case 'Text':
            return (
                

                <div className="mb-4 pl-5">
                    <label className="font-tree-medium mb-3 block text-sm text-font-secondary">
                        {field.label} <sup className="text-red">*</sup>
                    </label>
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="form-input w-full"
                        placeholder="Enter Title"
                    />
                </div>
            );

        case 'Markup':
            return (
                <div className="mb-4 pl-5">
                    <label className="font-tree-medium mb-3 block text-sm text-font-secondary">{field.label}</label>
                    <CKEditor
                        editor={ClassicEditor}
                        data={value || ''}
                        onChange={(_, editor) => {
                            const data = editor.getData();
                            onChange(data);
                        }}
                    />
                </div>
            );

        case 'Image':
            return (
                <div className="mb-4 pl-5">
                    <label className="font-tree-medium !text-14 mb-5 block text-font-secondary">{field.label}</label>
                        <input
                            type="file"
                            accept="image/*"
                            className="form-input w-full"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                        onChange(reader.result); // Store base64 or implement proper upload
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        {field.fields?.map((subField) => (
                            <div key={subField.id} className="my-4">
                                <label className="font-tree-medium mb-3 block text-sm text-font-secondary">{subField.label}</label>
                                <input
                                    type="text"
                                    className="form-input w-full "
                                    value={value?.[subField.key] || ''}
                                    onChange={(e) => onChange({ ...value, [subField.key]: e.target.value })}
                                />
                            </div>
                        ))}
                        {value && (
                            <div className="mt-2">
                                <img src={value} alt="Preview" className="h-20" />
                            </div>
                        )}
                    </div>
            );

        case 'Link':
            return (
                <div className="mb-4 pl-5">
                    <label className="font-tree-medium text-16 mb-5 block text-font-secondary">{field.label}</label>
                    {/* Sample manual entry UI for link */}
                    {field.fields?.map((subField) => (
                        <div key={subField.id} className="mb-2">
                            <label className="font-tree-medium mb-3 block text-sm text-font-secondary">{subField.label}</label>
                            <input
                                type="text"
                                className="form-input w-full"
                                value={value?.[subField.key] || ''}
                                onChange={(e) => onChange({ ...value, [subField.key]: e.target.value })}
                                
                            />
                        </div>
                    ))}
                </div>
            );

        default:
            return (
                <div>
                    <p className="text-sm text-gray-500">Unsupported field type: {field.type}</p>
                </div>
            );
    }
}
