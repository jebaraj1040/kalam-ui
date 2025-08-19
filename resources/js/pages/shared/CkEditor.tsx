// shared/CkEditor.tsx
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { CKEditor } from '@ckeditor/ckeditor5-react';

export default function CkEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
    return (
        // <CKEditor
        //   editor={ClassicEditor}
        //   data={value}
        //   onChange={(_, editor) => {
        //     const data = editor.getData();
        //     onChange(data);
        //   }}
        // />
        <CKEditor
            editor={ClassicEditor}
            config={{
                ckfinder: {
                    // Change this to your actual upload URL
                    uploadUrl: '',
                },
            }}
            data={value}
            onChange={(event, editor) => {
                const data = editor.getData();
                onChange(data); // Pass the data back to parent
            }}
        />
    );
}
